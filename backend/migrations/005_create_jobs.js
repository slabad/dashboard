exports.up = function(knex) {
  return knex.schema.createTable('jobs', function(table) {
    table.bigIncrements('id').primary();
    table.bigInteger('tenant_id').unsigned().notNullable();
    table.bigInteger('customer_id').unsigned().notNullable();
    table.bigInteger('service_id').unsigned();
    table.string('external_id', 255);
    table.string('external_source', 100);
    table.string('title', 255).notNullable();
    table.text('description');
    table.string('status', 50).defaultTo('scheduled');
    table.date('scheduled_date');
    table.time('scheduled_time_start');
    table.time('scheduled_time_end');
    table.timestamp('actual_start_time');
    table.timestamp('actual_end_time');
    table.decimal('quoted_amount', 10, 2);
    table.decimal('final_amount', 10, 2);
    table.jsonb('address');
    table.jsonb('metadata').defaultTo('{}');
    table.timestamps(true, true);

    // Foreign keys
    table.foreign('tenant_id').references('id').inTable('tenants').onDelete('CASCADE');
    table.foreign('customer_id').references('id').inTable('customers');
    table.foreign('service_id').references('id').inTable('services');

    // Indexes
    table.index('tenant_id');
    table.index('customer_id');
    table.index(['tenant_id', 'scheduled_date']);
    table.index(['tenant_id', 'status']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('jobs');
};