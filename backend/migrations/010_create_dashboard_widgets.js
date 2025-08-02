exports.up = function(knex) {
  return knex.schema.createTable('dashboard_widgets', function(table) {
    table.bigIncrements('id').primary();
    table.bigInteger('tenant_id').unsigned().notNullable();
    table.bigInteger('user_id').unsigned();
    table.string('widget_type', 100).notNullable();
    table.string('title', 255);
    table.integer('position_x').defaultTo(0);
    table.integer('position_y').defaultTo(0);
    table.integer('width').defaultTo(1);
    table.integer('height').defaultTo(1);
    table.jsonb('config').defaultTo('{}');
    table.boolean('is_visible').defaultTo(true);
    table.timestamps(true, true);

    // Foreign keys
    table.foreign('tenant_id').references('id').inTable('tenants').onDelete('CASCADE');
    table.foreign('user_id').references('id').inTable('users');

    // Indexes
    table.index('tenant_id');
    table.index('user_id');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('dashboard_widgets');
};