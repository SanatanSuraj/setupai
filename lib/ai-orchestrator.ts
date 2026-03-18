import OpenAI from 'openai';
import { StateRegulatoryProfile } from '@/models/StateRegulatoryProfile';
import { ComplianceGate } from '@/models/ComplianceGate';
import type { ITask } from '@/types';
import type { RoadmapInput, GeneratedRoadmap, DocumentGapResult, EquipmentRecommendation } from './ai';

// Lazy OpenAI client — only instantiated when a request is actually made,
// so a missing API key does not crash the module at import time.
let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set.');
    }
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}
// Keep a top-level alias used by existing call sites that reference `openai` directly.
const openai = new Proxy({} as OpenAI, {
  get(_target, prop) {
    return (getOpenAI() as any)[prop];
  },
});

export interface LabProfile {
  labType: string;
  city: string;
  state: string;
  district?: string;
  budget: number;
  area: number;
  testMenu?: string[];
  organizationId: string;
}

export interface ValidationResult {
  isValid: boolean;
  confidence: number;
  issues: string[];
  suggestions: string[];
  extractedData?: any;
}

export class AIOrchestrator {
  private static instance: AIOrchestrator;

  public static getInstance(): AIOrchestrator {
    if (!AIOrchestrator.instance) {
      AIOrchestrator.instance = new AIOrchestrator();
    }
    return AIOrchestrator.instance;
  }

  // Enhanced roadmap generation with state-specific rules
  async generateRoadmap(input: RoadmapInput & { state?: string; district?: string }): Promise<GeneratedRoadmap> {
    try {
      // Get state-specific regulatory profile
      const stateProfile = input.state ? 
        await StateRegulatoryProfile.getByState(input.state) : null;

      const prompt = this.buildRoadmapPrompt(input, stateProfile);
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: "You are an expert consultant for diagnostic laboratory setup in India. Generate detailed, compliant roadmaps based on state-specific regulations."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        functions: [{
          name: "generate_roadmap",
          description: "Generate a detailed lab setup roadmap",
          parameters: {
            type: "object",
            properties: {
              timeline: {
                type: "object",
                properties: {
                  totalDays: { type: "number" },
                  phases: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        duration: { type: "number" },
                        startDay: { type: "number" }
                      }
                    }
                  }
                }
              },
              tasks: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    module: { type: "string" },
                    priority: { type: "string", enum: ["high", "medium", "low"] },
                    estimatedDays: { type: "number" },
                    dependencies: { type: "array", items: { type: "string" } },
                    stateSpecific: { type: "boolean" },
                    complianceGate: { type: "string" }
                  }
                }
              },
              estimatedCost: { type: "number" },
              criticalPath: { type: "array", items: { type: "string" } },
              riskFactors: { type: "array", items: { type: "string" } }
            }
          }
        }],
        function_call: { name: "generate_roadmap" }
      });

      const result = completion.choices[0]?.message?.function_call;
      if (!result?.arguments) {
        throw new Error('No roadmap generated');
      }

      const roadmapData = JSON.parse(result.arguments);
      return this.formatRoadmapResponse(roadmapData, input);
    } catch (error) {
      console.error('Error generating AI roadmap:', error);
      // Fallback to enhanced version of original logic
      return this.generateFallbackRoadmap(input, stateProfile);
    }
  }

  // AI-powered document validation
  async validateComplianceDocument(
    documentType: string,
    documentContent: string | Buffer,
    stateRules?: any
  ): Promise<ValidationResult> {
    try {
      const isBuffer = Buffer.isBuffer(documentContent);
      const prompt = this.buildDocumentValidationPrompt(documentType, stateRules);

      const messages: any[] = [
        {
          role: "system",
          content: "You are an expert in Indian regulatory compliance for diagnostic laboratories. Validate documents against specific state regulations."
        },
        {
          role: "user",
          content: prompt
        }
      ];

      // Handle image documents
      if (isBuffer) {
        const base64Image = documentContent.toString('base64');
        messages[1].content = [
          { type: "text", text: prompt },
          { 
            type: "image_url", 
            image_url: { 
              url: `data:image/jpeg;base64,${base64Image}`,
              detail: "high"
            } 
          }
        ];
      } else {
        messages[1].content = `${prompt}\n\nDocument Content:\n${documentContent}`;
      }

      const completion = await openai.chat.completions.create({
        model: isBuffer ? "gpt-4-vision-preview" : "gpt-4-turbo-preview",
        messages,
        functions: [{
          name: "validate_document",
          description: "Validate compliance document",
          parameters: {
            type: "object",
            properties: {
              isValid: { type: "boolean" },
              confidence: { type: "number", minimum: 0, maximum: 100 },
              issues: { type: "array", items: { type: "string" } },
              suggestions: { type: "array", items: { type: "string" } },
              extractedData: { type: "object" },
              complianceScore: { type: "number", minimum: 0, maximum: 100 }
            }
          }
        }],
        function_call: { name: "validate_document" }
      });

      const result = completion.choices[0]?.message?.function_call;
      if (!result?.arguments) {
        throw new Error('No validation result generated');
      }

      return JSON.parse(result.arguments);
    } catch (error) {
      console.error('Error validating document:', error);
      return {
        isValid: false,
        confidence: 0,
        issues: ['Unable to validate document automatically'],
        suggestions: ['Please review document manually']
      };
    }
  }

  // Enhanced equipment recommendations
  async recommendEquipment(
    testMenu: string[],
    budget: number,
    labType: string,
    state: string
  ): Promise<EquipmentRecommendation[]> {
    try {
      const prompt = `Generate equipment recommendations for a ${labType} diagnostic laboratory in ${state}, India.

Test Menu: ${testMenu.join(', ')}
Budget: ₹${budget.toLocaleString()}
Lab Type: ${labType}

Consider:
1. Indian regulatory requirements (NABL, FDA)
2. Local vendor availability in ${state}
3. Budget constraints
4. Maintenance and service support
5. Training requirements
6. Calibration schedules

Provide detailed recommendations with:
- Equipment specifications
- Indian vendors with actual pricing
- Installation and training costs
- Annual maintenance costs
- ROI analysis`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: "You are an expert in diagnostic laboratory equipment for the Indian market. Provide accurate, current recommendations."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        functions: [{
          name: "recommend_equipment",
          description: "Generate equipment recommendations",
          parameters: {
            type: "object",
            properties: {
              recommendations: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    category: { type: "string" },
                    priority: { type: "string", enum: ["essential", "recommended", "optional"] },
                    estimatedCapex: { type: "number" },
                    annualOpex: { type: "number" },
                    vendors: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string" },
                          priceRange: { type: "array", items: { type: "number" } },
                          location: { type: "string" },
                          serviceSupport: { type: "string" }
                        }
                      }
                    },
                    specifications: { type: "object" },
                    roiMonths: { type: "number" }
                  }
                }
              },
              totalBudgetUtilization: { type: "number" },
              phaseWiseProcurement: { type: "array", items: { type: "object" } }
            }
          }
        }],
        function_call: { name: "recommend_equipment" }
      });

      const result = completion.choices[0]?.message?.function_call;
      if (!result?.arguments) {
        throw new Error('No equipment recommendations generated');
      }

      const data = JSON.parse(result.arguments);
      return data.recommendations;
    } catch (error) {
      console.error('Error generating equipment recommendations:', error);
      // Fallback to original logic
      const { recommendEquipment } = await import('./ai');
      return recommendEquipment(testMenu);
    }
  }

  // Document gap analysis with AI
  async documentGapAnalysis(
    licenseType: string,
    documents: string[],
    state: string,
    district?: string
  ): Promise<DocumentGapResult> {
    try {
      const stateProfile = await StateRegulatoryProfile.getByState(state);
      const districtRules = district && stateProfile ? 
        stateProfile.getDistrictRules(district) : null;

      const prompt = `Analyze document gaps for ${licenseType} license application in ${state}${district ? `, ${district}` : ''}, India.

Current Documents: ${documents.join(', ')}
State: ${state}
${district ? `District: ${district}` : ''}

State-specific requirements: ${JSON.stringify(stateProfile?.ceaImplementation || {})}
${districtRules ? `District variations: ${JSON.stringify(districtRules)}` : ''}

Provide:
1. Missing mandatory documents
2. Optional but recommended documents
3. State/district specific requirements
4. Document preparation suggestions
5. Compliance score (0-100)`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: "You are an expert in Indian regulatory compliance for diagnostic laboratories. Analyze document requirements accurately."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        functions: [{
          name: "analyze_document_gaps",
          description: "Analyze missing documents for license application",
          parameters: {
            type: "object",
            properties: {
              missing: { type: "array", items: { type: "string" } },
              recommended: { type: "array", items: { type: "string" } },
              suggestions: { type: "array", items: { type: "string" } },
              score: { type: "number", minimum: 0, maximum: 100 },
              stateSpecific: { type: "array", items: { type: "string" } },
              urgency: { type: "string", enum: ["low", "medium", "high", "critical"] }
            }
          }
        }],
        function_call: { name: "analyze_document_gaps" }
      });

      const result = completion.choices[0]?.message?.function_call;
      if (!result?.arguments) {
        throw new Error('No gap analysis generated');
      }

      const data = JSON.parse(result.arguments);
      return {
        missing: [...data.missing, ...(data.stateSpecific || [])],
        suggestions: data.suggestions,
        score: data.score
      };
    } catch (error) {
      console.error('Error analyzing document gaps:', error);
      // Fallback to original logic
      const { documentGapAnalysis } = await import('./ai');
      return documentGapAnalysis(licenseType, documents);
    }
  }

  // Generate compliance insights
  async generateComplianceInsight(organizationId: string): Promise<string> {
    try {
      // Get current compliance status
      const gates = await ComplianceGate.find({ organizationId });
      const readiness = await ComplianceGate.checkGoLiveReadiness(organizationId);

      const prompt = `Generate actionable compliance insights for a diagnostic laboratory.

Current Status:
- Total Gates: ${readiness.totalGates}
- Completed: ${readiness.completedGates}
- Completion: ${readiness.completionPercentage}%
- Can Go Live: ${readiness.canGoLive}

Blockers: ${JSON.stringify(readiness.blockers)}

Gates Status: ${gates.map(g => `${g.gateType}: ${g.status}`).join(', ')}

Provide:
1. Priority actions for next 7 days
2. Risk mitigation strategies
3. Timeline optimization suggestions
4. Cost-saving opportunities
5. Regulatory updates to watch`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: "You are a regulatory compliance consultant for Indian diagnostic laboratories. Provide actionable, prioritized insights."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      });

      return completion.choices[0]?.message?.content || 'Unable to generate insights at this time.';
    } catch (error) {
      console.error('Error generating compliance insight:', error);
      return 'Focus on completing BMW authorization and CEA registration as priority items for go-live readiness.';
    }
  }

  // Private helper methods
  private buildRoadmapPrompt(input: RoadmapInput & { state?: string; district?: string }, stateProfile: any): string {
    return `Generate a detailed 5-phase setup roadmap for a diagnostic laboratory in India.

Lab Details:
- Type: ${input.labType}
- Location: ${input.city}${input.state ? `, ${input.state}` : ''}
- Budget: ₹${input.budget?.toLocaleString() || '10,00,000'}

${stateProfile ? `State Regulatory Profile:
- CEA Status: ${stateProfile.ceaImplementation?.status}
- BMW Authority: ${stateProfile.bmwAuthority?.name}
- Processing Times: CEA ${stateProfile.ceaImplementation?.processingTimeDays} days, BMW ${stateProfile.bmwAuthority?.processingTimeDays} days
- Required Documents: ${stateProfile.ceaImplementation?.requiredDocuments?.join(', ')}
` : ''}

Generate a roadmap with:
1. 5 distinct phases (Location, Manpower, Equipment, Licensing, Launch)
2. State-specific compliance requirements
3. Realistic timelines based on regulatory processing times
4. Critical path dependencies
5. Risk factors and mitigation strategies
6. Budget allocation across phases`;
  }

  private buildDocumentValidationPrompt(documentType: string, stateRules?: any): string {
    return `Validate this ${documentType} document for diagnostic laboratory compliance in India.

${stateRules ? `State-specific requirements: ${JSON.stringify(stateRules)}` : ''}

Check for:
1. Mandatory fields completion
2. Signature and stamp authenticity
3. Date validity
4. Format compliance
5. State-specific requirements
6. Missing information
7. Potential issues

Provide detailed validation results with confidence score.`;
  }

  private formatRoadmapResponse(roadmapData: any, input: RoadmapInput): GeneratedRoadmap {
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + (roadmapData.timeline?.totalDays || 120));

    const tasks: ITask[] = roadmapData.tasks?.map((task: any, index: number) => ({
      title: task.title,
      status: 'pending' as const,
      module: task.module || 'setup',
      dueDate: new Date(Date.now() + (task.estimatedDays || 7) * 24 * 60 * 60 * 1000),
      dependency: task.dependencies?.[0],
      priority: task.priority || 'medium'
    })) || [];

    return {
      timeline: { start, end },
      tasks,
      estimatedCost: roadmapData.estimatedCost || input.budget || 1000000
    };
  }

  private async generateFallbackRoadmap(input: RoadmapInput, stateProfile: any): Promise<GeneratedRoadmap> {
    // Enhanced fallback with state-specific considerations
    const { generateRoadmap } = await import('./ai');
    const baseRoadmap = await generateRoadmap(input);
    
    // Add state-specific tasks if profile available
    if (stateProfile) {
      const stateSpecificTasks: ITask[] = [
        {
          title: `${stateProfile.bmwAuthority?.name} BMW Authorization`,
          status: 'pending',
          module: 'compliance',
          dueDate: new Date(Date.now() + (stateProfile.bmwAuthority?.processingTimeDays || 45) * 24 * 60 * 60 * 1000)
        },
        {
          title: `${stateProfile.ceaImplementation?.authority} CEA Registration`,
          status: 'pending',
          module: 'compliance',
          dueDate: new Date(Date.now() + (stateProfile.ceaImplementation?.processingTimeDays || 60) * 24 * 60 * 60 * 1000)
        }
      ];
      
      baseRoadmap.tasks.push(...stateSpecificTasks);
    }
    
    return baseRoadmap;
  }
}

// Export singleton instance
export const aiOrchestrator = AIOrchestrator.getInstance();