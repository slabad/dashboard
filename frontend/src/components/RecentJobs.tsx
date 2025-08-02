import React from 'react';
import { format } from 'date-fns';
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlayIcon,
} from '@heroicons/react/24/outline';
import { Job } from '../types';

interface RecentJobsProps {
  jobs?: Job[];
  isLoading: boolean;
}

const statusIcons = {
  scheduled: ClockIcon,
  in_progress: PlayIcon,
  completed: CheckCircleIcon,
  cancelled: XCircleIcon,
};

const statusColors = {
  scheduled: 'text-yellow-500 bg-yellow-100',
  in_progress: 'text-blue-500 bg-blue-100',
  completed: 'text-green-500 bg-green-100',
  cancelled: 'text-red-500 bg-red-100',
};

function RecentJobs({ jobs, isLoading }: RecentJobsProps) {
  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Recent Jobs
          </h3>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Mock data for demonstration
  const mockJobs: Job[] = jobs?.length ? jobs : [
    {
      id: 1,
      tenantId: 1,
      customerId: 1,
      title: 'Weekly House Cleaning - Johnson Residence',
      description: 'Standard cleaning package',
      status: 'scheduled',
      scheduledDate: new Date().toISOString(),
      quotedAmount: 150,
      metadata: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 2,
      tenantId: 1,
      customerId: 2,
      title: 'Deep Clean - Smith Office',
      description: 'Deep cleaning with carpet shampooing',
      status: 'in_progress',
      scheduledDate: new Date().toISOString(),
      quotedAmount: 300,
      metadata: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 3,
      tenantId: 1,
      customerId: 3,
      title: 'Move-out Cleaning - Brown Apartment',
      description: 'Complete move-out cleaning service',
      status: 'completed',
      scheduledDate: new Date(Date.now() - 86400000).toISOString(),
      quotedAmount: 200,
      finalAmount: 200,
      metadata: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Recent Jobs
          </h3>
          <a
            href="/jobs"
            className="text-sm font-medium text-primary-600 hover:text-primary-500"
          >
            View all
          </a>
        </div>
        
        {mockJobs.length === 0 ? (
          <div className="text-center py-8">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <ClockIcon className="h-12 w-12" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Start by adding your first customer and scheduling a job.
            </p>
            <div className="mt-6">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Add Job
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {mockJobs.slice(0, 5).map((job) => {
              const StatusIcon = statusIcons[job.status];
              return (
                <div key={job.id} className="flex items-center space-x-3">
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      statusColors[job.status]
                    }`}
                  >
                    <StatusIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {job.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      {job.scheduledDate && format(new Date(job.scheduledDate), 'MMM d, yyyy')}
                      {job.quotedAmount && ` • $${job.quotedAmount}`}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        job.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : job.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-800'
                          : job.status === 'scheduled'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {job.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default RecentJobs;