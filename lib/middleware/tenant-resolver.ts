import { NextRequest } from 'next/server';
import { TenantBranding } from '@/models/TenantBranding';
import { Organization } from '@/models/Organization';
import { connectDB } from '../mongodb';

export interface TenantContext {
  organizationId: string;
  branding: any;
  subscription: any;
  features: string[];
  customDomain?: string;
  isWhiteLabel: boolean;
}

export class TenantResolver {
  private static instance: TenantResolver;
  private cache = new Map<string, TenantContext>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  public static getInstance(): TenantResolver {
    if (!TenantResolver.instance) {
      TenantResolver.instance = new TenantResolver();
    }
    return TenantResolver.instance;
  }

  // Resolve tenant context from request
  async resolveTenant(request: NextRequest): Promise<TenantContext | null> {
    try {
      await connectDB();

      const host = request.headers.get('host') || '';
      const subdomain = this.extractSubdomain(host);
      const customDomain = this.isCustomDomain(host) ? host : null;

      // Check cache first
      const cacheKey = customDomain || subdomain || 'default';
      const cached = this.cache.get(cacheKey);
      if (cached && this.isCacheValid(cacheKey)) {
        return cached;
      }

      let tenantContext: TenantContext | null = null;

      // Try to resolve by custom domain first
      if (customDomain) {
        tenantContext = await this.resolveByCustomDomain(customDomain);
      }

      // If not found, try subdomain
      if (!tenantContext && subdomain) {
        tenantContext = await this.resolveBySubdomain(subdomain);
      }

      // If still not found, use default tenant
      if (!tenantContext) {
        tenantContext = await this.getDefaultTenant();
      }

      // Cache the result
      if (tenantContext) {
        this.cache.set(cacheKey, tenantContext);
        setTimeout(() => this.cache.delete(cacheKey), this.cacheTimeout);
      }

      return tenantContext;
    } catch (error) {
      console.error('Error resolving tenant:', error);
      return null;
    }
  }

  // Resolve tenant by custom domain
  private async resolveByCustomDomain(domain: string): Promise<TenantContext | null> {
    try {
      const branding = await TenantBranding.getByDomain(domain);
      if (!branding) return null;

      const organization = await Organization.findById(branding.organizationId);
      if (!organization) return null;

      return {
        organizationId: branding.organizationId.toString(),
        branding: branding.getCustomizedConfig().branding,
        subscription: branding.getCustomizedConfig().subscription,
        features: branding.subscription.features,
        customDomain: domain,
        isWhiteLabel: branding.whitelabelConfig.hideSetupAiBranding
      };
    } catch (error) {
      console.error('Error resolving by custom domain:', error);
      return null;
    }
  }

  // Resolve tenant by subdomain
  private async resolveBySubdomain(subdomain: string): Promise<TenantContext | null> {
    try {
      // Find organization by subdomain or name
      const organization = await Organization.findOne({
        $or: [
          { subdomain: subdomain },
          { name: new RegExp(subdomain, 'i') }
        ]
      });

      if (!organization) return null;

      // Get or create branding
      let branding = await TenantBranding.getByOrganization(organization._id);
      if (!branding) {
        branding = await TenantBranding.createDefaultBranding(organization._id, organization.name);
      }

      return {
        organizationId: organization._id.toString(),
        branding: branding.getCustomizedConfig().branding,
        subscription: branding.getCustomizedConfig().subscription,
        features: branding.subscription.features,
        isWhiteLabel: branding.whitelabelConfig.hideSetupAiBranding
      };
    } catch (error) {
      console.error('Error resolving by subdomain:', error);
      return null;
    }
  }

  // Get default tenant (fallback)
  private async getDefaultTenant(): Promise<TenantContext> {
    return {
      organizationId: 'default',
      branding: {
        brandName: 'Setup.AI',
        logoUrl: '/logo.png',
        primaryColor: '#3B82F6',
        hideSetupAiBranding: false
      },
      subscription: {
        plan: 'basic',
        features: ['basic_compliance', 'document_generation'],
        limits: {
          maxLabs: 1,
          maxUsers: 5
        }
      },
      features: ['basic_compliance', 'document_generation'],
      isWhiteLabel: false
    };
  }

  // Extract subdomain from host
  private extractSubdomain(host: string): string | null {
    const parts = host.split('.');
    if (parts.length >= 3) {
      return parts[0];
    }
    return null;
  }

  // Check if host is a custom domain (not our main domain)
  private isCustomDomain(host: string): boolean {
    const mainDomains = ['localhost', 'setupai.com', 'app.setupai.com'];
    return !mainDomains.some(domain => host.includes(domain));
  }

  // Check if cache entry is still valid
  private isCacheValid(key: string): boolean {
    // Simple cache validation - in production, you'd want more sophisticated cache invalidation
    return this.cache.has(key);
  }

  // Clear cache for a specific tenant
  clearCache(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  // Feature gate checking
  async checkFeatureAccess(
    organizationId: string, 
    feature: string
  ): Promise<boolean> {
    try {
      const branding = await TenantBranding.getByOrganization(organizationId);
      if (!branding) return false;

      return branding.isFeatureEnabled(feature);
    } catch (error) {
      console.error('Error checking feature access:', error);
      return false;
    }
  }

  // Usage limits checking
  async checkUsageLimits(
    organizationId: string,
    resource: 'labs' | 'users' | 'documents'
  ): Promise<{ allowed: boolean; current: number; limit: number }> {
    try {
      const branding = await TenantBranding.getByOrganization(organizationId);
      if (!branding) {
        return { allowed: false, current: 0, limit: 0 };
      }

      let current = 0;
      let limit = 0;

      switch (resource) {
        case 'labs':
          // Count current labs for this organization
          current = await Organization.countDocuments({ 
            parentOrganizationId: organizationId 
          });
          limit = branding.subscription.maxLabs;
          break;

        case 'users':
          // Count current users for this organization
          current = await Organization.aggregate([
            { $match: { _id: organizationId } },
            { $lookup: { from: 'users', localField: '_id', foreignField: 'organizationId', as: 'users' } },
            { $project: { userCount: { $size: '$users' } } }
          ]).then(result => result[0]?.userCount || 0);
          limit = branding.subscription.maxUsers;
          break;

        case 'documents':
          // For documents, we might have a daily/monthly limit
          limit = 1000; // Default limit
          current = 0; // Would need to implement document counting
          break;
      }

      return {
        allowed: current < limit,
        current,
        limit
      };
    } catch (error) {
      console.error('Error checking usage limits:', error);
      return { allowed: false, current: 0, limit: 0 };
    }
  }
}

// Export singleton instance
export const tenantResolver = TenantResolver.getInstance();

// Middleware function for Next.js
export async function withTenantContext(
  request: NextRequest,
  handler: (request: NextRequest, tenant: TenantContext) => Promise<Response>
): Promise<Response> {
  try {
    const tenant = await tenantResolver.resolveTenant(request);
    if (!tenant) {
      return new Response('Tenant not found', { status: 404 });
    }

    return await handler(request, tenant);
  } catch (error) {
    console.error('Error in tenant middleware:', error);
    return new Response('Internal server error', { status: 500 });
  }
}

// Rate limiting by tenant
export class TenantRateLimiter {
  private static limits = new Map<string, { count: number; resetTime: number }>();
  
  static checkLimit(
    organizationId: string, 
    limit: number = 1000, 
    windowMs: number = 60000
  ): boolean {
    const now = Date.now();
    const key = organizationId;
    const current = this.limits.get(key);
    
    if (!current || now > current.resetTime) {
      this.limits.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    if (current.count >= limit) {
      return false;
    }
    
    current.count++;
    return true;
  }
}