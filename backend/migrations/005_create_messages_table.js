/**
 * Create messages table
 */
exports.up = function (knex) {
    return knex.schema.createTable('messages', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
        table.uuid('sender_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
        table.uuid('receiver_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
        table.text('content').notNullable();
        table.boolean('read').defaultTo(false);
        table.timestamp('created_at').defaultTo(knex.fn.now());

        // Indexes
        table.index('sender_id');
        table.index('receiver_id');
        table.index('created_at');
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('messages');
};
