import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw, Trophy, Clock, ArrowLeft, Pause, Play } from 'lucide-react';
import GameController from '../common/GameController';
import GameRatingComment from '../common/GameRatingComment';
import './TetrisGame.css';

// Tetromino shapes
const TETROMINOES = {
    I: { shape: [[1, 1, 1, 1]], color: '#00f5ff' },
    O: { shape: [[1, 1], [1, 1]], color: '#ffd700' },
    T: { shape: [[0, 1, 0], [1, 1, 1]], color: '#9b59b6' },
    S: { shape: [[0, 1, 1], [1, 1, 0]], color: '#2ecc71' },
    Z: { shape: [[1, 1, 0], [0, 1, 1]], color: '#e74c3c' },
    J: { shape: [[1, 0, 0], [1, 1, 1]], color: '#3498db' },
    L: { shape: [[0, 0, 1], [1, 1, 1]], color: '#e67e22' }
};

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

const TetrisGame = () => {
    const navigate = useNavigate();
    const [board, setBoard] = useState([]);
    const [currentPiece, setCurrentPiece] = useState(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [score, setScore] = useState(0);
    const [level, setLevel] = useState(1);
    const [lines, setLines] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [time, setTime] = useState(0);
    const [nextPiece, setNextPiece] = useState(null);
    const gameLoopRef = useRef(null);

    // Initialize empty board
    const createEmptyBoard = () =>
        Array(BOARD_HEIGHT).fill(null).map(() =>
            Array(BOARD_WIDTH).fill(null)
        );

    // Get random tetromino
    const getRandomPiece = () => {
        const pieces = Object.keys(TETROMINOES);
        const key = pieces[Math.floor(Math.random() * pieces.length)];
        return { ...TETROMINOES[key], type: key };
    };

    // Initialize game
    const initGame = useCallback(() => {
        setBoard(createEmptyBoard());
        const first = getRandomPiece();
        const next = getRandomPiece();
        setCurrentPiece(first);
        setNextPiece(next);
        setPosition({ x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 });
        setScore(0);
        setLevel(1);
        setLines(0);
        setGameOver(false);
        setIsPaused(false);
        setTime(0);
    }, []);

    useEffect(() => {
        initGame();
    }, [initGame]);

    // Timer
    useEffect(() => {
        let interval;
        if (!gameOver && !isPaused) {
            interval = setInterval(() => setTime(t => t + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [gameOver, isPaused]);

    // Check collision
    const checkCollision = useCallback((piece, pos, boardState) => {
        if (!piece) return true;
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x]) {
                    const newX = pos.x + x;
                    const newY = pos.y + y;
                    if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) return true;
                    if (newY >= 0 && boardState[newY][newX]) return true;
                }
            }
        }
        return false;
    }, []);

    // Rotate piece
    const rotatePiece = useCallback((piece) => {
        const rotated = piece.shape[0].map((_, i) =>
            piece.shape.map(row => row[i]).reverse()
        );
        return { ...piece, shape: rotated };
    }, []);

    // Place piece on board
    const placePiece = useCallback(() => {
        const newBoard = board.map(row => [...row]);

        for (let y = 0; y < currentPiece.shape.length; y++) {
            for (let x = 0; x < currentPiece.shape[y].length; x++) {
                if (currentPiece.shape[y][x]) {
                    const boardY = position.y + y;
                    const boardX = position.x + x;
                    if (boardY >= 0) {
                        newBoard[boardY][boardX] = currentPiece.color;
                    }
                }
            }
        }

        // Check for completed lines
        let linesCleared = 0;
        const clearedBoard = newBoard.filter(row => {
            const isFull = row.every(cell => cell !== null);
            if (isFull) linesCleared++;
            return !isFull;
        });

        // Add empty lines at top
        while (clearedBoard.length < BOARD_HEIGHT) {
            clearedBoard.unshift(Array(BOARD_WIDTH).fill(null));
        }

        // Update score
        const linePoints = [0, 100, 300, 500, 800];
        const newScore = score + (linePoints[linesCleared] || 0) * level;
        const newLines = lines + linesCleared;
        const newLevel = Math.floor(newLines / 10) + 1;

        setBoard(clearedBoard);
        setScore(newScore);
        setLines(newLines);
        setLevel(newLevel);

        // Spawn new piece
        const newPiece = nextPiece;
        const newNext = getRandomPiece();
        const startPos = { x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 };

        if (checkCollision(newPiece, startPos, clearedBoard)) {
            setGameOver(true);
            return;
        }

        setCurrentPiece(newPiece);
        setNextPiece(newNext);
        setPosition(startPos);
    }, [board, currentPiece, position, nextPiece, score, lines, level, checkCollision]);

    // Move piece down
    const moveDown = useCallback(() => {
        if (gameOver || isPaused || !currentPiece) return;

        const newPos = { ...position, y: position.y + 1 };
        if (checkCollision(currentPiece, newPos, board)) {
            placePiece();
        } else {
            setPosition(newPos);
        }
    }, [position, currentPiece, board, gameOver, isPaused, checkCollision, placePiece]);

    // Game loop
    useEffect(() => {
        if (gameOver || isPaused) {
            if (gameLoopRef.current) clearInterval(gameLoopRef.current);
            return;
        }

        const speed = Math.max(100, 500 - (level - 1) * 50);
        gameLoopRef.current = setInterval(moveDown, speed);

        return () => {
            if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        };
    }, [moveDown, gameOver, isPaused, level]);

    // Handle moves
    const moveLeft = useCallback(() => {
        if (gameOver || isPaused) return;
        const newPos = { ...position, x: position.x - 1 };
        if (!checkCollision(currentPiece, newPos, board)) {
            setPosition(newPos);
        }
    }, [position, currentPiece, board, gameOver, isPaused, checkCollision]);

    const moveRight = useCallback(() => {
        if (gameOver || isPaused) return;
        const newPos = { ...position, x: position.x + 1 };
        if (!checkCollision(currentPiece, newPos, board)) {
            setPosition(newPos);
        }
    }, [position, currentPiece, board, gameOver, isPaused, checkCollision]);

    const rotate = useCallback(() => {
        if (gameOver || isPaused || !currentPiece) return;
        const rotated = rotatePiece(currentPiece);
        if (!checkCollision(rotated, position, board)) {
            setCurrentPiece(rotated);
        }
    }, [currentPiece, position, board, gameOver, isPaused, rotatePiece, checkCollision]);

    const hardDrop = useCallback(() => {
        if (gameOver || isPaused || !currentPiece) return;
        let newY = position.y;
        while (!checkCollision(currentPiece, { ...position, y: newY + 1 }, board)) {
            newY++;
        }
        setPosition({ ...position, y: newY });
        setTimeout(placePiece, 50);
    }, [position, currentPiece, board, gameOver, isPaused, checkCollision, placePiece]);

    // Keyboard controls
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (gameOver) return;
            e.preventDefault();

            switch (e.key) {
                case 'ArrowLeft': moveLeft(); break;
                case 'ArrowRight': moveRight(); break;
                case 'ArrowUp': rotate(); break;
                case 'ArrowDown': moveDown(); break;
                case ' ': hardDrop(); break;
                case 'p': case 'P': setIsPaused(p => !p); break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [moveLeft, moveRight, rotate, moveDown, hardDrop, gameOver]);

    // 5-button handlers
    const handleLeft = () => moveLeft();
    const handleRight = () => moveRight();
    const handleEnter = () => rotate();
    const handleBack = () => navigate('/games');
    const handleHint = () => hardDrop();

    // Render board with current piece
    const renderBoard = () => {
        const displayBoard = board.map(row => [...row]);

        if (currentPiece && !gameOver) {
            for (let y = 0; y < currentPiece.shape.length; y++) {
                for (let x = 0; x < currentPiece.shape[y].length; x++) {
                    if (currentPiece.shape[y][x]) {
                        const boardY = position.y + y;
                        const boardX = position.x + x;
                        if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
                            displayBoard[boardY][boardX] = currentPiece.color;
                        }
                    }
                }
            }
        }

        return displayBoard;
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="tetris-page">
            <div className="game-header">
                <button className="btn btn-outline" onClick={() => navigate('/games')}>
                    <ArrowLeft size={18} /> Quay lại
                </button>
                <h1>🧱 Tetris</h1>
                <button className="btn btn-primary" onClick={initGame}>
                    <RotateCcw size={18} /> Chơi lại
                </button>
            </div>

            <div className="tetris-container">
                <div className="tetris-sidebar">
                    <div className="next-piece-box">
                        <h4>Tiếp theo</h4>
                        <div className="next-piece-display">
                            {nextPiece && nextPiece.shape.map((row, y) => (
                                <div key={y} className="next-row">
                                    {row.map((cell, x) => (
                                        <div
                                            key={x}
                                            className="next-cell"
                                            style={{ background: cell ? nextPiece.color : 'transparent' }}
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="stat-box">
                        <Trophy size={18} />
                        <span className="stat-label">Điểm</span>
                        <span className="stat-value">{score}</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-label">Level</span>
                        <span className="stat-value">{level}</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-label">Lines</span>
                        <span className="stat-value">{lines}</span>
                    </div>
                    <div className="stat-box">
                        <Clock size={18} />
                        <span className="stat-label">Thời gian</span>
                        <span className="stat-value">{formatTime(time)}</span>
                    </div>

                    <button
                        className="btn btn-outline pause-btn"
                        onClick={() => setIsPaused(p => !p)}
                    >
                        {isPaused ? <Play size={18} /> : <Pause size={18} />}
                        {isPaused ? 'Tiếp tục' : 'Tạm dừng'}
                    </button>
                </div>

                <div className="tetris-board">
                    {renderBoard().map((row, y) => (
                        <div key={y} className="board-row">
                            {row.map((cell, x) => (
                                <div
                                    key={x}
                                    className="tetris-cell"
                                    style={{ background: cell || 'var(--bg-tertiary)' }}
                                />
                            ))}
                        </div>
                    ))}

                    {(gameOver || isPaused) && (
                        <div className="game-overlay">
                            <h2>{gameOver ? '💀 Game Over!' : '⏸️ Tạm dừng'}</h2>
                            <p>Điểm: {score}</p>
                            <button className="btn btn-primary" onClick={gameOver ? initGame : () => setIsPaused(false)}>
                                {gameOver ? 'Chơi lại' : 'Tiếp tục'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <GameController
                onLeft={handleLeft}
                onRight={handleRight}
                onEnter={handleEnter}
                onBack={handleBack}
                onHint={handleHint}
                disabledButtons={gameOver ? ['left', 'right', 'enter', 'hint'] : []}
            />

            <div className="game-instructions">
                <h4>📖 Điều khiển</h4>
                <p>
                    ← →: Di chuyển | ↑/Enter: Xoay | ↓: Rơi nhanh | Space/Hint: Thả nhanh | P: Tạm dừng
                </p>
            </div>

            {/* Rating & Comments */}
            <GameRatingComment gameId={8} />
        </div>
    );
};

export default TetrisGame;
