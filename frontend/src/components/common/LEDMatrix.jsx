import PropTypes from 'prop-types';
import './LEDMatrix.css';

/**
 * LED Matrix Display Component
 * Hiển thị lưới các nút tròn (LED dots) thay đổi màu sắc
 * Theo yêu cầu đề bài - giao diện giống bảng đèn LED ma trận
 */
const LEDMatrix = ({
    pixels,
    rows = 15,
    cols = 15,
    cursor = null,
    dotSize = 'medium',
    showBorder = true,
    className = ''
}) => {
    // Generate empty matrix if pixels not provided
    const matrix = pixels || Array(rows).fill(null).map(() => Array(cols).fill(null));

    // Dot size mapping
    const sizeClass = {
        small: 'led-size-small',
        medium: 'led-size-medium',
        large: 'led-size-large'
    }[dotSize] || 'led-size-medium';

    return (
        <div className={`led-matrix-container ${className}`}>
            <div
                className={`led-matrix ${sizeClass} ${showBorder ? 'with-border' : ''}`}
                style={{
                    gridTemplateColumns: `repeat(${cols}, 1fr)`,
                    gridTemplateRows: `repeat(${rows}, 1fr)`
                }}
            >
                {matrix.map((row, rowIndex) =>
                    row.map((color, colIndex) => {
                        const isCursor = cursor &&
                            cursor.row === rowIndex &&
                            cursor.col === colIndex;

                        return (
                            <div
                                key={`${rowIndex}-${colIndex}`}
                                className={`led-dot ${isCursor ? 'cursor' : ''} ${color ? 'active' : ''}`}
                                style={color ? { backgroundColor: color } : undefined}
                            />
                        );
                    })
                )}
            </div>
        </div>
    );
};

// Color constants for games
export const LED_COLORS = {
    OFF: null,           // Default off state
    PLAYER_1: '#ff6b6b', // Red - Player 1 / X
    PLAYER_2: '#4ecdc4', // Cyan - Player 2 / O  
    CURSOR: '#ffd93d',   // Yellow - Cursor highlight
    FOOD: '#6bcb77',     // Green - Food/Target
    WINNING: '#ffc107',  // Gold - Winning cells
    SNAKE_HEAD: '#2ecc71', // Bright green - Snake head
    SNAKE_BODY: '#27ae60', // Dark green - Snake body
    WALL: '#636e72',     // Gray - Walls
    EMPTY: '#2d2d44',    // Dark - Empty visible cell
    // Candy colors for Match-3
    CANDY_RED: '#e74c3c',
    CANDY_ORANGE: '#e67e22',
    CANDY_YELLOW: '#f1c40f',
    CANDY_GREEN: '#2ecc71',
    CANDY_BLUE: '#3498db',
    CANDY_PURPLE: '#9b59b6',
    // Memory card colors
    CARD_BACK: '#34495e',
    CARD_MATCHED: '#1abc9c',
    // Tetris colors
    TETRIS_I: '#00d4ff',
    TETRIS_O: '#ffeb3b',
    TETRIS_T: '#9c27b0',
    TETRIS_S: '#4caf50',
    TETRIS_Z: '#f44336',
    TETRIS_J: '#2196f3',
    TETRIS_L: '#ff9800',
    // 2048 colors
    TILE_2: '#eee4da',
    TILE_4: '#ede0c8',
    TILE_8: '#f2b179',
    TILE_16: '#f59563',
    TILE_32: '#f67c5f',
    TILE_64: '#f65e3b',
    TILE_128: '#edcf72',
    TILE_256: '#edcc61',
    TILE_512: '#edc850',
    TILE_1024: '#edc53f',
    TILE_2048: '#edc22e',
};

// Pixel art patterns for game icons (5x5)
export const GAME_ICONS = {
    caro: [
        [null, '#ff6b6b', null, '#4ecdc4', null],
        ['#ff6b6b', null, '#ff6b6b', null, '#4ecdc4'],
        [null, '#ff6b6b', null, '#4ecdc4', null],
        ['#4ecdc4', null, '#4ecdc4', null, '#ff6b6b'],
        [null, '#4ecdc4', null, '#ff6b6b', null],
    ],
    snake: [
        ['#2ecc71', '#27ae60', '#27ae60', null, null],
        [null, null, '#27ae60', null, null],
        [null, null, '#27ae60', '#27ae60', null],
        [null, null, null, '#27ae60', null],
        [null, '#e74c3c', null, '#27ae60', '#27ae60'],
    ],
    match3: [
        ['#e74c3c', '#f1c40f', '#3498db', null, null],
        ['#f1c40f', '#3498db', '#e74c3c', null, null],
        ['#3498db', '#e74c3c', '#f1c40f', null, null],
        [null, null, null, null, null],
        [null, null, null, null, null],
    ],
    memory: [
        ['#34495e', '#34495e', null, '#9b59b6', '#9b59b6'],
        ['#34495e', '#34495e', null, '#9b59b6', '#9b59b6'],
        [null, null, null, null, null],
        ['#e74c3c', '#e74c3c', null, '#34495e', '#34495e'],
        ['#e74c3c', '#e74c3c', null, '#34495e', '#34495e'],
    ],
    tetris: [
        [null, '#00d4ff', null, null, null],
        [null, '#00d4ff', null, '#9c27b0', null],
        [null, '#00d4ff', '#9c27b0', '#9c27b0', null],
        [null, '#00d4ff', null, '#9c27b0', null],
        [null, null, null, null, null],
    ],
    game2048: [
        ['#f2b179', '#f2b179', null, '#edcf72', '#edcf72'],
        ['#f2b179', '#f2b179', null, '#edcf72', '#edcf72'],
        [null, null, null, null, null],
        ['#ede0c8', '#ede0c8', null, '#f67c5f', '#f67c5f'],
        ['#ede0c8', '#ede0c8', null, '#f67c5f', '#f67c5f'],
    ],
    drawing: [
        ['#e74c3c', '#f39c12', '#f1c40f', '#2ecc71', '#3498db'],
        ['#e74c3c', '#f39c12', '#f1c40f', '#2ecc71', '#3498db'],
        ['#e74c3c', '#f39c12', '#f1c40f', '#2ecc71', '#3498db'],
        [null, null, '#ffffff', null, null],
        [null, null, '#ffffff', null, null],
    ],
    minesweeper: [
        ['#636e72', null, '#e74c3c', null, '#636e72'],
        [null, '#636e72', null, '#636e72', null],
        ['#e74c3c', null, '#636e72', null, '#e74c3c'],
        [null, '#636e72', null, '#636e72', null],
        ['#636e72', null, '#e74c3c', null, '#636e72'],
    ],
};

LEDMatrix.propTypes = {
    pixels: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),
    rows: PropTypes.number,
    cols: PropTypes.number,
    cursor: PropTypes.shape({
        row: PropTypes.number,
        col: PropTypes.number
    }),
    dotSize: PropTypes.oneOf(['small', 'medium', 'large']),
    showBorder: PropTypes.bool,
    className: PropTypes.string
};

export default LEDMatrix;
