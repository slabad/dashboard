exports.up = function(knex) {
  return knex.schema.createTable('uploaded_files', function(table) {
    table.bigIncrements('id').primary();
    table.bigInteger('tenant_id').unsigned().notNullable();
    table.string('original_filename', 255).notNullable();
    table.string('file_type', 50);
    table.integer('file_size');
    table.string('storage_path', 500);
    table.string('processing_status', 50).defaultTo('pending');
    table.jsonb('extracted_data');
    table.text('error_message');
    table.bigInteger('uploaded_by').unsigned();
    table.timestamps(true, true);
    table.timestamp('processed_at');

    // Foreign keys
    table.foreign('tenant_id').references('id').inTable('tenants').onDelete('CASCADE');
    table.foreign('uploaded_by').references('id').inTable('users');

    // Indexes
    table.index('tenant_id');
    table.index('processing_status');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('uploaded_files');
};