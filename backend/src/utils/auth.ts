import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User, Tenant } from '../types';

const JWT_SECRET: string = process.env.JWT_SECRET || 'development-secret-change-in-production';
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '7d';

export interface JWTPayload {
  userId: number;
  tenantId: number;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface AuthResponse {
  token: string;
  user: Omit<User, 'passwordHash'>;
  tenant: Tenant;
}

/**
 * Generate JWT token for authenticated user
 */
export function generateToken(user: User, tenant: Tenant): string {
  const payload: JWTPayload = {
    userId: user.id,
    tenantId: user.tenantId,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, JWT_SECRET as string, {
    expiresIn: JWT_EXPIRES_IN as string,
  } as jwt.SignOptions);
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    throw new Error('Token verification failed');
  }
}

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
  return bcrypt.hash(password, saltRounds);
}

/**
 * Compare password with hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
}

/**
 * Clean user object for API response (remove sensitive data)
 */
export function sanitizeUser(user: User): Omit<User, 'passwordHash'> {
  const { passwordHash, ...sanitizedUser } = user;
  return sanitizedUser;
}