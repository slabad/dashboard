# Local Development & Deployment Setup Plan

## Local Development Environment

### Docker Compose Stack
- **React Frontend** (port 3000) - Development server with hot reload
- **Node.js Backend** (port 5000) - Express API server with TypeScript
- **PostgreSQL Database** (port 5432) - Primary data store
- **nginx-proxy** (port 80) - Subdomain routing for multi-tenant testing
- **Redis** (port 6379) - Caching and session storage

### Multi-Tenant Local Testing
- **nginx-proxy**: Use VIRTUAL_HOST environment variables for tenant routing
- **DNS Setup**: Configure dnsmasq for wildcard domains (*.dashboard.local)
- **Hosts File**: Fallback entries for test tenants
  ```
  127.0.0.1 cleanco.dashboard.local
  127.0.0.1 greenscape.dashboard.local
  127.0.0.1 hvacpro.dashboard.local
  ```

## Project Structure Setup
```
/dashboard
├── docker-compose.yml           # Development stack
├── docker-compose.prod.yml      # Production configuration
├── .env.example                 # Environment template
├── .env                        # Local environment (git-ignored)
├── frontend/                   # React application
│   ├── Dockerfile.dev
│   ├── Dockerfile.prod
│   ├── package.json
│   └── src/
├── backend/                    # Node.js API
│   ├── Dockerfile.dev
│   ├── Dockerfile.prod
│   ├── package.json
│   ├── src/
│   └── migrations/
├── database/                   # Database files
│   ├── migrations/
│   ├── seeds/
│   └── init.sql
├── nginx/                      # Proxy configuration
│   ├── nginx.conf
│   └── Dockerfile
└── docs/                       # Documentation
    ├── CLAUDE.md
    ├── database-schema.md
    ├── architecture-diagram.md
    └── database-erd.md
```

## Development Workflow

### Initial Setup
1. **Clone and Setup**
   ```bash
   git clone <repo>
   cd dashboard
   cp .env.example .env
   # Edit .env with local settings
   ```

2. **Start Development Stack**
   ```bash
   docker compose up --build
   ```

3. **Database Setup**
   ```bash
   # Run migrations
   docker compose exec backend npm run migrate
   # Seed sample data
   docker compose exec backend npm run seed
   ```

### Daily Development
- **Start Services**: `docker compose up -d`
- **View Logs**: `docker compose logs -f [service]`
- **Rebuild**: `docker compose up --build [service]`
- **Stop Services**: `docker compose down`

### Live Reload Configuration
- **Frontend**: Volume mount `./frontend:/app` with node_modules exclusion
- **Backend**: Volume mount `./backend:/app` with nodemon for auto-restart
- **Database**: Persistent volume for data retention

## Testing Strategy

### Unit Testing
- **Frontend**: Jest + React Testing Library in frontend container
- **Backend**: Jest + Supertest in backend container
- **Run Tests**: `docker compose exec [frontend|backend] npm test`

### Integration Testing
- **Test Database**: Separate PostgreSQL instance for integration tests
- **API Testing**: Test different tenant contexts and data isolation
- **File Upload Testing**: Test CSV/PDF processing workflows

### End-to-End Testing
- **Multi-Tenant Scenarios**: Test subdomain routing and tenant isolation
- **Integration Flows**: QuickBooks OAuth, data sync processes
- **User Workflows**: Complete business scenarios from login to reporting

## Testing Best Practices

### Container-First Testing
**All tests must run in Docker containers to ensure:**
- Consistent environments across all developers
- Proper database isolation with automatic cleanup
- No local system pollution or dependency conflicts
- Production-like testing conditions

### Recommended Testing Commands
```bash
# Primary testing workflow
npm test                    # Run all tests in containers
npm run test:clean         # Clean up test containers

# Individual test suites
npm run test:backend       # Backend tests only
npm run test:frontend      # Frontend tests only

# Emergency local testing (avoid if possible)
npm run test:local         # Only if Docker unavailable
```

### Test Database Management
- Dedicated `dashboard_test` database in isolated container
- Automatic schema migrations before each test run
- Complete data cleanup between test suites
- No shared state between tests

## Environment Configuration

### Development (.env)
```bash
# Database
DATABASE_URL=postgresql://postgres:password@db:5432/dashboard_dev
REDIS_URL=redis://redis:6379

# Application
NODE_ENV=development
JWT_SECRET=dev-secret-key
API_BASE_URL=http://localhost:5000

# External Integrations (development keys)
QUICKBOOKS_CLIENT_ID=dev_client_id
QUICKBOOKS_CLIENT_SECRET=dev_client_secret
GOHIGHLEVEL_API_KEY=dev_api_key

# Frontend
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ENVIRONMENT=development
```

### Production Environment Variables
- Secure secrets management (AWS Secrets Manager, etc.)
- Production database connections
- CDN configurations for static assets
- Monitoring and logging endpoints

## Production Deployment Options

### Docker Deployment
- **Multi-stage Builds**: Optimized production images
- **Image Registry**: Push to Docker Hub/AWS ECR
- **Orchestration**: Docker Swarm or Kubernetes

### Kubernetes Deployment
- **Horizontal Scaling**: Multiple backend/frontend replicas
- **Database**: Managed PostgreSQL (AWS RDS, Google Cloud SQL)
- **Load Balancing**: Ingress controllers for tenant routing
- **Secrets Management**: Kubernetes secrets/external secret operators

### Cloud Platform Options
- **AWS**: ECS Fargate + RDS + ALB + Route53
- **Google Cloud**: Cloud Run + Cloud SQL + Load Balancer
- **Vercel/Netlify**: Frontend deployment with serverless backend

### Monitoring & Observability
- **Application Monitoring**: Sentry for error tracking
- **Performance**: New Relic or DataDog
- **Logs**: Centralized logging with ELK stack or cloud logging
- **Metrics**: Prometheus + Grafana for custom metrics

## Security Considerations

### Development Security
- Secure environment variable management
- HTTPS in development (mkcert for local SSL)
- Database connection encryption
- Input validation and sanitization

### Production Security
- Container image scanning
- Secrets rotation
- Network security (VPC, security groups)
- Regular dependency updates
- Compliance logging and audit trails

This setup provides a complete local development environment that mirrors production capabilities while supporting comprehensive multi-tenant testing and deployment flexibility.