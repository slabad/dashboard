import { Request, Response, NextFunction } from 'express';
import { getDatabase } from '../config/database';
import { AppError } from './errorHandler';

export async function tenantMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const db = getDatabase();
    
    // Extract subdomain from different sources
    let subdomain: string | undefined;
    
    // 1. Try to get from Host header (subdomain.domain.com)
    const host = req.get('Host');
    if (host) {
      const hostParts = host.split('.');
      if (hostParts.length > 2) {
        subdomain = hostParts[0];
      }
    }
    
    // 2. Try to get from X-Tenant-Subdomain header (for API clients)
    if (!subdomain) {
      subdomain = req.get('X-Tenant-Subdomain');
    }
    
    // 3. Try to get from query parameter (for development)
    if (!subdomain) {
      subdomain = req.query.tenant as string;
    }
    
    // 4. Default to 'demo' for development if localhost
    if (!subdomain && (host === 'localhost' || host?.startsWith('localhost:'))) {
      subdomain = 'demo';
    }
    
    // Skip tenant resolution for health checks and auth endpoints
    const skipTenantPaths = ['/api/health', '/api/auth', '/api/dashboard'];
    if (skipTenantPaths.some(path => req.path.startsWith(path))) {
      return next();
    }
    
    if (!subdomain) {
      throw new AppError('Tenant subdomain is required', 400);
    }
    
    // Look up tenant in database
    const tenant = await db('tenants')
      .where('subdomain', subdomain)
      .first();
    
    if (!tenant) {
      throw new AppError('Tenant not found', 404);
    }
    
    // Add tenant to request context
    req.tenant = {
      id: tenant.id,
      subdomain: tenant.subdomain,
      name: tenant.name,
      businessType: tenant.business_type,
      settings: tenant.settings
    };
    
    next();
  } catch (error) {
    next(error);
  }
}