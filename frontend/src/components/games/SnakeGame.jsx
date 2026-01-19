import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Play, Pause, Save } from 'lucide-react';
import api from '../../services/api';
import './SnakeGame.css';

const DIRECTIONS = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 }
};

const SnakeGame = () => {
    const navigate = useNavigate();
    const gameLoopRef = useRef(null);
    const directionRef = useRef(DIRECTIONS.RIGHT);

    // Game config
    const [boardSize] = useState({ width: 20, height: 20 });
    const [speed, setSpeed] = useState(150);

    // Game state
    const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
    const [food, setFood] = useState({ x: 15, y: 10 });
    const [direction, setDirection] = useState(DIRECTIONS.RIGHT);
    const [isPlaying, setIsPlaying] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [timeSpent, setTimeSpent] = useState(0);

    // Generate random food position
    const generateFood = useCallback((currentSnake) => {
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * boardSize.width),
                y: Math.floor(Math.random() * boardSize.height)
            };
        } while (currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
        return newFood;
    }, [boardSize]);

    // Initialize game
    const initializeGame = useCallback(() => {
        const initialSnake = [{ x: 10, y: 10 }];
        setSnake(initialSnake);
        setFood(generateFood(initialSnake));
        setDirection(DIRECTIONS.RIGHT);
        directionRef.current = DIRECTIONS.RIGHT;
        setScore(0);
        setTimeSpent(0);
        setGameOver(false);
        setIsPlaying(false);
        setSpeed(150);
    }, [generateFood]);

    // Game loop
    useEffect(() => {
        if (!isPlaying || gameOver) return;

        gameLoopRef.current = setInterval(() => {
            setSnake(prevSnake => {
                const head = prevSnake[0];
                const newHead = {
                    x: head.x + directionRef.current.x,
                    y: head.y + directionRef.current.y
                };

                // Check wall collision
                if (newHead.x < 0 || newHead.x >= boardSize.width ||
                    newHead.y < 0 || newHead.y >= boardSize.height) {
                    setGameOver(true);
                    setIsPlaying(false);
                    return prevSnake;
                }

                // Check self collision
                if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
                    setGameOver(true);
                    setIsPlaying(false);
                    return prevSnake;
                }

                const newSnake = [newHead, ...prevSnake];

                // Check food collision
                if (newHead.x === food.x && newHead.y === food.y) {
                    setScore(prev => {
                        const newScore = prev + 10;
                        if (newScore > highScore) setHighScore(newScore);
                        return newScore;
                    });
                    setFood(generateFood(newSnake));
                    // Increase speed slightly
                    setSpeed(prev => Math.max(50, prev - 2));
                } else {
                    newSnake.pop();
                }

                return newSnake;
            });

            setTimeSpent(prev => prev + 1);
        }, speed);

        return () => clearInterval(gameLoopRef.current);
    }, [isPlaying, gameOver, food, boardSize, generateFood, highScore, speed]);

    // Keyboard controls
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (gameOver) return;

            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    if (directionRef.current !== DIRECTIONS.DOWN) {
                        directionRef.current = DIRECTIONS.UP;
                        setDirection(DIRECTIONS.UP);
                    }
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    if (directionRef.current !== DIRECTIONS.UP) {
                        directionRef.current = DIRECTIONS.DOWN;
                        setDirection(DIRECTIONS.DOWN);
                    }
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    if (directionRef.current !== DIRECTIONS.RIGHT) {
                        directionRef.current = DIRECTIONS.LEFT;
                        setDirection(DIRECTIONS.LEFT);
                    }
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    if (directionRef.current !== DIRECTIONS.LEFT) {
                        directionRef.current = DIRECTIONS.RIGHT;
                        setDirection(DIRECTIONS.RIGHT);
                    }
                    break;
                case ' ':
                    e.preventDefault();
                    if (!gameOver) {
                        setIsPlaying(prev => !prev);
                    }
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameOver]);

    // Mobile controls
    const handleDirectionClick = (newDirection) => {
        if (gameOver) return;

        if (newDirection === DIRECTIONS.UP && directionRef.current !== DIRECTIONS.DOWN) {
            directionRef.current = DIRECTIONS.UP;
            setDirection(DIRECTIONS.UP);
        } else if (newDirection === DIRECTIONS.DOWN && directionRef.current !== DIRECTIONS.UP) {
            directionRef.current = DIRECTIONS.DOWN;
            setDirection(DIRECTIONS.DOWN);
        } else if (newDirection === DIRECTIONS.LEFT && directionRef.current !== DIRECTIONS.RIGHT) {
            directionRef.current = DIRECTIONS.LEFT;
            setDirection(DIRECTIONS.LEFT);
        } else if (newDirection === DIRECTIONS.RIGHT && directionRef.current !== DIRECTIONS.LEFT) {
            directionRef.current = DIRECTIONS.RIGHT;
            setDirection(DIRECTIONS.RIGHT);
        }
    };

    // Toggle play/pause
    const togglePlay = () => {
        if (gameOver) {
            initializeGame();
        }
        setIsPlaying(prev => !prev);
    };

    // Save game
    const saveGame = async () => {
        try {
            await api.post('/games/4/sessions', {
                state: { snake, food, direction, score, speed },
                score,
                time_spent: timeSpent
            });
            alert('Game đã được lưu!');
        } catch (error) {
            console.error('Save error:', error);
        }
    };

    // Format time
    const formatTime = (ticks) => {
        const seconds = Math.floor(ticks * speed / 1000);
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="snake-game">
            {/* Header */}
            <div className="game-header">
                <button className="back-btn" onClick={() => navigate('/games')}>
                    <ArrowLeft size={20} />
                    Quay lại
                </button>
                <h1>🐍 Rắn Săn Mồi</h1>
                <div className="game-stats">
                    <span className="stat">🏆 {score}</span>
                    <span className="stat">👑 {highScore}</span>
                </div>
            </div>

            {/* Controls */}
            <div className="game-controls">
                <button className="control-btn" onClick={togglePlay}>
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

            {/* Game status */}
            <div className="game-status">
                {gameOver ? (
                    <div className="status-message lose">
                        💀 Game Over! Điểm: {score}
                    </div>
                ) : (
                    <div className="status-message">
                        {isPlaying ? '🎮 Đang chơi...' : '⏸️ Nhấn Space hoặc nút Play để bắt đầu'}
                    </div>
                )}
            </div>

            {/* Game board */}
            <div className="board-container">
                <div
                    className="game-board snake-board"
                    style={{
                        gridTemplateColumns: `repeat(${boardSize.width}, 1fr)`,
                        gridTemplateRows: `repeat(${boardSize.height}, 1fr)`
                    }}
                >
                    {Array(boardSize.height).fill(null).map((_, y) =>
                        Array(boardSize.width).fill(null).map((_, x) => {
                            const isSnakeHead = snake[0]?.x === x && snake[0]?.y === y;
                            const isSnakeBody = snake.slice(1).some(s => s.x === x && s.y === y);
                            const isFood = food.x === x && food.y === y;

                            return (
                                <div
                                    key={`${x}-${y}`}
                                    className={`cell ${isSnakeHead ? 'snake-head' : ''} ${isSnakeBody ? 'snake-body' : ''} ${isFood ? 'food' : ''}`}
                                >
                                    {isSnakeHead && '🐍'}
                                    {isFood && '🍎'}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Mobile controls */}
            <div className="mobile-controls">
                <div className="control-row">
                    <button className="direction-btn" onClick={() => handleDirectionClick(DIRECTIONS.UP)}>
                        ↑
                    </button>
                </div>
                <div className="control-row">
                    <button className="direction-btn" onClick={() => handleDirectionClick(DIRECTIONS.LEFT)}>
                        ←
                    </button>
                    <button className="direction-btn center" onClick={togglePlay}>
                        {isPlaying ? '⏸' : '▶'}
                    </button>
                    <button className="direction-btn" onClick={() => handleDirectionClick(DIRECTIONS.RIGHT)}>
                        →
                    </button>
                </div>
                <div className="control-row">
                    <button className="direction-btn" onClick={() => handleDirectionClick(DIRECTIONS.DOWN)}>
                        ↓
                    </button>
                </div>
            </div>

            {/* Instructions */}
            <div className="game-instructions">
                <h3>Hướng dẫn</h3>
                <ul>
                    <li>Dùng phím mũi tên hoặc WASD để điều khiển</li>
                    <li>Ăn 🍎 để tăng điểm và dài thêm</li>
                    <li>Tránh va vào tường và thân rắn</li>
                    <li>Nhấn Space để tạm dừng/tiếp tục</li>
                </ul>
            </div>
        </div>
    );
};

export default SnakeGame;
