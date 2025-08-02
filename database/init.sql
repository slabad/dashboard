-- Initial database setup and extensions
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable row level security by default
ALTER DATABASE dashboard_dev SET row_security = on;

-- Create initial schema will be handled by migrations
-- This file just sets up extensions and basic configuration