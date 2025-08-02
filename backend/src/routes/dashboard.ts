import { Router, Request, Response } from 'express';
import { getDatabase } from '../config/database';
import { authMiddleware } from '../middleware/authMiddleware';
import { asyncHandler } from '../middleware/errorHandler';
import { ApiResponse, DashboardStats, ChartData } from '../types';

const router = Router();

// Apply authentication middleware to all dashboard routes
router.use(authMiddleware);

/**
 * GET /api/dashboard/stats
 * Get dashboard statistics for the current tenant
 */
router.get('/stats', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const db = getDatabase();
  const tenantId = req.tenant!.id;

  // Get basic stats from database
  const [
    customerCount,
    jobCount,
    completedJobCount,
    pendingJobCount,
    revenueResult
  ] = await Promise.all([
    db('customers').where('tenant_id', tenantId).count('* as count').first(),
    db('jobs').where('tenant_id', tenantId).count('* as count').first(),
    db('jobs').where('tenant_id', tenantId).where('status', 'completed').count('* as count').first(),
    db('jobs').where('tenant_id', tenantId).whereIn('status', ['scheduled', 'in_progress']).count('* as count').first(),
    db('transactions')
      .where('tenant_id', tenantId)
      .where('type', 'payment')
      .where('status', 'completed')
      .sum('amount as total')
      .first()
  ]);

  // Calculate growth (simplified - comparing to previous period would require more complex queries)
  const totalRevenue = parseFloat(revenueResult?.total || '0');
  
  const stats: DashboardStats = {
    totalRevenue,
    totalCustomers: parseInt(customerCount?.count as string || '0'),
    totalJobs: parseInt(jobCount?.count as string || '0'),
    completedJobs: parseInt(completedJobCount?.count as string || '0'),
    pendingJobs: parseInt(pendingJobCount?.count as string || '0'),
    revenueGrowth: 0, // TODO: Calculate actual growth
    customerGrowth: 0, // TODO: Calculate actual growth
  };

  const response: ApiResponse<DashboardStats> = {
    success: true,
    data: stats
  };
  res.json(response);
}));

/**
 * GET /api/dashboard/recent-jobs
 * Get recent jobs for the current tenant
 */
router.get('/recent-jobs', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const db = getDatabase();
  const tenantId = req.tenant!.id;

  const jobs = await db('jobs')
    .select(
      'jobs.*',
      'customers.name as customer_name',
      'services.name as service_name'
    )
    .leftJoin('customers', 'jobs.customer_id', 'customers.id')
    .leftJoin('services', 'jobs.service_id', 'services.id')
    .where('jobs.tenant_id', tenantId)
    .orderBy('jobs.created_at', 'desc')
    .limit(10);

  // Transform database results to match frontend expectations
  const transformedJobs = jobs.map(job => ({
    id: job.id,
    tenantId: job.tenant_id,
    customerId: job.customer_id,
    serviceId: job.service_id,
    externalId: job.external_id,
    externalSource: job.external_source,
    title: job.title,
    description: job.description,
    status: job.status,
    scheduledDate: job.scheduled_date,
    scheduledTimeStart: job.scheduled_time_start,
    scheduledTimeEnd: job.scheduled_time_end,
    actualStartTime: job.actual_start_time,
    actualEndTime: job.actual_end_time,
    quotedAmount: job.quoted_amount ? parseFloat(job.quoted_amount) : undefined,
    finalAmount: job.final_amount ? parseFloat(job.final_amount) : undefined,
    address: job.address,
    metadata: job.metadata,
    createdAt: job.created_at,
    updatedAt: job.updated_at,
    customerName: job.customer_name,
    serviceName: job.service_name,
  }));

  const response: ApiResponse = {
    success: true,
    data: transformedJobs
  };
  res.json(response);
}));

/**
 * GET /api/dashboard/revenue-chart
 * Get revenue chart data for the current tenant
 */
router.get('/revenue-chart', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const db = getDatabase();
  const tenantId = req.tenant!.id;

  // Get revenue data for the last 6 months
  const revenueData = await db('transactions')
    .select(
      db.raw("DATE_TRUNC('month', transaction_date) as month"),
      db.raw('SUM(amount) as revenue')
    )
    .where('tenant_id', tenantId)
    .where('type', 'payment')
    .where('status', 'completed')
    .where('transaction_date', '>=', db.raw("NOW() - INTERVAL '6 months'"))
    .groupBy(db.raw("DATE_TRUNC('month', transaction_date)"))
    .orderBy('month');

  // Transform data for chart
  const labels = revenueData.map((row: any) => {
    const date = new Date(row.month);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  });

  const data = revenueData.map((row: any) => parseFloat(row.revenue || '0'));

  const chartData: ChartData = {
    labels,
    datasets: [
      {
        label: 'Revenue',
        data,
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',
        fill: false,
      }
    ]
  };

  const response: ApiResponse<ChartData> = {
    success: true,
    data: chartData
  };
  res.json(response);
}));

export { router as dashboardRoutes };