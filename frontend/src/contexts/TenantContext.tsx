import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Tenant } from '../types';

interface TenantContextType {
  tenant: Tenant | null;
  subdomain: string | null;
  setTenant: (tenant: Tenant | null) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

interface TenantProviderProps {
  children: ReactNode;
}

export function TenantProvider({ children }: TenantProviderProps) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [subdomain, setSubdomain] = useState<string | null>(null);

  useEffect(() => {
    // Extract subdomain from hostname
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    
    let detectedSubdomain: string | null = null;
    
    if (parts.length > 2) {
      // Production: subdomain.domain.com
      detectedSubdomain = parts[0];
    } else if (hostname === 'localhost' || hostname.startsWith('localhost')) {
      // Development: use demo as default or from localStorage
      detectedSubdomain = localStorage.getItem('tenantSubdomain') || 'demo';
    }
    
    setSubdomain(detectedSubdomain);

    // Try to load tenant from localStorage
    const storedTenant = localStorage.getItem('tenant');
    if (storedTenant) {
      try {
        setTenant(JSON.parse(storedTenant));
      } catch (error) {
        console.error('Error parsing stored tenant:', error);
        localStorage.removeItem('tenant');
      }
    }
  }, []);

  const value: TenantContextType = {
    tenant,
    subdomain,
    setTenant: (newTenant: Tenant | null) => {
      setTenant(newTenant);
      if (newTenant) {
        localStorage.setItem('tenant', JSON.stringify(newTenant));
      } else {
        localStorage.removeItem('tenant');
      }
    },
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}