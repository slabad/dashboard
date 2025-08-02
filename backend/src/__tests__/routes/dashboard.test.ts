import request from 'supertest';
import express from 'express';
import { dashboardRoutes } from '../../routes/dashboard';

const app = express();
app.use('/api/dashboard', dashboardRoutes);

describe('Dashboard Routes', () => {
  describe('GET /api/dashboard/stats', () => {
    it('should return dashboard stats', async () => {
      const response = await request(app)
        .get('/api/dashboard/stats')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          totalRevenue: 0,
          totalCustomers: 0,
          totalJobs: 0,
          completedJobs: 0,
          pendingJobs: 0,
          revenueGrowth: 0,
          customerGrowth: 0
        }
      });
    });

    it('should return consistent data structure', async () => {
      const response = await request(app)
        .get('/api/dashboard/stats')
        .expect(200);

      const { data } = response.body;
      expect(typeof data.totalRevenue).toBe('number');
      expect(typeof data.totalCustomers).toBe('number');
      expect(typeof data.totalJobs).toBe('number');
      expect(typeof data.completedJobs).toBe('number');
      expect(typeof data.pendingJobs).toBe('number');
      expect(typeof data.revenueGrowth).toBe('number');
      expect(typeof data.customerGrowth).toBe('number');
    });
  });

  describe('GET /api/dashboard/recent-jobs', () => {
    it('should return empty array for recent jobs', async () => {
      const response = await request(app)
        .get('/api/dashboard/recent-jobs')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: []
      });
    });

    it('should return array data type', async () => {
      const response = await request(app)
        .get('/api/dashboard/recent-jobs')
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/dashboard/revenue-chart', () => {
    it('should return chart data structure', async () => {
      const response = await request(app)
        .get('/api/dashboard/revenue-chart')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          labels: [],
          datasets: []
        }
      });
    });

    it('should return correct chart data structure', async () => {
      const response = await request(app)
        .get('/api/dashboard/revenue-chart')
        .expect(200);

      const { data } = response.body;
      expect(Array.isArray(data.labels)).toBe(true);
      expect(Array.isArray(data.datasets)).toBe(true);
    });
  });

  describe('Error handling', () => {
    it('should handle invalid routes', async () => {
      await request(app)
        .get('/api/dashboard/nonexistent')
        .expect(404);
    });
  });
});