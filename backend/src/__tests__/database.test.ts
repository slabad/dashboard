import { testDb } from './setup';
import bcrypt from 'bcryptjs';

describe('Database Integration', () => {
  describe('Tenants', () => {
    it('should create and retrieve a tenant', async () => {
      const tenantData = {
        name: 'Test Company',
        subdomain: 'testcompany',
        business_type: 'cleaning',
        settings: JSON.stringify({ timezone: 'UTC' })
      };

      const [tenant] = await testDb('tenants').insert(tenantData).returning('*');
      
      expect(tenant).toMatchObject({
        name: 'Test Company',
        subdomain: 'testcompany',
        business_type: 'cleaning'
      });
      expect(tenant.id).toBeDefined();
      expect(tenant.created_at).toBeDefined();
    });

    it('should enforce unique subdomain constraint', async () => {
      const tenantData = {
        name: 'Test Company',
        subdomain: 'duplicate',
        business_type: 'cleaning'
      };

      await testDb('tenants').insert(tenantData);
      
      await expect(testDb('tenants').insert(tenantData))
        .rejects.toThrow();
    });
  });

  describe('Users', () => {
    let tenantId: number;

    beforeEach(async () => {
      const [tenant] = await testDb('tenants').insert({
        name: 'Test Company',
        subdomain: 'testcompany',
        business_type: 'cleaning'
      }).returning('id');
      
      tenantId = tenant.id || tenant;
    });

    it('should create and retrieve a user', async () => {
      const passwordHash = await bcrypt.hash('password123', 12);
      const userData = {
        tenant_id: tenantId,
        email: 'test@example.com',
        password_hash: passwordHash,
        first_name: 'Test',
        last_name: 'User',
        role: 'admin'
      };

      const [user] = await testDb('users').insert(userData).returning('*');
      
      expect(user).toMatchObject({
        tenant_id: tenantId,
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        role: 'admin',
        is_active: true
      });
      expect(user.id).toBeDefined();
    });

    it('should enforce unique email per tenant', async () => {
      const passwordHash = await bcrypt.hash('password123', 12);
      const userData = {
        tenant_id: tenantId,
        email: 'duplicate@example.com',
        password_hash: passwordHash,
        first_name: 'Test',
        last_name: 'User'
      };

      await testDb('users').insert(userData);
      
      await expect(testDb('users').insert(userData))
        .rejects.toThrow();
    });

    it('should cascade delete users when tenant is deleted', async () => {
      const passwordHash = await bcrypt.hash('password123', 12);
      await testDb('users').insert({
        tenant_id: tenantId,
        email: 'test@example.com',
        password_hash: passwordHash,
        first_name: 'Test',
        last_name: 'User'
      });

      await testDb('tenants').where('id', tenantId).del();
      
      const users = await testDb('users').where('tenant_id', tenantId);
      expect(users).toHaveLength(0);
    });
  });

  describe('Customers', () => {
    let tenantId: number;

    beforeEach(async () => {
      const [tenant] = await testDb('tenants').insert({
        name: 'Test Company',
        subdomain: 'testcompany',
        business_type: 'cleaning'
      }).returning('id');
      
      tenantId = tenant.id || tenant;
    });

    it('should create and retrieve a customer', async () => {
      const customerData = {
        tenant_id: tenantId,
        name: 'John Doe',
        email: 'john@example.com',
        phone: '555-1234',
        address: JSON.stringify({
          street: '123 Main St',
          city: 'Springfield',
          state: 'IL',
          zip: '62701'
        }),
        metadata: JSON.stringify({
          preferred_time: 'morning'
        })
      };

      const [customer] = await testDb('customers').insert(customerData).returning('*');
      
      expect(customer).toMatchObject({
        tenant_id: tenantId,
        name: 'John Doe',
        email: 'john@example.com',
        phone: '555-1234'
      });
      expect(customer.id).toBeDefined();
      expect(JSON.parse(customer.address)).toEqual({
        street: '123 Main St',
        city: 'Springfield',  
        state: 'IL',
        zip: '62701'
      });
    });
  });

  describe('Services', () => {
    let tenantId: number;

    beforeEach(async () => {
      const [tenant] = await testDb('tenants').insert({
        name: 'Test Company',
        subdomain: 'testcompany',
        business_type: 'cleaning'
      }).returning('id');
      
      tenantId = tenant.id || tenant;
    });

    it('should create and retrieve a service', async () => {
      const serviceData = {
        tenant_id: tenantId,
        name: 'House Cleaning',
        description: 'Standard house cleaning service',
        category: 'residential',
        base_price: 120.00,
        unit: 'per_visit',
        is_active: true
      };

      const [service] = await testDb('services').insert(serviceData).returning('*');
      
      expect(service).toMatchObject({
        tenant_id: tenantId,
        name: 'House Cleaning',
        description: 'Standard house cleaning service',
        category: 'residential',
        unit: 'per_visit',
        is_active: true
      });
      expect(parseFloat(service.base_price)).toBe(120.00);
    });
  });

  describe('Jobs', () => {
    let tenantId: number;
    let customerId: number;
    let serviceId: number;

    beforeEach(async () => {
      const [tenant] = await testDb('tenants').insert({
        name: 'Test Company',
        subdomain: 'testcompany',
        business_type: 'cleaning'
      }).returning('id');
      
      tenantId = tenant.id || tenant;

      const [customer] = await testDb('customers').insert({
        tenant_id: tenantId,
        name: 'John Doe',
        email: 'john@example.com'
      }).returning('id');
      
      customerId = customer.id || customer;

      const [service] = await testDb('services').insert({
        tenant_id: tenantId,
        name: 'House Cleaning',
        category: 'residential',
        base_price: 120.00,
        unit: 'per_visit'
      }).returning('id');
      
      serviceId = service.id || service;
    });

    it('should create and retrieve a job', async () => {
      const jobData = {
        tenant_id: tenantId,
        customer_id: customerId,
        service_id: serviceId,
        title: 'Weekly House Cleaning',
        description: 'Regular cleaning service',
        status: 'scheduled',
        scheduled_date: '2024-01-15',
        scheduled_time_start: '09:00',
        scheduled_time_end: '11:00',
        quoted_amount: 120.00
      };

      const [job] = await testDb('jobs').insert(jobData).returning('*');
      
      expect(job).toMatchObject({
        tenant_id: tenantId,
        customer_id: customerId,
        service_id: serviceId,
        title: 'Weekly House Cleaning',
        status: 'scheduled'
      });
      expect(parseFloat(job.quoted_amount)).toBe(120.00);
    });

    it('should enforce foreign key constraints', async () => {
      const jobData = {
        tenant_id: tenantId,
        customer_id: 99999, // Non-existent customer
        title: 'Invalid Job',
        status: 'scheduled'
      };

      await expect(testDb('jobs').insert(jobData))
        .rejects.toThrow();
    });
  });

  describe('Transactions', () => {
    let tenantId: number;
    let customerId: number;

    beforeEach(async () => {
      const [tenant] = await testDb('tenants').insert({
        name: 'Test Company',
        subdomain: 'testcompany',
        business_type: 'cleaning'
      }).returning('id');
      
      tenantId = tenant.id || tenant;

      const [customer] = await testDb('customers').insert({
        tenant_id: tenantId,
        name: 'John Doe',
        email: 'john@example.com'
      }).returning('id');
      
      customerId = customer.id || customer;
    });

    it('should create and retrieve a transaction', async () => {
      const transactionData = {
        tenant_id: tenantId,
        customer_id: customerId,
        type: 'invoice',
        amount: 120.00,
        currency: 'USD',
        description: 'House cleaning service',
        transaction_date: '2024-01-15',
        status: 'sent'
      };

      const [transaction] = await testDb('transactions').insert(transactionData).returning('*');
      
      expect(transaction).toMatchObject({
        tenant_id: tenantId,
        customer_id: customerId,
        type: 'invoice',
        currency: 'USD',
        description: 'House cleaning service',
        status: 'sent'
      });
      expect(parseFloat(transaction.amount)).toBe(120.00);
    });
  });
});