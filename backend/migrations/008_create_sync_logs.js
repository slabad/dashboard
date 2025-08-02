exports.up = function(knex) {
  return knex.schema.createTable('sync_logs', function(table) {
    table.bigIncrements('id').primary();
    table.bigInteger('tenant_id').unsigned().notNullable();
    table.bigInteger('integration_id').unsigned().notNullable();
    table.string('entity_type', 100);
    table.string('status', 50);
    table.integer('records_processed').defaultTo(0);
    table.text('error_message');
    table.timestamp('started_at').defaultTo(knex.fn.now());
    table.timestamp('completed_at');

    // Foreign keys
    table.foreign('tenant_id').references('id').inTable('tenants').onDelete('CASCADE');
    table.foreign('integration_id').references('id').inTable('integrations');

    // Indexes
    table.index('tenant_id');
    table.index(['tenant_id', 'started_at']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('sync_logs');
};