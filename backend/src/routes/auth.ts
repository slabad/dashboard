import { Router, Request, Response } from 'express';
import Joi from 'joi';
import { loginUser, registerUser } from '../services/authService';
import { asyncHandler } from '../middleware/errorHandler';
import { authMiddleware } from '../middleware/authMiddleware';
import { ApiResponse, LoginRequest, RegisterRequest } from '../types';

const router = Router();

// Validation schemas
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  subdomain: Joi.string().optional(),
});

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().min(1).max(100).required(),
  lastName: Joi.string().min(1).max(100).required(),
  companyName: Joi.string().min(1).max(255).required(),
  subdomain: Joi.string().alphanum().min(2).max(50).required(),
  businessType: Joi.string().valid('cleaning', 'landscaping', 'hvac', 'plumbing', 'electrical', 'other').required(),
});

/**
 * POST /api/auth/login
 * Authenticate user with email and password
 */
router.post('/login', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  // Validate request body
  const { error, value } = loginSchema.validate(req.body);
  if (error) {
    const response: ApiResponse = {
      success: false,
      error: error.details[0].message
    };
    res.status(400).json(response);
    return;
  }

  const credentials: LoginRequest = value;
  
  // Use tenant context from middleware if available
  const tenantId = req.tenant?.id;
  
  // Login user
  const authResult = await loginUser(credentials, tenantId);

  const response: ApiResponse = {
    success: true,
    data: authResult
  };

  res.json(response);
}));

/**
 * POST /api/auth/register
 * Register new user and optionally create tenant
 */
router.post('/register', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  // Validate request body
  const { error, value } = registerSchema.validate(req.body);
  if (error) {
    const response: ApiResponse = {
      success: false,
      error: error.details[0].message
    };
    res.status(400).json(response);
    return;
  }

  const userData: RegisterRequest = value;
  
  // Register user
  const authResult = await registerUser(userData);

  const response: ApiResponse = {
    success: true,
    data: authResult
  };

  res.status(201).json(response);
}));

/**
 * POST /api/auth/logout
 * Logout user (client-side token removal)
 */
router.post('/logout', (req: Request, res: Response) => {
  // JWT is stateless, so logout is handled client-side by removing token
  // This endpoint exists for consistency and future session management
  const response: ApiResponse = {
    success: true,
    message: 'Logged out successfully'
  };
  res.json(response);
});

/**
 * GET /api/auth/me
 * Get current user information
 */
router.get('/me', authMiddleware, (req: Request, res: Response) => {
  const response: ApiResponse = {
    success: true,
    data: {
      user: req.user,
      tenant: req.tenant
    }
  };
  res.json(response);
});

/**
 * POST /api/auth/refresh
 * Refresh JWT token (extend expiration)  
 */
router.post('/refresh', authMiddleware, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  // For JWT refresh, we could issue a new token with extended expiration
  // For now, client should login again when token expires
  const response: ApiResponse = {
    success: true,
    message: 'Token refresh not implemented - please login again when token expires'
  };
  res.json(response);
}));

export { router as authRoutes };