import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { documentAutomation } from "@/lib/document-automation";
import { Organization } from "@/models/Organization";
import { connectDB } from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { documentType, labProfile } = body;

    if (!documentType || !labProfile) {
      return NextResponse.json(
        { error: "Document type and lab profile are required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Get organization details
    const organization = await Organization.findById(session.user.organizationId);
    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    let documentBuffer: Buffer;
    let fileName: string;

    // Generate document based on type
    switch (documentType) {
      case 'cea_application':
        documentBuffer = await documentAutomation.generateCEAApplication(labProfile);
        fileName = `CEA_Application_${organization.name.replace(/\s+/g, '_')}.docx`;
        break;
      
      case 'bmw_management_plan':
        documentBuffer = await documentAutomation.generateBMWManagementPlan(labProfile);
        fileName = `BMW_Management_Plan_${organization.name.replace(/\s+/g, '_')}.docx`;
        break;
      
      case 'quality_manual':
        documentBuffer = await documentAutomation.generateQualityManual(labProfile);
        fileName = `Quality_Manual_${organization.name.replace(/\s+/g, '_')}.docx`;
        break;
      
      default:
        return NextResponse.json(
          { error: "Unsupported document type" },
          { status: 400 }
        );
    }

    // Return the document as a downloadable file
    return new NextResponse(documentBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': documentBuffer.length.toString()
      }
    });
  } catch (error) {
    console.error("Error generating document:", error);
    return NextResponse.json(
      { error: "Failed to generate document" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Return available document types
    const documentTypes = [
      {
        type: 'cea_application',
        name: 'Clinical Establishment Act Application',
        description: 'Complete CEA registration application with state-specific requirements',
        requiredFields: [
          'organizationName',
          'address',
          'contact',
          'owner',
          'pathologist',
          'area',
          'testMenu',
          'equipment',
          'staff'
        ]
      },
      {
        type: 'bmw_management_plan',
        name: 'Biomedical Waste Management Plan',
        description: 'Comprehensive BMW management plan as per BMW Rules 2016',
        requiredFields: [
          'organizationName',
          'address',
          'owner',
          'testMenu'
        ]
      },
      {
        type: 'quality_manual',
        name: 'Quality Manual (ISO 15189:2022)',
        description: 'Quality manual template for NABL accreditation',
        requiredFields: [
          'organizationName',
          'pathologist',
          'testMenu',
          'equipment',
          'staff'
        ]
      }
    ];

    return NextResponse.json({
      success: true,
      documentTypes,
      aiPowered: true
    });
  } catch (error) {
    console.error("Error fetching document types:", error);
    return NextResponse.json(
      { error: "Failed to fetch document types" },
      { status: 500 }
    );
  }
}