import { StateRegulatoryProfile, StateRegulatoryProfileDocument } from '@/models/StateRegulatoryProfile';
import { ComplianceGate, ComplianceGateDocument } from '@/models/ComplianceGate';
import { GoLiveGate, GoLiveGateDocument } from '@/models/GoLiveGate';
import { Organization } from '@/models/Organization';
import { aiOrchestrator } from './ai-orchestrator';
import mongoose from 'mongoose';

export interface LabProfile {
  organizationId: string;
  labType: string;
  state: string;
  district?: string;
  city: string;
  area: number;
  testMenu: string[];
  staffCount: number;
  pathologistQualification?: string;
  equipment: Array<{
    name: string;
    category: string;
    manufacturer?: string;
  }>;
}

export interface ComplianceReport {
  overallScore: number;
  canGoLive: boolean;
  criticalIssues: string[];
  recommendations: string[];
  gateStatus: {
    total: number;
    completed: number;
    pending: number;
    blocked: number;
  };
  validations: {
    bmw: ValidationResult;
    cea: ValidationResult;
    staffing: ValidationResult;
    equipment: ValidationResult;
    nabl?: ValidationResult;
  };
  estimatedTimeToGoLive: number; // days
  nextActions: Array<{
    action: string;
    priority: 'high' | 'medium' | 'low';
    estimatedDays: number;
    dependencies?: string[];
  }>;
}

export interface ValidationResult {
  isCompliant: boolean;
  score: number; // 0-100
  issues: string[];
  recommendations: string[];
  requiredActions: string[];
  estimatedCompletionDays?: number;
}

export interface GoLiveStatus {
  canGoLive: boolean;
  completionPercentage: number;
  blockers: Array<{
    gateType: string;
    reason: string;
    actionRequired: string;
    priority: 'critical' | 'high' | 'medium';
  }>;
  estimatedGoLiveDate?: Date;
  criticalPath: string[];
}

export class ComplianceEngine {
  private static instance: ComplianceEngine;

  public static getInstance(): ComplianceEngine {
    if (!ComplianceEngine.instance) {
      ComplianceEngine.instance = new ComplianceEngine();
    }
    return ComplianceEngine.instance;
  }

  // Main compliance validation method
  async validateLabSetup(labProfile: LabProfile): Promise<ComplianceReport> {
    try {
      const stateRules = await this.getStateRules(labProfile.state);
      
      // Run all validations in parallel
      const [bmwValidation, ceaValidation, staffingValidation, equipmentValidation] = await Promise.all([
        this.validateBMWCompliance(labProfile, stateRules),
        this.validateCEARequirements(labProfile, stateRules),
        this.validateStaffingRequirements(labProfile, stateRules),
        this.validateEquipmentCompliance(labProfile, stateRules)
      ]);

      // Get current gate status
      const gateStatus = await this.getGateStatus(labProfile.organizationId);
      
      // Calculate overall score
      const overallScore = this.calculateOverallScore([
        bmwValidation,
        ceaValidation,
        staffingValidation,
        equipmentValidation
      ]);

      // Determine if can go live
      const canGoLive = overallScore >= 80 && 
                       bmwValidation.isCompliant && 
                       ceaValidation.isCompliant &&
                       gateStatus.blocked === 0;

      // Generate recommendations and next actions
      const { recommendations, nextActions } = await this.generateRecommendations(
        labProfile,
        [bmwValidation, ceaValidation, staffingValidation, equipmentValidation],
        stateRules
      );

      // Collect critical issues
      const criticalIssues = [
        ...bmwValidation.issues.filter(issue => issue.includes('critical')),
        ...ceaValidation.issues.filter(issue => issue.includes('critical')),
        ...staffingValidation.issues.filter(issue => issue.includes('mandatory')),
        ...equipmentValidation.issues.filter(issue => issue.includes('required'))
      ];

      // Estimate time to go-live
      const estimatedTimeToGoLive = this.calculateTimeToGoLive(nextActions, stateRules);

      return {
        overallScore,
        canGoLive,
        criticalIssues,
        recommendations,
        gateStatus,
        validations: {
          bmw: bmwValidation,
          cea: ceaValidation,
          staffing: staffingValidation,
          equipment: equipmentValidation
        },
        estimatedTimeToGoLive,
        nextActions
      };
    } catch (error) {
      console.error('Error validating lab setup:', error);
      throw new Error('Failed to validate lab setup compliance');
    }
  }

  // BMW compliance validation
  async validateBMWCompliance(labProfile: LabProfile, stateRules: StateRegulatoryProfileDocument): Promise<ValidationResult> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    const requiredActions: string[] = [];
    let score = 100;

    // Check BMW authorization status
    const bmwGate = await ComplianceGate.findOne({
      organizationId: labProfile.organizationId,
      gateType: 'bmw_authorization'
    });

    if (!bmwGate || bmwGate.status !== 'approved') {
      issues.push('BMW authorization not approved - critical blocker for go-live');
      requiredActions.push('Submit BMW authorization application to ' + stateRules.bmwAuthority.name);
      score -= 50;
    }

    // Check CBWTF contract
    const cbwtfVendors = stateRules.getCBWTFVendors(labProfile.district || '');
    if (cbwtfVendors.length === 0) {
      issues.push('No authorized CBWTF vendors found for your district');
      recommendations.push('Contact state pollution control board for CBWTF vendor list');
      score -= 20;
    }

    // Validate waste categories based on test menu
    const wasteCategories = this.identifyWasteCategories(labProfile.testMenu);
    if (wasteCategories.length === 0) {
      issues.push('Unable to identify waste categories from test menu');
      score -= 10;
    }

    // Check BMW management plan
    if (!bmwGate?.documents?.some(doc => doc.name.toLowerCase().includes('management plan'))) {
      issues.push('BMW management plan document missing');
      requiredActions.push('Upload BMW management plan document');
      score -= 15;
    }

    return {
      isCompliant: score >= 80 && bmwGate?.status === 'approved',
      score: Math.max(0, score),
      issues,
      recommendations,
      requiredActions,
      estimatedCompletionDays: stateRules.bmwAuthority.processingTimeDays
    };
  }

  // CEA compliance validation
  async validateCEARequirements(labProfile: LabProfile, stateRules: StateRegulatoryProfileDocument): Promise<ValidationResult> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    const requiredActions: string[] = [];
    let score = 100;

    // Check if CEA is applicable
    if (stateRules.ceaImplementation.status === 'not_applicable') {
      return {
        isCompliant: true,
        score: 100,
        issues: [],
        recommendations: ['CEA not applicable in this state'],
        requiredActions: []
      };
    }

    // Check CEA registration status
    const ceaGate = await ComplianceGate.findOne({
      organizationId: labProfile.organizationId,
      gateType: 'cea_approval'
    });

    if (!ceaGate || ceaGate.status !== 'approved') {
      issues.push('CEA registration not completed');
      requiredActions.push(`Submit CEA application to ${stateRules.ceaImplementation.authority}`);
      score -= 40;
    }

    // Validate required documents
    const requiredDocs = stateRules.ceaImplementation.requiredDocuments || [];
    const submittedDocs = ceaGate?.documents?.map(doc => doc.name.toLowerCase()) || [];
    
    const missingDocs = requiredDocs.filter(doc => 
      !submittedDocs.some(submitted => submitted.includes(doc.toLowerCase()))
    );

    if (missingDocs.length > 0) {
      issues.push(`Missing required documents: ${missingDocs.join(', ')}`);
      requiredActions.push('Upload missing CEA documents');
      score -= missingDocs.length * 5;
    }

    // Check area requirements (minimum 200 sq ft for basic lab)
    const minArea = labProfile.labType === 'basic' ? 200 : 
                   labProfile.labType === 'medium' ? 500 : 1000;
    
    if (labProfile.area < minArea) {
      issues.push(`Laboratory area (${labProfile.area} sq ft) below minimum requirement (${minArea} sq ft)`);
      score -= 20;
    }

    // District-specific validations
    const districtRules = labProfile.district ? stateRules.getDistrictRules(labProfile.district) : null;
    if (districtRules?.specialRequirements) {
      districtRules.specialRequirements.forEach(req => {
        recommendations.push(`District requirement: ${req}`);
      });
    }

    return {
      isCompliant: score >= 80 && ceaGate?.status === 'approved',
      score: Math.max(0, score),
      issues,
      recommendations,
      requiredActions,
      estimatedCompletionDays: stateRules.ceaImplementation.processingTimeDays
    };
  }

  // Staffing requirements validation
  async validateStaffingRequirements(labProfile: LabProfile, stateRules: StateRegulatoryProfileDocument): Promise<ValidationResult> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    const requiredActions: string[] = [];
    let score = 100;

    const staffingReqs = stateRules.staffingRequirements;

    // Check pathologist requirement
    if (staffingReqs.pathologist.mandatory) {
      const pathologistGate = await GoLiveGate.findOne({
        organizationId: labProfile.organizationId,
        gateType: 'pathologist_onboard'
      });

      if (!pathologistGate || pathologistGate.status !== 'passed') {
        issues.push('Qualified pathologist not onboarded - mandatory requirement');
        requiredActions.push(`Onboard pathologist with qualification: ${staffingReqs.pathologist.qualification.join(' or ')}`);
        score -= 30;
      }
    }

    // Check minimum technician count
    if (labProfile.staffCount < staffingReqs.technicians.minimumCount) {
      issues.push(`Insufficient technical staff: ${labProfile.staffCount} (minimum: ${staffingReqs.technicians.minimumCount})`);
      requiredActions.push('Hire additional qualified technicians');
      score -= 20;
    }

    // Check quality manager requirement
    if (staffingReqs.qualityManager.mandatory) {
      const qmGate = await GoLiveGate.findOne({
        organizationId: labProfile.organizationId,
        name: { $regex: /quality.*manager/i }
      });

      if (!qmGate || qmGate.status !== 'passed') {
        issues.push('Quality manager not appointed');
        requiredActions.push('Appoint qualified quality manager with ISO 15189 training');
        score -= 25;
      }
    }

    return {
      isCompliant: score >= 80,
      score: Math.max(0, score),
      issues,
      recommendations,
      requiredActions
    };
  }

  // Equipment compliance validation
  async validateEquipmentCompliance(labProfile: LabProfile, stateRules: StateRegulatoryProfileDocument): Promise<ValidationResult> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    const requiredActions: string[] = [];
    let score = 100;

    // Check equipment calibration status
    const calibrationGate = await GoLiveGate.findOne({
      organizationId: labProfile.organizationId,
      gateType: 'equipment_calibration'
    });

    if (!calibrationGate || calibrationGate.status !== 'passed') {
      issues.push('Equipment calibration not completed');
      requiredActions.push('Complete calibration of all analytical equipment');
      score -= 25;
    }

    // Validate equipment against test menu
    const requiredEquipment = this.getRequiredEquipment(labProfile.testMenu);
    const availableEquipment = labProfile.equipment.map(eq => eq.category.toLowerCase());
    
    const missingEquipment = requiredEquipment.filter(req => 
      !availableEquipment.some(avail => avail.includes(req.toLowerCase()))
    );

    if (missingEquipment.length > 0) {
      issues.push(`Missing required equipment categories: ${missingEquipment.join(', ')}`);
      recommendations.push('Procure missing equipment or modify test menu');
      score -= missingEquipment.length * 10;
    }

    // Check for basic safety equipment
    const safetyEquipment = ['biosafety cabinet', 'fire extinguisher', 'first aid', 'eyewash'];
    const missingSafety = safetyEquipment.filter(safety => 
      !availableEquipment.some(avail => avail.includes(safety))
    );

    if (missingSafety.length > 0) {
      issues.push(`Missing safety equipment: ${missingSafety.join(', ')}`);
      requiredActions.push('Install required safety equipment');
      score -= missingSafety.length * 5;
    }

    return {
      isCompliant: score >= 80,
      score: Math.max(0, score),
      issues,
      recommendations,
      requiredActions
    };
  }

  // Check go-live readiness
  async checkGoLiveReadiness(organizationId: string): Promise<GoLiveStatus> {
    try {
      // Get all compliance gates
      const complianceGates = await ComplianceGate.find({ organizationId });
      const goLiveGates = await GoLiveGate.find({ organizationId });
      
      // Check for blockers
      const complianceBlockers = complianceGates.filter(gate => 
        gate.hardGate && !gate.canProceed()
      );
      
      const goLiveBlockers = goLiveGates.filter(gate => 
        gate.isHardGate && !gate.canProceed()
      );
      
      const allBlockers = [
        ...complianceBlockers.map(gate => ({
          gateType: gate.gateType,
          reason: gate.blockingReason || 'Gate not approved',
          actionRequired: gate.actionRequired || 'Complete gate requirements',
          priority: gate.gateType === 'bmw_authorization' ? 'critical' as const : 'high' as const
        })),
        ...goLiveBlockers.map(gate => ({
          gateType: gate.gateType,
          reason: gate.blockingReason || 'Gate not passed',
          actionRequired: gate.actionRequired || 'Complete gate requirements',
          priority: gate.isHardGate ? 'critical' as const : 'high' as const
        }))
      ];

      // Calculate completion percentage
      const totalGates = complianceGates.length + goLiveGates.length;
      const completedGates = complianceGates.filter(g => g.status === 'approved').length + 
                           goLiveGates.filter(g => g.status === 'passed').length;
      
      const completionPercentage = totalGates > 0 ? (completedGates / totalGates) * 100 : 0;
      
      // Determine critical path
      const criticalPath = this.calculateCriticalPath(complianceGates, goLiveGates);
      
      // Estimate go-live date
      const estimatedGoLiveDate = allBlockers.length === 0 ? 
        new Date() : 
        this.estimateGoLiveDate(allBlockers);

      return {
        canGoLive: allBlockers.length === 0,
        completionPercentage,
        blockers: allBlockers,
        estimatedGoLiveDate,
        criticalPath
      };
    } catch (error) {
      console.error('Error checking go-live readiness:', error);
      throw new Error('Failed to check go-live readiness');
    }
  }

  // Private helper methods
  private async getStateRules(state: string): Promise<StateRegulatoryProfileDocument> {
    const stateProfile = await StateRegulatoryProfile.getByState(state);
    if (stateProfile) return stateProfile;

    // Return a sensible fallback so validation can proceed without seeded DB data.
    // All numeric processing times are in days.
    const fallback = {
      state,
      stateCode: state.substring(0, 2).toUpperCase(),
      ceaImplementation: {
        status: "fully_adopted",
        authority: `${state} Health Authority`,
        applicationPortal: "",
        processingTimeDays: 60,
        fees: { min: 1000, max: 5000, currency: "INR" },
        renewalPeriodYears: 5,
        requiredDocuments: [],
        inspectionRequired: true,
      },
      bmwAuthority: {
        name: `${state} Pollution Control Board`,
        fullName: `${state} State Pollution Control Board`,
        regionalOffice: "",
        onlinePortal: "",
        contactDetails: { phone: "", email: "", address: "" },
        processingTimeDays: 45,
        fees: 2000,
        renewalPeriodYears: 5,
      },
      fireAuthority: {
        name: "Fire & Emergency Services",
        authority: `${state} Fire Department`,
        onlinePortal: "",
        processingTimeDays: 30,
        fees: 500,
        renewalPeriodYears: 1,
      },
      tradeLicenseAuthority: {
        name: "Municipal Corporation",
        authority: "Local Municipal Body",
        onlinePortal: "",
        processingTimeDays: 15,
        fees: 500,
        renewalPeriodYears: 1,
      },
      districtVariations: [],
      cbwtfVendors: [],
      additionalCompliances: [],
      staffingRequirements: {
        pathologist: {
          mandatory: true,
          qualification: ["MD Pathology", "DNB Pathology"],
          registrationRequired: "MCI",
          residencyRequired: false,
        },
        qualityManager: {
          mandatory: false,
          qualification: ["BSc MLT", "DMLT"],
          trainingRequired: "ISO 15189",
          certificationRequired: false,
        },
        technicians: {
          minimumCount: 2,
          qualification: ["DMLT", "BSc MLT"],
          registrationRequired: "",
        },
      },
      totalSetupTimeline: { minimum: 60, average: 90, maximum: 150 },
      isActive: true,
      lastUpdated: new Date(),
      updatedBy: "system-fallback",
      // Instance methods expected by the engine
      getDistrictRules: () => null,
      getCBWTFVendors: () => [],
      getEstimatedTimeline: () => 90,
    } as unknown as StateRegulatoryProfileDocument;

    return fallback;
  }

  private async getGateStatus(organizationId: string) {
    const complianceGates = await ComplianceGate.find({ organizationId });
    const goLiveGates = await GoLiveGate.find({ organizationId });
    
    const total = complianceGates.length + goLiveGates.length;
    const completed = complianceGates.filter(g => g.status === 'approved').length + 
                     goLiveGates.filter(g => g.status === 'passed').length;
    const pending = total - completed;
    const blocked = complianceGates.filter(g => g.hardGate && !g.canProceed()).length +
                   goLiveGates.filter(g => g.isHardGate && !g.canProceed()).length;
    
    return { total, completed, pending, blocked };
  }

  private calculateOverallScore(validations: ValidationResult[]): number {
    if (validations.length === 0) return 0;
    return validations.reduce((sum, val) => sum + val.score, 0) / validations.length;
  }

  private async generateRecommendations(
    labProfile: LabProfile,
    validations: ValidationResult[],
    stateRules: StateRegulatoryProfileDocument
  ) {
    // Use AI to generate contextual recommendations
    const context = {
      labProfile,
      validationResults: validations,
      stateRules: {
        state: stateRules.state,
        bmwAuthority: stateRules.bmwAuthority.name,
        ceaAuthority: stateRules.ceaImplementation.authority
      }
    };

    const aiRecommendations = await aiOrchestrator.generateComplianceInsight(labProfile.organizationId);
    
    const recommendations = [
      aiRecommendations,
      ...validations.flatMap(v => v.recommendations)
    ];

    const nextActions = validations.flatMap(validation => 
      validation.requiredActions.map(action => ({
        action,
        priority: validation.score < 50 ? 'high' as const : 
                 validation.score < 80 ? 'medium' as const : 'low' as const,
        estimatedDays: validation.estimatedCompletionDays || 7
      }))
    );

    return { recommendations, nextActions };
  }

  private calculateTimeToGoLive(nextActions: any[], stateRules: StateRegulatoryProfileDocument): number {
    const maxProcessingTime = Math.max(
      stateRules.bmwAuthority.processingTimeDays,
      stateRules.ceaImplementation.processingTimeDays
    );
    
    const actionDays = nextActions.reduce((sum, action) => sum + action.estimatedDays, 0);
    
    return Math.max(maxProcessingTime, actionDays);
  }

  private identifyWasteCategories(testMenu: string[]): string[] {
    const categories = new Set<string>();
    
    testMenu.forEach(test => {
      const testLower = test.toLowerCase();
      if (testLower.includes('blood') || testLower.includes('serum') || testLower.includes('plasma')) {
        categories.add('yellow'); // Pathological waste
        categories.add('red'); // Contaminated waste
      }
      if (testLower.includes('urine') || testLower.includes('stool')) {
        categories.add('yellow');
      }
      if (testLower.includes('culture') || testLower.includes('micro')) {
        categories.add('red');
        categories.add('white'); // Sharps
      }
    });
    
    return Array.from(categories);
  }

  private getRequiredEquipment(testMenu: string[]): string[] {
    const equipment = new Set<string>();
    
    testMenu.forEach(test => {
      const testLower = test.toLowerCase();
      if (testLower.includes('cbc') || testLower.includes('hemoglobin')) {
        equipment.add('hematology');
      }
      if (testLower.includes('sugar') || testLower.includes('creatinine') || testLower.includes('liver')) {
        equipment.add('biochemistry');
      }
      if (testLower.includes('culture') || testLower.includes('micro')) {
        equipment.add('microbiology');
      }
      if (testLower.includes('urine')) {
        equipment.add('microscopy');
      }
    });
    
    // Add basic equipment
    equipment.add('centrifuge');
    equipment.add('microscope');
    
    return Array.from(equipment);
  }

  private calculateCriticalPath(complianceGates: any[], goLiveGates: any[]): string[] {
    const criticalGates = [
      'bmw_authorization',
      'cea_approval',
      'pathologist_onboard',
      'equipment_calibration',
      'staff_training'
    ];
    
    return criticalGates.filter(gateType => {
      const complianceGate = complianceGates.find(g => g.gateType === gateType);
      const goLiveGate = goLiveGates.find(g => g.gateType === gateType);
      
      return (complianceGate && complianceGate.status !== 'approved') ||
             (goLiveGate && goLiveGate.status !== 'passed');
    });
  }

  private estimateGoLiveDate(blockers: any[]): Date {
    const maxDays = Math.max(...blockers.map(b => {
      if (b.gateType === 'bmw_authorization') return 60;
      if (b.gateType === 'cea_approval') return 45;
      if (b.gateType === 'pathologist_onboard') return 14;
      return 30;
    }));
    
    const date = new Date();
    date.setDate(date.getDate() + maxDays);
    return date;
  }
}

// Export singleton instance
export const complianceEngine = ComplianceEngine.getInstance();