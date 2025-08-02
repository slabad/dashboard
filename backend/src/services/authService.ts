import { getDatabase } from '../config/database';
import { generateToken, hashPassword, comparePassword, sanitizeUser, AuthResponse } from '../utils/auth';
import { AppError } from '../middleware/errorHandler';
import { LoginRequest, RegisterRequest, User, Tenant } from '../types';

/**
 * Authenticate user with email and password within tenant context
 */
export async function loginUser(credentials: LoginRequest, tenantId?: number): Promise<AuthResponse> {
  const db = getDatabase();
  
  // Get user with tenant information
  const userQuery = db('users')
    .select(
      'users.*',
      'tenants.id as tenant_id',
      'tenants.name as tenant_name',
      'tenants.subdomain as tenant_subdomain',
      'tenants.business_type as tenant_business_type',
      'tenants.settings as tenant_settings'
    )
    .join('tenants', 'users.tenant_id', 'tenants.id')
    .where('users.email', credentials.email)
    .where('users.is_active', true);

  // If tenant context is provided, scope to that tenant
  if (tenantId) {
    userQuery.where('users.tenant_id', tenantId);
  }

  // If subdomain is provided in credentials, use it to find tenant
  if (credentials.subdomain) {
    userQuery.where('tenants.subdomain', credentials.subdomain);
  }

  const userRow = await userQuery.first();

  if (!userRow) {
    throw new AppError('Invalid credentials', 401);
  }

  // Verify password
  const isValidPassword = await comparePassword(credentials.password, userRow.password_hash);
  if (!isValidPassword) {
    throw new AppError('Invalid credentials', 401);
  }

  // Create user and tenant objects
  const user: User = {
    id: userRow.id,
    tenantId: userRow.tenant_id,
    email: userRow.email,
    passwordHash: userRow.password_hash,
    firstName: userRow.first_name,
    lastName: userRow.last_name,
    role: userRow.role,
    isActive: userRow.is_active,
    createdAt: userRow.created_at,
    updatedAt: userRow.updated_at,
  };

  const tenant: Tenant = {
    id: userRow.tenant_id,
    name: userRow.tenant_name,
    subdomain: userRow.tenant_subdomain,
    businessType: userRow.tenant_business_type,
    settings: userRow.tenant_settings,
    createdAt: userRow.created_at,
    updatedAt: userRow.updated_at,
  };

  // Generate JWT token
  const token = generateToken(user, tenant);

  return {
    token,
    user: sanitizeUser(user),
    tenant,
  };
}

/**
 * Register a new user (for tenant registration or adding users to existing tenant)
 */
export async function registerUser(userData: RegisterRequest): Promise<AuthResponse> {
  const db = getDatabase();

  // Start transaction
  return db.transaction(async (trx) => {
    // Check if tenant exists by subdomain
    let tenant = await trx('tenants')
      .where('subdomain', userData.subdomain)
      .first();

    let isNewTenant = false;

    // If tenant doesn't exist, create it
    if (!tenant) {
      const [newTenant] = await trx('tenants')
        .insert({
          name: userData.companyName,
          subdomain: userData.subdomain,
          business_type: userData.businessType,
          settings: JSON.stringify({})
        })
        .returning('*');

      tenant = newTenant;
      isNewTenant = true;
    }

    // Check if user already exists in this tenant
    const existingUser = await trx('users')
      .where('email', userData.email)
      .where('tenant_id', tenant.id)
      .first();

    if (existingUser) {
      throw new AppError('User already exists in this tenant', 409);
    }

    // Hash password
    const passwordHash = await hashPassword(userData.password);

    // Create user (first user in new tenant becomes admin)
    const [newUserRow] = await trx('users')
      .insert({
        tenant_id: tenant.id,
        email: userData.email,
        password_hash: passwordHash,
        first_name: userData.firstName,
        last_name: userData.lastName,
        role: isNewTenant ? 'admin' : 'user',
        is_active: true,
      })
      .returning('*');

    // Create user object
    const user: User = {
      id: newUserRow.id,
      tenantId: newUserRow.tenant_id,
      email: newUserRow.email,
      passwordHash: newUserRow.password_hash,
      firstName: newUserRow.first_name,
      lastName: newUserRow.last_name,
      role: newUserRow.role,
      isActive: newUserRow.is_active,
      createdAt: newUserRow.created_at,
      updatedAt: newUserRow.updated_at,
    };

    const tenantObject: Tenant = {
      id: tenant.id,
      name: tenant.name,
      subdomain: tenant.subdomain,
      businessType: tenant.business_type,
      settings: tenant.settings,
      createdAt: tenant.created_at,
      updatedAt: tenant.updated_at,
    };

    // Generate JWT token
    const token = generateToken(user, tenantObject);

    return {
      token,
      user: sanitizeUser(user),
      tenant: tenantObject,
    };
  });
}

/**
 * Get user by ID within tenant context
 */
export async function getUserById(userId: number, tenantId: number): Promise<User | null> {
  const db = getDatabase();

  const userRow = await db('users')
    .where('id', userId)
    .where('tenant_id', tenantId)
    .where('is_active', true)
    .first();

  if (!userRow) {
    return null;
  }

  return {
    id: userRow.id,
    tenantId: userRow.tenant_id,
    email: userRow.email,
    passwordHash: userRow.password_hash,
    firstName: userRow.first_name,
    lastName: userRow.last_name,
    role: userRow.role,
    isActive: userRow.is_active,
    createdAt: userRow.created_at,
    updatedAt: userRow.updated_at,
  };
}

/**
 * Update user password
 */
export async function updateUserPassword(userId: number, tenantId: number, newPassword: string): Promise<void> {
  const db = getDatabase();

  const passwordHash = await hashPassword(newPassword);

  const updated = await db('users')
    .where('id', userId)
    .where('tenant_id', tenantId)
    .update({
      password_hash: passwordHash,
      updated_at: db.fn.now(),
    });

  if (updated === 0) {
    throw new AppError('User not found', 404);
  }
}