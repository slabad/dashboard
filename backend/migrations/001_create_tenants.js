exports.up = function(knex) {
  return knex.schema.createTable('tenants', function(table) {
    table.bigIncrements('id').primary();
    table.string('name', 255).notNullable();
    table.string('subdomain', 100).unique().notNullable();
    table.string('business_type', 100).notNullable();
    table.jsonb('settings').defaultTo('{}');
    table.timestamps(true, true);

    // Indexes
    table.index('subdomain');
    table.index('business_type');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('tenants');
};