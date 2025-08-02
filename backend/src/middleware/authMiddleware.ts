import { Request, Response, NextFunction } from 'express';
import { getDatabase } from '../config/database';
import { verifyToken, extractTokenFromHeader } from '../utils/auth';
import { AppError } from './errorHandler';

/**
 * Authentication middleware - validates JWT and sets req.user
 */
export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const db = getDatabase();
    
    // Extract token from Authorization header
    const token = extractTokenFromHeader(req.get('Authorization'));
    
    if (!token) {
      throw new AppError('Authentication token required', 401);
    }

    // Verify and decode token
    const payload = verifyToken(token);

    // Get user from database with tenant info
    const user = await db('users')
      .select('users.*', 'tenants.name as tenant_name', 'tenants.subdomain as tenant_subdomain', 'tenants.business_type as tenant_business_type', 'tenants.settings as tenant_settings')
      .join('tenants', 'users.tenant_id', 'tenants.id')
      .where('users.id', payload.userId)
      .where('users.tenant_id', payload.tenantId)
      .where('users.is_active', true)
      .first();

    if (!user) {
      throw new AppError('User not found or inactive', 401);
    }

    // Verify tenant matches the current request tenant (if set)
    if (req.tenant && req.tenant.id !== user.tenant_id) {
      throw new AppError('Token tenant mismatch', 403);
    }

    // Set user context on request
    req.user = {
      id: user.id,
      tenantId: user.tenant_id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      isActive: user.is_active,
    };

    // Update tenant context if not already set
    if (!req.tenant) {
      req.tenant = {
        id: user.tenant_id,
        subdomain: user.tenant_subdomain,
        name: user.tenant_name,
        businessType: user.tenant_business_type,
        settings: user.tenant_settings,
      };
    }

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Optional authentication middleware - sets req.user if token is valid, but doesn't require it
 */
export async function optionalAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = extractTokenFromHeader(req.get('Authorization'));
    
    if (token) {
      // If token exists, validate it
      await authMiddleware(req, res, next);
    } else {
      // No token provided, continue without user context
      next();
    }
  } catch (error) {
    // If token is invalid, continue without user context
    next();
  }
}

/**
 * Role-based authorization middleware
 */
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError(`Access denied. Required role: ${roles.join(' or ')}`, 403);
    }

    next();
  };
}

/**
 * Admin-only middleware
 */
export const requireAdmin = requireRole('admin');

/**
 * Admin or Manager middleware
 */
export const requireManagerOrAdmin = requireRole('admin', 'manager');