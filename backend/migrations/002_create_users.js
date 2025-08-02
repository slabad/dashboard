exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
    table.bigIncrements('id').primary();
    table.bigInteger('tenant_id').unsigned().notNullable();
    table.string('email', 255).notNullable();
    table.string('password_hash', 255).notNullable();
    table.string('first_name', 100);
    table.string('last_name', 100);
    table.string('role', 50).defaultTo('user');
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);

    // Foreign keys
    table.foreign('tenant_id').references('id').inTable('tenants').onDelete('CASCADE');

    // Unique constraint and indexes
    table.unique(['tenant_id', 'email']);
    table.index('tenant_id');
    table.index('email');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('users');
};