/**
 * Create game_sessions table
 */
exports.up = function (knex) {
    return knex.schema.createTable('game_sessions', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
        table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
        table.integer('game_id').unsigned().notNullable().references('id').inTable('games').onDelete('CASCADE');
        table.jsonb('state').notNullable();
        table.integer('score').defaultTo(0);
        table.integer('time_spent').defaultTo(0);
        table.boolean('completed').defaultTo(false);
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());

        // Indexes
        table.index('user_id');
        table.index('game_id');
        table.index(['game_id', 'score']);
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('game_sessions');
};
