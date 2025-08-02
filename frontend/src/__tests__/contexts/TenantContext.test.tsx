import React from 'react';
import { render, screen } from '@testing-library/react';
import { TenantProvider, useTenant } from '../../contexts/TenantContext';

// Test component that uses useTenant
const TestComponent = () => {
  const { tenant, subdomain, setTenant } = useTenant();
  
  return (
    <div>
      <div data-testid="subdomain">{subdomain || 'null'}</div>
      <div data-testid="tenant-name">{tenant ? tenant.name : 'null'}</div>
      <button onClick={() => setTenant({
        id: 1,
        name: 'Test Company',
        subdomain: 'test',
        businessType: 'cleaning',
        settings: {}
      })}>
        Set Tenant
      </button>
      <button onClick={() => setTenant(null)}>Clear Tenant</button>
    </div>
  );
};

const renderWithTenantProvider = () => {
  return render(
    <TenantProvider>
      <TestComponent />
    </TenantProvider>
  );
};

// Mock window.location
const mockLocation = {
  hostname: 'localhost',
};

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

describe('TenantContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    mockLocation.hostname = 'localhost';
  });

  it('provides initial state with no tenant', () => {
    renderWithTenantProvider();
    
    expect(screen.getByTestId('subdomain')).toHaveTextContent('demo');
    expect(screen.getByTestId('tenant-name')).toHaveTextContent('null');
  });

  it('extracts subdomain from production hostname', () => {
    mockLocation.hostname = 'testcompany.dashboard.com';
    
    renderWithTenantProvider();
    
    expect(screen.getByTestId('subdomain')).toHaveTextContent('testcompany');
  });

  it('handles localhost with demo subdomain', () => {
    mockLocation.hostname = 'localhost';
    
    renderWithTenantProvider();
    
    expect(screen.getByTestId('subdomain')).toHaveTextContent('demo');
  });

  it('handles localhost with port', () => {
    mockLocation.hostname = 'localhost:3000';
    
    renderWithTenantProvider();
    
    expect(screen.getByTestId('subdomain')).toHaveTextContent('demo');
  });

  it('loads tenant from localStorage', () => {
    const mockTenant = {
      id: 1,
      name: 'Stored Company',
      subdomain: 'stored',
      businessType: 'landscaping',
      settings: { theme: 'dark' },
    };

    localStorage.setItem('tenant', JSON.stringify(mockTenant));
    localStorage.setItem('tenantSubdomain', 'stored');

    renderWithTenantProvider();

    expect(screen.getByTestId('subdomain')).toHaveTextContent('stored');
    expect(screen.getByTestId('tenant-name')).toHaveTextContent('Stored Company');
  });

  it('handles corrupted localStorage tenant data', () => {
    localStorage.setItem('tenant', 'invalid-json');
    
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    renderWithTenantProvider();

    expect(screen.getByTestId('tenant-name')).toHaveTextContent('null');
    expect(localStorage.removeItem).toHaveBeenCalledWith('tenant');

    consoleSpy.mockRestore();
  });

  it('sets tenant and updates localStorage', () => {
    renderWithTenantProvider();

    screen.getByText('Set Tenant').click();

    expect(screen.getByTestId('tenant-name')).toHaveTextContent('Test Company');
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'tenant',
      JSON.stringify({
        id: 1,
        name: 'Test Company',
        subdomain: 'test',
        businessType: 'cleaning',
        settings: {}
      })
    );
  });

  it('clears tenant and removes from localStorage', () => {
    // First set a tenant
    renderWithTenantProvider();
    screen.getByText('Set Tenant').click();
    
    expect(screen.getByTestId('tenant-name')).toHaveTextContent('Test Company');

    // Then clear it
    screen.getByText('Clear Tenant').click();

    expect(screen.getByTestId('tenant-name')).toHaveTextContent('null');
    expect(localStorage.removeItem).toHaveBeenCalledWith('tenant');
  });

  it('prioritizes subdomain from localStorage over hostname parsing for localhost', () => {
    mockLocation.hostname = 'localhost';
    localStorage.setItem('tenantSubdomain', 'custom');

    renderWithTenantProvider();

    expect(screen.getByTestId('subdomain')).toHaveTextContent('custom');
  });

  it('uses hostname subdomain over localStorage for production domains', () => {
    mockLocation.hostname = 'production.dashboard.com';
    localStorage.setItem('tenantSubdomain', 'ignored');

    renderWithTenantProvider();

    expect(screen.getByTestId('subdomain')).toHaveTextContent('production');
  });

  it('throws error when useTenant is used outside TenantProvider', () => {
    const TestComponentWithoutProvider = () => {
      useTenant();
      return <div>Test</div>;
    };

    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<TestComponentWithoutProvider />)).toThrow(
      'useTenant must be used within a TenantProvider'
    );

    consoleSpy.mockRestore();
  });

  it('handles edge case hostnames correctly', () => {
    // Single domain
    mockLocation.hostname = 'dashboard.com';
    renderWithTenantProvider();
    expect(screen.getByTestId('subdomain')).toHaveTextContent('demo');

    // www subdomain
    mockLocation.hostname = 'www.dashboard.com';
    renderWithTenantProvider();
    expect(screen.getByTestId('subdomain')).toHaveTextContent('demo');

    // Deep subdomain
    mockLocation.hostname = 'api.tenant.dashboard.com';
    renderWithTenantProvider();
    expect(screen.getByTestId('subdomain')).toHaveTextContent('api');
  });
});