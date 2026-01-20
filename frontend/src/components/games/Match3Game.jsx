import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import api from '../../services/api';
import LEDMatrix, { LED_COLORS } from '../common/LEDMatrix';
import GameController from '../common/GameController';
import ExitDialog from '../common/ExitDialog';
import GameRatingComment from '../common/GameRatingComment';
import './Match3Game.css';

const CANDY_COLORS = [
    LED_COLORS.CANDY_RED,
    LED_COLORS.CANDY_ORANGE,
    LED_COLORS.CANDY_YELLOW,
    LED_COLORS.CANDY_GREEN,
    LED_COLORS.CANDY_BLUE,
    LED_COLORS.CANDY_PURPLE
];
const BOARD_SIZE = 8;

const Match3Game = () => {
    const navigate = useNavigate();

    // Game state
    const [board, setBoard] = useState([]);
    const [selectedCell, setSelectedCell] = useState(null);
    const [score, setScore] = useState(0);
    const [moves, setMoves] = useState(30);
    const [isAnimating, setIsAnimating] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [combo, setCombo] = useState(0);
    const [timeSpent, setTimeSpent] = useState(0);
    const [cursor, setCursor] = useState({ row: 0, col: 0 });
    const [showInstructions, setShowInstructions] = useState(true);
    const [pixels, setPixels] = useState([]);
    const [showExitDialog, setShowExitDialog] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    // Initialize board
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
                const colorIndex = board[r]?.[c];
                if (colorIndex !== null && colorIndex !== undefined && colorIndex >= 0) {
                    newPixels[r][c] = CANDY_COLORS[colorIndex % CANDY_COLORS.length];
                }
            }
        }

        setPixels(newPixels);
    }, [board]);

    // Timer
    useEffect(() => {
        if (gameOver || moves <= 0) return;
        const interval = setInterval(() => {
            setTimeSpent(prev => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [gameOver, moves]);

    // Check game over
    useEffect(() => {
        if (moves <= 0 && !isAnimating) {
            setGameOver(true);
        }
    }, [moves, isAnimating]);

    // Keyboard controls
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Block keyboard when exit dialog is open
            if (showExitDialog) return;
            if (isAnimating || gameOver) return;

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
                    e.preventDefault();
                    handleCellSelect(cursor.row, cursor.col);
                    break;
                case 'Escape':
                    e.preventDefault();
                    if (!gameOver && moves > 0) {
                        setShowExitDialog(true);
                    } else {
                        navigate('/games');
                    }
                    break;
                case 'h':
                case 'H':
                    setShowInstructions(prev => !prev);
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [cursor, isAnimating, gameOver, navigate, showExitDialog]);

    // Generate random candy index
    const generateCandy = useCallback((excludeIndices = []) => {
        const availableIndices = CANDY_COLORS.map((_, i) => i).filter(i => !excludeIndices.includes(i));
        return availableIndices[Math.floor(Math.random() * availableIndices.length)];
    }, []);

    // Initialize game
    const initializeGame = useCallback(() => {
        const newBoard = [];
        for (let row = 0; row < BOARD_SIZE; row++) {
            const rowArray = [];
            for (let col = 0; col < BOARD_SIZE; col++) {
                const excludeIndices = [];
                if (col >= 2 && rowArray[col - 1] === rowArray[col - 2]) {
                    excludeIndices.push(rowArray[col - 1]);
                }
                if (row >= 2 && newBoard[row - 1]?.[col] === newBoard[row - 2]?.[col]) {
                    excludeIndices.push(newBoard[row - 1][col]);
                }
                rowArray.push(generateCandy(excludeIndices));
            }
            newBoard.push(rowArray);
        }
        setBoard(newBoard);
        setScore(0);
        setMoves(30);
        setGameOver(false);
        setCombo(0);
        setTimeSpent(0);
        setSelectedCell(null);
        setCursor({ row: 0, col: 0 });
    }, [generateCandy]);

    // Check for matches
    const findMatches = useCallback((currentBoard) => {
        const matches = new Set();

        // Check horizontal matches
        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE - 2; col++) {
                const candy = currentBoard[row][col];
                if (candy !== null && candy === currentBoard[row][col + 1] && candy === currentBoard[row][col + 2]) {
                    matches.add(`${row},${col}`);
                    matches.add(`${row},${col + 1}`);
                    matches.add(`${row},${col + 2}`);
                    if (col + 3 < BOARD_SIZE && candy === currentBoard[row][col + 3]) {
                        matches.add(`${row},${col + 3}`);
                        if (col + 4 < BOARD_SIZE && candy === currentBoard[row][col + 4]) {
                            matches.add(`${row},${col + 4}`);
                        }
                    }
                }
            }
        }

        // Check vertical matches
        for (let col = 0; col < BOARD_SIZE; col++) {
            for (let row = 0; row < BOARD_SIZE - 2; row++) {
                const candy = currentBoard[row][col];
                if (candy !== null && candy === currentBoard[row + 1]?.[col] && candy === currentBoard[row + 2]?.[col]) {
                    matches.add(`${row},${col}`);
                    matches.add(`${row + 1},${col}`);
                    matches.add(`${row + 2},${col}`);
                    if (row + 3 < BOARD_SIZE && candy === currentBoard[row + 3]?.[col]) {
                        matches.add(`${row + 3},${col}`);
                        if (row + 4 < BOARD_SIZE && candy === currentBoard[row + 4]?.[col]) {
                            matches.add(`${row + 4},${col}`);
                        }
                    }
                }
            }
        }

        return matches;
    }, []);

    // Remove matches and drop candies
    const processMatches = useCallback(async (currentBoard, currentCombo = 0) => {
        const matches = findMatches(currentBoard);

        if (matches.size === 0) {
            setIsAnimating(false);
            setCombo(0);
            return currentBoard;
        }

        setIsAnimating(true);

        const matchScore = matches.size * 10 * (currentCombo + 1);
        setScore(prev => prev + matchScore);
        setCombo(currentCombo + 1);

        const newBoard = currentBoard.map(row => [...row]);
        matches.forEach(pos => {
            const [row, col] = pos.split(',').map(Number);
            newBoard[row][col] = null;
        });

        setBoard([...newBoard]);
        await new Promise(resolve => setTimeout(resolve, 300));

        // Drop candies down
        for (let col = 0; col < BOARD_SIZE; col++) {
            let emptyRow = BOARD_SIZE - 1;
            for (let row = BOARD_SIZE - 1; row >= 0; row--) {
                if (newBoard[row][col] !== null) {
                    if (row !== emptyRow) {
                        newBoard[emptyRow][col] = newBoard[row][col];
                        newBoard[row][col] = null;
                    }
                    emptyRow--;
                }
            }
            for (let row = emptyRow; row >= 0; row--) {
                newBoard[row][col] = generateCandy();
            }
        }

        setBoard([...newBoard]);
        await new Promise(resolve => setTimeout(resolve, 300));
        return processMatches(newBoard, currentCombo + 1);
    }, [findMatches, generateCandy]);

    // Swap candies
    const swapCandies = useCallback(async (row1, col1, row2, col2) => {
        const newBoard = board.map(row => [...row]);
        [newBoard[row1][col1], newBoard[row2][col2]] = [newBoard[row2][col2], newBoard[row1][col1]];

        const matches = findMatches(newBoard);

        if (matches.size > 0) {
            setBoard(newBoard);
            setMoves(prev => prev - 1);
            await processMatches(newBoard);
        } else {
            setBoard(newBoard);
            await new Promise(resolve => setTimeout(resolve, 200));
            setBoard(board);
        }

        setSelectedCell(null);
    }, [board, findMatches, processMatches]);

    // Handle cell selection via Enter
    const handleCellSelect = (row, col) => {
        if (isAnimating || gameOver || moves <= 0) return;

        if (selectedCell === null) {
            setSelectedCell({ row, col });
        } else {
            const { row: selRow, col: selCol } = selectedCell;
            const isAdjacent =
                (Math.abs(row - selRow) === 1 && col === selCol) ||
                (Math.abs(col - selCol) === 1 && row === selRow);

            if (isAdjacent) {
                swapCandies(selRow, selCol, row, col);
            } else {
                setSelectedCell({ row, col });
            }
        }
    };

    // Save game and exit
    const saveGameAndExit = async () => {
        try {
            await api.post('/games/5/sessions', {
                state: { board, score, moves },
                score,
                time_spent: timeSpent
            });
            navigate('/games');
        } catch (error) {
            console.error('Save error:', error);
            navigate('/games');
        }
    };

    const discardAndExit = () => {
        navigate('/games');
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // GameController handlers
    const handleLeft = () => setCursor(prev => ({ ...prev, col: Math.max(0, prev.col - 1) }));
    const handleRight = () => setCursor(prev => ({ ...prev, col: Math.min(BOARD_SIZE - 1, prev.col + 1) }));
    const handleEnter = () => handleCellSelect(cursor.row, cursor.col);
    const handleBack = () => {
        if (!gameOver && moves > 0) {
            setShowExitDialog(true);
        } else {
            navigate('/games');
        }
    };
    const handleHint = () => setShowInstructions(prev => !prev);

    return (
        <div className="match3-game led-match3-game">
            <div className="game-header">
                <button className="back-btn" onClick={() => navigate('/games')}>
                    <ArrowLeft size={20} />
                    Quay lại
                </button>
                <h1>🍬 Ghép Hàng 3</h1>
                <div className="game-stats">
                    <span className="stat">🏆 {score}</span>
                    <span className="stat">🎯 {moves} lượt</span>
                </div>
            </div>

            <div className="game-controls">
                <button className="control-btn" onClick={initializeGame}>
                    <RotateCcw size={18} />
                    Chơi lại
                </button>
                {combo > 1 && (
                    <div className="combo-display">
                        🔥 Combo x{combo}!
                    </div>
                )}
            </div>

            <div className="game-status">
                {gameOver ? (
                    <div className="status-message lose">
                        🎮 Game Over! Điểm: {score}
                    </div>
                ) : (
                    <div className="status-message">
                        ⏱️ {formatTime(timeSpent)} | Dùng ← ↑ → ↓ và Enter để chọn
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
                    className={selectedCell ? 'has-selection' : ''}
                />
            </div>

            <GameController
                onLeft={handleLeft}
                onRight={handleRight}
                onEnter={handleEnter}
                onBack={handleBack}
                onHint={handleHint}
                disabledButtons={{
                    left: isAnimating || gameOver,
                    right: isAnimating || gameOver,
                    enter: isAnimating || gameOver,
                    back: false,
                    hint: false
                }}
            />

            {showInstructions && (
                <div className="game-instructions">
                    <h3>Hướng dẫn</h3>
                    <ul>
                        <li>Dùng phím mũi tên để di chuyển cursor</li>
                        <li>Nhấn Enter để chọn, di chuyển đến ô kế cận và Enter lại để đổi</li>
                        <li>Xếp 3 kẹo cùng màu theo hàng/cột để ghi điểm</li>
                        <li>Combo liên tiếp sẽ nhân điểm</li>
                    </ul>
                </div>
            )}

            <GameRatingComment gameId={5} />

            {/* Exit Dialog */}
            <ExitDialog
                isOpen={showExitDialog}
                onSave={saveGameAndExit}
                onDiscard={discardAndExit}
                onCancel={() => setShowExitDialog(false)}
                gameName="Ghép Hàng 3"
            />
        </div>
    );
};

export default Match3Game;
