exports.up = function(knex) {
  return knex.schema.createTable('services', function(table) {
    table.bigIncrements('id').primary();
    table.bigInteger('tenant_id').unsigned().notNullable();
    table.string('name', 255).notNullable();
    table.text('description');
    table.string('category', 100);
    table.decimal('base_price', 10, 2);
    table.string('unit', 50);
    table.boolean('is_active').defaultTo(true);
    table.jsonb('metadata').defaultTo('{}');
    table.timestamps(true, true);

    // Foreign keys
    table.foreign('tenant_id').references('id').inTable('tenants').onDelete('CASCADE');

    // Indexes
    table.index('tenant_id');
    table.index(['tenant_id', 'category']);
    table.index(['tenant_id', 'is_active']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('services');
};