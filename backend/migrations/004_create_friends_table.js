/**
 * Create friends table
 */
exports.up = function (knex) {
    return knex.schema.createTable('friends', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
        table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
        table.uuid('friend_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
        table.string('status', 20).notNullable().defaultTo('pending');
        table.timestamp('created_at').defaultTo(knex.fn.now());

        // Unique constraint
        table.unique(['user_id', 'friend_id']);

        // Indexes
        table.index('user_id');
        table.index('friend_id');
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('friends');
};
