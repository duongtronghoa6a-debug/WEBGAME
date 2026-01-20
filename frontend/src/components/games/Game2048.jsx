import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Save } from 'lucide-react';
import api from '../../services/api';
import LEDMatrix, { LED_COLORS } from '../common/LEDMatrix';
import GameController from '../common/GameController';
import GameRatingComment from '../common/GameRatingComment';
import './Game2048.css';

// Colors for different tile values
const TILE_COLORS = {
    0: null,
    2: LED_COLORS.TILE_2,
    4: LED_COLORS.TILE_4,
    8: LED_COLORS.TILE_8,
    16: LED_COLORS.TILE_16,
    32: LED_COLORS.TILE_32,
    64: LED_COLORS.TILE_64,
    128: LED_COLORS.TILE_128,
    256: LED_COLORS.TILE_256,
    512: LED_COLORS.TILE_512,
    1024: LED_COLORS.TILE_1024,
    2048: LED_COLORS.TILE_2048
};

const BOARD_SIZE = 4;
const LED_SIZE = 12; // 4x4 scaled 3x = 12x12

const Game2048 = () => {
    const navigate = useNavigate();

    const [board, setBoard] = useState([]);
    const [score, setScore] = useState(0);
    const [bestScore, setBestScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [won, setWon] = useState(false);
    const [timeSpent, setTimeSpent] = useState(0);
    const [pixels, setPixels] = useState([]);
    const [showInstructions, setShowInstructions] = useState(true);

    // Initialize game
    useEffect(() => {
        initializeGame();
    }, []);

    // Convert board to LED pixels (scaled 3x)
    useEffect(() => {
        const newPixels = Array(LED_SIZE).fill(null).map(() =>
            Array(LED_SIZE).fill(null)
        );

        const scale = 3;
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                const value = board[r]?.[c] || 0;
                const color = TILE_COLORS[value] || (value > 2048 ? LED_COLORS.TILE_2048 : null);

                // Fill 3x3 block
                for (let dr = 0; dr < scale; dr++) {
                    for (let dc = 0; dc < scale; dc++) {
                        newPixels[r * scale + dr][c * scale + dc] = color;
                    }
                }
            }
        }

        setPixels(newPixels);
    }, [board]);

    // Timer
    useEffect(() => {
        if (gameOver || won) return;
        const interval = setInterval(() => {
            setTimeSpent(prev => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [gameOver, won]);

    // Create empty board
    const createEmptyBoard = () => Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(0));

    // Add random tile
    const addRandomTile = (boardToUpdate) => {
        const emptyCells = [];
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                if (boardToUpdate[r][c] === 0) {
                    emptyCells.push({ r, c });
                }
            }
        }
        if (emptyCells.length > 0) {
            const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            boardToUpdate[r][c] = Math.random() < 0.9 ? 2 : 4;
        }
        return boardToUpdate;
    };

    // Initialize game
    const initializeGame = useCallback(() => {
        let newBoard = createEmptyBoard();
        newBoard = addRandomTile(newBoard);
        newBoard = addRandomTile(newBoard);
        setBoard(newBoard);
        setScore(0);
        setGameOver(false);
        setWon(false);
        setTimeSpent(0);
    }, []);

    // Check if game over
    const checkGameOver = (boardToCheck) => {
        // Check for empty cells
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                if (boardToCheck[r][c] === 0) return false;
            }
        }
        // Check for possible merges
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                const val = boardToCheck[r][c];
                if (r < BOARD_SIZE - 1 && boardToCheck[r + 1][c] === val) return false;
                if (c < BOARD_SIZE - 1 && boardToCheck[r][c + 1] === val) return false;
            }
        }
        return true;
    };

    // Move tiles
    const move = useCallback((direction) => {
        if (gameOver) return;

        let newBoard = board.map(row => [...row]);
        let moved = false;
        let newScore = score;

        const moveRow = (row) => {
            // Remove zeros
            let newRow = row.filter(x => x !== 0);
            // Merge
            for (let i = 0; i < newRow.length - 1; i++) {
                if (newRow[i] === newRow[i + 1]) {
                    newRow[i] *= 2;
                    newScore += newRow[i];
                    if (newRow[i] === 2048) setWon(true);
                    newRow.splice(i + 1, 1);
                }
            }
            // Pad with zeros
            while (newRow.length < BOARD_SIZE) newRow.push(0);
            return newRow;
        };

        if (direction === 'left') {
            for (let r = 0; r < BOARD_SIZE; r++) {
                const newRow = moveRow(newBoard[r]);
                if (newRow.join(',') !== newBoard[r].join(',')) moved = true;
                newBoard[r] = newRow;
            }
        } else if (direction === 'right') {
            for (let r = 0; r < BOARD_SIZE; r++) {
                const newRow = moveRow(newBoard[r].reverse()).reverse();
                if (newRow.join(',') !== newBoard[r].join(',')) moved = true;
                newBoard[r] = newRow;
            }
        } else if (direction === 'up') {
            for (let c = 0; c < BOARD_SIZE; c++) {
                const col = newBoard.map(row => row[c]);
                const newCol = moveRow(col);
                if (newCol.join(',') !== col.join(',')) moved = true;
                for (let r = 0; r < BOARD_SIZE; r++) {
                    newBoard[r][c] = newCol[r];
                }
            }
        } else if (direction === 'down') {
            for (let c = 0; c < BOARD_SIZE; c++) {
                const col = newBoard.map(row => row[c]).reverse();
                const newCol = moveRow(col).reverse();
                const origCol = newBoard.map(row => row[c]);
                if (newCol.join(',') !== origCol.join(',')) moved = true;
                for (let r = 0; r < BOARD_SIZE; r++) {
                    newBoard[r][c] = newCol[r];
                }
            }
        }

        if (moved) {
            newBoard = addRandomTile(newBoard);
            setBoard(newBoard);
            setScore(newScore);
            if (newScore > bestScore) setBestScore(newScore);
            if (checkGameOver(newBoard)) setGameOver(true);
        }
    }, [board, score, bestScore, gameOver]);

    // Keyboard controls
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (gameOver && e.key !== 'Escape' && e.key !== 'Enter') return;

            switch (e.key) {
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    e.preventDefault();
                    move('left');
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    e.preventDefault();
                    move('right');
                    break;
                case 'ArrowUp':
                case 'w':
                case 'W':
                    e.preventDefault();
                    move('up');
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    e.preventDefault();
                    move('down');
                    break;
                case 'Enter':
                    if (gameOver || won) initializeGame();
                    break;
                case 'Escape':
                    navigate('/games');
                    break;
                case 'h':
                case 'H':
                    setShowInstructions(prev => !prev);
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameOver, won, move, initializeGame, navigate]);

    // Controller handlers (Left/Right = horizontal, Enter = hint for directions)
    const handleLeft = () => move('left');
    const handleRight = () => move('right');
    const handleEnter = () => {
        if (gameOver || won) initializeGame();
    };
    const handleBack = () => navigate('/games');
    const handleHint = () => setShowInstructions(prev => !prev);

    // Save game
    const saveGame = async () => {
        try {
            await api.post('/games/9/sessions', {
                state: { board, score },
                score,
                time_spent: timeSpent
            });
            alert('Game đã được lưu!');
        } catch (error) {
            console.error('Save error:', error);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="game-2048 led-game-2048">
            <div className="game-header">
                <button className="back-btn" onClick={() => navigate('/games')}>
                    <ArrowLeft size={20} />
                    Quay lại
                </button>
                <h1>🎮 2048</h1>
                <div className="game-stats">
                    <span className="stat">🏆 {score}</span>
                    <span className="stat">👑 {bestScore}</span>
                </div>
            </div>

            <div className="game-controls">
                <button className="control-btn" onClick={initializeGame}>
                    <RotateCcw size={18} />
                    Chơi lại
                </button>
                <button className="control-btn" onClick={saveGame}>
                    <Save size={18} />
                    Lưu game
                </button>
            </div>

            <div className="game-status">
                {won && !gameOver ? (
                    <div className="status-message win">
                        🎉 Bạn đã đạt 2048! Tiếp tục chơi?
                    </div>
                ) : gameOver ? (
                    <div className="status-message lose">
                        💀 Game Over! Điểm: {score}
                    </div>
                ) : (
                    <div className="status-message">
                        ⏱️ {formatTime(timeSpent)} | Dùng ← ↑ → ↓ để di chuyển
                    </div>
                )}
            </div>

            <div className="board-container">
                <LEDMatrix
                    pixels={pixels}
                    rows={LED_SIZE}
                    cols={LED_SIZE}
                    dotSize="medium"
                    showBorder={true}
                />
            </div>

            <GameController
                onLeft={handleLeft}
                onRight={handleRight}
                onEnter={handleEnter}
                onBack={handleBack}
                onHint={handleHint}
                disabledButtons={{}}
            />

            {showInstructions && (
                <div className="game-instructions">
                    <h3>Hướng dẫn</h3>
                    <ul>
                        <li>Dùng ← ↑ → ↓ để trượt các ô</li>
                        <li>Ô cùng giá trị sẽ gộp lại thành 1</li>
                        <li>Đạt ô 2048 để thắng</li>
                        <li>Màu càng đậm = giá trị càng cao</li>
                    </ul>
                </div>
            )}

            <GameRatingComment gameId={9} />
        </div>
    );
};

export default Game2048;
