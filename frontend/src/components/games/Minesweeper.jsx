import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Save, Flag } from 'lucide-react';
import api from '../../services/api';
import LEDMatrix, { LED_COLORS } from '../common/LEDMatrix';
import GameController from '../common/GameController';
import GameRatingComment from '../common/GameRatingComment';
import './Minesweeper.css';

const BOARD_SIZE = 9;
const MINE_COUNT = 10;

// Colors for numbers
const NUMBER_COLORS = {
    1: '#3498db',
    2: '#27ae60',
    3: '#e74c3c',
    4: '#8e44ad',
    5: '#d35400',
    6: '#16a085',
    7: '#2c3e50',
    8: '#7f8c8d'
};

const Minesweeper = () => {
    const navigate = useNavigate();

    const [board, setBoard] = useState([]);
    const [revealed, setRevealed] = useState([]);
    const [flagged, setFlagged] = useState([]);
    const [gameOver, setGameOver] = useState(false);
    const [won, setWon] = useState(false);
    const [cursor, setCursor] = useState({ row: 4, col: 4 });
    const [firstClick, setFirstClick] = useState(true);
    const [mineCount, setMineCount] = useState(MINE_COUNT);
    const [timeSpent, setTimeSpent] = useState(0);
    const [pixels, setPixels] = useState([]);
    const [showInstructions, setShowInstructions] = useState(true);

    // Initialize game
    useEffect(() => {
        initializeGame();
    }, []);

    // Convert board to LED pixels
    useEffect(() => {
        const newPixels = Array(BOARD_SIZE).fill(null).map(() =>
            Array(BOARD_SIZE).fill(null)
        );

        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                if (flagged.some(f => f.row === r && f.col === c)) {
                    newPixels[r][c] = LED_COLORS.CANDY_ORANGE; // Flag = orange
                } else if (!revealed[r]?.[c]) {
                    newPixels[r][c] = LED_COLORS.WALL; // Unrevealed = gray
                } else if (board[r]?.[c] === -1) {
                    newPixels[r][c] = LED_COLORS.CANDY_RED; // Mine = red
                } else if (board[r]?.[c] === 0) {
                    newPixels[r][c] = null; // Empty = off
                } else {
                    newPixels[r][c] = NUMBER_COLORS[board[r][c]] || LED_COLORS.CANDY_BLUE;
                }
            }
        }

        setPixels(newPixels);
    }, [board, revealed, flagged]);

    // Timer
    useEffect(() => {
        if (gameOver || won || firstClick) return;
        const interval = setInterval(() => {
            setTimeSpent(prev => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [gameOver, won, firstClick]);

    // Keyboard controls
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (gameOver || won) {
                if (e.key === 'Enter') initializeGame();
                if (e.key === 'Escape') navigate('/games');
                return;
            }

            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    setCursor(prev => ({ ...prev, col: Math.max(0, prev.col - 1) }));
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    setCursor(prev => ({ ...prev, col: Math.min(BOARD_SIZE - 1, prev.col + 1) }));
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setCursor(prev => ({ ...prev, row: Math.max(0, prev.row - 1) }));
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    setCursor(prev => ({ ...prev, row: Math.min(BOARD_SIZE - 1, prev.row + 1) }));
                    break;
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    revealCell(cursor.row, cursor.col);
                    break;
                case 'f':
                case 'F':
                    e.preventDefault();
                    toggleFlag(cursor.row, cursor.col);
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
    }, [cursor, gameOver, won, board, revealed, flagged]);

    // Initialize game
    const initializeGame = useCallback(() => {
        const emptyBoard = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(0));
        const emptyRevealed = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(false));

        setBoard(emptyBoard);
        setRevealed(emptyRevealed);
        setFlagged([]);
        setGameOver(false);
        setWon(false);
        setFirstClick(true);
        setMineCount(MINE_COUNT);
        setTimeSpent(0);
        setCursor({ row: 4, col: 4 });
    }, []);

    // Place mines (avoiding first click)
    const placeMines = (excludeRow, excludeCol) => {
        const newBoard = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(0));
        let placed = 0;

        while (placed < MINE_COUNT) {
            const r = Math.floor(Math.random() * BOARD_SIZE);
            const c = Math.floor(Math.random() * BOARD_SIZE);

            // Avoid first click area
            if (Math.abs(r - excludeRow) <= 1 && Math.abs(c - excludeCol) <= 1) continue;
            if (newBoard[r][c] === -1) continue;

            newBoard[r][c] = -1;
            placed++;
        }

        // Calculate numbers
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                if (newBoard[r][c] === -1) continue;
                let count = 0;
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        const nr = r + dr;
                        const nc = c + dc;
                        if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && newBoard[nr][nc] === -1) {
                            count++;
                        }
                    }
                }
                newBoard[r][c] = count;
            }
        }

        return newBoard;
    };

    // Reveal cell
    const revealCell = (row, col) => {
        if (revealed[row]?.[col]) return;
        if (flagged.some(f => f.row === row && f.col === col)) return;

        let currentBoard = board;

        // First click - place mines
        if (firstClick) {
            currentBoard = placeMines(row, col);
            setBoard(currentBoard);
            setFirstClick(false);
        }

        // Hit mine
        if (currentBoard[row][col] === -1) {
            const newRevealed = revealed.map(r => r.map(() => true));
            setRevealed(newRevealed);
            setGameOver(true);
            return;
        }

        // Flood fill for empty cells
        const newRevealed = revealed.map(r => [...r]);
        const toReveal = [[row, col]];

        while (toReveal.length > 0) {
            const [r, c] = toReveal.pop();
            if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) continue;
            if (newRevealed[r][c]) continue;

            newRevealed[r][c] = true;

            if (currentBoard[r][c] === 0) {
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        toReveal.push([r + dr, c + dc]);
                    }
                }
            }
        }

        setRevealed(newRevealed);

        // Check win
        let unrevealedCount = 0;
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                if (!newRevealed[r][c]) unrevealedCount++;
            }
        }
        if (unrevealedCount === MINE_COUNT) {
            setWon(true);
        }
    };

    // Toggle flag
    const toggleFlag = (row, col) => {
        if (revealed[row]?.[col]) return;

        const flagIndex = flagged.findIndex(f => f.row === row && f.col === col);
        if (flagIndex >= 0) {
            setFlagged(prev => prev.filter((_, i) => i !== flagIndex));
            setMineCount(prev => prev + 1);
        } else {
            setFlagged(prev => [...prev, { row, col }]);
            setMineCount(prev => prev - 1);
        }
    };

    // Controller handlers
    const handleLeft = () => setCursor(prev => ({ ...prev, col: Math.max(0, prev.col - 1) }));
    const handleRight = () => setCursor(prev => ({ ...prev, col: Math.min(BOARD_SIZE - 1, prev.col + 1) }));
    const handleEnter = () => revealCell(cursor.row, cursor.col);
    const handleBack = () => navigate('/games');
    const handleHint = () => toggleFlag(cursor.row, cursor.col);

    // Save game
    const saveGame = async () => {
        try {
            await api.post('/games/10/sessions', {
                state: { board, revealed, flagged },
                score: won ? 1000 - timeSpent : 0,
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
        <div className="minesweeper led-minesweeper">
            <div className="game-header">
                <button className="back-btn" onClick={() => navigate('/games')}>
                    <ArrowLeft size={20} />
                    Quay lại
                </button>
                <h1>💣 Dò Mìn</h1>
                <div className="game-stats">
                    <span className="stat">💣 {mineCount}</span>
                    <span className="stat">⏱️ {formatTime(timeSpent)}</span>
                </div>
            </div>

            <div className="game-controls">
                <button className="control-btn" onClick={initializeGame}>
                    <RotateCcw size={18} />
                    Chơi lại
                </button>
                <button className="control-btn" onClick={() => toggleFlag(cursor.row, cursor.col)}>
                    <Flag size={18} />
                    Cắm cờ
                </button>
                <button className="control-btn" onClick={saveGame}>
                    <Save size={18} />
                    Lưu game
                </button>
            </div>

            <div className="game-status">
                {gameOver ? (
                    <div className="status-message lose">
                        💥 Bạn đã dẫm phải mìn!
                    </div>
                ) : won ? (
                    <div className="status-message win">
                        🎉 Chúc mừng! Bạn đã thắng!
                    </div>
                ) : (
                    <div className="status-message">
                        🎮 ← ↑ → ↓ di chuyển | Enter mở ô | H cắm cờ
                    </div>
                )}
            </div>

            <div className="board-container">
                <LEDMatrix
                    pixels={pixels}
                    rows={BOARD_SIZE}
                    cols={BOARD_SIZE}
                    cursor={cursor}
                    dotSize="large"
                    showBorder={true}
                />
            </div>

            <GameController
                onLeft={handleLeft}
                onRight={handleRight}
                onEnter={handleEnter}
                onBack={handleBack}
                onHint={handleHint}
                disabledButtons={{
                    enter: gameOver || won
                }}
            />

            {showInstructions && (
                <div className="game-instructions">
                    <h3>Hướng dẫn</h3>
                    <ul>
                        <li>← ↑ → ↓ để di chuyển</li>
                        <li>Enter để mở ô</li>
                        <li>H hoặc Hint để cắm cờ</li>
                        <li>Màu sắc: Xám=chưa mở, Cam=cờ, Đỏ=mìn</li>
                    </ul>
                </div>
            )}

            <GameRatingComment gameId={10} />
        </div>
    );
};

export default Minesweeper;
