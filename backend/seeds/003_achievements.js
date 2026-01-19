/**
 * Seed achievements
 */
exports.seed = async function (knex) {
    await knex('achievements').del();

    await knex('achievements').insert([
        {
            id: 1,
            name: 'Người Mới',
            description: 'Hoàn thành trận đấu đầu tiên',
            icon: '🎮',
            criteria: JSON.stringify({ type: 'game_wins', count: 1 })
        },
        {
            id: 2,
            name: 'Caro Beginner',
            description: 'Thắng 5 trận Caro',
            icon: '🎯',
            criteria: JSON.stringify({ type: 'game_wins', gameId: 1, count: 5 })
        },
        {
            id: 3,
            name: 'Caro Master',
            description: 'Thắng 20 trận Caro',
            icon: '🏆',
            criteria: JSON.stringify({ type: 'game_wins', gameId: 1, count: 20 })
        },
        {
            id: 4,
            name: 'Snake Lover',
            description: 'Đạt 500 điểm trong Snake',
            icon: '🐍',
            criteria: JSON.stringify({ type: 'total_score', gameId: 4, score: 500 })
        },
        {
            id: 5,
            name: 'Match-3 Pro',
            description: 'Hoàn thành 10 trận Match-3',
            icon: '🍬',
            criteria: JSON.stringify({ type: 'game_wins', gameId: 5, count: 10 })
        },
        {
            id: 6,
            name: 'Memory Expert',
            description: 'Hoàn thành Memory dưới 20 lượt',
            icon: '🧠',
            criteria: JSON.stringify({ type: 'game_wins', gameId: 6, count: 5 })
        },
        {
            id: 7,
            name: 'Kết Bạn',
            description: 'Có 3 người bạn',
            icon: '👥',
            criteria: JSON.stringify({ type: 'friends_count', count: 3 })
        },
        {
            id: 8,
            name: 'Xã Hội',
            description: 'Có 10 người bạn',
            icon: '🌟',
            criteria: JSON.stringify({ type: 'friends_count', count: 10 })
        },
        {
            id: 9,
            name: 'Scorer',
            description: 'Đạt tổng 1000 điểm',
            icon: '💯',
            criteria: JSON.stringify({ type: 'total_score', score: 1000 })
        },
        {
            id: 10,
            name: 'High Scorer',
            description: 'Đạt tổng 10000 điểm',
            icon: '🔥',
            criteria: JSON.stringify({ type: 'total_score', score: 10000 })
        },
        {
            id: 11,
            name: 'All Rounder',
            description: 'Chơi tất cả 7 game cơ bản',
            icon: '🎲',
            criteria: JSON.stringify({ type: 'games_played', count: 7 })
        },
        {
            id: 12,
            name: 'Tetris Master',
            description: 'Đạt 1000 điểm Tetris',
            icon: '🧱',
            criteria: JSON.stringify({ type: 'total_score', gameId: 8, score: 1000 })
        }
    ]);

    console.log('✅ Seeded 12 achievements');
};
