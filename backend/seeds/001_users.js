const bcrypt = require('bcryptjs');

/**
 * Seed users (10 users với đầy đủ thông tin)
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
            is_admin: true,
            status: 'active',
            role: 'admin'
        },
        {
            id: 'b2222222-2222-2222-2222-222222222222',
            email: '02@gmail.com',
            username: 'CaroMaster',
            password_hash: password,
            avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player1',
            is_admin: false,
            status: 'active',
            role: 'player'
        },
        {
            id: 'c3333333-3333-3333-3333-333333333333',
            email: '03@gmail.com',
            username: 'GameLover',
            password_hash: password,
            avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player2',
            is_admin: false,
            status: 'active',
            role: 'player'
        },
        {
            id: 'd4444444-4444-4444-4444-444444444444',
            email: '04@gmail.com',
            username: 'NewGamer',
            password_hash: password,
            avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player3',
            is_admin: false,
            status: 'active',
            role: 'player'
        },
        {
            id: 'e5555555-5555-5555-5555-555555555555',
            email: '05@gmail.com',
            username: 'CasualPlayer',
            password_hash: password,
            avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player4',
            is_admin: false,
            status: 'active',
            role: 'player'
        },
        {
            id: 'f6666666-6666-6666-6666-666666666666',
            email: '06@gmail.com',
            username: 'ProGamer',
            password_hash: password,
            avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player5',
            is_admin: false,
            status: 'active',
            role: 'player'
        },
        {
            id: 'g7777777-7777-7777-7777-777777777777',
            email: '07@gmail.com',
            username: 'TetrisPro',
            password_hash: password,
            avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player6',
            is_admin: false,
            status: 'active',
            role: 'player'
        },
        {
            id: 'h8888888-8888-8888-8888-888888888888',
            email: '08@gmail.com',
            username: 'SnakeKing',
            password_hash: password,
            avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player7',
            is_admin: false,
            status: 'active',
            role: 'player'
        },
        {
            id: 'i9999999-9999-9999-9999-999999999999',
            email: '09@gmail.com',
            username: 'MemoryMaster',
            password_hash: password,
            avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player8',
            is_admin: false,
            status: 'active',
            role: 'player'
        },
        {
            id: 'j0000000-0000-0000-0000-000000000000',
            email: '10@gmail.com',
            username: 'Match3King',
            password_hash: password,
            avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player9',
            is_admin: false,
            status: 'active',
            role: 'player'
        }
    ]);

    console.log('✅ Seeded 10 users');
};

