const { v4: uuidv4 } = require('uuid');

/**
 * Seed sample data: friends, messages, game_sessions, ratings, comments
 * ≥3 data mỗi chức năng
 */
exports.seed = async function (knex) {
    // User IDs
    const admin = 'a1111111-1111-1111-1111-111111111111';
    const player1 = 'b2222222-2222-2222-2222-222222222222';
    const player2 = 'c3333333-3333-3333-3333-333333333333';
    const player3 = 'd4444444-4444-4444-4444-444444444444';
    const player4 = 'e5555555-5555-5555-5555-555555555555';
    const player5 = 'f6666666-6666-6666-6666-666666666666';

    // ============ FRIENDS (≥10 relationships) ============
    await knex('friends').del();
    await knex('friends').insert([
        { id: uuidv4(), user_id: player1, friend_id: player2, status: 'accepted' },
        { id: uuidv4(), user_id: player1, friend_id: player3, status: 'accepted' },
        { id: uuidv4(), user_id: player1, friend_id: player4, status: 'accepted' },
        { id: uuidv4(), user_id: player2, friend_id: player3, status: 'accepted' },
        { id: uuidv4(), user_id: player2, friend_id: player5, status: 'accepted' },
        { id: uuidv4(), user_id: player3, friend_id: player4, status: 'accepted' },
        { id: uuidv4(), user_id: player4, friend_id: player5, status: 'accepted' },
        { id: uuidv4(), user_id: player5, friend_id: player1, status: 'pending' },
        { id: uuidv4(), user_id: admin, friend_id: player1, status: 'accepted' },
        { id: uuidv4(), user_id: admin, friend_id: player2, status: 'accepted' },
    ]);
    console.log('✅ Seeded 10 friend relationships');

    // ============ MESSAGES (≥15 messages) ============
    await knex('messages').del();
    await knex('messages').insert([
        { id: uuidv4(), sender_id: player1, receiver_id: player2, content: 'Chào bạn! Chơi Caro không?', read: true },
        { id: uuidv4(), sender_id: player2, receiver_id: player1, content: 'Chào! OK đi thôi!', read: true },
        { id: uuidv4(), sender_id: player1, receiver_id: player2, content: 'Tôi đang online đây', read: false },
        { id: uuidv4(), sender_id: player3, receiver_id: player1, content: 'Bạn chơi giỏi quá!', read: true },
        { id: uuidv4(), sender_id: player1, receiver_id: player3, content: 'Cảm ơn bạn!', read: true },
        { id: uuidv4(), sender_id: player2, receiver_id: player3, content: 'Hôm nay chơi game gì đây?', read: true },
        { id: uuidv4(), sender_id: player3, receiver_id: player2, content: 'Snake nhé, tôi thích game đó', read: true },
        { id: uuidv4(), sender_id: player4, receiver_id: player5, content: 'Xin chào!', read: true },
        { id: uuidv4(), sender_id: player5, receiver_id: player4, content: 'Hi! Bạn mới vào hả?', read: true },
        { id: uuidv4(), sender_id: player4, receiver_id: player5, content: 'Ừ, mình mới đăng ký', read: false },
        { id: uuidv4(), sender_id: admin, receiver_id: player1, content: 'Chào mừng bạn đến với Board Game!', read: true },
        { id: uuidv4(), sender_id: player1, receiver_id: admin, content: 'Cảm ơn admin!', read: true },
        { id: uuidv4(), sender_id: player2, receiver_id: player5, content: 'Chơi match-3 đi!', read: false },
        { id: uuidv4(), sender_id: player3, receiver_id: player4, content: 'Bạn đã thử Memory chưa?', read: false },
        { id: uuidv4(), sender_id: player5, receiver_id: player1, content: 'Xin kết bạn nhé!', read: false },
    ]);
    console.log('✅ Seeded 15 messages');

    // ============ GAME SESSIONS (≥20 sessions) ============
    await knex('game_sessions').del();
    const sessions = [
        // Player 1 - Caro expert
        { id: uuidv4(), user_id: player1, game_id: 1, state: JSON.stringify({ board: [], winner: 1 }), score: 1500, time_spent: 300, completed: true },
        { id: uuidv4(), user_id: player1, game_id: 1, state: JSON.stringify({ board: [], winner: 1 }), score: 1200, time_spent: 250, completed: true },
        { id: uuidv4(), user_id: player1, game_id: 1, state: JSON.stringify({ board: [], winner: 1 }), score: 1800, time_spent: 280, completed: true },
        { id: uuidv4(), user_id: player1, game_id: 2, state: JSON.stringify({ board: [] }), score: 800, time_spent: 150, completed: true },
        { id: uuidv4(), user_id: player1, game_id: 4, state: JSON.stringify({ snake: [] }), score: 350, time_spent: 120, completed: true },

        // Player 2 - All-rounder
        { id: uuidv4(), user_id: player2, game_id: 1, state: JSON.stringify({ board: [] }), score: 1100, time_spent: 320, completed: true },
        { id: uuidv4(), user_id: player2, game_id: 3, state: JSON.stringify({ board: [] }), score: 50, time_spent: 60, completed: true },
        { id: uuidv4(), user_id: player2, game_id: 4, state: JSON.stringify({ snake: [] }), score: 450, time_spent: 180, completed: true },
        { id: uuidv4(), user_id: player2, game_id: 5, state: JSON.stringify({ board: [] }), score: 2500, time_spent: 100, completed: true },
        { id: uuidv4(), user_id: player2, game_id: 6, state: JSON.stringify({ cards: [] }), score: 200, time_spent: 90, completed: true },

        // Player 3 - Casual
        { id: uuidv4(), user_id: player3, game_id: 3, state: JSON.stringify({ board: [] }), score: 50, time_spent: 45, completed: true },
        { id: uuidv4(), user_id: player3, game_id: 5, state: JSON.stringify({ board: [] }), score: 1800, time_spent: 110, completed: true },
        { id: uuidv4(), user_id: player3, game_id: 6, state: JSON.stringify({ cards: [] }), score: 180, time_spent: 75, completed: true },

        // Player 4 - New gamer
        { id: uuidv4(), user_id: player4, game_id: 1, state: JSON.stringify({ board: [] }), score: 500, time_spent: 400, completed: true },
        { id: uuidv4(), user_id: player4, game_id: 3, state: JSON.stringify({ board: [] }), score: 50, time_spent: 30, completed: true },
        { id: uuidv4(), user_id: player4, game_id: 1, state: JSON.stringify({ board: [], currentPlayer: 1 }), score: 0, time_spent: 60, completed: false }, // Saved game

        // Player 5 - Pro gamer
        { id: uuidv4(), user_id: player5, game_id: 1, state: JSON.stringify({ board: [] }), score: 2000, time_spent: 200, completed: true },
        { id: uuidv4(), user_id: player5, game_id: 2, state: JSON.stringify({ board: [] }), score: 1500, time_spent: 180, completed: true },
        { id: uuidv4(), user_id: player5, game_id: 4, state: JSON.stringify({ snake: [] }), score: 800, time_spent: 300, completed: true },
        { id: uuidv4(), user_id: player5, game_id: 5, state: JSON.stringify({ board: [] }), score: 5000, time_spent: 115, completed: true },
        { id: uuidv4(), user_id: player5, game_id: 8, state: JSON.stringify({ board: [] }), score: 3500, time_spent: 400, completed: true },
    ];
    await knex('game_sessions').insert(sessions);
    console.log('✅ Seeded 21 game sessions');

    // ============ RATINGS (≥15 ratings) ============
    await knex('ratings').del();
    await knex('ratings').insert([
        { id: uuidv4(), user_id: player1, game_id: 1, stars: 5 },
        { id: uuidv4(), user_id: player1, game_id: 2, stars: 4 },
        { id: uuidv4(), user_id: player1, game_id: 4, stars: 5 },
        { id: uuidv4(), user_id: player2, game_id: 1, stars: 5 },
        { id: uuidv4(), user_id: player2, game_id: 3, stars: 4 },
        { id: uuidv4(), user_id: player2, game_id: 5, stars: 5 },
        { id: uuidv4(), user_id: player2, game_id: 6, stars: 4 },
        { id: uuidv4(), user_id: player3, game_id: 3, stars: 5 },
        { id: uuidv4(), user_id: player3, game_id: 5, stars: 4 },
        { id: uuidv4(), user_id: player3, game_id: 6, stars: 5 },
        { id: uuidv4(), user_id: player4, game_id: 1, stars: 4 },
        { id: uuidv4(), user_id: player4, game_id: 3, stars: 5 },
        { id: uuidv4(), user_id: player5, game_id: 1, stars: 5 },
        { id: uuidv4(), user_id: player5, game_id: 4, stars: 5 },
        { id: uuidv4(), user_id: player5, game_id: 5, stars: 5 },
        { id: uuidv4(), user_id: player5, game_id: 8, stars: 5 },
    ]);
    console.log('✅ Seeded 16 ratings');

    // ============ COMMENTS (≥15 comments) ============
    await knex('comments').del();
    await knex('comments').insert([
        { id: uuidv4(), user_id: player1, game_id: 1, content: 'Game Caro này quá hay! Đồ họa đẹp, AI thông minh.' },
        { id: uuidv4(), user_id: player1, game_id: 2, content: 'Caro 4 cũng thú vị, nhanh hơn Caro 5.' },
        { id: uuidv4(), user_id: player1, game_id: 4, content: 'Snake gợi nhớ tuổi thơ!' },
        { id: uuidv4(), user_id: player2, game_id: 1, content: 'Caro hàng 5 là game yêu thích của tôi!' },
        { id: uuidv4(), user_id: player2, game_id: 5, content: 'Match-3 gây nghiện thật!' },
        { id: uuidv4(), user_id: player2, game_id: 6, content: 'Memory giúp rèn luyện trí nhớ tốt.' },
        { id: uuidv4(), user_id: player3, game_id: 3, content: 'Tic-tac-toe đơn giản nhưng vui.' },
        { id: uuidv4(), user_id: player3, game_id: 5, content: 'Candy Crush phiên bản web!' },
        { id: uuidv4(), user_id: player3, game_id: 6, content: 'Tôi thích thử thách trí nhớ!' },
        { id: uuidv4(), user_id: player4, game_id: 1, content: 'Đang học chơi, AI dễ vừa phải.' },
        { id: uuidv4(), user_id: player4, game_id: 3, content: 'Game đầu tiên tôi thắng!' },
        { id: uuidv4(), user_id: player5, game_id: 1, content: 'Pro tip: Luôn chiếm trung tâm trước!' },
        { id: uuidv4(), user_id: player5, game_id: 4, content: 'Đạt 800 điểm rồi, ai hơn tôi không?' },
        { id: uuidv4(), user_id: player5, game_id: 5, content: 'Combo 5x cảm giác phê thật!' },
        { id: uuidv4(), user_id: player5, game_id: 8, content: 'Tetris không bao giờ lỗi thời!' },
        { id: uuidv4(), user_id: admin, game_id: 1, content: 'Chào mừng đến với Caro! Chúc các bạn chơi vui!' },
    ]);
    console.log('✅ Seeded 16 comments');

    // ============ USER ACHIEVEMENTS (≥20) ============
    await knex('user_achievements').del();
    await knex('user_achievements').insert([
        { id: uuidv4(), user_id: player1, achievement_id: 1 }, // Người mới
        { id: uuidv4(), user_id: player1, achievement_id: 2 }, // Caro Beginner
        { id: uuidv4(), user_id: player1, achievement_id: 7 }, // Kết bạn
        { id: uuidv4(), user_id: player1, achievement_id: 9 }, // Scorer
        { id: uuidv4(), user_id: player2, achievement_id: 1 },
        { id: uuidv4(), user_id: player2, achievement_id: 5 }, // Match-3 Pro
        { id: uuidv4(), user_id: player2, achievement_id: 7 },
        { id: uuidv4(), user_id: player2, achievement_id: 9 },
        { id: uuidv4(), user_id: player3, achievement_id: 1 },
        { id: uuidv4(), user_id: player3, achievement_id: 5 },
        { id: uuidv4(), user_id: player4, achievement_id: 1 },
        { id: uuidv4(), user_id: player5, achievement_id: 1 },
        { id: uuidv4(), user_id: player5, achievement_id: 2 },
        { id: uuidv4(), user_id: player5, achievement_id: 3 }, // Caro Master
        { id: uuidv4(), user_id: player5, achievement_id: 4 }, // Snake Lover
        { id: uuidv4(), user_id: player5, achievement_id: 5 },
        { id: uuidv4(), user_id: player5, achievement_id: 7 },
        { id: uuidv4(), user_id: player5, achievement_id: 9 },
        { id: uuidv4(), user_id: player5, achievement_id: 10 }, // High Scorer
        { id: uuidv4(), user_id: player5, achievement_id: 12 }, // Tetris Master
    ]);
    console.log('✅ Seeded 20 user achievements');
};
