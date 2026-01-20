import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Play, Pause } from 'lucide-react';
import api from '../../services/api';
import LEDMatrix, { LED_COLORS } from '../common/LEDMatrix';
import GameController from '../common/GameController';
import ExitDialog from '../common/ExitDialog';
import GameOverDialog from '../common/GameOverDialog';
import GameRatingComment from '../common/GameRatingComment';
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
    const [showInstructions, setShowInstructions] = useState(true);
    const [pixels, setPixels] = useState([]);
    const [showExitDialog, setShowExitDialog] = useState(false);
    const [showGameOverDialog, setShowGameOverDialog] = useState(false);

    // Convert game state to LED pixels
    useEffect(() => {
        const newPixels = Array(boardSize.height).fill(null).map(() =>
            Array(boardSize.width).fill(null)
        );

        // Draw snake
        snake.forEach((segment, index) => {
            if (newPixels[segment.y]) {
                if (index === 0) {
                    // Snake head
                    newPixels[segment.y][segment.x] = LED_COLORS.SNAKE_HEAD;
                } else {
                    // Snake body
                    newPixels[segment.y][segment.x] = LED_COLORS.SNAKE_BODY;
                }
            }
        });

        // Draw food
        if (newPixels[food.y]) {
            newPixels[food.y][food.x] = LED_COLORS.FOOD;
        }

        setPixels(newPixels);
    }, [snake, food, boardSize]);

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

    // Load saved game on mount
    useEffect(() => {
        const loadSavedGame = async () => {
            try {
                const res = await api.get('/games/sessions?completed=false');
                if (res.data.success && res.data.data && res.data.data.length > 0) {
                    const saved = res.data.data.find(s => s.game_id === 4);
                    if (saved && saved.state) {
                        const state = saved.state;
                        if (state.snake) setSnake(state.snake);
                        if (state.food) setFood(state.food);
                        if (state.score) setScore(state.score);
                        if (state.speed) setSpeed(state.speed);
                    }
                }
            } catch (error) {
                console.error('Load saved game error:', error);
            }
        };
        loadSavedGame();
    }, []);

    // Show game over dialog
    useEffect(() => {
        if (gameOver) {
            const timer = setTimeout(() => {
                setShowGameOverDialog(true);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [gameOver]);

    // Keyboard controls
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Block keyboard when exit dialog is open
            if (showExitDialog) return;
            if (gameOver) return;

            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    e.preventDefault();
                    if (directionRef.current !== DIRECTIONS.DOWN) {
                        directionRef.current = DIRECTIONS.UP;
                        setDirection(DIRECTIONS.UP);
                    }
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    e.preventDefault();
                    if (directionRef.current !== DIRECTIONS.UP) {
                        directionRef.current = DIRECTIONS.DOWN;
                        setDirection(DIRECTIONS.DOWN);
                    }
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    e.preventDefault();
                    if (directionRef.current !== DIRECTIONS.RIGHT) {
                        directionRef.current = DIRECTIONS.LEFT;
                        setDirection(DIRECTIONS.LEFT);
                    }
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    e.preventDefault();
                    if (directionRef.current !== DIRECTIONS.LEFT) {
                        directionRef.current = DIRECTIONS.RIGHT;
                        setDirection(DIRECTIONS.RIGHT);
                    }
                    break;
                case ' ':
                case 'Enter':
                    e.preventDefault();
                    if (!gameOver) {
                        setIsPlaying(prev => !prev);
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
                    if (isPlaying && !gameOver) {
                        setIsPlaying(false);
                        setShowExitDialog(true);
                    } else if (!gameOver) {
                        setShowExitDialog(true);
                    } else {
                        navigate('/games');
                    }
                    break;
                case 'h':
                case 'H':
                    setShowInstructions(prev => !prev);
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameOver, navigate, showExitDialog]);

    // Toggle play/pause
    const togglePlay = () => {
        if (gameOver) {
            initializeGame();
        }
        setIsPlaying(prev => !prev);
    };

    // GameController handlers - Left/Right controls direction
    const handleControllerLeft = () => {
        if (gameOver) return;
        if (directionRef.current !== DIRECTIONS.RIGHT) {
            directionRef.current = DIRECTIONS.LEFT;
            setDirection(DIRECTIONS.LEFT);
        }
    };

    const handleControllerRight = () => {
        if (gameOver) return;
        if (directionRef.current !== DIRECTIONS.LEFT) {
            directionRef.current = DIRECTIONS.RIGHT;
            setDirection(DIRECTIONS.RIGHT);
        }
    };

    const handleControllerEnter = () => {
        if (gameOver) {
            initializeGame();
        }
        setIsPlaying(prev => !prev);
    };

    const handleControllerBack = () => {
        if (isPlaying) {
            setIsPlaying(false);
            setShowExitDialog(true);
        } else if (!gameOver) {
            setShowExitDialog(true);
        } else {
            navigate('/games');
        }
    };

    const handleControllerHint = () => {
        setShowInstructions(prev => !prev);
    };

    // Save game and exit
    const saveGameAndExit = async () => {
        try {
            await api.post('/games/4/sessions', {
                state: { snake, food, direction, score, speed },
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

    // Format time
    const formatTime = (ticks) => {
        const seconds = Math.floor(ticks * speed / 1000);
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="snake-game led-snake-game">
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
            </div>

            {/* Game status */}
            <div className="game-status">
                {gameOver ? (
                    <div className="status-message lose">
                        💀 Game Over! Điểm: {score}
                    </div>
                ) : (
                    <div className="status-message">
                        {isPlaying ? '🎮 Đang chơi - Dùng ← → để đổi hướng' : '⏸️ Nhấn Enter để bắt đầu'}
                    </div>
                )}
            </div>

            {/* LED Matrix game board */}
            <div className="board-container">
                <LEDMatrix
                    pixels={pixels}
                    rows={boardSize.height}
                    cols={boardSize.width}
                    dotSize="small"
                    showBorder={true}
                />
            </div>

            {/* 5-Button Game Controller */}
            <GameController
                onLeft={handleControllerLeft}
                onRight={handleControllerRight}
                onEnter={handleControllerEnter}
                onBack={handleControllerBack}
                onHint={handleControllerHint}
                disabledButtons={{
                    left: gameOver,
                    right: gameOver,
                    enter: false,
                    back: false,
                    hint: false
                }}
            />

            {/* Instructions */}
            {showInstructions && (
                <div className="game-instructions">
                    <h3>Hướng dẫn</h3>
                    <ul>
                        <li>Dùng phím mũi tên hoặc WASD để điều khiển</li>
                        <li>Hoặc dùng 5-button controller: ← → đổi hướng</li>
                        <li>Ăn 🍎 (điểm xanh) để tăng điểm và dài thêm</li>
                        <li>Tránh va vào tường và thân rắn</li>
                        <li>Nhấn Enter để tạm dừng/tiếp tục</li>
                        <li>Nhấn Esc để quay lại, H để ẩn/hiện hướng dẫn</li>
                    </ul>
                </div>
            )}

            {/* Rating & Comments */}
            <GameRatingComment gameId={4} />

            {/* Exit Dialog */}
            <ExitDialog
                isOpen={showExitDialog}
                onSave={saveGameAndExit}
                onDiscard={discardAndExit}
                onCancel={() => setShowExitDialog(false)}
                gameName="Rắn Săn Mồi"
            />

            {/* Game Over Dialog */}
            <GameOverDialog
                isOpen={showGameOverDialog}
                isWin={false}
                score={score}
                message={`Điểm cao nhất: ${highScore}`}
                onPlayAgain={() => {
                    setShowGameOverDialog(false);
                    initializeGame();
                }}
                onExit={() => navigate('/games')}
                gameName="Rắn Săn Mồi"
            />
        </div>
    );
};

export default SnakeGame;
