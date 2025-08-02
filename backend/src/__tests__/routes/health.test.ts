import request from 'supertest';
import express from 'express';
import { healthRoutes } from '../../routes/health';

// Mock database and redis connections
const mockDb = {
  raw: jest.fn()
};

const mockRedis = {
  ping: jest.fn()
};

jest.mock('../../config/database', () => ({
  getDatabase: () => mockDb
}));

jest.mock('../../config/redis', () => ({
  getRedisClient: () => mockRedis
}));

const app = express();
app.use('/api/health', healthRoutes);

describe('Health Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          status: 'healthy',
          timestamp: expect.any(String),
          uptime: expect.any(Number),
          version: expect.any(String)
        }
      });
    });

    it('should include correct timestamp format', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      const timestamp = new Date(response.body.data.timestamp);
      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.getTime()).not.toBeNaN();
    });
  });

  describe('GET /api/health/detailed', () => {
    it('should return detailed health status when all services are healthy', async () => {
      mockDb.raw.mockResolvedValue([]);
      mockRedis.ping.mockResolvedValue('PONG');

      const response = await request(app)
        .get('/api/health/detailed')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          status: 'healthy',
          timestamp: expect.any(String),
          uptime: expect.any(Number),
          checks: {
            database: { status: 'healthy' },
            redis: { status: 'healthy' },
            memory: {
              used: expect.any(Number),
              total: expect.any(Number)
            }
          }
        }
      });
    });

    it('should return unhealthy status when database is down', async () => {
      mockDb.raw.mockRejectedValue(new Error('Connection failed'));
      mockRedis.ping.mockResolvedValue('PONG');

      const response = await request(app)
        .get('/api/health/detailed')
        .expect(503);

      expect(response.body.success).toBe(false);
      expect(response.body.data.status).toBe('unhealthy');
      expect(response.body.data.checks.database).toEqual({
        status: 'unhealthy',
        error: 'Connection failed'
      });
      expect(response.body.data.checks.redis).toEqual({
        status: 'healthy'
      });
    });

    it('should return unhealthy status when redis is down', async () => {
      mockDb.raw.mockResolvedValue([]);
      mockRedis.ping.mockRejectedValue(new Error('Redis connection failed'));

      const response = await request(app)
        .get('/api/health/detailed')
        .expect(503);

      expect(response.body.success).toBe(false);
      expect(response.body.data.status).toBe('unhealthy');
      expect(response.body.data.checks.database).toEqual({
        status: 'healthy'
      });
      expect(response.body.data.checks.redis).toEqual({
        status: 'unhealthy',
        error: 'Redis connection failed'
      });
    });

    it('should return unhealthy status when both services are down', async () => {
      mockDb.raw.mockRejectedValue(new Error('Database error'));
      mockRedis.ping.mockRejectedValue(new Error('Redis error'));

      const response = await request(app)
        .get('/api/health/detailed')
        .expect(503);

      expect(response.body.success).toBe(false);
      expect(response.body.data.status).toBe('unhealthy');
      expect(response.body.data.checks.database.status).toBe('unhealthy');
      expect(response.body.data.checks.redis.status).toBe('unhealthy');
    });

    it('should include memory usage information', async () => {
      mockDb.raw.mockResolvedValue([]);
      mockRedis.ping.mockResolvedValue('PONG');

      const response = await request(app)
        .get('/api/health/detailed')
        .expect(200);

      expect(response.body.data.checks.memory).toEqual({
        used: expect.any(Number),
        total: expect.any(Number)
      });
      expect(response.body.data.checks.memory.used).toBeGreaterThan(0);
      expect(response.body.data.checks.memory.total).toBeGreaterThan(0);
    });
  });
});