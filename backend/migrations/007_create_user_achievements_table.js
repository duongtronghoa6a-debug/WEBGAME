/**
 * Create user_achievements table
 */
exports.up = function (knex) {
    return knex.schema.createTable('user_achievements', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
        table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
        table.integer('achievement_id').unsigned().notNullable().references('id').inTable('achievements').onDelete('CASCADE');
        table.timestamp('unlocked_at').defaultTo(knex.fn.now());

        // Unique constraint
        table.unique(['user_id', 'achievement_id']);
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('user_achievements');
};
