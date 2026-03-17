import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType, HeadingLevel } from 'docx';
import { StateRegulatoryProfile } from '@/models/StateRegulatoryProfile';
import { aiOrchestrator } from './ai-orchestrator';

export interface LabProfile {
  organizationName: string;
  labType: string;
  address: {
    street: string;
    city: string;
    state: string;
    district: string;
    pincode: string;
  };
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
  owner: {
    name: string;
    qualification: string;
    experience: string;
  };
  pathologist: {
    name: string;
    qualification: string;
    registrationNumber: string;
  };
  area: number;
  testMenu: string[];
  equipment: Array<{
    name: string;
    manufacturer: string;
    model: string;
  }>;
  staff: Array<{
    name: string;
    qualification: string;
    designation: string;
  }>;
}

export class DocumentAutomationEngine {
  private static instance: DocumentAutomationEngine;

  public static getInstance(): DocumentAutomationEngine {
    if (!DocumentAutomationEngine.instance) {
      DocumentAutomationEngine.instance = new DocumentAutomationEngine();
    }
    return DocumentAutomationEngine.instance;
  }

  // Generate CEA Application
  async generateCEAApplication(labProfile: LabProfile): Promise<Buffer> {
    const stateProfile = await StateRegulatoryProfile.getByState(labProfile.address.state);
    
    if (!stateProfile) {
      throw new Error(`State profile not found for ${labProfile.address.state}`);
    }

    // AI-enhanced form data generation
    const formData = await this.generateFormData('cea_application', labProfile, stateProfile);

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          // Header
          new Paragraph({
            text: `Clinical Establishment Act Registration Application`,
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER
          }),
          new Paragraph({
            text: `State: ${stateProfile.state}`,
            alignment: AlignmentType.CENTER
          }),
          new Paragraph({ text: "" }), // Spacer

          // Application Details Section
          new Paragraph({
            text: "1. ESTABLISHMENT DETAILS",
            heading: HeadingLevel.HEADING_1
          }),
          
          new Paragraph({
            children: [
              new TextRun({ text: "Name of Clinical Establishment: ", bold: true }),
              new TextRun(labProfile.organizationName)
            ]
          }),
          
          new Paragraph({
            children: [
              new TextRun({ text: "Type of Laboratory: ", bold: true }),
              new TextRun(labProfile.labType.toUpperCase())
            ]
          }),
          
          new Paragraph({
            children: [
              new TextRun({ text: "Complete Address: ", bold: true }),
              new TextRun(`${labProfile.address.street}, ${labProfile.address.city}, ${labProfile.address.district}, ${labProfile.address.state} - ${labProfile.address.pincode}`)
            ]
          }),
          
          new Paragraph({
            children: [
              new TextRun({ text: "Contact Details: ", bold: true }),
              new TextRun(`Phone: ${labProfile.contact.phone}, Email: ${labProfile.contact.email}`)
            ]
          }),

          new Paragraph({ text: "" }),

          // Owner Details Section
          new Paragraph({
            text: "2. OWNER/PROPRIETOR DETAILS",
            heading: HeadingLevel.HEADING_1
          }),
          
          new Paragraph({
            children: [
              new TextRun({ text: "Name: ", bold: true }),
              new TextRun(labProfile.owner.name)
            ]
          }),
          
          new Paragraph({
            children: [
              new TextRun({ text: "Qualification: ", bold: true }),
              new TextRun(labProfile.owner.qualification)
            ]
          }),
          
          new Paragraph({
            children: [
              new TextRun({ text: "Experience: ", bold: true }),
              new TextRun(labProfile.owner.experience)
            ]
          }),

          new Paragraph({ text: "" }),

          // Technical Staff Section
          new Paragraph({
            text: "3. TECHNICAL STAFF DETAILS",
            heading: HeadingLevel.HEADING_1
          }),
          
          new Paragraph({
            text: "Pathologist-in-Charge:",
            heading: HeadingLevel.HEADING_2
          }),
          
          new Paragraph({
            children: [
              new TextRun({ text: "Name: ", bold: true }),
              new TextRun(labProfile.pathologist.name)
            ]
          }),
          
          new Paragraph({
            children: [
              new TextRun({ text: "Qualification: ", bold: true }),
              new TextRun(labProfile.pathologist.qualification)
            ]
          }),
          
          new Paragraph({
            children: [
              new TextRun({ text: "Registration Number: ", bold: true }),
              new TextRun(labProfile.pathologist.registrationNumber)
            ]
          }),

          new Paragraph({ text: "" }),

          // Staff Table
          this.createStaffTable(labProfile.staff),

          new Paragraph({ text: "" }),

          // Services Section
          new Paragraph({
            text: "4. SERVICES TO BE PROVIDED",
            heading: HeadingLevel.HEADING_1
          }),
          
          new Paragraph({
            children: [
              new TextRun({ text: "Laboratory Area: ", bold: true }),
              new TextRun(`${labProfile.area} sq. ft.`)
            ]
          }),
          
          new Paragraph({
            text: "Test Menu:",
            heading: HeadingLevel.HEADING_2
          }),
          
          ...labProfile.testMenu.map(test => 
            new Paragraph({
              text: `• ${test}`,
              bullet: { level: 0 }
            })
          ),

          new Paragraph({ text: "" }),

          // Equipment Section
          new Paragraph({
            text: "5. EQUIPMENT DETAILS",
            heading: HeadingLevel.HEADING_1
          }),
          
          this.createEquipmentTable(labProfile.equipment),

          new Paragraph({ text: "" }),

          // Compliance Section
          new Paragraph({
            text: "6. COMPLIANCE DECLARATIONS",
            heading: HeadingLevel.HEADING_1
          }),
          
          new Paragraph({
            text: "The undersigned hereby declares that:"
          }),
          
          new Paragraph({
            text: "• All information provided is true and accurate to the best of my knowledge",
            bullet: { level: 0 }
          }),
          
          new Paragraph({
            text: "• The establishment will comply with all applicable regulations and standards",
            bullet: { level: 0 }
          }),
          
          new Paragraph({
            text: "• Biomedical waste will be managed as per BMW Rules 2016",
            bullet: { level: 0 }
          }),
          
          new Paragraph({
            text: "• Quality assurance protocols will be implemented and maintained",
            bullet: { level: 0 }
          }),

          new Paragraph({ text: "" }),
          new Paragraph({ text: "" }),

          // Signature Section
          new Paragraph({
            children: [
              new TextRun({ text: "Date: ________________", break: 1 }),
              new TextRun({ text: "Place: ________________", break: 2 }),
              new TextRun({ text: "Signature of Applicant: ________________", break: 2 }),
              new TextRun({ text: `Name: ${labProfile.owner.name}`, break: 1 })
            ]
          }),

          // State-specific sections
          ...this.generateStateSpecificSections(formData, stateProfile)
        ]
      }]
    });

    return await Packer.toBuffer(doc);
  }

  // Generate BMW Management Plan
  async generateBMWManagementPlan(labProfile: LabProfile): Promise<Buffer> {
    const stateProfile = await StateRegulatoryProfile.getByState(labProfile.address.state);
    const cbwtfVendors = stateProfile?.getCBWTFVendors(labProfile.address.district) || [];

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: "BIOMEDICAL WASTE MANAGEMENT PLAN",
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER
          }),
          
          new Paragraph({
            text: `As per Biomedical Waste Management Rules, 2016`,
            alignment: AlignmentType.CENTER
          }),
          
          new Paragraph({ text: "" }),

          // Laboratory Details
          new Paragraph({
            text: "1. LABORATORY DETAILS",
            heading: HeadingLevel.HEADING_1
          }),
          
          new Paragraph({
            children: [
              new TextRun({ text: "Name: ", bold: true }),
              new TextRun(labProfile.organizationName)
            ]
          }),
          
          new Paragraph({
            children: [
              new TextRun({ text: "Address: ", bold: true }),
              new TextRun(`${labProfile.address.street}, ${labProfile.address.city}, ${labProfile.address.state}`)
            ]
          }),
          
          new Paragraph({
            children: [
              new TextRun({ text: "Person Responsible: ", bold: true }),
              new TextRun(labProfile.owner.name)
            ]
          }),

          new Paragraph({ text: "" }),

          // Waste Categories
          new Paragraph({
            text: "2. BIOMEDICAL WASTE CATEGORIES GENERATED",
            heading: HeadingLevel.HEADING_1
          }),
          
          this.createBMWCategoriesTable(),

          new Paragraph({ text: "" }),

          // Segregation Plan
          new Paragraph({
            text: "3. WASTE SEGREGATION PLAN",
            heading: HeadingLevel.HEADING_1
          }),
          
          new Paragraph({
            text: "Color Coding System as per BMW Rules 2016:",
            heading: HeadingLevel.HEADING_2
          }),
          
          new Paragraph({
            children: [
              new TextRun({ text: "Yellow Container: ", bold: true, color: "FFA500" }),
              new TextRun("Pathological waste, human tissues, body parts, soiled waste")
            ]
          }),
          
          new Paragraph({
            children: [
              new TextRun({ text: "Red Container: ", bold: true, color: "FF0000" }),
              new TextRun("Contaminated waste (recyclable), tubing, catheters, IV sets")
            ]
          }),
          
          new Paragraph({
            children: [
              new TextRun({ text: "White/Translucent Container: ", bold: true }),
              new TextRun("Pharmaceutical waste, cytotoxic drugs")
            ]
          }),
          
          new Paragraph({
            children: [
              new TextRun({ text: "Blue/White Container: ", bold: true, color: "0000FF" }),
              new TextRun("Pharmaceutical waste, glass vials, ampoules")
            ]
          }),

          new Paragraph({ text: "" }),

          // Collection and Storage
          new Paragraph({
            text: "4. COLLECTION, STORAGE AND TRANSPORTATION",
            heading: HeadingLevel.HEADING_1
          }),
          
          new Paragraph({
            text: "Storage Procedures:",
            heading: HeadingLevel.HEADING_2
          }),
          
          new Paragraph({
            text: "• Waste will be stored in designated area away from patient care areas",
            bullet: { level: 0 }
          }),
          
          new Paragraph({
            text: "• Storage area will be secured, ventilated, and easily cleanable",
            bullet: { level: 0 }
          }),
          
          new Paragraph({
            text: "• Waste will not be stored for more than 48 hours",
            bullet: { level: 0 }
          }),

          new Paragraph({ text: "" }),

          // CBWTF Details
          new Paragraph({
            text: "5. COMMON BIOMEDICAL WASTE TREATMENT FACILITY (CBWTF)",
            heading: HeadingLevel.HEADING_1
          }),
          
          ...(cbwtfVendors.length > 0 ? [
            new Paragraph({
              children: [
                new TextRun({ text: "Authorized CBWTF: ", bold: true }),
                new TextRun(cbwtfVendors[0].name)
              ]
            }),
            
            new Paragraph({
              children: [
                new TextRun({ text: "Contact Person: ", bold: true }),
                new TextRun(cbwtfVendors[0].contactPerson)
              ]
            }),
            
            new Paragraph({
              children: [
                new TextRun({ text: "Phone: ", bold: true }),
                new TextRun(cbwtfVendors[0].phone)
              ]
            }),
            
            new Paragraph({
              children: [
                new TextRun({ text: "Collection Frequency: ", bold: true }),
                new TextRun(cbwtfVendors[0].collectionFrequency.replace('_', ' ').toUpperCase())
              ]
            })
          ] : [
            new Paragraph({
              text: "CBWTF details to be finalized upon authorization approval"
            })
          ]),

          new Paragraph({ text: "" }),

          // Training Plan
          new Paragraph({
            text: "6. STAFF TRAINING PLAN",
            heading: HeadingLevel.HEADING_1
          }),
          
          new Paragraph({
            text: "All laboratory staff will receive training on:"
          }),
          
          new Paragraph({
            text: "• BMW Rules 2016 and amendments",
            bullet: { level: 0 }
          }),
          
          new Paragraph({
            text: "• Proper segregation techniques",
            bullet: { level: 0 }
          }),
          
          new Paragraph({
            text: "• Use of personal protective equipment",
            bullet: { level: 0 }
          }),
          
          new Paragraph({
            text: "• Emergency procedures for spills and accidents",
            bullet: { level: 0 }
          }),

          new Paragraph({ text: "" }),

          // Monitoring and Records
          new Paragraph({
            text: "7. MONITORING AND RECORD KEEPING",
            heading: HeadingLevel.HEADING_1
          }),
          
          new Paragraph({
            text: "Records to be maintained:"
          }),
          
          new Paragraph({
            text: "• Daily waste generation logs",
            bullet: { level: 0 }
          }),
          
          new Paragraph({
            text: "• CBWTF collection receipts",
            bullet: { level: 0 }
          }),
          
          new Paragraph({
            text: "• Staff training records",
            bullet: { level: 0 }
          }),
          
          new Paragraph({
            text: "• Incident reports (if any)",
            bullet: { level: 0 }
          }),

          new Paragraph({ text: "" }),
          new Paragraph({ text: "" }),

          // Declaration
          new Paragraph({
            text: "DECLARATION",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER
          }),
          
          new Paragraph({
            text: `I, ${labProfile.owner.name}, hereby declare that the above biomedical waste management plan will be strictly followed. Any violation of BMW Rules 2016 will be my responsibility.`
          }),

          new Paragraph({ text: "" }),
          new Paragraph({ text: "" }),

          new Paragraph({
            children: [
              new TextRun({ text: "Date: ________________", break: 1 }),
              new TextRun({ text: "Place: ________________", break: 2 }),
              new TextRun({ text: "Signature: ________________", break: 2 }),
              new TextRun({ text: `Name: ${labProfile.owner.name}`, break: 1 }),
              new TextRun({ text: "Designation: Owner/Proprietor", break: 1 })
            ]
          })
        ]
      }]
    });

    return await Packer.toBuffer(doc);
  }

  // Generate Quality Manual
  async generateQualityManual(labProfile: LabProfile): Promise<Buffer> {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: "QUALITY MANUAL",
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER
          }),
          
          new Paragraph({
            text: `${labProfile.organizationName}`,
            alignment: AlignmentType.CENTER
          }),
          
          new Paragraph({
            text: "ISO 15189:2022 Medical Laboratories",
            alignment: AlignmentType.CENTER
          }),
          
          new Paragraph({ text: "" }),

          // Document Control
          new Paragraph({
            text: "DOCUMENT CONTROL",
            heading: HeadingLevel.HEADING_1
          }),
          
          new Paragraph({
            children: [
              new TextRun({ text: "Document Number: ", bold: true }),
              new TextRun("QM-001")
            ]
          }),
          
          new Paragraph({
            children: [
              new TextRun({ text: "Version: ", bold: true }),
              new TextRun("1.0")
            ]
          }),
          
          new Paragraph({
            children: [
              new TextRun({ text: "Effective Date: ", bold: true }),
              new TextRun(new Date().toLocaleDateString('en-IN'))
            ]
          }),
          
          new Paragraph({
            children: [
              new TextRun({ text: "Approved By: ", bold: true }),
              new TextRun(labProfile.pathologist.name)
            ]
          }),

          new Paragraph({ text: "" }),

          // Scope and Application
          new Paragraph({
            text: "1. SCOPE AND APPLICATION",
            heading: HeadingLevel.HEADING_1
          }),
          
          new Paragraph({
            text: `This Quality Manual applies to all laboratory activities conducted at ${labProfile.organizationName}. It covers the requirements of ISO 15189:2022 for medical laboratories.`
          }),

          new Paragraph({ text: "" }),

          // Quality Policy
          new Paragraph({
            text: "2. QUALITY POLICY",
            heading: HeadingLevel.HEADING_1
          }),
          
          new Paragraph({
            text: `${labProfile.organizationName} is committed to providing accurate, reliable, and timely laboratory services. We ensure compliance with ISO 15189:2022 standards and continuously improve our quality management system.`
          }),

          // Continue with more sections...
          // This is a simplified version - full manual would be much longer
        ]
      }]
    });

    return await Packer.toBuffer(doc);
  }

  // Private helper methods
  private async generateFormData(documentType: string, labProfile: LabProfile, stateProfile: any): Promise<any> {
    // This would use AI to generate form-specific data
    return {
      applicationNumber: `${stateProfile.stateCode}-${Date.now()}`,
      submissionDate: new Date().toLocaleDateString('en-IN'),
      processingAuthority: stateProfile.ceaImplementation?.authority,
      estimatedFees: stateProfile.ceaImplementation?.fees?.min || 5000
    };
  }

  private createStaffTable(staff: LabProfile['staff']): Table {
    return new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: "Name", alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: "Qualification", alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: "Designation", alignment: AlignmentType.CENTER })] })
          ]
        }),
        ...staff.map(member => new TableRow({
          children: [
            new TableCell({ children: [new Paragraph(member.name)] }),
            new TableCell({ children: [new Paragraph(member.qualification)] }),
            new TableCell({ children: [new Paragraph(member.designation)] })
          ]
        }))
      ]
    });
  }

  private createEquipmentTable(equipment: LabProfile['equipment']): Table {
    return new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: "Equipment", alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: "Manufacturer", alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: "Model", alignment: AlignmentType.CENTER })] })
          ]
        }),
        ...equipment.map(item => new TableRow({
          children: [
            new TableCell({ children: [new Paragraph(item.name)] }),
            new TableCell({ children: [new Paragraph(item.manufacturer)] }),
            new TableCell({ children: [new Paragraph(item.model)] })
          ]
        }))
      ]
    });
  }

  private createBMWCategoriesTable(): Table {
    const categories = [
      { category: "Yellow", type: "Pathological Waste", treatment: "Incineration/Deep Burial" },
      { category: "Red", type: "Contaminated Waste", treatment: "Autoclaving/Microwave" },
      { category: "Blue/White", type: "Pharmaceutical Waste", treatment: "Incineration" },
      { category: "White", type: "Sharps", treatment: "Autoclaving + Shredding" }
    ];

    return new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: "Category", alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: "Type of Waste", alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: "Treatment Method", alignment: AlignmentType.CENTER })] })
          ]
        }),
        ...categories.map(cat => new TableRow({
          children: [
            new TableCell({ children: [new Paragraph(cat.category)] }),
            new TableCell({ children: [new Paragraph(cat.type)] }),
            new TableCell({ children: [new Paragraph(cat.treatment)] })
          ]
        }))
      ]
    });
  }

  private generateStateSpecificSections(formData: any, stateProfile: any): Paragraph[] {
    const sections: Paragraph[] = [];

    // Add state-specific requirements
    if (stateProfile.additionalCompliances?.length > 0) {
      sections.push(
        new Paragraph({ text: "" }),
        new Paragraph({
          text: `7. ${stateProfile.state.toUpperCase()} SPECIFIC REQUIREMENTS`,
          heading: HeadingLevel.HEADING_1
        })
      );

      stateProfile.additionalCompliances.forEach((compliance: any) => {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${compliance.name}: `, bold: true }),
              new TextRun(compliance.description)
            ]
          })
        );
      });
    }

    return sections;
  }
}

// Export singleton instance
export const documentAutomation = DocumentAutomationEngine.getInstance();