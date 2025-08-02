exports.up = function(knex) {
  return knex.schema.createTable('customers', function(table) {
    table.bigIncrements('id').primary();
    table.bigInteger('tenant_id').unsigned().notNullable();
    table.string('external_id', 255);
    table.string('external_source', 100);
    table.string('name', 255).notNullable();
    table.string('email', 255);
    table.string('phone', 50);
    table.jsonb('address');
    table.jsonb('metadata').defaultTo('{}');
    table.timestamps(true, true);

    // Foreign keys
    table.foreign('tenant_id').references('id').inTable('tenants').onDelete('CASCADE');

    // Indexes
    table.index('tenant_id');
    table.index(['tenant_id', 'external_id', 'external_source']);
    table.index(['tenant_id', 'name']);
    table.index(['tenant_id', 'email']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('customers');
};