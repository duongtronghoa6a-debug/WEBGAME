/**
 * Create games table
 */
exports.up = function (knex) {
    return knex.schema.createTable('games', (table) => {
        table.increments('id').primary();
        table.string('name', 100).notNullable();
        table.string('type', 50).notNullable();
        table.jsonb('config').defaultTo('{}');
        table.boolean('enabled').defaultTo(true);
        table.text('instructions');
        table.timestamp('created_at').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('games');
};
