import { Request, Response, NextFunction } from 'express';
import { errorHandler, AppError, asyncHandler } from '../../middleware/errorHandler';

describe('errorHandler', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('should handle AppError correctly', () => {
    const error = new AppError('Custom error message', 400);

    errorHandler(error, req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Custom error message'
    });
  });

  it('should handle ValidationError', () => {
    const error = new Error('Invalid input');
    error.name = 'ValidationError';

    errorHandler(error, req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Validation error: Invalid input'
    });
  });

  it('should handle UnauthorizedError', () => {
    const error = new Error('Unauthorized');
    error.name = 'UnauthorizedError';

    errorHandler(error, req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Unauthorized'
    });
  });

  it('should handle JsonWebTokenError', () => {
    const error = new Error('Invalid token');
    error.name = 'JsonWebTokenError';

    errorHandler(error, req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Invalid token'
    });
  });

  it('should handle TokenExpiredError', () => {
    const error = new Error('Token expired');
    error.name = 'TokenExpiredError';

    errorHandler(error, req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Token expired'
    });
  });

  it('should handle generic errors', () => {
    const error = new Error('Something went wrong');

    errorHandler(error, req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Internal server error'
    });
  });
});

describe('asyncHandler', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {};
    res = {};
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('should handle successful async functions', async () => {
    const mockFn = jest.fn().mockResolvedValue('success');
    const wrappedFn = asyncHandler(mockFn);

    await wrappedFn(req as Request, res as Response, next);

    expect(mockFn).toHaveBeenCalledWith(req, res, next);
    expect(next).not.toHaveBeenCalled();
  });

  it('should handle async function errors', async () => {
    const error = new Error('Async error');
    const mockFn = jest.fn().mockRejectedValue(error);
    const wrappedFn = asyncHandler(mockFn);

    await wrappedFn(req as Request, res as Response, next);

    expect(mockFn).toHaveBeenCalledWith(req, res, next);
    expect(next).toHaveBeenCalledWith(error);
  });

  it('should handle synchronous function errors', async () => {
    const error = new Error('Sync error');
    const mockFn = jest.fn().mockImplementation(() => {
      throw error;
    });
    const wrappedFn = asyncHandler(mockFn);

    await wrappedFn(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});

describe('AppError', () => {
  it('should create AppError with correct properties', () => {
    const error = new AppError('Test error', 400);

    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(400);
    expect(error.isOperational).toBe(true);
    expect(error).toBeInstanceOf(Error);
  });

  it('should capture stack trace', () => {
    const error = new AppError('Test error', 400);

    expect(error.stack).toBeDefined();
    expect(error.stack).toContain('AppError');
  });
});