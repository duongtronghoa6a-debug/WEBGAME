const { v4: uuidv4 } = require('uuid');

/**
 * Seed sample data: friends, messages, game_sessions, ratings, comments
 * Expanded with all 10 games and 10 users
 */
exports.seed = async function (knex) {
    // User IDs (10 users)
    const admin = 'a1111111-1111-1111-1111-111111111111';
    const player1 = 'b2222222-2222-2222-2222-222222222222'; // CaroMaster
    const player2 = 'c3333333-3333-3333-3333-333333333333'; // GameLover
    const player3 = 'd4444444-4444-4444-4444-444444444444'; // NewGamer
    const player4 = 'e5555555-5555-5555-5555-555555555555'; // CasualPlayer
    const player5 = 'f6666666-6666-6666-6666-666666666666'; // ProGamer
    const player6 = 'a7777777-7777-7777-7777-777777777777'; // TetrisPro
    const player7 = 'a8888888-8888-8888-8888-888888888888'; // SnakeKing
    const player8 = 'a9999999-9999-9999-9999-999999999999'; // MemoryMaster
    const player9 = 'a0000000-0000-0000-0000-000000000000'; // Match3King

    // Game IDs: 1,2,3,4,5,6,7,8,11,18

    // ============ FRIENDS (Focused on player1/02@gmail.com for pagination testing) ============
    await knex('friends').del();
    const friends = [
        // Player1 (02@gmail.com / CaroMaster) has 15+ friends for pagination
        { id: uuidv4(), user_id: player1, friend_id: admin, status: 'accepted' },
        { id: uuidv4(), user_id: player1, friend_id: player2, status: 'accepted' },
        { id: uuidv4(), user_id: player1, friend_id: player3, status: 'accepted' },
        { id: uuidv4(), user_id: player1, friend_id: player4, status: 'accepted' },
        { id: uuidv4(), user_id: player1, friend_id: player5, status: 'accepted' },
        { id: uuidv4(), user_id: player1, friend_id: player6, status: 'accepted' },
        { id: uuidv4(), user_id: player1, friend_id: player7, status: 'accepted' },
        { id: uuidv4(), user_id: player1, friend_id: player8, status: 'accepted' },
        { id: uuidv4(), user_id: player1, friend_id: player9, status: 'accepted' },
        // Other friendships
        { id: uuidv4(), user_id: player2, friend_id: player3, status: 'accepted' },
        { id: uuidv4(), user_id: player2, friend_id: player5, status: 'accepted' },
        { id: uuidv4(), user_id: player3, friend_id: player4, status: 'accepted' },
        { id: uuidv4(), user_id: player4, friend_id: player5, status: 'accepted' },
        { id: uuidv4(), user_id: player5, friend_id: player6, status: 'accepted' },
        { id: uuidv4(), user_id: player6, friend_id: player7, status: 'accepted' },
        { id: uuidv4(), user_id: player7, friend_id: player8, status: 'accepted' },
        { id: uuidv4(), user_id: player8, friend_id: player9, status: 'accepted' },
        { id: uuidv4(), user_id: admin, friend_id: player2, status: 'accepted' },
        { id: uuidv4(), user_id: admin, friend_id: player3, status: 'accepted' },
        // Pending requests
        { id: uuidv4(), user_id: player5, friend_id: player9, status: 'pending' },
    ];
    await knex('friends').insert(friends);
    console.log('✅ Seeded 21 friend relationships (player1 has 9 friends)');

    // ============ MESSAGES (Focused on player1/02@gmail.com for pagination testing) ============
    await knex('messages').del();
    const messages = [
        // Player1 (02@gmail.com) conversations - 30+ messages for pagination
        // With admin
        { id: uuidv4(), sender_id: admin, receiver_id: player1, content: 'Chào mừng bạn đến với game!' },
        { id: uuidv4(), sender_id: player1, receiver_id: admin, content: 'Cảm ơn admin!' },
        { id: uuidv4(), sender_id: admin, receiver_id: player1, content: 'Có gì cần hỗ trợ cứ nói nha!' },
        { id: uuidv4(), sender_id: player1, receiver_id: admin, content: 'Dạ, cảm ơn admin nhiều!' },
        // With player2
        { id: uuidv4(), sender_id: player1, receiver_id: player2, content: 'Chào bạn! Chơi Caro không?' },
        { id: uuidv4(), sender_id: player2, receiver_id: player1, content: 'Ok luôn! Đang rảnh nè.' },
        { id: uuidv4(), sender_id: player1, receiver_id: player2, content: 'Để mình tạo phòng nhé!' },
        { id: uuidv4(), sender_id: player2, receiver_id: player1, content: 'Được, mình vào ngay!' },
        { id: uuidv4(), sender_id: player1, receiver_id: player2, content: 'Trận vừa hay quá!' },
        { id: uuidv4(), sender_id: player2, receiver_id: player1, content: 'Ừ, thắng sát nút!' },
        // With player3
        { id: uuidv4(), sender_id: player1, receiver_id: player3, content: 'Chơi Snake không?' },
        { id: uuidv4(), sender_id: player3, receiver_id: player1, content: 'OK, thi điểm cao!' },
        { id: uuidv4(), sender_id: player1, receiver_id: player3, content: 'Mình được 800 điểm!' },
        { id: uuidv4(), sender_id: player3, receiver_id: player1, content: 'Mình mới 500 thôi!' },
        // With player4
        { id: uuidv4(), sender_id: player1, receiver_id: player4, content: 'Hello!' },
        { id: uuidv4(), sender_id: player4, receiver_id: player1, content: 'Hi! Chơi game gì?' },
        { id: uuidv4(), sender_id: player1, receiver_id: player4, content: 'Tetris đi!' },
        { id: uuidv4(), sender_id: player4, receiver_id: player1, content: 'OK let go!' },
        // With player5
        { id: uuidv4(), sender_id: player5, receiver_id: player1, content: 'Tip chơi Tetris đi bạn!' },
        { id: uuidv4(), sender_id: player1, receiver_id: player5, content: 'Focus vào tạo line!' },
        { id: uuidv4(), sender_id: player5, receiver_id: player1, content: 'Cảm ơn bạn!' },
        { id: uuidv4(), sender_id: player1, receiver_id: player5, content: 'Không có gì!' },
        // With player6
        { id: uuidv4(), sender_id: player1, receiver_id: player6, content: 'Bạn chơi Caro hay thật!' },
        { id: uuidv4(), sender_id: player6, receiver_id: player1, content: 'Cảm ơn, mình tập nhiều!' },
        // With player7
        { id: uuidv4(), sender_id: player1, receiver_id: player7, content: 'Snake King ơi, dạy mình!' },
        { id: uuidv4(), sender_id: player7, receiver_id: player1, content: '1200 điểm là bí kíp!' },
        // With player8
        { id: uuidv4(), sender_id: player1, receiver_id: player8, content: 'Memory khó không?' },
        { id: uuidv4(), sender_id: player8, receiver_id: player1, content: 'Cần tập trung thôi!' },
        // With player9
        { id: uuidv4(), sender_id: player1, receiver_id: player9, content: 'Match-3 gây nghiện ghê!' },
        { id: uuidv4(), sender_id: player9, receiver_id: player1, content: 'Combo 5x phê lắm!' },
        // Other conversations
        { id: uuidv4(), sender_id: player3, receiver_id: player4, content: 'Trận Snake vừa rồi hay quá!' },
        { id: uuidv4(), sender_id: player4, receiver_id: player3, content: 'Ừ, điểm cao nhất của mình là 800 điểm!' },
        { id: uuidv4(), sender_id: player6, receiver_id: player7, content: 'Tetris hay quá!' },
        { id: uuidv4(), sender_id: player7, receiver_id: player6, content: 'Ừ, mình đang cày điểm Snake!' },
        { id: uuidv4(), sender_id: player8, receiver_id: player9, content: 'Memory game khó vcl!' },
        { id: uuidv4(), sender_id: player9, receiver_id: player8, content: 'Từ từ nhớ vị trí thôi!' },
    ];
    await knex('messages').insert(messages);
    console.log('✅ Seeded 36 messages (player1 has 26 messages)');

    // ============ GAME SESSIONS (Đa dạng số lượt chơi cho từng game) ============
    await knex('game_sessions').del();
    const sessions = [
        // Game 1 - Caro Hàng 5 (13 sessions - game phổ biến nhất)
        { id: uuidv4(), user_id: player1, game_id: 1, state: JSON.stringify({ board: [] }), score: 1500, time_spent: 300, completed: true },
        { id: uuidv4(), user_id: player1, game_id: 1, state: JSON.stringify({ board: [] }), score: 1800, time_spent: 280, completed: true },
        { id: uuidv4(), user_id: player1, game_id: 1, state: JSON.stringify({ board: [] }), score: 2100, time_spent: 250, completed: true },
        { id: uuidv4(), user_id: player2, game_id: 1, state: JSON.stringify({ board: [] }), score: 1200, time_spent: 320, completed: true },
        { id: uuidv4(), user_id: player2, game_id: 1, state: JSON.stringify({ board: [] }), score: 1400, time_spent: 300, completed: true },
        { id: uuidv4(), user_id: player3, game_id: 1, state: JSON.stringify({ board: [] }), score: 800, time_spent: 400, completed: true },
        { id: uuidv4(), user_id: player3, game_id: 1, state: JSON.stringify({ board: [] }), score: 950, time_spent: 380, completed: true },
        { id: uuidv4(), user_id: player4, game_id: 1, state: JSON.stringify({ board: [] }), score: 600, time_spent: 450, completed: true },
        { id: uuidv4(), user_id: player5, game_id: 1, state: JSON.stringify({ board: [] }), score: 2000, time_spent: 200, completed: true },
        { id: uuidv4(), user_id: player5, game_id: 1, state: JSON.stringify({ board: [] }), score: 2200, time_spent: 180, completed: true },
        { id: uuidv4(), user_id: player6, game_id: 1, state: JSON.stringify({ board: [] }), score: 1100, time_spent: 350, completed: true },
        { id: uuidv4(), user_id: player7, game_id: 1, state: JSON.stringify({ board: [] }), score: 1300, time_spent: 330, completed: true },
        { id: uuidv4(), user_id: player8, game_id: 1, state: JSON.stringify({ board: [] }), score: 900, time_spent: 400, completed: true },

        // Game 4 - Snake (9 sessions)
        { id: uuidv4(), user_id: player1, game_id: 4, state: JSON.stringify({ snake: [] }), score: 450, time_spent: 120, completed: true },
        { id: uuidv4(), user_id: player1, game_id: 4, state: JSON.stringify({ snake: [] }), score: 620, time_spent: 150, completed: true },
        { id: uuidv4(), user_id: player2, game_id: 4, state: JSON.stringify({ snake: [] }), score: 550, time_spent: 180, completed: true },
        { id: uuidv4(), user_id: player3, game_id: 4, state: JSON.stringify({ snake: [] }), score: 380, time_spent: 100, completed: true },
        { id: uuidv4(), user_id: player5, game_id: 4, state: JSON.stringify({ snake: [] }), score: 800, time_spent: 300, completed: true },
        { id: uuidv4(), user_id: player7, game_id: 4, state: JSON.stringify({ snake: [] }), score: 1200, time_spent: 450, completed: true },
        { id: uuidv4(), user_id: player7, game_id: 4, state: JSON.stringify({ snake: [] }), score: 950, time_spent: 380, completed: true },
        { id: uuidv4(), user_id: player8, game_id: 4, state: JSON.stringify({ snake: [] }), score: 720, time_spent: 280, completed: true },
        { id: uuidv4(), user_id: player9, game_id: 4, state: JSON.stringify({ snake: [] }), score: 850, time_spent: 320, completed: true },

        // Game 3 - Tic-Tac-Toe (6 sessions)
        { id: uuidv4(), user_id: player2, game_id: 3, state: JSON.stringify({ board: [] }), score: 50, time_spent: 60, completed: true },
        { id: uuidv4(), user_id: player3, game_id: 3, state: JSON.stringify({ board: [] }), score: 50, time_spent: 45, completed: true },
        { id: uuidv4(), user_id: player4, game_id: 3, state: JSON.stringify({ board: [] }), score: 50, time_spent: 30, completed: true },
        { id: uuidv4(), user_id: player5, game_id: 3, state: JSON.stringify({ board: [] }), score: 50, time_spent: 40, completed: true },
        { id: uuidv4(), user_id: player6, game_id: 3, state: JSON.stringify({ board: [] }), score: 50, time_spent: 35, completed: true },
        { id: uuidv4(), user_id: player7, game_id: 3, state: JSON.stringify({ board: [] }), score: 50, time_spent: 55, completed: true },

        // Game 5 - Match-3 (5 sessions)
        { id: uuidv4(), user_id: player2, game_id: 5, state: JSON.stringify({ board: [] }), score: 2500, time_spent: 100, completed: true },
        { id: uuidv4(), user_id: player3, game_id: 5, state: JSON.stringify({ board: [] }), score: 1800, time_spent: 110, completed: true },
        { id: uuidv4(), user_id: player5, game_id: 5, state: JSON.stringify({ board: [] }), score: 3500, time_spent: 115, completed: true },
        { id: uuidv4(), user_id: player9, game_id: 5, state: JSON.stringify({ board: [] }), score: 4200, time_spent: 120, completed: true },
        { id: uuidv4(), user_id: player9, game_id: 5, state: JSON.stringify({ board: [] }), score: 3800, time_spent: 105, completed: true },

        // Game 2 - Caro Hàng 4 (4 sessions)
        { id: uuidv4(), user_id: player1, game_id: 2, state: JSON.stringify({ board: [] }), score: 900, time_spent: 150, completed: true },
        { id: uuidv4(), user_id: player2, game_id: 2, state: JSON.stringify({ board: [] }), score: 750, time_spent: 180, completed: true },
        { id: uuidv4(), user_id: player5, game_id: 2, state: JSON.stringify({ board: [] }), score: 1200, time_spent: 120, completed: true },
        { id: uuidv4(), user_id: player6, game_id: 2, state: JSON.stringify({ board: [] }), score: 680, time_spent: 200, completed: true },

        // Game 6 - Memory (4 sessions)
        { id: uuidv4(), user_id: player2, game_id: 6, state: JSON.stringify({ cards: [] }), score: 200, time_spent: 90, completed: true },
        { id: uuidv4(), user_id: player3, game_id: 6, state: JSON.stringify({ cards: [] }), score: 180, time_spent: 75, completed: true },
        { id: uuidv4(), user_id: player8, game_id: 6, state: JSON.stringify({ cards: [] }), score: 300, time_spent: 60, completed: true },
        { id: uuidv4(), user_id: player8, game_id: 6, state: JSON.stringify({ cards: [] }), score: 280, time_spent: 65, completed: true },

        // Game 8 - Tetris (5 sessions)
        { id: uuidv4(), user_id: player5, game_id: 8, state: JSON.stringify({ board: [] }), score: 3500, time_spent: 400, completed: true },
        { id: uuidv4(), user_id: player6, game_id: 8, state: JSON.stringify({ board: [] }), score: 5000, time_spent: 600, completed: true },
        { id: uuidv4(), user_id: player6, game_id: 8, state: JSON.stringify({ board: [] }), score: 4500, time_spent: 550, completed: true },
        { id: uuidv4(), user_id: player1, game_id: 8, state: JSON.stringify({ board: [] }), score: 2800, time_spent: 350, completed: true },
        { id: uuidv4(), user_id: player2, game_id: 8, state: JSON.stringify({ board: [] }), score: 2200, time_spent: 300, completed: true },

        // Game 18 - 2048 (3 sessions)
        { id: uuidv4(), user_id: player1, game_id: 18, state: JSON.stringify({ board: [] }), score: 8500, time_spent: 600, completed: true },
        { id: uuidv4(), user_id: player2, game_id: 18, state: JSON.stringify({ board: [] }), score: 12000, time_spent: 800, completed: true },
        { id: uuidv4(), user_id: player5, game_id: 18, state: JSON.stringify({ board: [] }), score: 15000, time_spent: 900, completed: true },

        // Game 11 - Minesweeper (2 sessions)
        { id: uuidv4(), user_id: player3, game_id: 11, state: JSON.stringify({ board: [] }), score: 120, time_spent: 150, completed: true },
        { id: uuidv4(), user_id: player4, game_id: 11, state: JSON.stringify({ board: [] }), score: 180, time_spent: 200, completed: true },
    ];
    await knex('game_sessions').insert(sessions);
    console.log('✅ Seeded 51 game sessions (Caro5: 13, Snake: 9, TTT: 6, Match3: 5, Tetris: 5, Caro4: 4, Memory: 4, 2048: 3, Minesweeper: 2)');

    // ============ RATINGS (ratings cho tất cả games) ============
    await knex('ratings').del();
    await knex('ratings').insert([
        // Game 1 - Caro Hàng 5
        { id: uuidv4(), user_id: player1, game_id: 1, stars: 5 },
        { id: uuidv4(), user_id: player2, game_id: 1, stars: 5 },
        { id: uuidv4(), user_id: player3, game_id: 1, stars: 4 },
        { id: uuidv4(), user_id: player4, game_id: 1, stars: 5 },
        { id: uuidv4(), user_id: player5, game_id: 1, stars: 5 },
        // Game 2 - Caro Hàng 4
        { id: uuidv4(), user_id: player1, game_id: 2, stars: 4 },
        { id: uuidv4(), user_id: player2, game_id: 2, stars: 4 },
        { id: uuidv4(), user_id: player5, game_id: 2, stars: 5 },
        // Game 3 - Tic-Tac-Toe
        { id: uuidv4(), user_id: player2, game_id: 3, stars: 3 },
        { id: uuidv4(), user_id: player3, game_id: 3, stars: 4 },
        { id: uuidv4(), user_id: player4, game_id: 3, stars: 4 },
        // Game 4 - Snake
        { id: uuidv4(), user_id: player1, game_id: 4, stars: 5 },
        { id: uuidv4(), user_id: player5, game_id: 4, stars: 4 },
        { id: uuidv4(), user_id: player7, game_id: 4, stars: 5 },
        // Game 5 - Match-3
        { id: uuidv4(), user_id: player2, game_id: 5, stars: 5 },
        { id: uuidv4(), user_id: player3, game_id: 5, stars: 4 },
        { id: uuidv4(), user_id: player9, game_id: 5, stars: 5 },
        // Game 6 - Memory
        { id: uuidv4(), user_id: player2, game_id: 6, stars: 4 },
        { id: uuidv4(), user_id: player3, game_id: 6, stars: 5 },
        { id: uuidv4(), user_id: player8, game_id: 6, stars: 5 },
        // Game 7 - Drawing Board
        { id: uuidv4(), user_id: player1, game_id: 7, stars: 4 },
        { id: uuidv4(), user_id: player4, game_id: 7, stars: 5 },
        // Game 8 - Tetris
        { id: uuidv4(), user_id: player5, game_id: 8, stars: 5 },
        { id: uuidv4(), user_id: player6, game_id: 8, stars: 5 },
        { id: uuidv4(), user_id: player1, game_id: 8, stars: 4 },
        { id: uuidv4(), user_id: player2, game_id: 8, stars: 5 },
        // Game 11 - Minesweeper
        { id: uuidv4(), user_id: player3, game_id: 11, stars: 4 },
        { id: uuidv4(), user_id: player4, game_id: 11, stars: 3 },
        { id: uuidv4(), user_id: player6, game_id: 11, stars: 4 },
        { id: uuidv4(), user_id: player7, game_id: 11, stars: 5 },
        // Game 18 - 2048
        { id: uuidv4(), user_id: player1, game_id: 18, stars: 5 },
        { id: uuidv4(), user_id: player2, game_id: 18, stars: 5 },
        { id: uuidv4(), user_id: player4, game_id: 18, stars: 4 },
        { id: uuidv4(), user_id: player5, game_id: 18, stars: 5 },
        { id: uuidv4(), user_id: player9, game_id: 18, stars: 5 },
    ]);
    console.log('✅ Seeded 35 ratings across all games');

    // ============ COMMENTS (comments cho tất cả games) ============
    await knex('comments').del();
    await knex('comments').insert([
        // Game 1 - Caro Hàng 5
        { id: uuidv4(), user_id: player1, game_id: 1, content: 'Game Caro này quá hay! Đồ họa đẹp, AI thông minh.' },
        { id: uuidv4(), user_id: player2, game_id: 1, content: 'Caro hàng 5 là game yêu thích của tôi!' },
        { id: uuidv4(), user_id: player5, game_id: 1, content: 'Pro tip: Luôn chiếm trung tâm trước!' },
        { id: uuidv4(), user_id: admin, game_id: 1, content: 'Chào mừng đến với Caro! Chúc các bạn chơi vui!' },
        // Game 2 - Caro Hàng 4
        { id: uuidv4(), user_id: player1, game_id: 2, content: 'Caro 4 cũng thú vị, nhanh hơn Caro 5.' },
        { id: uuidv4(), user_id: player2, game_id: 2, content: 'Phù hợp chơi giải trí nhanh!' },
        // Game 3 - Tic-Tac-Toe
        { id: uuidv4(), user_id: player3, game_id: 3, content: 'Tic-tac-toe đơn giản nhưng vui.' },
        { id: uuidv4(), user_id: player4, game_id: 3, content: 'Game đầu tiên tôi thắng!' },
        // Game 4 - Snake
        { id: uuidv4(), user_id: player1, game_id: 4, content: 'Snake gợi nhớ tuổi thơ!' },
        { id: uuidv4(), user_id: player5, game_id: 4, content: 'Đã đạt 800 điểm, ai hơn không?' },
        { id: uuidv4(), user_id: player7, game_id: 4, content: 'Snake King đây! 1200 điểm nhé!' },
        // Game 5 - Match-3
        { id: uuidv4(), user_id: player2, game_id: 5, content: 'Match-3 gây nghiện thật!' },
        { id: uuidv4(), user_id: player3, game_id: 5, content: 'Candy Crush phiên bản web!' },
        { id: uuidv4(), user_id: player9, game_id: 5, content: 'Combo 5x cảm giác phê thật!' },
        // Game 6 - Memory
        { id: uuidv4(), user_id: player2, game_id: 6, content: 'Memory giúp rèn luyện trí nhớ tốt.' },
        { id: uuidv4(), user_id: player3, game_id: 6, content: 'Tôi thích thử thách trí nhớ!' },
        { id: uuidv4(), user_id: player8, game_id: 6, content: 'Memory Master here! 60 giây hoàn thành!' },
        // Game 7 - Drawing Board
        { id: uuidv4(), user_id: player1, game_id: 7, content: 'Công cụ vẽ đẹp, nhiều màu sắc!' },
        { id: uuidv4(), user_id: player4, game_id: 7, content: 'Tôi vẽ được bức tranh đẹp lắm!' },
        // Game 8 - Tetris
        { id: uuidv4(), user_id: player5, game_id: 8, content: 'Tetris không bao giờ lỗi thời!' },
        { id: uuidv4(), user_id: player6, game_id: 8, content: 'TetrisPro đây, 5000 điểm!' },
        { id: uuidv4(), user_id: player1, game_id: 8, content: 'Xoay khối cần kỹ năng!' },
        { id: uuidv4(), user_id: player2, game_id: 8, content: 'Luyện tập mỗi ngày!' },
        // Game 11 - Minesweeper
        { id: uuidv4(), user_id: player3, game_id: 11, content: 'Dò mìn cần logic!' },
        { id: uuidv4(), user_id: player6, game_id: 11, content: 'Game suy luận hay!' },
        { id: uuidv4(), user_id: player7, game_id: 11, content: '90 giây clear bảng!' },
        // Game 18 - 2048
        { id: uuidv4(), user_id: player1, game_id: 18, content: '2048 rất thú vị!' },
        { id: uuidv4(), user_id: player2, game_id: 18, content: 'Đạt được 2048 rồi, next 4096!' },
        { id: uuidv4(), user_id: player5, game_id: 18, content: 'Game này cần chiến thuật!' },
        { id: uuidv4(), user_id: player9, game_id: 18, content: '10000 điểm thôi, còn phải cày!' },
    ]);
    console.log('✅ Seeded 30 comments across all games');

    // ============ USER ACHIEVEMENTS (expanded) ============
    await knex('user_achievements').del();
    await knex('user_achievements').insert([
        // Player 1 achievements
        { id: uuidv4(), user_id: player1, achievement_id: 1, unlocked_at: new Date() }, // Người Mới
        { id: uuidv4(), user_id: player1, achievement_id: 2, unlocked_at: new Date() }, // Caro Beginner
        { id: uuidv4(), user_id: player1, achievement_id: 6, unlocked_at: new Date() }, // Kết Bạn
        { id: uuidv4(), user_id: player1, achievement_id: 8, unlocked_at: new Date() }, // Scorer
        // Player 2 achievements
        { id: uuidv4(), user_id: player2, achievement_id: 1, unlocked_at: new Date() },
        { id: uuidv4(), user_id: player2, achievement_id: 2, unlocked_at: new Date() },
        { id: uuidv4(), user_id: player2, achievement_id: 5, unlocked_at: new Date() }, // Match-3 Pro
        { id: uuidv4(), user_id: player2, achievement_id: 6, unlocked_at: new Date() },
        // Player 3 achievements
        { id: uuidv4(), user_id: player3, achievement_id: 1, unlocked_at: new Date() },
        { id: uuidv4(), user_id: player3, achievement_id: 6, unlocked_at: new Date() },
        // Player 4 achievements
        { id: uuidv4(), user_id: player4, achievement_id: 1, unlocked_at: new Date() },
        // Player 5 achievements
        { id: uuidv4(), user_id: player5, achievement_id: 1, unlocked_at: new Date() },
        { id: uuidv4(), user_id: player5, achievement_id: 8, unlocked_at: new Date() },
        { id: uuidv4(), user_id: player5, achievement_id: 9, unlocked_at: new Date() }, // High Scorer
        // Player 6 achievements
        { id: uuidv4(), user_id: player6, achievement_id: 1, unlocked_at: new Date() },
        { id: uuidv4(), user_id: player6, achievement_id: 12, unlocked_at: new Date() }, // Tetris Master
        // Player 7 achievements
        { id: uuidv4(), user_id: player7, achievement_id: 1, unlocked_at: new Date() },
        { id: uuidv4(), user_id: player7, achievement_id: 4, unlocked_at: new Date() }, // Snake Lover
        // Player 8 achievements
        { id: uuidv4(), user_id: player8, achievement_id: 1, unlocked_at: new Date() },
        // Player 9 achievements
        { id: uuidv4(), user_id: player9, achievement_id: 1, unlocked_at: new Date() },
        { id: uuidv4(), user_id: player9, achievement_id: 5, unlocked_at: new Date() }, // Match-3 Pro
    ]);
    console.log('✅ Seeded 21 user achievements');
};
