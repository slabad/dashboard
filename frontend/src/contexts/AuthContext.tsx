import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Tenant, AuthResponse, LoginRequest } from '../types';
import { authApi } from '../services/api';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
  setTenant: (tenant: Tenant | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    // Check for existing auth on mount
    const token = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');
    const storedTenant = localStorage.getItem('tenant');

    if (token && storedUser && storedTenant) {
      try {
        setUser(JSON.parse(storedUser));
        setTenant(JSON.parse(storedTenant));
      } catch (error) {
        console.error('Error parsing stored auth data:', error);
        logout();
      }
    }

    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true);
      const authResponse: AuthResponse = await authApi.login(credentials);
      
      // Store auth data
      localStorage.setItem('authToken', authResponse.token);
      localStorage.setItem('user', JSON.stringify(authResponse.user));
      localStorage.setItem('tenant', JSON.stringify(authResponse.tenant));
      localStorage.setItem('tenantSubdomain', authResponse.tenant.subdomain);

      setUser(authResponse.user);
      setTenant(authResponse.tenant);

      toast.success(`Welcome back, ${authResponse.user.firstName || authResponse.user.email}!`);
    } catch (error: any) {
      const message = error.response?.data?.error || error.message || 'Login failed. Please try again.';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Clear auth data
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('tenant');
    localStorage.removeItem('tenantSubdomain');

    setUser(null);
    setTenant(null);

    // Call logout API (don't wait for response)
    authApi.logout().catch(() => {
      // Ignore errors on logout
    });

    toast.success('You have been logged out.');
  };

  const value: AuthContextType = {
    user,
    tenant,
    isAuthenticated,
    isLoading,
    login,
    logout,
    setUser,
    setTenant,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}