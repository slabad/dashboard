import knex, { Knex } from 'knex';
import { Model } from 'objection';

let db: Knex;

const knexConfig: Knex.Config = {
  client: 'postgresql',
  connection: process.env.DATABASE_URL || {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'dashboard_dev'
  },
  pool: {
    min: 2,
    max: 10,
    createTimeoutMillis: 3000,
    acquireTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 100,
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: '../migrations'
  },
  seeds: {
    directory: '../seeds'
  }
};

export async function connectDatabase(): Promise<Knex> {
  try {
    db = knex(knexConfig);
    
    // Test the connection
    await db.raw('SELECT 1');
    
    // Bind Objection.js to Knex
    Model.knex(db);
    
    return db;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
}

export function getDatabase(): Knex {
  if (!db) {
    throw new Error('Database not initialized. Call connectDatabase() first.');
  }
  return db;
}

export { db };