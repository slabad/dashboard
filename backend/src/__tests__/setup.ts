import { beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import knex, { Knex } from 'knex';
import { Model } from 'objection';

// Test database configuration
const testDbConfig = {
  client: 'postgresql',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: 'dashboard_test'
  },
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: '../migrations'
  }
};

let testDb: Knex;

beforeAll(async () => {
  // Create test database connection
  testDb = knex(testDbConfig);
  
  // Bind Objection.js to test database
  Model.knex(testDb);
  
  // Run migrations
  await testDb.migrate.latest();
  
  // Make test database available globally
  global.testDb = testDb;
});

beforeEach(async () => {
  // Clean up database before each test
  if (testDb) {
    await testDb.raw('TRUNCATE TABLE sync_logs, uploaded_files, dashboard_widgets, transactions, jobs, services, customers, integrations, users, tenants, business_templates RESTART IDENTITY CASCADE');
  }
});

afterEach(async () => {
  // Additional cleanup if needed
});

afterAll(async () => {
  // Close database connection
  if (testDb) {
    await testDb.destroy();
  }
});

// Make test database available globally
declare global {
  var testDb: Knex;
}

export { testDb };