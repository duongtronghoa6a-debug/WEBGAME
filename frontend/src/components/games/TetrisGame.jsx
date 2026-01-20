import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Play, Pause, Save } from 'lucide-react';
import api from '../../services/api';
import LEDMatrix, { LED_COLORS } from '../common/LEDMatrix';
import GameController from '../common/GameController';
import GameRatingComment from '../common/GameRatingComment';
import './TetrisGame.css';

// Tetris pieces
const PIECES = {
    I: { shape: [[1, 1, 1, 1]], color: LED_COLORS.TETRIS_I },
    O: { shape: [[1, 1], [1, 1]], color: LED_COLORS.TETRIS_O },
    T: { shape: [[0, 1, 0], [1, 1, 1]], color: LED_COLORS.TETRIS_T },
    S: { shape: [[0, 1, 1], [1, 1, 0]], color: LED_COLORS.TETRIS_S },
    Z: { shape: [[1, 1, 0], [0, 1, 1]], color: LED_COLORS.TETRIS_Z },
    J: { shape: [[1, 0, 0], [1, 1, 1]], color: LED_COLORS.TETRIS_J },
    L: { shape: [[0, 0, 1], [1, 1, 1]], color: LED_COLORS.TETRIS_L }
};

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

const TetrisGame = () => {
    const navigate = useNavigate();
    const gameLoopRef = useRef(null);

    const [board, setBoard] = useState([]);
    const [currentPiece, setCurrentPiece] = useState(null);
    const [piecePosition, setPiecePosition] = useState({ x: 0, y: 0 });
    const [score, setScore] = useState(0);
    const [level, setLevel] = useState(1);
    const [lines, setLines] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [timeSpent, setTimeSpent] = useState(0);
    const [pixels, setPixels] = useState([]);
    const [showInstructions, setShowInstructions] = useState(true);

    // Initialize empty board
    const createEmptyBoard = () => Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null));

    // Get random piece
    const getRandomPiece = () => {
        const pieces = Object.keys(PIECES);
        const key = pieces[Math.floor(Math.random() * pieces.length)];
        return { ...PIECES[key], type: key };
    };

    // Initialize game
    const initializeGame = useCallback(() => {
        setBoard(createEmptyBoard());
        const piece = getRandomPiece();
        setCurrentPiece(piece);
        setPiecePosition({ x: Math.floor((BOARD_WIDTH - piece.shape[0].length) / 2), y: 0 });
        setScore(0);
        setLevel(1);
        setLines(0);
        setGameOver(false);
        setIsPlaying(false);
        setTimeSpent(0);
    }, []);

    useEffect(() => {
        initializeGame();
    }, [initializeGame]);

    // Convert board to LED pixels
    useEffect(() => {
        const newPixels = board.map(row => [...row]);

        // Draw current piece
        if (currentPiece && !gameOver) {
            currentPiece.shape.forEach((row, dy) => {
                row.forEach((cell, dx) => {
                    if (cell) {
                        const y = piecePosition.y + dy;
                        const x = piecePosition.x + dx;
                        if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
                            newPixels[y][x] = currentPiece.color;
                        }
                    }
                });
            });
        }

        setPixels(newPixels);
    }, [board, currentPiece, piecePosition, gameOver]);

    // Check collision
    const checkCollision = useCallback((piece, pos, boardToCheck) => {
        for (let dy = 0; dy < piece.shape.length; dy++) {
            for (let dx = 0; dx < piece.shape[dy].length; dx++) {
                if (piece.shape[dy][dx]) {
                    const newX = pos.x + dx;
                    const newY = pos.y + dy;
                    if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) return true;
                    if (newY >= 0 && boardToCheck[newY][newX]) return true;
                }
            }
        }
        return false;
    }, []);

    // Lock piece and check lines
    const lockPiece = useCallback(() => {
        const newBoard = board.map(row => [...row]);

        currentPiece.shape.forEach((row, dy) => {
            row.forEach((cell, dx) => {
                if (cell) {
                    const y = piecePosition.y + dy;
                    const x = piecePosition.x + dx;
                    if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
                        newBoard[y][x] = currentPiece.color;
                    }
                }
            });
        });

        // Check for completed lines
        let linesCleared = 0;
        for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
            if (newBoard[y].every(cell => cell !== null)) {
                newBoard.splice(y, 1);
                newBoard.unshift(Array(BOARD_WIDTH).fill(null));
                linesCleared++;
                y++; // Check same row again
            }
        }

        if (linesCleared > 0) {
            setLines(prev => prev + linesCleared);
            setScore(prev => prev + linesCleared * 100 * level);
            setLevel(prev => Math.floor((lines + linesCleared) / 10) + 1);
        }

        setBoard(newBoard);

        // Spawn new piece
        const newPiece = getRandomPiece();
        const newPos = { x: Math.floor((BOARD_WIDTH - newPiece.shape[0].length) / 2), y: 0 };

        if (checkCollision(newPiece, newPos, newBoard)) {
            setGameOver(true);
            setIsPlaying(false);
        } else {
            setCurrentPiece(newPiece);
            setPiecePosition(newPos);
        }
    }, [board, currentPiece, piecePosition, level, lines, checkCollision]);

    // Move piece down
    const moveDown = useCallback(() => {
        if (!currentPiece || gameOver) return;

        const newPos = { ...piecePosition, y: piecePosition.y + 1 };
        if (checkCollision(currentPiece, newPos, board)) {
            lockPiece();
        } else {
            setPiecePosition(newPos);
        }
    }, [currentPiece, piecePosition, board, checkCollision, lockPiece, gameOver]);

    // Game loop
    useEffect(() => {
        if (!isPlaying || gameOver) return;

        const speed = Math.max(100, 1000 - (level - 1) * 100);
        gameLoopRef.current = setInterval(() => {
            moveDown();
            setTimeSpent(prev => prev + 1);
        }, speed);

        return () => clearInterval(gameLoopRef.current);
    }, [isPlaying, gameOver, level, moveDown]);

    // Rotate piece
    const rotatePiece = useCallback(() => {
        if (!currentPiece || gameOver) return;

        const rotated = currentPiece.shape[0].map((_, i) =>
            currentPiece.shape.map(row => row[i]).reverse()
        );
        const newPiece = { ...currentPiece, shape: rotated };

        if (!checkCollision(newPiece, piecePosition, board)) {
            setCurrentPiece(newPiece);
        }
    }, [currentPiece, piecePosition, board, checkCollision, gameOver]);

    // Move horizontal
    const moveHorizontal = useCallback((dir) => {
        if (!currentPiece || gameOver) return;

        const newPos = { ...piecePosition, x: piecePosition.x + dir };
        if (!checkCollision(currentPiece, newPos, board)) {
            setPiecePosition(newPos);
        }
    }, [currentPiece, piecePosition, board, checkCollision, gameOver]);

    // Hard drop
    const hardDrop = useCallback(() => {
        if (!currentPiece || gameOver) return;

        let newY = piecePosition.y;
        while (!checkCollision(currentPiece, { ...piecePosition, y: newY + 1 }, board)) {
            newY++;
        }
        setPiecePosition({ ...piecePosition, y: newY });
        setTimeout(lockPiece, 50);
    }, [currentPiece, piecePosition, board, checkCollision, lockPiece, gameOver]);

    // Keyboard controls
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (gameOver && e.key !== 'Escape') return;

            switch (e.key) {
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    e.preventDefault();
                    moveHorizontal(-1);
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    e.preventDefault();
                    moveHorizontal(1);
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    e.preventDefault();
                    moveDown();
                    break;
                case 'ArrowUp':
                case 'w':
                case 'W':
                    e.preventDefault();
                    rotatePiece();
                    break;
                case ' ':
                    e.preventDefault();
                    if (!isPlaying) {
                        setIsPlaying(true);
                    } else {
                        hardDrop();
                    }
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (gameOver) {
                        initializeGame();
                    }
                    setIsPlaying(prev => !prev);
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
    }, [gameOver, moveHorizontal, moveDown, rotatePiece, hardDrop, initializeGame, navigate]);

    // Controller handlers
    const handleLeft = () => moveHorizontal(-1);
    const handleRight = () => moveHorizontal(1);
    const handleEnter = () => {
        if (gameOver) initializeGame();
        setIsPlaying(prev => !prev);
    };
    const handleBack = () => navigate('/games');
    const handleHint = () => setShowInstructions(prev => !prev);

    // Save game
    const saveGame = async () => {
        try {
            await api.post('/games/8/sessions', {
                state: { board, score, level, lines },
                score,
                time_spent: timeSpent
            });
            alert('Game đã được lưu!');
        } catch (error) {
            console.error('Save error:', error);
        }
    };

    const formatTime = (ticks) => {
        const seconds = Math.floor(ticks);
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="tetris-game led-tetris-game">
            <div className="game-header">
                <button className="back-btn" onClick={() => navigate('/games')}>
                    <ArrowLeft size={20} />
                    Quay lại
                </button>
                <h1>🧱 Tetris</h1>
                <div className="game-stats">
                    <span className="stat">🏆 {score}</span>
                    <span className="stat">📈 Lv.{level}</span>
                </div>
            </div>

            <div className="game-controls">
                <button className="control-btn" onClick={handleEnter}>
                    {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                    {isPlaying ? 'Tạm dừng' : (gameOver ? 'Chơi lại' : 'Bắt đầu')}
                </button>
                <button className="control-btn" onClick={initializeGame}>
                    <RotateCcw size={18} />
                    Reset
                </button>
                <button className="control-btn" onClick={saveGame} disabled={isPlaying}>
                    <Save size={18} />
                    Lưu game
                </button>
            </div>

            <div className="game-status">
                {gameOver ? (
                    <div className="status-message lose">
                        💀 Game Over! Điểm: {score}
                    </div>
                ) : (
                    <div className="status-message">
                        {isPlaying ? `🎮 Lines: ${lines}` : '⏸️ Nhấn Enter để bắt đầu'}
                    </div>
                )}
            </div>

            <div className="board-container">
                <LEDMatrix
                    pixels={pixels}
                    rows={BOARD_HEIGHT}
                    cols={BOARD_WIDTH}
                    dotSize="small"
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
                    left: gameOver,
                    right: gameOver
                }}
            />

            {showInstructions && (
                <div className="game-instructions">
                    <h3>Hướng dẫn</h3>
                    <ul>
                        <li>← → để di chuyển, ↑ để xoay</li>
                        <li>↓ để rơi nhanh, Space để thả rơi</li>
                        <li>Enter để tạm dừng/tiếp tục</li>
                        <li>Xếp đầy hàng ngang để ghi điểm</li>
                    </ul>
                </div>
            )}

            <GameRatingComment gameId={8} />
        </div>
    );
};

export default TetrisGame;
