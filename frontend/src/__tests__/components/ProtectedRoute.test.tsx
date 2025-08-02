import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProtectedRoute from '../../components/ProtectedRoute';
import { AuthProvider } from '../../contexts/AuthContext';

// Mock the useAuth hook
const mockUseAuth = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
  tenant: null,
  login: jest.fn(),
  logout: jest.fn(),
};

jest.mock('../../contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useAuth: () => mockUseAuth,
}));

// Mock Navigate component
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Navigate: ({ to, state }: { to: string; state: any }) => {
    mockNavigate(to, state);
    return <div data-testid="navigate">Redirecting to {to}</div>;
  },
}));

const TestComponent = () => <div data-testid="protected-content">Protected Content</div>;

const renderProtectedRoute = (initialEntries = ['/dashboard']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('ProtectedRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock state
    mockUseAuth.isAuthenticated = false;
    mockUseAuth.isLoading = false;
    mockUseAuth.user = null;
  });

  it('shows loading spinner when authentication is loading', () => {
    mockUseAuth.isLoading = true;
    
    renderProtectedRoute();
    
    // Should show loading spinner
    const spinner = screen.getByRole('generic');
    expect(spinner).toHaveClass('animate-spin');
  });

  it('redirects to login when user is not authenticated', () => {
    mockUseAuth.isAuthenticated = false;
    mockUseAuth.isLoading = false;
    
    renderProtectedRoute(['/dashboard']);
    
    expect(screen.getByTestId('navigate')).toBeInTheDocument();
    expect(mockNavigate).toHaveBeenCalledWith('/login', {
      from: expect.objectContaining({ pathname: '/dashboard' })
    });
  });

  it('renders protected content when user is authenticated', () => {
    mockUseAuth.isAuthenticated = true;
    mockUseAuth.isLoading = false;
    mockUseAuth.user = {
      id: 1,
      tenantId: 1,
      email: 'test@example.com',
      role: 'admin',
      isActive: true,
    };
    
    renderProtectedRoute();
    
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('preserves the intended destination in redirect state', () => {
    mockUseAuth.isAuthenticated = false;
    mockUseAuth.isLoading = false;
    
    renderProtectedRoute(['/dashboard/analytics']);
    
    expect(mockNavigate).toHaveBeenCalledWith('/login', {
      from: expect.objectContaining({ pathname: '/dashboard/analytics' })
    });
  });

  it('handles loading state properly', () => {
    mockUseAuth.isLoading = true;
    mockUseAuth.isAuthenticated = false;
    
    renderProtectedRoute();
    
    // Should show loading state, not redirect
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    
    const loadingContainer = screen.getByRole('generic');
    expect(loadingContainer).toHaveClass('min-h-screen', 'flex', 'items-center', 'justify-center');
  });

  it('transitions from loading to authenticated correctly', () => {
    // Start with loading
    mockUseAuth.isLoading = true;
    mockUseAuth.isAuthenticated = false;
    
    const { rerender } = renderProtectedRoute();
    
    expect(screen.getByRole('generic')).toHaveClass('animate-spin');
    
    // Simulate authentication complete
    mockUseAuth.isLoading = false;
    mockUseAuth.isAuthenticated = true;
    mockUseAuth.user = {
      id: 1,
      tenantId: 1,
      email: 'test@example.com',
      role: 'admin',
      isActive: true,
    };
    
    rerender(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AuthProvider>
          <ProtectedRoute>
            <TestComponent />
          </ProtectedRoute>
        </AuthProvider>
      </MemoryRouter>
    );
    
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('transitions from loading to unauthenticated correctly', () => {
    // Start with loading
    mockUseAuth.isLoading = true;
    mockUseAuth.isAuthenticated = false;
    
    const { rerender } = renderProtectedRoute();
    
    expect(screen.getByRole('generic')).toHaveClass('animate-spin');
    
    // Simulate authentication check complete - not authenticated
    mockUseAuth.isLoading = false;
    mockUseAuth.isAuthenticated = false;
    
    rerender(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AuthProvider>
          <ProtectedRoute>
            <TestComponent />
          </ProtectedRoute>
        </AuthProvider>
      </MemoryRouter>
    );
    
    expect(screen.getByTestId('navigate')).toBeInTheDocument();
  });
});