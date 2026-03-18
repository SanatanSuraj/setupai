import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { TenantBranding } from "@/models/TenantBranding";
import { Organization } from "@/models/Organization";
import { tenantResolver } from "@/lib/middleware/tenant-resolver";
import { connectDB } from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email?.includes('@setupai.com')) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const plan = searchParams.get('plan') || '';

    await connectDB();

    // Build query
    const query: any = {};
    if (search) {
      query.$or = [
        { brandName: new RegExp(search, 'i') },
        { 'emailBranding.fromEmail': new RegExp(search, 'i') }
      ];
    }
    if (plan) {
      query['subscription.plan'] = plan;
    }

    // Get tenants with pagination
    const tenants = await TenantBranding.find(query)
      .populate('organizationId', 'name email city state status')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await TenantBranding.countDocuments(query);

    // Get usage statistics for each tenant
    const tenantsWithStats = await Promise.all(
      tenants.map(async (tenant) => {
        const orgId = tenant.organizationId;
        
        // Get usage stats
        const labCount = await Organization.countDocuments({ 
          parentOrganizationId: orgId 
        });
        
        const userCount = 0; // Would need User model to count actual users
        
        // Get feature usage
        const featureUsage = await tenantResolver.checkUsageLimits(
          orgId.toString(), 
          'labs'
        );

        return {
          ...tenant.toObject(),
          stats: {
            labCount,
            userCount,
            featureUsage,
            lastActivity: tenant.updatedAt
          }
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: tenantsWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching tenants:", error);
    return NextResponse.json(
      { error: "Failed to fetch tenants" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email?.includes('@setupai.com')) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const {
      organizationId,
      brandName,
      logoUrl,
      primaryColor,
      customDomain,
      subscription,
      whitelabelConfig,
      emailBranding,
      features
    } = body;

    await connectDB();

    // Validate organization exists
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Check if tenant branding already exists
    const existingBranding = await TenantBranding.findOne({ organizationId });
    if (existingBranding) {
      return NextResponse.json(
        { error: "Tenant branding already exists for this organization" },
        { status: 400 }
      );
    }

    // Create new tenant branding
    const tenantBranding = new TenantBranding({
      organizationId,
      brandName: brandName || organization.name,
      logoUrl,
      primaryColor: primaryColor || '#3B82F6',
      customDomain,
      whitelabelConfig: {
        hideSetupAiBranding: whitelabelConfig?.hideSetupAiBranding || false,
        customFooter: whitelabelConfig?.customFooter,
        customTermsUrl: whitelabelConfig?.customTermsUrl,
        customPrivacyUrl: whitelabelConfig?.customPrivacyUrl,
        customSupportEmail: whitelabelConfig?.customSupportEmail,
        customSupportPhone: whitelabelConfig?.customSupportPhone
      },
      emailBranding: {
        fromName: emailBranding?.fromName || brandName || organization.name,
        fromEmail: emailBranding?.fromEmail || `noreply@${organization.name.toLowerCase().replace(/\s+/g, '')}.com`,
        replyToEmail: emailBranding?.replyToEmail,
        emailSignature: emailBranding?.emailSignature,
        headerImageUrl: emailBranding?.headerImageUrl
      },
      features: {
        enabledModules: features?.enabledModules || [
          'dashboard', 'roadmap', 'licensing', 'equipment', 'staff', 'qc', 'operations'
        ],
        customModuleNames: features?.customModuleNames || {},
        hiddenFeatures: features?.hiddenFeatures || [],
        customWorkflows: features?.customWorkflows || []
      },
      subscription: {
        plan: subscription?.plan || 'basic',
        maxLabs: subscription?.maxLabs || 1,
        maxUsers: subscription?.maxUsers || 5,
        features: subscription?.features || ['basic_compliance', 'document_generation'],
        customPricing: subscription?.customPricing
      }
    });

    await tenantBranding.save();

    // Clear tenant cache
    tenantResolver.clearCache();

    return NextResponse.json({
      success: true,
      data: tenantBranding,
      message: "Tenant branding created successfully"
    });
  } catch (error) {
    console.error("Error creating tenant:", error);
    return NextResponse.json(
      { error: "Failed to create tenant" },
      { status: 500 }
    );
  }
}