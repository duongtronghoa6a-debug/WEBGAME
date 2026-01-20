import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Save, Lightbulb } from 'lucide-react';
import api from '../../services/api';
import GameController from '../common/GameController';
import GameRatingComment from '../common/GameRatingComment';
import './Match3Game.css';

const CANDY_TYPES = ['🍎', '🍊', '🍋', '🍇', '🍓', '🍒'];
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

    // Initialize board
    useEffect(() => {
        initializeGame();
    }, []);

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
                    handleCellClick(cursor.row, cursor.col);
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
    }, [cursor, isAnimating, gameOver, navigate]);

    // Generate random candy (avoiding initial matches)
    const generateCandy = useCallback((excludeTypes = []) => {
        const availableTypes = CANDY_TYPES.filter(t => !excludeTypes.includes(t));
        return availableTypes[Math.floor(Math.random() * availableTypes.length)];
    }, []);

    // Initialize game
    const initializeGame = useCallback(() => {
        const newBoard = [];
        for (let row = 0; row < BOARD_SIZE; row++) {
            const rowArray = [];
            for (let col = 0; col < BOARD_SIZE; col++) {
                // Avoid initial matches
                const excludeTypes = [];
                if (col >= 2 && rowArray[col - 1] === rowArray[col - 2]) {
                    excludeTypes.push(rowArray[col - 1]);
                }
                if (row >= 2 && newBoard[row - 1]?.[col] === newBoard[row - 2]?.[col]) {
                    excludeTypes.push(newBoard[row - 1][col]);
                }
                rowArray.push(generateCandy(excludeTypes));
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
    }, [generateCandy]);

    // Check for matches
    const findMatches = useCallback((currentBoard) => {
        const matches = new Set();

        // Check horizontal matches
        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE - 2; col++) {
                const candy = currentBoard[row][col];
                if (candy && candy === currentBoard[row][col + 1] && candy === currentBoard[row][col + 2]) {
                    matches.add(`${row},${col}`);
                    matches.add(`${row},${col + 1}`);
                    matches.add(`${row},${col + 2}`);
                    // Check for 4 or 5 in a row
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
                if (candy && candy === currentBoard[row + 1]?.[col] && candy === currentBoard[row + 2]?.[col]) {
                    matches.add(`${row},${col}`);
                    matches.add(`${row + 1},${col}`);
                    matches.add(`${row + 2},${col}`);
                    // Check for 4 or 5 in a column
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

        // Calculate score with combo multiplier
        const matchScore = matches.size * 10 * (currentCombo + 1);
        setScore(prev => prev + matchScore);
        setCombo(currentCombo + 1);

        // Remove matched candies
        const newBoard = currentBoard.map(row => [...row]);
        matches.forEach(pos => {
            const [row, col] = pos.split(',').map(Number);
            newBoard[row][col] = null;
        });

        setBoard([...newBoard]);

        // Wait for animation
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
            // Fill empty spaces with new candies
            for (let row = emptyRow; row >= 0; row--) {
                newBoard[row][col] = generateCandy();
            }
        }

        setBoard([...newBoard]);

        // Wait and check for chain reactions
        await new Promise(resolve => setTimeout(resolve, 300));
        return processMatches(newBoard, currentCombo + 1);
    }, [findMatches, generateCandy]);

    // Swap candies
    const swapCandies = useCallback(async (row1, col1, row2, col2) => {
        const newBoard = board.map(row => [...row]);
        [newBoard[row1][col1], newBoard[row2][col2]] = [newBoard[row2][col2], newBoard[row1][col1]];

        // Check if swap creates a match
        const matches = findMatches(newBoard);

        if (matches.size > 0) {
            setBoard(newBoard);
            setMoves(prev => prev - 1);
            await processMatches(newBoard);
        } else {
            // Invalid swap - swap back with animation
            setBoard(newBoard);
            await new Promise(resolve => setTimeout(resolve, 200));
            setBoard(board);
        }

        setSelectedCell(null);
    }, [board, findMatches, processMatches]);

    // Handle cell click
    const handleCellClick = (row, col) => {
        if (isAnimating || gameOver || moves <= 0) return;

        if (selectedCell === null) {
            setSelectedCell({ row, col });
        } else {
            const { row: selRow, col: selCol } = selectedCell;

            // Check if adjacent
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

    // Save game
    const saveGame = async () => {
        try {
            await api.post('/games/5/sessions', {
                state: { board, score, moves },
                score,
                time_spent: timeSpent
            });
            alert('Game đã được lưu!');
        } catch (error) {
            console.error('Save error:', error);
        }
    };

    // Format time
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // GameController handlers
    const handleControllerLeft = () => {
        if (isAnimating || gameOver) return;
        setCursor(prev => ({ ...prev, col: Math.max(0, prev.col - 1) }));
    };

    const handleControllerRight = () => {
        if (isAnimating || gameOver) return;
        setCursor(prev => ({ ...prev, col: Math.min(BOARD_SIZE - 1, prev.col + 1) }));
    };

    const handleControllerEnter = () => {
        if (isAnimating || gameOver) return;
        handleCellClick(cursor.row, cursor.col);
    };

    const handleControllerBack = () => {
        navigate('/games');
    };

    const handleControllerHint = () => {
        setShowInstructions(prev => !prev);
    };

    return (
        <div className="match3-game">
            {/* Header */}
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

            {/* Controls */}
            <div className="game-controls">
                <button className="control-btn" onClick={initializeGame}>
                    <RotateCcw size={18} />
                    Chơi lại
                </button>
                <button className="control-btn" onClick={saveGame} disabled={isAnimating}>
                    <Save size={18} />
                    Lưu game
                </button>
                {combo > 1 && (
                    <div className="combo-display">
                        🔥 Combo x{combo}!
                    </div>
                )}
            </div>

            {/* Game status */}
            <div className="game-status">
                {gameOver ? (
                    <div className="status-message lose">
                        🎮 Game Over! Điểm: {score}
                    </div>
                ) : (
                    <div className="status-message">
                        ⏱️ {formatTime(timeSpent)} | Chọn 2 kẹo cạnh nhau để đổi chỗ
                    </div>
                )}
            </div>

            {/* Game board */}
            <div className="board-container">
                <div className="game-board match3-board">
                    {board.map((row, rowIndex) =>
                        row.map((candy, colIndex) => {
                            const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
                            const isCursor = cursor.row === rowIndex && cursor.col === colIndex;

                            return (
                                <div
                                    key={`${rowIndex}-${colIndex}`}
                                    className={`cell candy-cell ${isSelected ? 'selected' : ''} ${candy === null ? 'empty' : ''} ${isCursor ? 'cursor' : ''}`}
                                    onClick={() => handleCellClick(rowIndex, colIndex)}
                                >
                                    {candy}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* 5-Button Game Controller */}
            <GameController
                onLeft={handleControllerLeft}
                onRight={handleControllerRight}
                onEnter={handleControllerEnter}
                onBack={handleControllerBack}
                onHint={handleControllerHint}
                disabledButtons={{
                    left: isAnimating || gameOver,
                    right: isAnimating || gameOver,
                    enter: isAnimating || gameOver,
                    back: false,
                    hint: false
                }}
            />

            {/* Instructions */}
            {showInstructions && (
                <div className="game-instructions">
                    <h3>Hướng dẫn</h3>
                    <ul>
                        <li>Dùng phím mũi tên hoặc 5-button để di chuyển cursor</li>
                        <li>Nhấn Enter để chọn kẹo, nhấn lần nữa để đổi chỗ</li>
                        <li>Xếp 3 kẹo cùng loại theo hàng/cột để ghi điểm</li>
                        <li>Combo liên tiếp sẽ nhân điểm</li>
                        <li>Nhấn Esc để quay lại, H để ẩn/hiện hướng dẫn</li>
                    </ul>
                </div>
            )}

            {/* Rating & Comments */}
            <GameRatingComment gameId={5} />
        </div>
    );
};

export default Match3Game;
