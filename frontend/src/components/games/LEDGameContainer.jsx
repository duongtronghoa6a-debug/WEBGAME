import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LEDMatrix, { LED_COLORS } from '../common/LEDMatrix';
import GameController from '../common/GameController';
import GameRatingComment from '../common/GameRatingComment';
import api from '../../services/api';
import './LEDGameContainer.css';

/**
 * LED Game Container - Unified wrapper cho tất cả games
 * Chứa: LED Matrix display + 5-button controller
 * State machine: MENU → PLAYING → GAMEOVER
 */

const GAME_STATES = {
    LOADING: 'LOADING',
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED',
    GAMEOVER: 'GAMEOVER'
};

const LEDGameContainer = ({
    gameId,
    gameName,
    gameLogic, // Function that handles game logic
    initialState,
    boardSize = { rows: 15, cols: 15 },
    onSave,
    onLoad,
    children // Optional: custom UI elements
}) => {
    const navigate = useNavigate();
    const [gameState, setGameState] = useState(GAME_STATES.LOADING);
    const [pixels, setPixels] = useState([]);
    const [cursor, setCursor] = useState({ row: 0, col: 0 });
    const [score, setScore] = useState(0);
    const [timeSpent, setTimeSpent] = useState(0);
    const [message, setMessage] = useState('');

    // Initialize pixels matrix
    useEffect(() => {
        const emptyMatrix = Array(boardSize.rows).fill(null).map(() =>
            Array(boardSize.cols).fill(null)
        );
        setPixels(emptyMatrix);
        setGameState(GAME_STATES.PLAYING);
    }, [boardSize.rows, boardSize.cols]);

    // Timer
    useEffect(() => {
        if (gameState !== GAME_STATES.PLAYING) return;

        const interval = setInterval(() => {
            setTimeSpent(prev => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [gameState]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (gameState === GAME_STATES.LOADING) return;

            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    handleLeft();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    handleRight();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    handleUp();
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    handleDown();
                    break;
                case 'Enter':
                    e.preventDefault();
                    handleEnter();
                    break;
                case 'Escape':
                    e.preventDefault();
                    handleBack();
                    break;
                case 'h':
                case 'H':
                    e.preventDefault();
                    handleHint();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameState, cursor, boardSize]);

    // Navigation handlers
    const handleLeft = () => {
        setCursor(prev => ({
            ...prev,
            col: Math.max(0, prev.col - 1)
        }));
    };

    const handleRight = () => {
        setCursor(prev => ({
            ...prev,
            col: Math.min(boardSize.cols - 1, prev.col + 1)
        }));
    };

    const handleUp = () => {
        setCursor(prev => ({
            ...prev,
            row: Math.max(0, prev.row - 1)
        }));
    };

    const handleDown = () => {
        setCursor(prev => ({
            ...prev,
            row: Math.min(boardSize.rows - 1, prev.row + 1)
        }));
    };

    const handleEnter = () => {
        if (gameState === GAME_STATES.GAMEOVER) {
            // Restart game
            resetGame();
        }
        // Game-specific enter logic will be handled by parent component
    };

    const handleBack = () => {
        navigate('/games');
    };

    const handleHint = () => {
        setMessage('💡 Gợi ý sẽ được hiển thị tại đây');
        setTimeout(() => setMessage(''), 2000);
    };

    const resetGame = () => {
        const emptyMatrix = Array(boardSize.rows).fill(null).map(() =>
            Array(boardSize.cols).fill(null)
        );
        setPixels(emptyMatrix);
        setCursor({ row: Math.floor(boardSize.rows / 2), col: Math.floor(boardSize.cols / 2) });
        setScore(0);
        setTimeSpent(0);
        setGameState(GAME_STATES.PLAYING);
    };

    // Save game
    const saveGame = async () => {
        try {
            await api.post(`/games/${gameId}/sessions`, {
                state: { pixels, cursor, score },
                score,
                time_spent: timeSpent
            });
            setMessage('💾 Game đã được lưu!');
            setTimeout(() => setMessage(''), 2000);
        } catch (error) {
            console.error('Save error:', error);
            setMessage('❌ Lỗi khi lưu game');
            setTimeout(() => setMessage(''), 2000);
        }
    };

    // Format time
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="led-game-container">
            {/* Header */}
            <div className="led-game-header">
                <h1>{gameName}</h1>
                <div className="led-game-stats">
                    <span className="stat">⏱️ {formatTime(timeSpent)}</span>
                    <span className="stat">🏆 {score}</span>
                </div>
            </div>

            {/* Status/Message */}
            {message && (
                <div className="led-game-message">
                    {message}
                </div>
            )}

            {/* LED Matrix Display */}
            <div className="led-display-wrapper">
                <LEDMatrix
                    pixels={pixels}
                    rows={boardSize.rows}
                    cols={boardSize.cols}
                    cursor={cursor}
                    dotSize="medium"
                    showBorder={true}
                />
            </div>

            {/* Game State Overlay */}
            {gameState === GAME_STATES.GAMEOVER && (
                <div className="led-game-overlay">
                    <div className="overlay-content">
                        <h2>Game Over!</h2>
                        <p>Điểm: {score}</p>
                        <p>Thời gian: {formatTime(timeSpent)}</p>
                        <button onClick={resetGame}>Chơi lại</button>
                    </div>
                </div>
            )}

            {/* 5-Button Controller */}
            <GameController
                onLeft={handleLeft}
                onRight={handleRight}
                onEnter={handleEnter}
                onBack={handleBack}
                onHint={handleHint}
                disabledButtons={{
                    enter: gameState === GAME_STATES.LOADING
                }}
            />

            {/* Save Button */}
            <div className="led-game-actions">
                <button
                    className="led-save-btn"
                    onClick={saveGame}
                    disabled={gameState === GAME_STATES.LOADING}
                >
                    💾 Lưu Game
                </button>
            </div>

            {/* Custom children (game-specific UI) */}
            {children}

            {/* Rating & Comments */}
            <GameRatingComment gameId={parseInt(gameId)} />
        </div>
    );
};

// Export for use in game components
export { GAME_STATES, LED_COLORS };
export default LEDGameContainer;
