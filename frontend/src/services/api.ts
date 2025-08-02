import axios, { AxiosResponse } from 'axios';
import { ApiResponse, AuthResponse, LoginRequest, DashboardStats, ChartData } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost';

// Create axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token and tenant context
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add tenant subdomain from hostname or storage
    const hostname = window.location.hostname;
    const subdomain = hostname.split('.')[0];
    
    if (subdomain && subdomain !== 'localhost' && subdomain !== 'www') {
      config.headers['X-Tenant-Subdomain'] = subdomain;
    } else {
      // Fallback to stored tenant for development
      const storedTenant = localStorage.getItem('tenantSubdomain');
      if (storedTenant) {
        config.headers['X-Tenant-Subdomain'] = storedTenant;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('tenant');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    return response.data.data!;
  },

  register: async (userData: any): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', userData);
    return response.data.data!;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },
};

// Dashboard API
export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get<ApiResponse<DashboardStats>>('/dashboard/stats');
    return response.data.data!;
  },

  getRecentJobs: async (): Promise<any[]> => {
    const response = await api.get<ApiResponse<any[]>>('/dashboard/recent-jobs');
    return response.data.data!;
  },

  getRevenueChart: async (): Promise<ChartData> => {
    const response = await api.get<ApiResponse<ChartData>>('/dashboard/revenue-chart');
    return response.data.data!;
  },
};

// Health API
export const healthApi = {
  check: async (): Promise<any> => {
    const response = await api.get<ApiResponse>('/health');
    return response.data;
  },

  detailed: async (): Promise<any> => {
    const response = await api.get<ApiResponse>('/health/detailed');
    return response.data;
  },
};

export default api;