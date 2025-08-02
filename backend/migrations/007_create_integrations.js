exports.up = function(knex) {
  return knex.schema.createTable('integrations', function(table) {
    table.bigIncrements('id').primary();
    table.bigInteger('tenant_id').unsigned().notNullable();
    table.string('service_name', 100).notNullable();
    table.jsonb('config').notNullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamp('last_sync_at');
    table.timestamps(true, true);

    // Foreign keys
    table.foreign('tenant_id').references('id').inTable('tenants').onDelete('CASCADE');

    // Unique constraint and indexes
    table.unique(['tenant_id', 'service_name']);
    table.index('tenant_id');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('integrations');
};