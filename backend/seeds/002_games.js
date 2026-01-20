/**
 * Seed games (16 games từ thư viện C++ + 7 games yêu cầu)
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

        // GAMES BỔ SUNG TỪ THƯ VIỆN C++
        {
            id: 8,
            name: 'Tetris',
            type: 'tetris',
            config: JSON.stringify({
                boardSize: { rows: 20, cols: 10 },
                initialSpeed: 300
            }),
            enabled: true,
            instructions: '🧱 **TETRIS**\n\n**Luật chơi:**\n- Xếp các khối rơi xuống\n- Hoàn thành hàng để xóa\n- Game over khi chạm đỉnh\n\n**Điều khiển:**\n- ← →: Di chuyển\n- ↑: Xoay\n- ↓: Rơi nhanh'
        },
        {
            id: 9,
            name: 'Doodle Jump',
            type: 'doodlejump',
            config: JSON.stringify({
                gravity: 0.5,
                jumpForce: 15
            }),
            enabled: true,
            instructions: '🦘 **DOODLE JUMP**\n\n**Luật chơi:**\n- Nhảy lên các platform\n- Tránh quái vật\n- Leo cao nhất có thể\n\n**Điều khiển:**\n- ← →: Di chuyển trái/phải'
        },
        {
            id: 10,
            name: 'Arkanoid',
            type: 'arkanoid',
            config: JSON.stringify({
                lives: 3,
                brickRows: 5
            }),
            enabled: true,
            instructions: '🧱 **ARKANOID**\n\n**Luật chơi:**\n- Điều khiển thanh để bật bóng\n- Phá hết gạch để thắng\n- Đừng để bóng rơi!\n\n**Điều khiển:**\n- ← →: Di chuyển thanh'
        },
        {
            id: 11,
            name: 'Minesweeper',
            type: 'minesweeper',
            config: JSON.stringify({
                boardSize: { rows: 10, cols: 10 },
                mines: 15
            }),
            enabled: true,
            instructions: '💣 **MINESWEEPER**\n\n**Luật chơi:**\n- Mở các ô không có mìn\n- Số = số mìn xung quanh\n- Cắm cờ để đánh dấu mìn\n\n**Điều khiển:**\n- ENTER: Mở ô\n- HINT: Đặt cờ'
        },
        {
            id: 12,
            name: 'Fifteen Puzzle',
            type: 'fifteenpuzzle',
            config: JSON.stringify({
                size: 4
            }),
            enabled: true,
            instructions: '🔢 **FIFTEEN PUZZLE**\n\n**Luật chơi:**\n- Sắp xếp số từ 1-15\n- Di chuyển ô vào chỗ trống\n- Hoàn thành nhanh nhất\n\n**Điều khiển:**\n- ← → ↑ ↓: Di chuyển ô'
        },
        {
            id: 13,
            name: 'Racing',
            type: 'racing',
            config: JSON.stringify({
                lanes: 3,
                speed: 5
            }),
            enabled: true,
            instructions: '🏎️ **RACING**\n\n**Luật chơi:**\n- Tránh chướng ngại vật\n- Ăn items để ghi điểm\n- Tốc độ tăng dần\n\n**Điều khiển:**\n- ← →: Đổi làn'
        },
        {
            id: 14,
            name: 'Xonix',
            type: 'xonix',
            config: JSON.stringify({
                boardSize: { rows: 40, cols: 60 }
            }),
            enabled: true,
            instructions: '⬜ **XONIX**\n\n**Luật chơi:**\n- Vẽ đường để chiếm đất\n- Đừng để bóng chạm đường đang vẽ\n- Chiếm 80% để thắng'
        },
        {
            id: 15,
            name: 'Mahjong Solitaire',
            type: 'mahjong',
            config: JSON.stringify({
                layout: 'turtle'
            }),
            enabled: true,
            instructions: '🀄 **MAHJONG SOLITAIRE**\n\n**Luật chơi:**\n- Ghép cặp quân giống nhau\n- Chỉ lấy được quân tự do\n- Xóa hết bàn để thắng'
        },
        {
            id: 16,
            name: 'Chess',
            type: 'chess',
            config: JSON.stringify({
                timeLimit: 600
            }),
            enabled: true,
            instructions: '♟️ **CHESS**\n\n**Luật chơi:**\n- Cờ vua chuẩn quốc tế\n- Chiếu bí vua đối thủ để thắng\n\n**Điều khiển:**\n- Click để chọn và di chuyển quân'
        },
        {
            id: 17,
            name: 'Asteroids',
            type: 'asteroids',
            config: JSON.stringify({
                lives: 3
            }),
            enabled: true,
            instructions: '☄️ **ASTEROIDS**\n\n**Luật chơi:**\n- Bắn phá thiên thạch\n- Tránh va chạm\n- Ghi điểm cao nhất\n\n**Điều khiển:**\n- ← →: Xoay\n- ↑: Tăng tốc\n- ENTER: Bắn'
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

    console.log('✅ Seeded 18 games');
};
