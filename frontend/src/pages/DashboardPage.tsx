import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { dashboardApi } from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import StatsCards from '../components/StatsCards';
import RevenueChart from '../components/RevenueChart';
import RecentJobs from '../components/RecentJobs';
import { DashboardStats, ChartData } from '../types';
import toast from 'react-hot-toast';

function DashboardPage() {
  const { user, tenant } = useAuth();
  const [stats, setStats] = useState<DashboardStats | undefined>(undefined);
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<ChartData | undefined>(undefined);
  const [statsLoading, setStatsLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [revenueLoading, setRevenueLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Load stats
        try {
          const statsResponse = await dashboardApi.getStats();
          setStats(statsResponse);
        } catch (error) {
          console.error('Failed to load stats:', error);
        } finally {
          setStatsLoading(false);
        }

        // Load recent jobs
        try {
          const jobsResponse = await dashboardApi.getRecentJobs();
          setRecentJobs(jobsResponse);
        } catch (error) {
          console.error('Failed to load jobs:', error);
        } finally {
          setJobsLoading(false);
        }

        // Load revenue chart
        try {
          const revenueResponse = await dashboardApi.getRevenueChart();
          setRevenueData(revenueResponse);
        } catch (error) {
          console.error('Failed to load revenue chart:', error);
        } finally {
          setRevenueLoading(false);
        }
      } catch (error) {
        console.error('Dashboard data loading error:', error);
      }
    };

    loadDashboardData();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="px-4 sm:px-6 lg:mx-auto lg:max-w-6xl lg:px-8">
            <div className="py-6 md:flex md:items-center md:justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center">
                  <div>
                    <div className="flex items-center">
                      <h1 className="ml-3 text-2xl font-bold leading-7 text-gray-900 sm:leading-9 sm:truncate">
                        Dashboard
                      </h1>
                    </div>
                    <dl className="mt-6 flex flex-col sm:ml-3 sm:mt-1 sm:flex-row sm:flex-wrap">
                      <dt className="sr-only">Company</dt>
                      <dd className="flex items-center text-sm text-gray-500 font-medium capitalize sm:mr-6">
                        {tenant?.name}
                      </dd>
                      <dt className="sr-only">Business Type</dt>
                      <dd className="mt-3 flex items-center text-sm text-gray-500 font-medium sm:mr-6 sm:mt-0 capitalize">
                        {tenant?.businessType} Business
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex space-x-3 md:mt-0 md:ml-4">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Export Data
                </button>
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Add Integration
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Stats Cards */}
          <StatsCards stats={stats} isLoading={statsLoading} />

          {/* Charts and Recent Activity */}
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Revenue Chart */}
            <div className="lg:col-span-1">
              <RevenueChart data={revenueData} isLoading={revenueLoading} />
            </div>

            {/* Recent Jobs */}
            <div className="lg:col-span-1">
              <RecentJobs jobs={recentJobs} isLoading={jobsLoading} />
            </div>
          </div>

          {/* Coming Soon */}
          <div className="mt-8 bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Coming Soon
              </h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>
                  Additional features including QuickBooks integration, advanced analytics,
                  and custom reporting will be available soon.
                </p>
              </div>
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="bg-gray-50 px-4 py-3 rounded-md">
                  <p className="font-medium text-gray-900">QuickBooks Integration</p>
                  <p className="text-sm text-gray-500">Sync financial data automatically</p>
                </div>
                <div className="bg-gray-50 px-4 py-3 rounded-md">
                  <p className="font-medium text-gray-900">Go High Level CRM</p>
                  <p className="text-sm text-gray-500">Customer relationship management</p>
                </div>
                <div className="bg-gray-50 px-4 py-3 rounded-md">
                  <p className="font-medium text-gray-900">File Upload & Processing</p>
                  <p className="text-sm text-gray-500">CSV and PDF report parsing</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default DashboardPage;