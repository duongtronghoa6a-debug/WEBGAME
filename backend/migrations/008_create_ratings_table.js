/**
 * Create ratings table
 */
exports.up = function (knex) {
    return knex.schema.createTable('ratings', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
        table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
        table.integer('game_id').unsigned().notNullable().references('id').inTable('games').onDelete('CASCADE');
        table.integer('stars').notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());

        // Unique constraint - one rating per user per game
        table.unique(['user_id', 'game_id']);
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('ratings');
};
