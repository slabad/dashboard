import { Request, Response, NextFunction } from 'express';
import { tenantMiddleware } from '../../middleware/tenantMiddleware';
import { AppError } from '../../middleware/errorHandler';

// Mock the database connection
const mockDb = {
  where: jest.fn().mockReturnThis(),
  first: jest.fn()
};

jest.mock('../../config/database', () => ({
  getDatabase: () => mockDb
}));

describe('tenantMiddleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      get: jest.fn(),
      query: {},
      path: '/api/dashboard'
    };
    res = {};
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('subdomain extraction', () => {
    it('should extract subdomain from Host header', async () => {
      const mockTenant = {
        id: 1,
        subdomain: 'demo',
        name: 'Demo Company',
        business_type: 'cleaning',
        settings: {}
      };

      (req.get as jest.Mock).mockImplementation((header: string) => {
        if (header === 'Host') return 'demo.dashboard.com';
        return undefined;
      });

      mockDb.first.mockResolvedValue(mockTenant);

      await tenantMiddleware(req as Request, res as Response, next);

      expect(mockDb.where).toHaveBeenCalledWith('subdomain', 'demo');
      expect(req.tenant).toEqual({
        id: 1,
        subdomain: 'demo',
        name: 'Demo Company',
        businessType: 'cleaning',
        settings: {}
      });
      expect(next).toHaveBeenCalled();
    });

    it('should extract subdomain from X-Tenant-Subdomain header', async () => {
      const mockTenant = {
        id: 1,
        subdomain: 'testcompany',
        name: 'Test Company',
        business_type: 'landscaping',
        settings: {}
      };

      (req.get as jest.Mock).mockImplementation((header: string) => {
        if (header === 'X-Tenant-Subdomain') return 'testcompany';
        return undefined;
      });

      mockDb.first.mockResolvedValue(mockTenant);

      await tenantMiddleware(req as Request, res as Response, next);

      expect(mockDb.where).toHaveBeenCalledWith('subdomain', 'testcompany');
      expect(req.tenant?.subdomain).toBe('testcompany');
      expect(next).toHaveBeenCalled();
    });

    it('should extract subdomain from query parameter', async () => {
      const mockTenant = {
        id: 1,
        subdomain: 'querytest',
        name: 'Query Test',
        business_type: 'hvac',
        settings: {}
      };

      req.query = { tenant: 'querytest' };
      mockDb.first.mockResolvedValue(mockTenant);

      await tenantMiddleware(req as Request, res as Response, next);

      expect(mockDb.where).toHaveBeenCalledWith('subdomain', 'querytest');
      expect(req.tenant?.subdomain).toBe('querytest');
      expect(next).toHaveBeenCalled();
    });

    it('should default to demo for localhost', async () => {
      const mockTenant = {
        id: 1,
        subdomain: 'demo',
        name: 'Demo Company',
        business_type: 'cleaning',
        settings: {}
      };

      (req.get as jest.Mock).mockImplementation((header: string) => {
        if (header === 'Host') return 'localhost:3000';
        return undefined;
      });

      mockDb.first.mockResolvedValue(mockTenant);

      await tenantMiddleware(req as Request, res as Response, next);

      expect(mockDb.where).toHaveBeenCalledWith('subdomain', 'demo');
      expect(next).toHaveBeenCalled();
    });
  });

  describe('path-based skipping', () => {
    it('should skip tenant resolution for health checks', async () => {
      req.path = '/api/health';

      await tenantMiddleware(req as Request, res as Response, next);

      expect(mockDb.where).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    it('should skip tenant resolution for auth registration', async () => {
      req.path = '/api/auth/register';

      await tenantMiddleware(req as Request, res as Response, next);

      expect(mockDb.where).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should throw error when no subdomain is provided', async () => {
      req.path = '/api/dashboard';

      await tenantMiddleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      const error = (next as jest.Mock).mock.calls[0][0];
      expect(error.message).toBe('Tenant subdomain is required');
      expect(error.statusCode).toBe(400);
    });

    it('should throw error when tenant is not found', async () => {
      (req.get as jest.Mock).mockImplementation((header: string) => {
        if (header === 'Host') return 'nonexistent.dashboard.com';
        return undefined;
      });

      mockDb.first.mockResolvedValue(null);

      await tenantMiddleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      const error = (next as jest.Mock).mock.calls[0][0];
      expect(error.message).toBe('Tenant not found');
      expect(error.statusCode).toBe(404);
    });

    it('should handle database errors', async () => {
      (req.get as jest.Mock).mockImplementation((header: string) => {
        if (header === 'Host') return 'demo.dashboard.com';
        return undefined;
      });

      mockDb.first.mockRejectedValue(new Error('Database connection failed'));

      await tenantMiddleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});