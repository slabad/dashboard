# Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    TENANTS {
        bigint id PK
        varchar name
        varchar subdomain UK
        varchar business_type
        jsonb settings
        timestamp created_at
        timestamp updated_at
    }

    USERS {
        bigint id PK
        bigint tenant_id FK
        varchar email
        varchar password_hash
        varchar first_name
        varchar last_name
        varchar role
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    CUSTOMERS {
        bigint id PK
        bigint tenant_id FK
        varchar external_id
        varchar external_source
        varchar name
        varchar email
        varchar phone
        jsonb address
        jsonb metadata
        timestamp created_at
        timestamp updated_at
    }

    SERVICES {
        bigint id PK
        bigint tenant_id FK
        varchar name
        text description
        varchar category
        decimal base_price
        varchar unit
        boolean is_active
        jsonb metadata
        timestamp created_at
        timestamp updated_at
    }

    JOBS {
        bigint id PK
        bigint tenant_id FK
        bigint customer_id FK
        bigint service_id FK
        varchar external_id
        varchar external_source
        varchar title
        text description
        varchar status
        date scheduled_date
        time scheduled_time_start
        time scheduled_time_end
        timestamp actual_start_time
        timestamp actual_end_time
        decimal quoted_amount
        decimal final_amount
        jsonb address
        jsonb metadata
        timestamp created_at
        timestamp updated_at
    }

    TRANSACTIONS {
        bigint id PK
        bigint tenant_id FK
        bigint customer_id FK
        bigint job_id FK
        varchar external_id
        varchar external_source
        varchar type
        decimal amount
        varchar currency
        text description
        date transaction_date
        date due_date
        varchar status
        jsonb external_data
        timestamp created_at
        timestamp updated_at
    }

    INTEGRATIONS {
        bigint id PK
        bigint tenant_id FK
        varchar service_name
        jsonb config
        boolean is_active
        timestamp last_sync_at
        timestamp created_at
        timestamp updated_at
    }

    SYNC_LOGS {
        bigint id PK
        bigint tenant_id FK
        bigint integration_id FK
        varchar entity_type
        varchar status
        integer records_processed
        text error_message
        timestamp started_at
        timestamp completed_at
    }

    UPLOADED_FILES {
        bigint id PK
        bigint tenant_id FK
        varchar original_filename
        varchar file_type
        integer file_size
        varchar storage_path
        varchar processing_status
        jsonb extracted_data
        text error_message
        bigint uploaded_by FK
        timestamp created_at
        timestamp processed_at
    }

    DASHBOARD_WIDGETS {
        bigint id PK
        bigint tenant_id FK
        bigint user_id FK
        varchar widget_type
        varchar title
        integer position_x
        integer position_y
        integer width
        integer height
        jsonb config
        boolean is_visible
        timestamp created_at
        timestamp updated_at
    }

    BUSINESS_TEMPLATES {
        bigint id PK
        varchar business_type
        varchar template_name
        jsonb config
        boolean is_default
        timestamp created_at
    }

    %% Relationships
    TENANTS ||--o{ USERS : "has many"
    TENANTS ||--o{ CUSTOMERS : "has many"
    TENANTS ||--o{ SERVICES : "has many"
    TENANTS ||--o{ JOBS : "has many"
    TENANTS ||--o{ TRANSACTIONS : "has many"
    TENANTS ||--o{ INTEGRATIONS : "has many"
    TENANTS ||--o{ SYNC_LOGS : "has many"
    TENANTS ||--o{ UPLOADED_FILES : "has many"
    TENANTS ||--o{ DASHBOARD_WIDGETS : "has many"

    CUSTOMERS ||--o{ JOBS : "has many"
    CUSTOMERS ||--o{ TRANSACTIONS : "has many"
    
    SERVICES ||--o{ JOBS : "used in"
    
    JOBS ||--o{ TRANSACTIONS : "generates"
    
    INTEGRATIONS ||--o{ SYNC_LOGS : "creates"
    
    USERS ||--o{ UPLOADED_FILES : "uploads"
    USERS ||--o{ DASHBOARD_WIDGETS : "configures"
```

## Key Relationships

### **Core Business Flow**
1. **Tenants** → Multiple **Users** (company employees/admins)
2. **Tenants** → **Customers** (service recipients)
3. **Tenants** → **Services** (offerings like cleaning packages)
4. **Customers** + **Services** → **Jobs** (scheduled work)
5. **Jobs** → **Transactions** (invoices, payments)

### **Data Integration Flow**
1. **Tenants** → **Integrations** (QuickBooks, GoHighLevel configs)
2. **Integrations** → **Sync Logs** (tracking data imports)
3. **Users** → **Uploaded Files** (manual CSV/PDF imports)

### **Dashboard Customization**
1. **Tenants** → **Dashboard Widgets** (company-wide widgets)
2. **Users** → **Dashboard Widgets** (personal widgets)
3. **Business Templates** → Standalone (industry templates)

## Data Flow Patterns

### **Multi-Tenant Isolation**
Every major entity connects to `tenants(id)` ensuring complete data separation between companies.

### **External System Integration**
Tables include `external_id` and `external_source` to track data origins and maintain sync relationships.

### **Flexible Metadata**
JSONB `metadata` fields allow industry-specific customizations without schema changes.

### **Audit Trail**
Comprehensive timestamp tracking (`created_at`, `updated_at`, sync timestamps) for data lineage.

This ERD shows how the schema supports both the POC goals and future multi-tenant SaaS scaling while maintaining clean relationships and data integrity.