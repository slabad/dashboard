# Service Business Dashboard - Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND LAYER                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  React.js + TypeScript Dashboard                                           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │
│  │   Auth      │ │  Dashboard  │ │  Settings   │ │   Data Import       │   │
│  │   Pages     │ │   Widgets   │ │   Config    │ │   (CSV/PDF/Manual)  │   │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────────────┘   │
│                                                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │
│  │   Reports   │ │    KPI      │ │   Charts    │ │   Industry          │   │
│  │   Export    │ │   Cards     │ │   Graphs    │ │   Templates         │   │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                             HTTP/WebSocket
                                    │
┌─────────────────────────────────────────────────────────────────────────────┐
│                               BACKEND LAYER                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  Node.js + Express + TypeScript API Server                                 │
│                                                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │
│  │    Auth     │ │   Tenant    │ │    Data     │ │      Integration    │   │
│  │  Middleware │ │   Context   │ │ Aggregation │ │      Manager        │   │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────────────┘   │
│                                                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │
│  │   Widget    │ │   Report    │ │    File     │ │      Background     │   │
│  │   Engine    │ │  Generator  │ │  Processing │ │      Jobs           │   │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                              Database Layer
                                    │
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATABASE LAYER                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  PostgreSQL with Tenant Isolation                                          │
│                                                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │
│  │   Tenants   │ │    Users    │ │   Business  │ │      Financial      │   │
│  │    Table    │ │    Table    │ │    Types    │ │       Data          │   │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────────────┘   │
│                                                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │
│  │   Services  │ │  Customers  │ │   Reports   │ │      Raw Data       │   │
│  │   & Jobs    │ │   & Leads   │ │   & Files   │ │      Storage        │   │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                            External Integrations
                                    │
┌─────────────────────────────────────────────────────────────────────────────┐
│                           EXTERNAL INTEGRATIONS                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │
│  │ QuickBooks  │ │ Go High     │ │   Manual    │ │     Future          │   │
│  │   Online    │ │   Level     │ │   Uploads   │ │   Integrations      │   │
│  │    API      │ │    API      │ │  (CSV/PDF)  │ │  (Stripe, Google)   │   │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────────────┘   │
│         │               │               │                     │           │
│    OAuth 2.0       API Keys      File Upload           Plugin System      │
└─────────────────────────────────────────────────────────────────────────────┘

```

## Data Flow Architecture

```
1. User Authentication & Tenant Routing
   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
   │   User      │ -> │   Tenant    │ -> │  Dashboard  │
   │  Login      │    │  Detection  │    │   Access    │
   └─────────────┘    └─────────────┘    └─────────────┘

2. Data Integration Flow
   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
   │  External   │ -> │ Integration │ -> │    Data     │ -> │  Dashboard  │
   │   APIs      │    │   Layer     │    │ Processing  │    │   Widgets   │
   └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘

3. File Processing Flow
   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
   │   PDF/CSV   │ -> │    File     │ -> │   Parser    │ -> │  Database   │
   │   Upload    │    │   Storage   │    │   Engine    │    │   Storage   │
   └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

## Key Architectural Decisions

**Tenant Isolation**: Each business gets isolated data while sharing the same application instance

**Plugin Architecture**: Integrations are modular, making it easy to add new services

**Configurable Widgets**: Dashboard components adapt to different business types

**Async Processing**: Background jobs handle data synchronization and file processing

**Industry Agnostic**: Core data models work for cleaning, landscaping, HVAC, etc.

This architecture supports the POC goals while providing a clear path to multi-tenant SaaS scaling.