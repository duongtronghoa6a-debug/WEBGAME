import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw, Trophy, Clock, ArrowLeft, Save } from 'lucide-react';
import GameController from '../common/GameController';
import GameRatingComment from '../common/GameRatingComment';
import api from '../../services/api';
import './Game2048.css';

const Game2048 = () => {
    const navigate = useNavigate();
    const [board, setBoard] = useState([]);
    const [score, setScore] = useState(0);
    const [bestScore, setBestScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [won, setWon] = useState(false);
    const [time, setTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    // Initialize game
    const initGame = useCallback(() => {
        const newBoard = Array(4).fill(null).map(() => Array(4).fill(0));
        addRandomTile(newBoard);
        addRandomTile(newBoard);
        setBoard(newBoard);
        setScore(0);
        setGameOver(false);
        setWon(false);
        setTime(0);
        setIsPlaying(true);
    }, []);

    useEffect(() => {
        initGame();
        // Load best score
        const saved = localStorage.getItem('2048_best');
        if (saved) setBestScore(parseInt(saved));
    }, [initGame]);

    // Timer
    useEffect(() => {
        let interval;
        if (isPlaying && !gameOver) {
            interval = setInterval(() => setTime(t => t + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [isPlaying, gameOver]);

    const addRandomTile = (board) => {
        const empty = [];
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (board[i][j] === 0) empty.push({ i, j });
            }
        }
        if (empty.length > 0) {
            const { i, j } = empty[Math.floor(Math.random() * empty.length)];
            board[i][j] = Math.random() < 0.9 ? 2 : 4;
        }
    };

    const slide = (row) => {
        let arr = row.filter(x => x !== 0);
        let newArr = [];
        let scoreAdd = 0;

        for (let i = 0; i < arr.length; i++) {
            if (arr[i] === arr[i + 1]) {
                newArr.push(arr[i] * 2);
                scoreAdd += arr[i] * 2;
                if (arr[i] * 2 === 2048) setWon(true);
                i++;
            } else {
                newArr.push(arr[i]);
            }
        }

        while (newArr.length < 4) newArr.push(0);
        return { row: newArr, score: scoreAdd };
    };

    const move = useCallback((direction) => {
        if (gameOver) return;

        let newBoard = board.map(row => [...row]);
        let moved = false;
        let totalScore = 0;

        const rotateBoard = (b) => {
            const n = b.length;
            return b[0].map((_, i) => b.map(row => row[n - 1 - i]));
        };

        // Rotate to always slide left
        let rotations = { left: 0, up: 1, right: 2, down: 3 }[direction];
        for (let r = 0; r < rotations; r++) newBoard = rotateBoard(newBoard);

        // Slide left
        for (let i = 0; i < 4; i++) {
            const original = [...newBoard[i]];
            const { row, score } = slide(newBoard[i]);
            newBoard[i] = row;
            totalScore += score;
            if (original.join(',') !== row.join(',')) moved = true;
        }

        // Rotate back
        for (let r = 0; r < (4 - rotations) % 4; r++) newBoard = rotateBoard(newBoard);

        if (moved) {
            addRandomTile(newBoard);
            setBoard(newBoard);
            setScore(prev => {
                const newScore = prev + totalScore;
                if (newScore > bestScore) {
                    setBestScore(newScore);
                    localStorage.setItem('2048_best', newScore.toString());
                }
                return newScore;
            });

            // Check game over
            if (!canMove(newBoard)) {
                setGameOver(true);
                setIsPlaying(false);
                saveScore();
            }
        }
    }, [board, gameOver, bestScore]);

    const canMove = (board) => {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (board[i][j] === 0) return true;
                if (j < 3 && board[i][j] === board[i][j + 1]) return true;
                if (i < 3 && board[i][j] === board[i + 1][j]) return true;
            }
        }
        return false;
    };

    const saveScore = async () => {
        try {
            await api.post('/games/9/sessions', {
                score,
                time_spent: time,
                completed: true,
                state: JSON.stringify({ board, score })
            });
        } catch (error) {
            console.error('Error saving score:', error);
        }
    };

    // Manual save game
    const saveGame = async () => {
        try {
            await api.post('/games/9/sessions', {
                score,
                time_spent: time,
                completed: gameOver || won,
                state: JSON.stringify({ board, score })
            });
            alert('Game đã được lưu!');
        } catch (error) {
            console.error('Save error:', error);
        }
    };

    // Keyboard controls
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
                const dir = e.key.replace('Arrow', '').toLowerCase();
                move(dir);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [move]);

    // 5-button handlers
    const handleLeft = () => move('left');
    const handleRight = () => move('right');
    const handleEnter = () => move('up');
    const handleBack = () => navigate('/games');
    const handleHint = () => {
        alert('💡 Hướng dẫn:\n• Di chuyển các ô bằng phím mũi tên\n• Các ô cùng số sẽ gộp lại\n• Mục tiêu: Đạt ô 2048!');
    };

    const getTileClass = (value) => {
        if (value === 0) return 'tile-0';
        const power = Math.log2(value);
        return `tile-${Math.min(power, 11)}`;
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="game-2048-page">
            <div className="game-header">
                <button className="btn btn-outline" onClick={() => navigate('/games')}>
                    <ArrowLeft size={18} /> Quay lại
                </button>
                <h1>2048</h1>
                <button className="btn btn-primary" onClick={initGame}>
                    <RotateCcw size={18} /> Chơi lại
                </button>
                <button className="btn btn-outline" onClick={saveGame} disabled={gameOver || won}>
                    <Save size={18} /> Lưu
                </button>
            </div>

            <div className="game-stats">
                <div className="stat-box">
                    <Trophy size={20} />
                    <div>
                        <span className="stat-label">Điểm</span>
                        <span className="stat-value">{score}</span>
                    </div>
                </div>
                <div className="stat-box best">
                    <Trophy size={20} />
                    <div>
                        <span className="stat-label">Cao nhất</span>
                        <span className="stat-value">{bestScore}</span>
                    </div>
                </div>
                <div className="stat-box">
                    <Clock size={20} />
                    <div>
                        <span className="stat-label">Thời gian</span>
                        <span className="stat-value">{formatTime(time)}</span>
                    </div>
                </div>
            </div>

            <div className="game-board-2048">
                {board.map((row, i) => (
                    <div key={i} className="board-row">
                        {row.map((cell, j) => (
                            <div key={`${i}-${j}`} className={`tile ${getTileClass(cell)}`}>
                                {cell > 0 && cell}
                            </div>
                        ))}
                    </div>
                ))}

                {(gameOver || won) && (
                    <div className="game-overlay">
                        <h2>{won ? '🎉 Chiến thắng!' : '💀 Game Over!'}</h2>
                        <p>Điểm: {score}</p>
                        <button className="btn btn-primary" onClick={initGame}>
                            Chơi lại
                        </button>
                    </div>
                )}
            </div>

            <GameController
                onLeft={handleLeft}
                onRight={handleRight}
                onEnter={handleEnter}
                onBack={handleBack}
                onHint={handleHint}
                disabledButtons={gameOver ? ['left', 'right', 'enter'] : []}
            />

            <div className="game-instructions">
                <h4>📖 Hướng dẫn</h4>
                <p>Dùng phím mũi tên hoặc nút điều khiển để di chuyển. Gộp các ô cùng số để tạo số lớn hơn. Đạt 2048 để chiến thắng!</p>
            </div>

            {/* Rating & Comments */}
            <GameRatingComment gameId={18} />
        </div>
    );
};

export default Game2048;
