import React from 'react';
import {
  CurrencyDollarIcon,
  UsersIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';
import { DashboardStats } from '../types';

interface StatsCardsProps {
  stats?: DashboardStats;
  isLoading: boolean;
}

function StatsCards({ stats, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white overflow-hidden shadow rounded-lg animate-pulse">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-gray-200 rounded"></div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const statsData = [
    {
      name: 'Total Revenue',
      value: stats?.totalRevenue ? `$${stats.totalRevenue.toLocaleString()}` : '$0',
      icon: CurrencyDollarIcon,
      change: stats?.revenueGrowth || 0,
      changeType: (stats?.revenueGrowth || 0) >= 0 ? 'increase' : 'decrease',
    },
    {
      name: 'Total Customers',
      value: stats?.totalCustomers?.toLocaleString() || '0',
      icon: UsersIcon,
      change: stats?.customerGrowth || 0,
      changeType: (stats?.customerGrowth || 0) >= 0 ? 'increase' : 'decrease',
    },
    {
      name: 'Total Jobs',
      value: stats?.totalJobs?.toLocaleString() || '0',
      icon: BriefcaseIcon,
      change: 0,
      changeType: 'neutral',
    },
    {
      name: 'Completed Jobs',
      value: stats?.completedJobs?.toLocaleString() || '0',
      icon: CheckCircleIcon,
      change: 0,
      changeType: 'neutral',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {statsData.map((item) => (
        <div key={item.name} className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <item.icon className="h-8 w-8 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{item.name}</dt>
                  <dd className="text-lg font-medium text-gray-900">{item.value}</dd>
                </dl>
              </div>
            </div>
            {item.change !== 0 && (
              <div className="mt-4 flex items-center text-sm">
                {item.changeType === 'increase' ? (
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span
                  className={`${
                    item.changeType === 'increase' ? 'text-green-500' : 'text-red-500'
                  } font-medium`}
                >
                  {Math.abs(item.change)}%
                </span>
                <span className="text-gray-500 ml-1">from last month</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default StatsCards;