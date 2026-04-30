import { ComplianceGate } from '@/models/ComplianceGate';
import { GoLiveGate } from '@/models/GoLiveGate';
import { Organization } from '@/models/Organization';
import { StateRegulatoryProfile } from '@/models/StateRegulatoryProfile';
import { aiOrchestrator } from '../ai-orchestrator';
import { connectDB } from '../mongodb';

export interface ComplianceAlert {
  organizationId: string;
  alertType: 'renewal_due' | 'expired' | 'missing_document' | 'validation_failed' | 'go_live_blocked';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  actionRequired: string;
  dueDate?: Date;
  gateType?: string;
}

export class ComplianceMonitorJob {
  private static instance: ComplianceMonitorJob;

  public static getInstance(): ComplianceMonitorJob {
    if (!ComplianceMonitorJob.instance) {
      ComplianceMonitorJob.instance = new ComplianceMonitorJob();
    }
    return ComplianceMonitorJob.instance;
  }

  // Main execution method for the compliance monitoring job
  async execute(): Promise<void> {
    try {
      await connectDB();
      
      console.log('Starting compliance monitoring job...');
      
      // Get all active organizations
      const organizations = await Organization.find({ 
        status: { $in: ['active', 'setup'] }
      });

      console.log(`Monitoring compliance for ${organizations.length} organizations`);

      // Process organizations in batches to avoid overwhelming the system
      const batchSize = 10;
      for (let i = 0; i < organizations.length; i += batchSize) {
        const batch = organizations.slice(i, i + batchSize);
        await Promise.all(batch.map(org => this.monitorOrganizationCompliance(org)));
      }

      console.log('Compliance monitoring job completed successfully');
    } catch (error) {
      console.error('Error in compliance monitoring job:', error);
      throw error;
    }
  }

  // Monitor compliance for a single organization
  private async monitorOrganizationCompliance(organization: any): Promise<void> {
    try {
      const alerts: ComplianceAlert[] = [];
      
      // Check expiring licenses
      const expiringLicenses = await this.checkExpiringLicenses(organization._id);
      alerts.push(...expiringLicenses);
      
      // Check missing documents
      const missingDocuments = await this.checkMissingDocuments(organization._id);
      alerts.push(...missingDocuments);
      
      // Check go-live blockers
      const goLiveBlockers = await this.checkGoLiveBlockers(organization._id);
      alerts.push(...goLiveBlockers);
      
      // Check state-specific compliance
      if (organization.state) {
        const stateCompliance = await this.checkStateSpecificCompliance(organization._id, organization.state);
        alerts.push(...stateCompliance);
      }
      
      // Send alerts if any critical issues found
      if (alerts.length > 0) {
        await this.sendComplianceAlerts(organization, alerts);
      }
      
      // Update organization compliance score
      await this.updateComplianceScore(organization._id, alerts);
      
    } catch (error) {
      console.error(`Error monitoring compliance for organization ${organization._id}:`, error);
    }
  }

  // Check for licenses that are expiring soon
  private async checkExpiringLicenses(organizationId: string): Promise<ComplianceAlert[]> {
    const alerts: ComplianceAlert[] = [];
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    // Check compliance gates for expiring licenses
    const complianceGates = await ComplianceGate.find({
      organizationId,
      'applicationDetails.expiryDate': { $exists: true, $ne: null }
    });

    for (const gate of complianceGates) {
      const expiryDate = new Date(gate.applicationDetails.expiryDate!);
      const now = new Date();
      
      if (expiryDate < now) {
        // Already expired
        alerts.push({
          organizationId,
          alertType: 'expired',
          severity: 'critical',
          message: `${gate.gateType} license has expired`,
          actionRequired: 'Renew license immediately to avoid compliance violations',
          gateType: gate.gateType
        });
      } else if (expiryDate <= sevenDaysFromNow) {
        // Expires within 7 days
        alerts.push({
          organizationId,
          alertType: 'renewal_due',
          severity: 'high',
          message: `${gate.gateType} license expires in ${Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} days`,
          actionRequired: 'Initiate renewal process immediately',
          dueDate: expiryDate,
          gateType: gate.gateType
        });
      } else if (expiryDate <= thirtyDaysFromNow) {
        // Expires within 30 days
        alerts.push({
          organizationId,
          alertType: 'renewal_due',
          severity: 'medium',
          message: `${gate.gateType} license expires in ${Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} days`,
          actionRequired: 'Plan renewal process',
          dueDate: expiryDate,
          gateType: gate.gateType
        });
      }
    }

    return alerts;
  }

  // Check for missing critical documents
  private async checkMissingDocuments(organizationId: string): Promise<ComplianceAlert[]> {
    const alerts: ComplianceAlert[] = [];
    
    // Check for gates without required documents
    const complianceGates = await ComplianceGate.find({
      organizationId,
      status: { $in: ['pending', 'in_progress'] }
    });

    for (const gate of complianceGates) {
      if (!gate.documents || gate.documents.length === 0) {
        alerts.push({
          organizationId,
          alertType: 'missing_document',
          severity: gate.hardGate ? 'high' : 'medium',
          message: `No documents uploaded for ${gate.gateType}`,
          actionRequired: 'Upload required documents',
          gateType: gate.gateType
        });
      } else {
        // Check for documents that failed AI validation
        const failedValidations = gate.documents.filter(doc => 
          doc.aiValidationStatus === 'invalid' || doc.aiValidationStatus === 'requires_review'
        );
        
        if (failedValidations.length > 0) {
          alerts.push({
            organizationId,
            alertType: 'validation_failed',
            severity: 'medium',
            message: `${failedValidations.length} document(s) failed validation for ${gate.gateType}`,
            actionRequired: 'Review and resubmit documents',
            gateType: gate.gateType
          });
        }
      }
    }

    return alerts;
  }

  // Check for go-live blockers
  private async checkGoLiveBlockers(organizationId: string): Promise<ComplianceAlert[]> {
    const alerts: ComplianceAlert[] = [];
    
    // Check hard gates that are blocking go-live
    const hardGates = await ComplianceGate.find({
      organizationId,
      hardGate: true,
      status: { $ne: 'approved' }
    });

    const goLiveHardGates = await GoLiveGate.find({
      organizationId,
      isHardGate: true,
      status: { $ne: 'passed' }
    });

    // BMW authorization is critical
    const bmwGate = hardGates.find(gate => gate.gateType === 'bmw_authorization');
    if (bmwGate) {
      alerts.push({
        organizationId,
        alertType: 'go_live_blocked',
        severity: 'critical',
        message: 'BMW authorization is blocking go-live',
        actionRequired: 'Complete BMW authorization process immediately',
        gateType: 'bmw_authorization'
      });
    }

    // Other hard gates
    const otherBlockers = [...hardGates.filter(g => g.gateType !== 'bmw_authorization'), ...goLiveHardGates];
    if (otherBlockers.length > 0) {
      alerts.push({
        organizationId,
        alertType: 'go_live_blocked',
        severity: 'high',
        message: `${otherBlockers.length} critical gate(s) blocking go-live`,
        actionRequired: 'Complete all hard gates before go-live'
      });
    }

    return alerts;
  }

  // Check state-specific compliance requirements
  private async checkStateSpecificCompliance(organizationId: string, state: string): Promise<ComplianceAlert[]> {
    const alerts: ComplianceAlert[] = [];
    
    try {
      const stateProfile = await StateRegulatoryProfile.getByState(state);
      if (!stateProfile) {
        alerts.push({
          organizationId,
          alertType: 'missing_document',
          severity: 'medium',
          message: `State regulatory profile not found for ${state}`,
          actionRequired: 'Contact support to set up state-specific compliance rules'
        });
        return alerts;
      }

      // Check if all required state-specific licenses are in place
      const requiredLicenses = await StateRegulatoryProfile.getRequiredLicenses(state, 'basic');
      const existingGates = await ComplianceGate.find({ organizationId });
      
      for (const license of requiredLicenses) {
        const existingGate = existingGates.find(gate => gate.gateType === license.type);
        if (!existingGate) {
          alerts.push({
            organizationId,
            alertType: 'missing_document',
            severity: 'high',
            message: `Missing required license: ${license.type} for ${state}`,
            actionRequired: `Apply for ${license.type} as required by ${state} regulations`,
            gateType: license.type
          });
        }
      }

    } catch (error) {
      console.error(`Error checking state compliance for ${state}:`, error);
    }

    return alerts;
  }

  // Send compliance alerts (in production, this would integrate with email/SMS services)
  private async sendComplianceAlerts(organization: any, alerts: ComplianceAlert[]): Promise<void> {
    try {
      // Critical alerts need immediate attention
      const criticalAlerts = alerts.filter(alert => alert.severity === 'critical');
      if (criticalAlerts.length > 0) {
        console.log(`CRITICAL ALERT for ${organization.name}:`, criticalAlerts);
        // In production: Send SMS/email to key stakeholders
        // await this.sendSMS(organization.contactPhone, criticalAlerts);
        // await this.sendEmail(organization.contactEmail, criticalAlerts);
      }

      // High priority alerts
      const highAlerts = alerts.filter(alert => alert.severity === 'high');
      if (highAlerts.length > 0) {
        console.log(`HIGH PRIORITY ALERT for ${organization.name}:`, highAlerts);
        // In production: Send email notifications
        // await this.sendEmail(organization.contactEmail, highAlerts);
      }

      // Store alerts in database for dashboard display
      await this.storeAlertsInDatabase(alerts);

    } catch (error) {
      console.error('Error sending compliance alerts:', error);
    }
  }

  // Update organization compliance score
  private async updateComplianceScore(organizationId: string, alerts: ComplianceAlert[]): Promise<void> {
    try {
      // Calculate compliance score based on alerts
      let score = 100;
      
      alerts.forEach(alert => {
        switch (alert.severity) {
          case 'critical':
            score -= 25;
            break;
          case 'high':
            score -= 15;
            break;
          case 'medium':
            score -= 10;
            break;
          case 'low':
            score -= 5;
            break;
        }
      });

      score = Math.max(0, score); // Ensure score doesn't go below 0

      // Update organization with compliance score
      await Organization.findByIdAndUpdate(organizationId, {
        complianceScore: score,
        lastComplianceCheck: new Date()
      });

    } catch (error) {
      console.error('Error updating compliance score:', error);
    }
  }

  // Store alerts in database for dashboard display
  private async storeAlertsInDatabase(alerts: ComplianceAlert[]): Promise<void> {
    try {
      // In a real implementation, you would store these in an Alerts collection
      // For now, we'll update the compliance gates with alert information
      
      for (const alert of alerts) {
        if (alert.gateType) {
          await ComplianceGate.findOneAndUpdate(
            { 
              organizationId: alert.organizationId, 
              gateType: alert.gateType 
            },
            {
              $push: {
                alerts: {
                  type: alert.alertType,
                  message: alert.message,
                  createdAt: new Date(),
                  acknowledged: false
                }
              }
            }
          );
        }
      }
    } catch (error) {
      console.error('Error storing alerts in database:', error);
    }
  }

  // Generate AI-powered compliance insights
  async generateComplianceInsights(organizationId: string): Promise<string> {
    try {
      return await aiOrchestrator.generateComplianceInsight(organizationId);
    } catch (error) {
      console.error('Error generating AI compliance insights:', error);
      return 'Unable to generate compliance insights at this time.';
    }
  }
}

// Export singleton instance
export const complianceMonitor = ComplianceMonitorJob.getInstance();

// Scaling targets for production readiness
export const SCALING_TARGETS = {
  concurrent_users: 10000,
  labs_supported: 1000,
  documents_per_day: 50000,
  api_requests_per_second: 1000,
  compliance_checks_per_hour: 5000,
  ai_document_validations_per_day: 10000
};

// Performance monitoring thresholds
export const PERFORMANCE_THRESHOLDS = {
  api_response_time_ms: 500,
  database_query_time_ms: 100,
  document_processing_time_ms: 5000,
  ai_validation_time_ms: 10000,
  compliance_check_time_ms: 2000
};