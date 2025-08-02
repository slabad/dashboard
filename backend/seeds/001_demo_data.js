const bcrypt = require('bcryptjs');

exports.seed = async function(knex) {
  // Clean up existing data
  await knex('sync_logs').del();
  await knex('uploaded_files').del();
  await knex('dashboard_widgets').del();
  await knex('transactions').del();
  await knex('jobs').del();
  await knex('services').del();
  await knex('customers').del();
  await knex('integrations').del();
  await knex('users').del();
  await knex('tenants').del();
  await knex('business_templates').del();

  // Hash password for demo users
  const passwordHash = await bcrypt.hash('password123', 12);

  // Insert tenants
  const tenants = await knex('tenants').insert([
    {
      name: 'Demo Cleaning Company',
      subdomain: 'demo',
      business_type: 'cleaning',
      settings: JSON.stringify({
        timezone: 'America/New_York',
        currency: 'USD',
        business_hours: {
          monday: { start: '08:00', end: '18:00' },
          tuesday: { start: '08:00', end: '18:00' },
          wednesday: { start: '08:00', end: '18:00' },
          thursday: { start: '08:00', end: '18:00' },
          friday: { start: '08:00', end: '18:00' },
          saturday: { start: '09:00', end: '15:00' },
          sunday: { closed: true }
        }
      })
    },
    {
      name: 'GreenScape Landscaping',
      subdomain: 'greenscape',
      business_type: 'landscaping',
      settings: JSON.stringify({
        timezone: 'America/Los_Angeles',
        currency: 'USD'
      })
    },
    {
      name: 'HVAC Pro Services',
      subdomain: 'hvacpro',
      business_type: 'hvac',
      settings: JSON.stringify({
        timezone: 'America/Chicago',
        currency: 'USD'
      })
    }
  ]).returning('id');

  const demoTenantId = tenants[0].id || tenants[0];
  const greenscapeTenantId = tenants[1].id || tenants[1];
  const hvacTenantId = tenants[2].id || tenants[2];

  // Insert users
  await knex('users').insert([
    {
      tenant_id: demoTenantId,
      email: 'admin@demo.com',
      password_hash: passwordHash,
      first_name: 'Demo',
      last_name: 'Admin',
      role: 'admin'
    },
    {
      tenant_id: demoTenantId,
      email: 'manager@demo.com',
      password_hash: passwordHash,
      first_name: 'Demo',
      last_name: 'Manager',
      role: 'manager'
    },
    {
      tenant_id: greenscapeTenantId,
      email: 'admin@greenscape.com',
      password_hash: passwordHash,
      first_name: 'Green',
      last_name: 'Admin',
      role: 'admin'
    },
    {
      tenant_id: hvacTenantId,
      email: 'admin@hvacpro.com',
      password_hash: passwordHash,
      first_name: 'HVAC',
      last_name: 'Admin',
      role: 'admin'
    }
  ]);

  // Insert customers for demo tenant
  const customers = await knex('customers').insert([
    {
      tenant_id: demoTenantId,
      name: 'Johnson Family',
      email: 'mary@johnson.com',
      phone: '(555) 123-4567',
      address: JSON.stringify({
        street: '123 Oak Street',
        city: 'Springfield',
        state: 'IL',
        zip: '62701'
      }),
      metadata: JSON.stringify({
        preferred_time: 'morning',
        special_instructions: 'Use eco-friendly products'
      })
    },
    {
      tenant_id: demoTenantId,
      name: 'Smith Office Building',
      email: 'facilities@smithcorp.com',
      phone: '(555) 987-6543',
      address: JSON.stringify({
        street: '456 Business Ave',
        city: 'Springfield',
        state: 'IL',
        zip: '62702'
      }),
      metadata: JSON.stringify({
        contact_person: 'Janet Smith',
        access_code: '1234'
      })
    },
    {
      tenant_id: demoTenantId,
      name: 'Brown Apartment Complex',
      email: 'manager@brownapts.com',
      phone: '(555) 456-7890',
      address: JSON.stringify({
        street: '789 Residential Blvd',
        city: 'Springfield',
        state: 'IL',
        zip: '62703'
      }),
      metadata: JSON.stringify({
        units: ['A1', 'A2', 'B1', 'B2'],
        key_location: 'Front office'
      })
    }
  ]).returning('id');

  const customer1Id = customers[0].id || customers[0];
  const customer2Id = customers[1].id || customers[1];
  const customer3Id = customers[2].id || customers[2];

  // Insert services for demo tenant
  const services = await knex('services').insert([
    {
      tenant_id: demoTenantId,
      name: 'Standard House Cleaning',
      description: 'Regular weekly cleaning service',
      category: 'residential',
      base_price: 120.00,
      unit: 'per_visit'
    },
    {
      tenant_id: demoTenantId,
      name: 'Deep Cleaning',
      description: 'Comprehensive deep cleaning service',
      category: 'residential',
      base_price: 250.00,
      unit: 'per_visit'
    },
    {
      tenant_id: demoTenantId,
      name: 'Office Cleaning',
      description: 'Commercial office cleaning',
      category: 'commercial',
      base_price: 200.00,
      unit: 'per_visit'
    },
    {
      tenant_id: demoTenantId,
      name: 'Move-out Cleaning',
      description: 'Complete cleaning for move-out',
      category: 'specialty',
      base_price: 300.00,
      unit: 'per_visit'
    }
  ]).returning('id');

  const service1Id = services[0].id || services[0];
  const service2Id = services[1].id || services[1];
  const service3Id = services[2].id || services[2];
  const service4Id = services[3].id || services[3];

  // Insert jobs for demo tenant
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  await knex('jobs').insert([
    {
      tenant_id: demoTenantId,
      customer_id: customer1Id,
      service_id: service1Id,
      title: 'Weekly House Cleaning - Johnson Residence',
      description: 'Regular weekly cleaning service',
      status: 'completed',
      scheduled_date: yesterday.toISOString().split('T')[0],
      scheduled_time_start: '09:00',
      scheduled_time_end: '11:00',
      actual_start_time: new Date(yesterday.getTime() + 9 * 60 * 60 * 1000),
      actual_end_time: new Date(yesterday.getTime() + 11 * 60 * 60 * 1000),
      quoted_amount: 120.00,
      final_amount: 120.00
    },
    {
      tenant_id: demoTenantId,
      customer_id: customer2Id,
      service_id: service3Id,
      title: 'Office Cleaning - Smith Corp',
      description: 'Weekly office cleaning service',
      status: 'in_progress',
      scheduled_date: now.toISOString().split('T')[0],
      scheduled_time_start: '18:00',
      scheduled_time_end: '20:00',
      quoted_amount: 200.00
    },
    {
      tenant_id: demoTenantId,
      customer_id: customer3Id,
      service_id: service4Id,
      title: 'Move-out Cleaning - Brown Apartments Unit A1',
      description: 'Complete move-out cleaning for apartment A1',
      status: 'scheduled',
      scheduled_date: tomorrow.toISOString().split('T')[0],
      scheduled_time_start: '10:00',
      scheduled_time_end: '14:00',
      quoted_amount: 300.00
    },
    {
      tenant_id: demoTenantId,
      customer_id: customer1Id,
      service_id: service1Id,
      title: 'Weekly House Cleaning - Johnson Residence',
      description: 'Regular weekly cleaning service',
      status: 'scheduled',
      scheduled_date: nextWeek.toISOString().split('T')[0],
      scheduled_time_start: '09:00',
      scheduled_time_end: '11:00',
      quoted_amount: 120.00
    }
  ]);

  // Insert some sample transactions
  await knex('transactions').insert([
    {
      tenant_id: demoTenantId,
      customer_id: customer1Id,
      type: 'invoice',
      amount: 120.00,
      description: 'Weekly House Cleaning - Johnson Residence',
      transaction_date: yesterday.toISOString().split('T')[0],
      status: 'paid'
    },
    {
      tenant_id: demoTenantId,
      customer_id: customer1Id,
      type: 'payment',
      amount: 120.00,
      description: 'Payment for weekly cleaning service',
      transaction_date: yesterday.toISOString().split('T')[0],
      status: 'completed'
    },
    {
      tenant_id: demoTenantId,
      customer_id: customer2Id,
      type: 'invoice',
      amount: 200.00,
      description: 'Office Cleaning - Smith Corp',
      transaction_date: now.toISOString().split('T')[0],
      due_date: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'sent'
    }
  ]);

  // Insert business templates
  await knex('business_templates').insert([
    {
      business_type: 'cleaning',
      template_name: 'Standard Cleaning Dashboard',
      is_default: true,
      config: JSON.stringify({
        widgets: [
          { type: 'revenue_overview', position: { x: 0, y: 0 }, size: { w: 2, h: 1 } },
          { type: 'job_status', position: { x: 2, y: 0 }, size: { w: 2, h: 1 } },
          { type: 'recent_jobs', position: { x: 0, y: 1 }, size: { w: 2, h: 2 } },
          { type: 'customer_growth', position: { x: 2, y: 1 }, size: { w: 2, h: 2 } }
        ],
        kpis: ['total_revenue', 'completed_jobs', 'customer_count', 'avg_job_value']
      })
    },
    {
      business_type: 'landscaping',
      template_name: 'Landscaping Dashboard',
      is_default: true,
      config: JSON.stringify({
        widgets: [
          { type: 'seasonal_revenue', position: { x: 0, y: 0 }, size: { w: 2, h: 1 } },
          { type: 'property_status', position: { x: 2, y: 0 }, size: { w: 2, h: 1 } },
          { type: 'weather_alerts', position: { x: 0, y: 1 }, size: { w: 1, h: 1 } },
          { type: 'equipment_status', position: { x: 1, y: 1 }, size: { w: 1, h: 1 } }
        ],
        kpis: ['seasonal_revenue', 'properties_maintained', 'crew_utilization', 'equipment_cost']
      })
    },
    {
      business_type: 'hvac',
      template_name: 'HVAC Service Dashboard',
      is_default: true,
      config: JSON.stringify({
        widgets: [
          { type: 'service_calls', position: { x: 0, y: 0 }, size: { w: 2, h: 1 } },
          { type: 'emergency_calls', position: { x: 2, y: 0 }, size: { w: 2, h: 1 } },
          { type: 'technician_schedule', position: { x: 0, y: 1 }, size: { w: 2, h: 2 } },
          { type: 'parts_inventory', position: { x: 2, y: 1 }, size: { w: 2, h: 2 } }
        ],
        kpis: ['service_revenue', 'emergency_response_time', 'technician_utilization', 'customer_satisfaction']
      })
    }
  ]);

  console.log('✅ Demo data seeded successfully');
};