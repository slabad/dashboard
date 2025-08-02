# Service Business Dashboard

A multi-tenant SaaS dashboard for service businesses (cleaning, landscaping, HVAC, etc.) that integrates with QuickBooks, Go High Level, and supports manual data imports.

## Quick Start

1. **Clone and setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

2. **Start development environment**
   ```bash
   docker compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Database: localhost:5432

## Documentation

- [POC Plan](CLAUDE.md) - Project goals and timeline
- [Database Schema](database-schema.md) - PostgreSQL table structure
- [Database ERD](database-erd.md) - Entity relationship diagram
- [Architecture](architecture-diagram.md) - System architecture overview
- [Development Setup](development-setup.md) - Local development and deployment

## Development

### Available Commands

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f [service]

# Rebuild specific service
docker compose up --build [service]

# Stop all services
docker compose down

# Run database migrations
docker compose exec backend npm run migrate

# Seed sample data
docker compose exec backend npm run seed
```

## Testing

**⚠️ Important: Always run tests in Docker containers to ensure consistent, isolated environments.**

### Run All Tests (Recommended)
```bash
# Run tests in isolated Docker containers (RECOMMENDED)
docker compose -f docker-compose.test.yml up --build

# Clean up test containers when done
docker compose -f docker-compose.test.yml down --volumes
```

### Individual Test Services
```bash
# Run only backend tests with test database
docker compose -f docker-compose.test.yml up --build backend-test

# Run only frontend tests
docker compose -f docker-compose.test.yml up --build frontend-test

# Run tests with existing containers
docker compose up -d db redis
docker compose run --rm backend npm test
docker compose run --rm frontend npm test -- --watchAll=false
```

### Local Testing (Not Recommended)
```bash
# Only use local testing if Docker is unavailable
# Requires local PostgreSQL and Redis setup
cd backend && npm test
cd frontend && npm test
```

### Test Structure
- **Backend**: Jest + Supertest for API testing, database integration tests
- **Frontend**: React Testing Library + Jest for component and context testing
- **Coverage**: Comprehensive test coverage for critical paths
- **Integration**: Full stack testing with test database

### Multi-Tenant Testing

For local multi-tenant testing, add these entries to your `/etc/hosts` file:

```
127.0.0.1 cleanco.dashboard.local
127.0.0.1 greenscape.dashboard.local
127.0.0.1 hvacpro.dashboard.local
```

Then access tenants at: http://cleanco.dashboard.local

## Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Proxy**: nginx
- **Container**: Docker + Docker Compose

## Project Structure

```
/dashboard
├── frontend/          # React application
├── backend/           # Node.js API server
├── database/          # Database migrations and seeds
├── nginx/             # Proxy configuration
└── docs/              # Project documentation
```