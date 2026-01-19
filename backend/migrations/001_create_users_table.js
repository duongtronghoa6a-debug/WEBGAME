/**
 * Create users table
 */
exports.up = function (knex) {
    return knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
        .then(() => {
            return knex.schema.createTable('users', (table) => {
                table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
                table.string('email', 255).unique().notNullable();
                table.string('username', 50).unique().notNullable();
                table.string('password_hash', 255).notNullable();
                table.text('avatar_url');
                table.boolean('is_admin').defaultTo(false);
                table.timestamp('created_at').defaultTo(knex.fn.now());
                table.timestamp('updated_at').defaultTo(knex.fn.now());

                // Indexes
                table.index('email');
                table.index('username');
            });
        });
};

exports.down = function (knex) {
    return knex.schema.dropTable('users');
};
