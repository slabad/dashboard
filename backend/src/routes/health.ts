import { Router, Request, Response } from 'express';
import { getDatabase } from '../config/database';
import { getRedisClient } from '../config/redis';
import { ApiResponse } from '../types';

const router = Router();

router.get('/', async (req, res) => {
  const response: ApiResponse = {
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0'
    }
  };
  
  res.json(response);
});

router.get('/detailed', async (req, res) => {
  const checks: Record<string, any> = {
    database: { status: 'unknown' },
    redis: { status: 'unknown' },
    memory: {
      used: process.memoryUsage().heapUsed,
      total: process.memoryUsage().heapTotal
    }
  };
  
  // Check database connection
  try {
    const db = getDatabase();
    await db.raw('SELECT 1');
    checks.database = { status: 'healthy' };
  } catch (error) {
    checks.database = { 
      status: 'unhealthy', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
  
  // Check Redis connection
  try {
    const redis = getRedisClient();
    await redis.ping();
    checks.redis = { status: 'healthy' };
  } catch (error) {
    checks.redis = { 
      status: 'unhealthy', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
  
  const allHealthy = Object.values(checks).every(check => 
    check.status === 'healthy' || !check.status
  );
  
  const response: ApiResponse = {
    success: allHealthy,
    data: {
      status: allHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks
    }
  };
  
  res.status(allHealthy ? 200 : 503).json(response);
});

export { router as healthRoutes };