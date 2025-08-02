# Database Schema Design

## Core Tenant & User Management

```sql
-- Tenants (Companies using the dashboard)
CREATE TABLE tenants (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE NOT NULL,
    business_type VARCHAR(100) NOT NULL, -- 'cleaning', 'landscaping', 'hvac', etc.
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Users within each tenant
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'user', -- 'admin', 'manager', 'user'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(tenant_id, email)
);

CREATE INDEX idx_users_tenant_id ON users(tenant_id);
```

## Business Data Models (Industry Agnostic)

```sql
-- Customers for any service business
CREATE TABLE customers (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    external_id VARCHAR(255), -- ID from external system (QuickBooks, etc.)
    external_source VARCHAR(100), -- 'quickbooks', 'gohighlevel', 'manual'
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address JSONB, -- {street, city, state, zip, country}
    metadata JSONB DEFAULT '{}', -- Industry-specific fields
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_customers_tenant_id ON customers(tenant_id);
CREATE INDEX idx_customers_external ON customers(tenant_id, external_id, external_source);

-- Services offered (cleaning packages, lawn care plans, etc.)
CREATE TABLE services (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100), -- 'deep_clean', 'weekly_service', 'lawn_mowing', etc.
    base_price DECIMAL(10,2),
    unit VARCHAR(50), -- 'per_visit', 'per_hour', 'per_sqft', 'monthly'
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}', -- Industry-specific fields
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_services_tenant_id ON services(tenant_id);

-- Jobs/Work Orders (flexible for any service industry)
CREATE TABLE jobs (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    customer_id BIGINT NOT NULL REFERENCES customers(id),
    service_id BIGINT REFERENCES services(id),
    external_id VARCHAR(255), -- ID from external system
    external_source VARCHAR(100),
    
    -- Job details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'in_progress', 'completed', 'cancelled'
    
    -- Scheduling
    scheduled_date DATE,
    scheduled_time_start TIME,
    scheduled_time_end TIME,
    actual_start_time TIMESTAMP,
    actual_end_time TIMESTAMP,
    
    -- Financials
    quoted_amount DECIMAL(10,2),
    final_amount DECIMAL(10,2),
    
    -- Location
    address JSONB,
    
    -- Flexible metadata for industry-specific fields
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_jobs_tenant_id ON jobs(tenant_id);
CREATE INDEX idx_jobs_customer_id ON jobs(customer_id);
CREATE INDEX idx_jobs_scheduled_date ON jobs(tenant_id, scheduled_date);
```

## Financial Data Integration

```sql
-- Financial transactions (from QuickBooks, manual entry, etc.)
CREATE TABLE transactions (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    customer_id BIGINT REFERENCES customers(id),
    job_id BIGINT REFERENCES jobs(id),
    external_id VARCHAR(255),
    external_source VARCHAR(100),
    
    -- Transaction details
    type VARCHAR(50) NOT NULL, -- 'invoice', 'payment', 'expense', 'refund'
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    description TEXT,
    
    -- Dates
    transaction_date DATE NOT NULL,
    due_date DATE,
    
    -- Status
    status VARCHAR(50), -- 'draft', 'sent', 'paid', 'overdue', 'cancelled'
    
    -- External system data
    external_data JSONB DEFAULT '{}',
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_transactions_tenant_id ON transactions(tenant_id);
CREATE INDEX idx_transactions_date_type ON transactions(tenant_id, transaction_date, type);
CREATE INDEX idx_transactions_customer_id ON transactions(customer_id);
CREATE INDEX idx_transactions_job_id ON transactions(job_id);
```

## Integration & Data Management

```sql
-- Integration configurations per tenant
CREATE TABLE integrations (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    service_name VARCHAR(100) NOT NULL, -- 'quickbooks', 'gohighlevel', etc.
    config JSONB NOT NULL, -- API keys, OAuth tokens, settings
    is_active BOOLEAN DEFAULT true,
    last_sync_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(tenant_id, service_name)
);

CREATE INDEX idx_integrations_tenant_id ON integrations(tenant_id);

-- Data sync tracking
CREATE TABLE sync_logs (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    integration_id BIGINT NOT NULL REFERENCES integrations(id),
    entity_type VARCHAR(100), -- 'customers', 'invoices', 'payments'
    status VARCHAR(50), -- 'success', 'error', 'partial'
    records_processed INTEGER DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

CREATE INDEX idx_sync_logs_tenant_id ON sync_logs(tenant_id);
CREATE INDEX idx_sync_logs_started_at ON sync_logs(tenant_id, started_at);

-- File uploads and processing
CREATE TABLE uploaded_files (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    original_filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(50), -- 'csv', 'pdf', 'xlsx'
    file_size INTEGER,
    storage_path VARCHAR(500),
    processing_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'error'
    extracted_data JSONB, -- Parsed data from file
    error_message TEXT,
    uploaded_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    processed_at TIMESTAMP
);

CREATE INDEX idx_uploaded_files_tenant_id ON uploaded_files(tenant_id);
CREATE INDEX idx_uploaded_files_status ON uploaded_files(processing_status);
```

## Dashboard Configuration

```sql
-- Dashboard widgets configuration
CREATE TABLE dashboard_widgets (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id), -- NULL for tenant-wide widgets
    widget_type VARCHAR(100) NOT NULL, -- 'revenue_chart', 'job_status', 'customer_count'
    title VARCHAR(255),
    position_x INTEGER DEFAULT 0,
    position_y INTEGER DEFAULT 0,
    width INTEGER DEFAULT 1,
    height INTEGER DEFAULT 1,
    config JSONB DEFAULT '{}', -- Widget-specific configuration
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_dashboard_widgets_tenant_id ON dashboard_widgets(tenant_id);
CREATE INDEX idx_dashboard_widgets_user_id ON dashboard_widgets(user_id);

-- Industry-specific templates
CREATE TABLE business_templates (
    id BIGSERIAL PRIMARY KEY,
    business_type VARCHAR(100) NOT NULL,
    template_name VARCHAR(255) NOT NULL,
    config JSONB NOT NULL, -- Widget layouts, KPI definitions, etc.
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_business_templates_type ON business_templates(business_type);
```

## Key Design Principles

**1. Tenant Isolation**: Every table includes `tenant_id` for complete data separation

**2. Performance**: BIGINT auto-incrementing primary keys for fast joins and indexing

**3. External System Flexibility**: `external_id` and `external_source` fields allow tracking data origins

**4. Industry Agnostic**: Core entities work for any service business, with `metadata` JSONB for custom fields

**5. Integration Ready**: Built-in support for API integrations and file uploads

**6. Configurable**: Dashboard widgets and business templates support customization

**7. Audit Trail**: Sync logs and timestamps track all data changes

**8. Proper Indexing**: Strategic indexes for tenant isolation and common query patterns

This schema supports the POC while providing a foundation for multi-tenant scaling and diverse industry requirements.