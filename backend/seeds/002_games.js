/**
 * Seed games - Chỉ giữ lại games đã có logic implement
 */
exports.seed = async function (knex) {
    await knex('games').del();

    await knex('games').insert([
        // 7 GAMES YÊU CẦU - BẮT BUỘC
        {
            id: 1,
            name: 'Caro Hàng 5',
            type: 'caro',
            config: JSON.stringify({
                boardSize: { rows: 15, cols: 15 },
                winCondition: 5,
                timeLimit: 600,
                aiLevels: ['easy', 'medium', 'hard']
            }),
            enabled: true,
            instructions: '🎯 **CARO HÀNG 5**\n\n**Luật chơi:**\n- Bàn cờ 15×15\n- Hai người lần lượt đặt quân (X và O)\n- Ai có 5 quân liên tiếp (ngang, dọc, chéo) sẽ thắng\n\n**Điều khiển:**\n- ← →: Di chuyển cursor\n- ENTER: Đặt quân\n- HINT: Xem gợi ý'
        },
        {
            id: 2,
            name: 'Caro Hàng 4',
            type: 'caro',
            config: JSON.stringify({
                boardSize: { rows: 10, cols: 10 },
                winCondition: 4,
                timeLimit: 300
            }),
            enabled: true,
            instructions: '🎯 **CARO HÀNG 4**\n\n**Luật chơi:**\n- Bàn cờ 10×10\n- 4 quân liên tiếp để thắng\n- Phiên bản nhanh hơn Caro 5'
        },
        {
            id: 3,
            name: 'Tic-Tac-Toe',
            type: 'tictactoe',
            config: JSON.stringify({
                boardSize: { rows: 3, cols: 3 },
                winCondition: 3
            }),
            enabled: true,
            instructions: '⭕ **TIC-TAC-TOE**\n\n**Luật chơi:**\n- Bàn cờ 3×3\n- 3 quân liên tiếp để thắng\n- Game cổ điển, quen thuộc'
        },
        {
            id: 4,
            name: 'Rắn Săn Mồi',
            type: 'snake',
            config: JSON.stringify({
                boardSize: { rows: 20, cols: 20 },
                initialSpeed: 150,
                speedIncrement: 5
            }),
            enabled: true,
            instructions: '🐍 **RẮN SĂN MỒI**\n\n**Luật chơi:**\n- Điều khiển rắn ăn mồi\n- Rắn dài ra sau mỗi lần ăn\n- Tốc độ tăng dần\n- Thua khi va tường hoặc thân rắn\n\n**Điều khiển:**\n- ← → ↑ ↓: Điều khiển hướng'
        },
        {
            id: 5,
            name: 'Ghép Hàng 3',
            type: 'match3',
            config: JSON.stringify({
                boardSize: { rows: 8, cols: 8 },
                colors: 6,
                timeLimit: 120,
                moves: 30
            }),
            enabled: true,
            instructions: '🍬 **GHÉP HÀNG 3**\n\n**Luật chơi:**\n- Hoán đổi 2 viên cạnh nhau\n- Tạo hàng 3+ viên cùng màu\n- Combo = điểm cao hơn\n\n**Tính điểm:**\n- 3 viên: 30 điểm\n- 4 viên: 60 điểm\n- 5 viên: 100 điểm'
        },
        {
            id: 6,
            name: 'Cờ Trí Nhớ',
            type: 'memory',
            config: JSON.stringify({
                boardSize: { rows: 4, cols: 4 },
                pairs: 8
            }),
            enabled: true,
            instructions: '🧠 **CỜ TRÍ NHỚ**\n\n**Luật chơi:**\n- Bàn 4×4 với 8 cặp thẻ úp\n- Lật 2 thẻ mỗi lượt\n- Nếu khớp → Giữ nguyên\n- Hoàn thành với ít lượt nhất'
        },
        {
            id: 7,
            name: 'Bảng Vẽ Tự Do',
            type: 'drawing',
            config: JSON.stringify({
                canvasSize: { width: 800, height: 600 },
                brushSizes: [2, 5, 10, 20],
                colors: ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFFFFF']
            }),
            enabled: true,
            instructions: '🎨 **BẢNG VẼ TỰ DO**\n\n**Công cụ:**\n- Chọn màu sắc\n- Chọn kích thước cọ\n- Tẩy và xóa\n- Lưu tranh\n\n**Điều khiển:**\n- Click & kéo để vẽ'
        },

        // BONUS GAMES - ĐÃ IMPLEMENT
        {
            id: 8,
            name: 'Tetris',
            type: 'tetris',
            config: JSON.stringify({
                boardSize: { rows: 20, cols: 10 },
                initialSpeed: 500
            }),
            enabled: true,
            instructions: '🧱 **TETRIS**\n\n**Luật chơi:**\n- Xếp các khối rơi xuống\n- Hoàn thành hàng để xóa và ghi điểm\n- Game over khi chạm đỉnh\n\n**Điều khiển:**\n- ← →: Di chuyển\n- ↑/Enter: Xoay\n- ↓: Rơi nhanh\n- Space/Hint: Thả nhanh'
        },
        {
            id: 11,
            name: 'Dò Mìn',
            type: 'minesweeper',
            config: JSON.stringify({
                boardSize: { rows: 9, cols: 9 },
                mines: 10
            }),
            enabled: true,
            instructions: '💣 **DÒ MÌN**\n\n**Luật chơi:**\n- Mở các ô không có mìn\n- Số = số mìn xung quanh\n- Cắm cờ để đánh dấu mìn nghi ngờ\n\n**Điều khiển:**\n- ← → ↑ ↓: Di chuyển cursor\n- ENTER: Mở ô\n- HINT/F: Đặt cờ'
        },
        {
            id: 18,
            name: '2048',
            type: 'puzzle2048',
            config: JSON.stringify({
                boardSize: 4,
                winTarget: 2048
            }),
            enabled: true,
            instructions: '🔢 **2048**\n\n**Luật chơi:**\n- Di chuyển ô bằng phím mũi tên\n- Ô cùng số sẽ gộp lại\n- Đạt ô 2048 để thắng!\n\n**Điều khiển:**\n- ← → ↑ ↓: Di chuyển\n- ENTER: Di lên (thay thế ↑)'
        }
    ]);

    console.log('✅ Seeded 10 games (7 bắt buộc + 3 bonus)');
};
