import axios from 'axios';
import { authApi, dashboardApi, healthApi } from '../../services/api';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock axios.create
const mockAxiosInstance = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  interceptors: {
    request: {
      use: jest.fn(),
    },
    response: {
      use: jest.fn(),
    },
  },
};

mockedAxios.create.mockReturnValue(mockAxiosInstance as any);

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    hostname: 'localhost',
    href: 'http://localhost:3000',
  },
  writable: true,
});

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('authApi', () => {
    describe('login', () => {
      it('should call login endpoint with correct data', async () => {
        const mockResponse = {
          data: {
            data: {
              token: 'test-token',
              user: {
                id: 1,
                email: 'test@example.com',
                role: 'admin',
              },
              tenant: {
                id: 1,
                name: 'Test Company',
                subdomain: 'test',
              },
            },
          },
        };

        mockAxiosInstance.post.mockResolvedValue(mockResponse);

        const credentials = {
          email: 'test@example.com',
          password: 'password123',
        };

        const result = await authApi.login(credentials);

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/login', credentials);
        expect(result).toEqual(mockResponse.data.data);
      });

      it('should handle login error', async () => {
        const mockError = {
          response: {
            data: {
              error: 'Invalid credentials',
            },
          },
        };

        mockAxiosInstance.post.mockRejectedValue(mockError);

        const credentials = {
          email: 'test@example.com',
          password: 'wrongpassword',
        };

        await expect(authApi.login(credentials)).rejects.toEqual(mockError);
      });
    });

    describe('register', () => {
      it('should call register endpoint with correct data', async () => {
        const mockResponse = {
          data: {
            data: {
              token: 'test-token',
              user: {
                id: 1,
                email: 'test@example.com',
                role: 'admin',
              },
              tenant: {
                id: 1,
                name: 'Test Company',
                subdomain: 'test',
              },
            },
          },
        };

        mockAxiosInstance.post.mockResolvedValue(mockResponse);

        const userData = {
          email: 'test@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
          companyName: 'Test Company',
          subdomain: 'test',
          businessType: 'cleaning',
        };

        const result = await authApi.register(userData);

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/register', userData);
        expect(result).toEqual(mockResponse.data.data);
      });
    });

    describe('logout', () => {
      it('should call logout endpoint', async () => {
        mockAxiosInstance.post.mockResolvedValue({});

        await authApi.logout();

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/logout');
      });
    });
  });

  describe('dashboardApi', () => {
    describe('getStats', () => {
      it('should fetch dashboard stats', async () => {
        const mockStats = {
          totalRevenue: 15000,
          totalCustomers: 50,
          totalJobs: 120,
          completedJobs: 100,
          pendingJobs: 20,
          revenueGrowth: 15.5,
          customerGrowth: 8.2,
        };

        const mockResponse = {
          data: {
            data: mockStats,
          },
        };

        mockAxiosInstance.get.mockResolvedValue(mockResponse);

        const result = await dashboardApi.getStats();

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/dashboard/stats');
        expect(result).toEqual(mockStats);
      });
    });

    describe('getRecentJobs', () => {
      it('should fetch recent jobs', async () => {
        const mockJobs = [
          {
            id: 1,
            title: 'Test Job',
            status: 'completed',
            scheduledDate: '2024-01-15',
          },
        ];

        const mockResponse = {
          data: {
            data: mockJobs,
          },
        };

        mockAxiosInstance.get.mockResolvedValue(mockResponse);

        const result = await dashboardApi.getRecentJobs();

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/dashboard/recent-jobs');
        expect(result).toEqual(mockJobs);
      });
    });

    describe('getRevenueChart', () => {
      it('should fetch revenue chart data', async () => {
        const mockChartData = {
          labels: ['Jan', 'Feb', 'Mar'],
          datasets: [
            {
              label: 'Revenue',
              data: [1000, 1500, 2000],
            },
          ],
        };

        const mockResponse = {
          data: {
            data: mockChartData,
          },
        };

        mockAxiosInstance.get.mockResolvedValue(mockResponse);

        const result = await dashboardApi.getRevenueChart();

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/dashboard/revenue-chart');
        expect(result).toEqual(mockChartData);
      });
    });
  });

  describe('healthApi', () => {
    describe('check', () => {
      it('should fetch health check', async () => {
        const mockHealth = {
          success: true,
          data: {
            status: 'healthy',
            timestamp: '2024-01-15T10:00:00Z',
          },
        };

        const mockResponse = {
          data: mockHealth,
        };

        mockAxiosInstance.get.mockResolvedValue(mockResponse);

        const result = await healthApi.check();

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/health');
        expect(result).toEqual(mockHealth);
      });
    });

    describe('detailed', () => {
      it('should fetch detailed health check', async () => {
        const mockDetailedHealth = {
          success: true,
          data: {
            status: 'healthy',
            checks: {
              database: { status: 'healthy' },
              redis: { status: 'healthy' },
            },
          },
        };

        const mockResponse = {
          data: mockDetailedHealth,
        };

        mockAxiosInstance.get.mockResolvedValue(mockResponse);

        const result = await healthApi.detailed();

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/health/detailed');
        expect(result).toEqual(mockDetailedHealth);
      });
    });
  });

  describe('axios interceptors', () => {
    it('should add authorization header when token exists', () => {
      localStorage.setItem('authToken', 'test-token');

      // Verify that the request interceptor was set up
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();

      // Get the request interceptor function
      const requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0];

      const config = {
        headers: {},
      };

      const result = requestInterceptor(config);

      expect(result.headers.Authorization).toBe('Bearer test-token');
    });

    it('should add tenant subdomain header from hostname', () => {
      window.location.hostname = 'testcompany.dashboard.com';

      const requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0];

      const config = {
        headers: {},
      };

      const result = requestInterceptor(config);

      expect(result.headers['X-Tenant-Subdomain']).toBe('testcompany');
    });

    it('should add tenant subdomain from localStorage for localhost', () => {
      window.location.hostname = 'localhost';
      localStorage.setItem('tenantSubdomain', 'stored-tenant');

      const requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0];

      const config = {
        headers: {},
      };

      const result = requestInterceptor(config);

      expect(result.headers['X-Tenant-Subdomain']).toBe('stored-tenant');
    });

    it('should handle request interceptor errors', () => {
      const requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][1];

      const error = new Error('Request error');
      expect(() => requestInterceptor(error)).toThrow('Request error');
    });
  });
});