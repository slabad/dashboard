import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';
import { authApi } from '../../services/api';

// Mock the authApi
jest.mock('../../services/api', () => ({
  authApi: {
    login: jest.fn(),
    logout: jest.fn(),
  },
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockAuthApi = authApi as jest.Mocked<typeof authApi>;

// Test component that uses useAuth
const TestComponent = () => {
  const { user, tenant, isAuthenticated, isLoading, login, logout } = useAuth();
  
  return (
    <div>
      <div data-testid="is-authenticated">{isAuthenticated.toString()}</div>
      <div data-testid="is-loading">{isLoading.toString()}</div>
      <div data-testid="user">{user ? user.email : 'null'}</div>
      <div data-testid="tenant">{tenant ? tenant.name : 'null'}</div>
      <button onClick={() => login({ email: 'test@example.com', password: 'password' })}>
        Login
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

const renderWithAuthProvider = () => {
  return render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('provides initial unauthenticated state', () => {
    renderWithAuthProvider();
    
    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
    expect(screen.getByTestId('user')).toHaveTextContent('null');
    expect(screen.getByTestId('tenant')).toHaveTextContent('null');
  });

  it('loads existing auth data from localStorage on mount', () => {
    const mockUser = {
      id: 1,
      tenantId: 1,
      email: 'test@example.com',
      role: 'admin' as const,
      isActive: true,
    };

    const mockTenant = {
      id: 1,
      name: 'Test Company',
      subdomain: 'test',
      businessType: 'cleaning',
      settings: {},
    };

    localStorage.setItem('authToken', 'test-token');
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('tenant', JSON.stringify(mockTenant));

    renderWithAuthProvider();

    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
    expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
    expect(screen.getByTestId('tenant')).toHaveTextContent('Test Company');
  });

  it('handles corrupted localStorage data gracefully', () => {
    localStorage.setItem('authToken', 'test-token');
    localStorage.setItem('user', 'invalid-json');
    localStorage.setItem('tenant', 'invalid-json');

    renderWithAuthProvider();

    // Should fallback to unauthenticated state
    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('user')).toHaveTextContent('null');
    expect(screen.getByTestId('tenant')).toHaveTextContent('null');
  });

  it('handles successful login', async () => {
    const mockAuthResponse = {
      token: 'new-token',
      user: {
        id: 1,
        tenantId: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'admin' as const,
        isActive: true,
      },
      tenant: {
        id: 1,
        name: 'Test Company',
        subdomain: 'test',
        businessType: 'cleaning',
        settings: {},
      },
    };

    mockAuthApi.login.mockResolvedValue(mockAuthResponse);

    renderWithAuthProvider();

    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
    });

    expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
    expect(screen.getByTestId('tenant')).toHaveTextContent('Test Company');
    
    // Check localStorage
    expect(localStorage.setItem).toHaveBeenCalledWith('authToken', 'new-token');
    expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockAuthResponse.user));
    expect(localStorage.setItem).toHaveBeenCalledWith('tenant', JSON.stringify(mockAuthResponse.tenant));
    expect(localStorage.setItem).toHaveBeenCalledWith('tenantSubdomain', 'test');
  });

  it('handles login error', async () => {
    const mockError = {
      response: {
        data: {
          error: 'Invalid credentials',
        },
      },
    };

    mockAuthApi.login.mockRejectedValue(mockError);

    renderWithAuthProvider();

    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
    });

    // Should remain unauthenticated
    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('user')).toHaveTextContent('null');
  });

  it('handles login error without response data', async () => {
    const mockError = new Error('Network error');
    mockAuthApi.login.mockRejectedValue(mockError);

    renderWithAuthProvider();

    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
  });

  it('handles logout', () => {
    // Set up authenticated state
    const mockUser = {
      id: 1,
      tenantId: 1,
      email: 'test@example.com',
      role: 'admin' as const,
      isActive: true,
    };

    const mockTenant = {
      id: 1,
      name: 'Test Company',
      subdomain: 'test',
      businessType: 'cleaning',
      settings: {},
    };

    localStorage.setItem('authToken', 'test-token');
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('tenant', JSON.stringify(mockTenant));

    renderWithAuthProvider();

    // Verify authenticated state
    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');

    // Logout
    fireEvent.click(screen.getByText('Logout'));

    // Should be unauthenticated
    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('user')).toHaveTextContent('null');
    expect(screen.getByTestId('tenant')).toHaveTextContent('null');

    // Should clear localStorage
    expect(localStorage.removeItem).toHaveBeenCalledWith('authToken');
    expect(localStorage.removeItem).toHaveBeenCalledWith('user');
    expect(localStorage.removeItem).toHaveBeenCalledWith('tenant');
    expect(localStorage.removeItem).toHaveBeenCalledWith('tenantSubdomain');
  });

  it('calls logout API on logout', () => {
    mockAuthApi.logout.mockResolvedValue();

    renderWithAuthProvider();

    fireEvent.click(screen.getByText('Logout'));

    expect(mockAuthApi.logout).toHaveBeenCalled();
  });

  it('handles logout API error gracefully', () => {
    mockAuthApi.logout.mockRejectedValue(new Error('API error'));

    renderWithAuthProvider();

    fireEvent.click(screen.getByText('Logout'));

    // Should still logout locally even if API call fails
    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
  });

  it('throws error when useAuth is used outside AuthProvider', () => {
    const TestComponentWithoutProvider = () => {
      useAuth();
      return <div>Test</div>;
    };

    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<TestComponentWithoutProvider />)).toThrow(
      'useAuth must be used within an AuthProvider'
    );

    consoleSpy.mockRestore();
  });
});