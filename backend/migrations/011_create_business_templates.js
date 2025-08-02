exports.up = function(knex) {
  return knex.schema.createTable('business_templates', function(table) {
    table.bigIncrements('id').primary();
    table.string('business_type', 100).notNullable();
    table.string('template_name', 255).notNullable();
    table.jsonb('config').notNullable();
    table.boolean('is_default').defaultTo(false);
    table.timestamps(true, true);

    // Indexes
    table.index('business_type');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('business_templates');
};