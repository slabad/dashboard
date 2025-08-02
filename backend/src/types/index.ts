import { Request } from 'express';

// Extend Express Request to include tenant and user context
declare global {
  namespace Express {
    interface Request {
      tenant?: {
        id: number;
        subdomain: string;
        name: string;
        businessType: string;
        settings: any;
      };
      user?: {
        id: number;
        tenantId: number;
        email: string;
        firstName?: string;
        lastName?: string;
        role: string;
        isActive: boolean;
      };
    }
  }
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Database entity types
export interface Tenant {
  id: number;
  name: string;
  subdomain: string;
  businessType: string;
  settings: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: number;
  tenantId: number;
  email: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
  role: 'admin' | 'manager' | 'user';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  id: number;
  tenantId: number;
  externalId?: string;
  externalSource?: string;
  name: string;
  email?: string;
  phone?: string;
  address?: Record<string, any>;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Service {
  id: number;
  tenantId: number;
  name: string;
  description?: string;
  category: string;
  basePrice?: number;
  unit: string;
  isActive: boolean;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Job {
  id: number;
  tenantId: number;
  customerId: number;
  serviceId?: number;
  externalId?: string;
  externalSource?: string;
  title: string;
  description?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  scheduledDate?: Date;
  scheduledTimeStart?: string;
  scheduledTimeEnd?: string;
  actualStartTime?: Date;
  actualEndTime?: Date;
  quotedAmount?: number;
  finalAmount?: number;
  address?: Record<string, any>;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: number;
  tenantId: number;
  customerId?: number;
  jobId?: number;
  externalId?: string;
  externalSource?: string;
  type: 'invoice' | 'payment' | 'expense' | 'refund';
  amount: number;
  currency: string;
  description?: string;
  transactionDate: Date;
  dueDate?: Date;
  status: string;
  externalData: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Integration {
  id: number;
  tenantId: number;
  serviceName: string;
  config: Record<string, any>;
  isActive: boolean;
  lastSyncAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
  subdomain?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName: string;
  subdomain: string;
  businessType: string;
}

export interface AuthResponse {
  token: string;
  user: Omit<User, 'passwordHash'>;
  tenant: Tenant;
}

// Dashboard types
export interface DashboardStats {
  totalRevenue: number;
  totalCustomers: number;
  totalJobs: number;
  completedJobs: number;
  pendingJobs: number;
  revenueGrowth: number;
  customerGrowth: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
    fill?: boolean;
  }[];
}

// File upload types
export interface FileUpload {
  id: number;
  tenantId: number;
  originalFilename: string;
  fileType: string;
  fileSize: number;
  storagePath: string;
  processingStatus: 'pending' | 'processing' | 'completed' | 'error';
  extractedData?: Record<string, any>;
  errorMessage?: string;
  uploadedBy: number;
  createdAt: Date;
  processedAt?: Date;
}