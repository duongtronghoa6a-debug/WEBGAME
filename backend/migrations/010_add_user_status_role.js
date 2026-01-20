/**
 * Add status and role columns to users table
 */
exports.up = function (knex) {
    return knex.schema.alterTable('users', (table) => {
        table.string('status', 20).defaultTo('active');  // 'active', 'banned'
        table.string('role', 20).defaultTo('player');    // 'admin', 'player'
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('users', (table) => {
        table.dropColumn('status');
        table.dropColumn('role');
    });
};
