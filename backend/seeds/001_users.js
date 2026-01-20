const bcrypt = require('bcryptjs');

/**
 * Seed users (≥5 users với đầy đủ thông tin)
 */
exports.seed = async function (knex) {
    // Delete existing data
    await knex('users').del();

    const password = await bcrypt.hash('111111', 12);

    await knex('users').insert([
        {
            id: 'a1111111-1111-1111-1111-111111111111',
            email: '01@gmail.com',
            username: 'admin',
            password_hash: password,
            avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
            is_admin: true
        },
        {
            id: 'b2222222-2222-2222-2222-222222222222',
            email: '02@gmail.com',
            username: 'CaroMaster',
            password_hash: password,
            avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player1',
            is_admin: false
        },
        {
            id: 'c3333333-3333-3333-3333-333333333333',
            email: '03@gmail.com',
            username: 'GameLover',
            password_hash: password,
            avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player2',
            is_admin: false
        },
        {
            id: 'd4444444-4444-4444-4444-444444444444',
            email: '04@gmail.com',
            username: 'NewGamer',
            password_hash: password,
            avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player3',
            is_admin: false
        },
        {
            id: 'e5555555-5555-5555-5555-555555555555',
            email: '05@gmail.com',
            username: 'CasualPlayer',
            password_hash: password,
            avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player4',
            is_admin: false
        },
        {
            id: 'f6666666-6666-6666-6666-666666666666',
            email: '06@gmail.com',
            username: 'ProGamer',
            password_hash: password,
            avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player5',
            is_admin: false
        }
    ]);

    console.log('✅ Seeded 6 users');
};

