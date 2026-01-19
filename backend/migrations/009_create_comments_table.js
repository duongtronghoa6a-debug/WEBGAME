/**
 * Create comments table
 */
exports.up = function (knex) {
    return knex.schema.createTable('comments', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
        table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
        table.integer('game_id').unsigned().notNullable().references('id').inTable('games').onDelete('CASCADE');
        table.text('content').notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());

        // Indexes
        table.index('game_id');
        table.index('created_at');
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('comments');
};
