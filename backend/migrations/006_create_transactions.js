exports.up = function(knex) {
  return knex.schema.createTable('transactions', function(table) {
    table.bigIncrements('id').primary();
    table.bigInteger('tenant_id').unsigned().notNullable();
    table.bigInteger('customer_id').unsigned();
    table.bigInteger('job_id').unsigned();
    table.string('external_id', 255);
    table.string('external_source', 100);
    table.string('type', 50).notNullable();
    table.decimal('amount', 12, 2).notNullable();
    table.string('currency', 3).defaultTo('USD');
    table.text('description');
    table.date('transaction_date').notNullable();
    table.date('due_date');
    table.string('status', 50);
    table.jsonb('external_data').defaultTo('{}');
    table.timestamps(true, true);

    // Foreign keys
    table.foreign('tenant_id').references('id').inTable('tenants').onDelete('CASCADE');
    table.foreign('customer_id').references('id').inTable('customers');
    table.foreign('job_id').references('id').inTable('jobs');

    // Indexes
    table.index('tenant_id');
    table.index('customer_id');
    table.index('job_id');
    table.index(['tenant_id', 'transaction_date', 'type']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('transactions');
};