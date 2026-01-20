import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import api from '../../services/api';
import LEDMatrix, { LED_COLORS } from '../common/LEDMatrix';
import GameController from '../common/GameController';
import ExitDialog from '../common/ExitDialog';
import GameRatingComment from '../common/GameRatingComment';
import './MemoryGame.css';

// Card colors for memory pairs
const CARD_COLORS = [
    LED_COLORS.CANDY_RED,
    LED_COLORS.CANDY_ORANGE,
    LED_COLORS.CANDY_YELLOW,
    LED_COLORS.CANDY_GREEN,
    LED_COLORS.CANDY_BLUE,
    LED_COLORS.CANDY_PURPLE,
    LED_COLORS.PLAYER_1,
    LED_COLORS.PLAYER_2
];

const BOARD_SIZE = 4; // 4x4 = 16 cards = 8 pairs

const MemoryGame = () => {
    const navigate = useNavigate();

    const [cards, setCards] = useState([]);
    const [flippedCards, setFlippedCards] = useState([]);
    const [matchedPairs, setMatchedPairs] = useState([]);
    const [moves, setMoves] = useState(0);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [isChecking, setIsChecking] = useState(false);
    const [timeSpent, setTimeSpent] = useState(0);
    const [cursor, setCursor] = useState({ row: 0, col: 0 });
    const [showInstructions, setShowInstructions] = useState(true);
    const [pixels, setPixels] = useState([]);
    const [showExitDialog, setShowExitDialog] = useState(false);

    // Initialize game
    useEffect(() => {
        initializeGame();
    }, []);

    // Convert cards to LED pixels
    useEffect(() => {
        const newPixels = Array(BOARD_SIZE).fill(null).map(() =>
            Array(BOARD_SIZE).fill(null)
        );

        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                const cardIndex = r * BOARD_SIZE + c;
                const card = cards[cardIndex];

                if (card !== undefined) {
                    const isFlipped = flippedCards.includes(cardIndex);
                    const isMatched = matchedPairs.includes(card);

                    if (isFlipped || isMatched) {
                        // Show card color
                        newPixels[r][c] = CARD_COLORS[card % CARD_COLORS.length];
                    } else {
                        // Card back - dim color
                        newPixels[r][c] = LED_COLORS.CARD_BACK;
                    }
                }
            }
        }

        setPixels(newPixels);
    }, [cards, flippedCards, matchedPairs]);

    // Timer
    useEffect(() => {
        if (gameOver) return;
        const interval = setInterval(() => {
            setTimeSpent(prev => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [gameOver]);

    // Keyboard controls
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Block keyboard when exit dialog is open
            if (showExitDialog) return;
            if (isChecking || gameOver) return;

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
                    handleCardFlip(cursor.row * BOARD_SIZE + cursor.col);
                    break;
                case 'Escape':
                    e.preventDefault();
                    if (!gameOver) {
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
    }, [cursor, isChecking, gameOver, navigate, flippedCards, matchedPairs, showExitDialog]);

    // Initialize game
    const initializeGame = useCallback(() => {
        // Create pairs of cards
        const pairs = [];
        for (let i = 0; i < (BOARD_SIZE * BOARD_SIZE) / 2; i++) {
            pairs.push(i, i);
        }
        // Shuffle
        for (let i = pairs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
        }

        setCards(pairs);
        setFlippedCards([]);
        setMatchedPairs([]);
        setMoves(0);
        setScore(0);
        setGameOver(false);
        setTimeSpent(0);
        setCursor({ row: 0, col: 0 });
    }, []);

    // Handle card flip
    const handleCardFlip = useCallback((index) => {
        if (isChecking || flippedCards.length >= 2) return;
        if (flippedCards.includes(index)) return;
        if (matchedPairs.includes(cards[index])) return;

        const newFlipped = [...flippedCards, index];
        setFlippedCards(newFlipped);

        if (newFlipped.length === 2) {
            setMoves(prev => prev + 1);
            setIsChecking(true);

            const [first, second] = newFlipped;
            if (cards[first] === cards[second]) {
                // Match!
                setTimeout(() => {
                    setMatchedPairs(prev => [...prev, cards[first]]);
                    setScore(prev => prev + 100);
                    setFlippedCards([]);
                    setIsChecking(false);

                    // Check win
                    if (matchedPairs.length + 1 === (BOARD_SIZE * BOARD_SIZE) / 2) {
                        setGameOver(true);
                        setScore(prev => prev + Math.max(0, 500 - timeSpent));
                    }
                }, 500);
            } else {
                // No match
                setTimeout(() => {
                    setFlippedCards([]);
                    setIsChecking(false);
                }, 1000);
            }
        }
    }, [isChecking, flippedCards, matchedPairs, cards, timeSpent]);

    // Save game and exit
    const saveGameAndExit = async () => {
        try {
            await api.post('/games/6/sessions', {
                state: { cards, matchedPairs, moves, score },
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
    const handleEnter = () => handleCardFlip(cursor.row * BOARD_SIZE + cursor.col);
    const handleBack = () => {
        if (!gameOver) {
            setShowExitDialog(true);
        } else {
            navigate('/games');
        }
    };
    const handleHint = () => setShowInstructions(prev => !prev);

    const allMatched = matchedPairs.length === (BOARD_SIZE * BOARD_SIZE) / 2;

    return (
        <div className="memory-game led-memory-game">
            <div className="game-header">
                <button className="back-btn" onClick={() => navigate('/games')}>
                    <ArrowLeft size={20} />
                    Quay lại
                </button>
                <h1>🧠 Cờ Trí Nhớ</h1>
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
            </div>

            <div className="game-status">
                {allMatched ? (
                    <div className="status-message win">
                        🎉 Chúc mừng! Điểm: {score}
                    </div>
                ) : (
                    <div className="status-message">
                        ⏱️ {formatTime(timeSpent)} | Tìm {(BOARD_SIZE * BOARD_SIZE) / 2 - matchedPairs.length} cặp còn lại
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
                    enter: isChecking || allMatched,
                    back: false,
                    hint: false
                }}
            />

            {showInstructions && (
                <div className="game-instructions">
                    <h3>Hướng dẫn</h3>
                    <ul>
                        <li>Dùng ← ↑ → ↓ để di chuyển cursor</li>
                        <li>Nhấn Enter để lật thẻ</li>
                        <li>Tìm các cặp thẻ cùng màu</li>
                        <li>Hoàn thành nhanh để được điểm thưởng</li>
                    </ul>
                </div>
            )}

            <GameRatingComment gameId={6} />

            {/* Exit Dialog */}
            <ExitDialog
                isOpen={showExitDialog}
                onSave={saveGameAndExit}
                onDiscard={discardAndExit}
                onCancel={() => setShowExitDialog(false)}
                gameName="Cờ Trí Nhớ"
            />
        </div>
    );
};

export default MemoryGame;
