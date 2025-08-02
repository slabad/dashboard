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

// Auth types
export interface User {
  id: number;
  tenantId: number;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'admin' | 'manager' | 'user';
  isActive: boolean;
}

export interface Tenant {
  id: number;
  name: string;
  subdomain: string;
  businessType: string;
  settings: Record<string, any>;
}

export interface AuthResponse {
  token: string;
  user: User;
  tenant: Tenant;
}

export interface LoginRequest {
  email: string;
  password: string;
  subdomain?: string;
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

// Business entities
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
  createdAt: string;
  updatedAt: string;
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
  createdAt: string;
  updatedAt: string;
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
  scheduledDate?: string;
  scheduledTimeStart?: string;
  scheduledTimeEnd?: string;
  actualStartTime?: string;
  actualEndTime?: string;
  quotedAmount?: number;
  finalAmount?: number;
  address?: Record<string, any>;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
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
  transactionDate: string;
  dueDate?: string;
  status: string;
  externalData: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// Widget types
export interface Widget {
  id: string;
  type: string;
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  config: Record<string, any>;
  isVisible: boolean;
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  companyName: string;
  subdomain: string;
  businessType: string;
}