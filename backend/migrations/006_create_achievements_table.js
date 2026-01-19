/**
 * Create achievements table
 */
exports.up = function (knex) {
    return knex.schema.createTable('achievements', (table) => {
        table.increments('id').primary();
        table.string('name', 100).notNullable();
        table.text('description');
        table.string('icon', 50);
        table.jsonb('criteria').notNullable();
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('achievements');
};
