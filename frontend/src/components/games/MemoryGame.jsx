import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Save, Eye, EyeOff, Lightbulb } from 'lucide-react';
import api from '../../services/api';
import GameController from '../common/GameController';
import GameRatingComment from '../common/GameRatingComment';
import './MemoryGame.css';

const CARD_SYMBOLS = ['🐶', '🐱', '🐰', '🦊', '🐻', '🐼', '🐨', '🦁', '🐸', '🐵', '🐔', '🦄'];

const MemoryGame = () => {
    const navigate = useNavigate();

    // Game config
    const [gridSize, setGridSize] = useState(4); // 4x4 = 16 cards = 8 pairs

    // Game state
    const [cards, setCards] = useState([]);
    const [flippedCards, setFlippedCards] = useState([]);
    const [matchedPairs, setMatchedPairs] = useState([]);
    const [moves, setMoves] = useState(0);
    const [isLocked, setIsLocked] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [timeSpent, setTimeSpent] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [cursor, setCursor] = useState(0);
    const [showInstructions, setShowInstructions] = useState(true);

    // Initialize game
    useEffect(() => {
        initializeGame();
    }, [gridSize]);

    // Timer
    useEffect(() => {
        if (!isPlaying || gameOver) return;
        const interval = setInterval(() => {
            setTimeSpent(prev => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [isPlaying, gameOver]);

    // Check game over
    useEffect(() => {
        const totalPairs = (gridSize * gridSize) / 2;
        if (matchedPairs.length === totalPairs && matchedPairs.length > 0) {
            setGameOver(true);
            setIsPlaying(false);
        }
    }, [matchedPairs, gridSize]);

    // Keyboard controls
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (isLocked || showPreview) return;

            const totalCards = gridSize * gridSize;

            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    setCursor(prev => Math.max(0, prev - 1));
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    setCursor(prev => Math.min(totalCards - 1, prev + 1));
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setCursor(prev => Math.max(0, prev - gridSize));
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    setCursor(prev => Math.min(totalCards - 1, prev + gridSize));
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (cards[cursor]) {
                        handleCardClick(cards[cursor].id);
                    }
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
    }, [cursor, gridSize, cards, isLocked, showPreview, navigate]);

    // Initialize game
    const initializeGame = useCallback(() => {
        const totalCards = gridSize * gridSize;
        const pairsNeeded = totalCards / 2;
        const symbols = CARD_SYMBOLS.slice(0, pairsNeeded);

        // Create pairs
        const cardPairs = [...symbols, ...symbols].map((symbol, index) => ({
            id: index,
            symbol,
            isFlipped: false,
            isMatched: false
        }));

        // Shuffle
        for (let i = cardPairs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cardPairs[i], cardPairs[j]] = [cardPairs[j], cardPairs[i]];
        }

        setCards(cardPairs);
        setFlippedCards([]);
        setMatchedPairs([]);
        setMoves(0);
        setTimeSpent(0);
        setGameOver(false);
        setIsPlaying(false);
        setShowPreview(false);
    }, [gridSize]);

    // Preview all cards
    const handlePreview = () => {
        setShowPreview(true);
        setTimeout(() => {
            setShowPreview(false);
            setIsPlaying(true);
        }, 3000);
    };

    // Handle card click
    const handleCardClick = (cardId) => {
        if (isLocked || gameOver || showPreview) return;
        if (!isPlaying) setIsPlaying(true);

        const card = cards.find(c => c.id === cardId);
        if (!card || card.isMatched || flippedCards.includes(cardId)) return;

        const newFlipped = [...flippedCards, cardId];
        setFlippedCards(newFlipped);

        if (newFlipped.length === 2) {
            setMoves(prev => prev + 1);
            setIsLocked(true);

            const [first, second] = newFlipped;
            const firstCard = cards.find(c => c.id === first);
            const secondCard = cards.find(c => c.id === second);

            if (firstCard.symbol === secondCard.symbol) {
                // Match found
                setMatchedPairs(prev => [...prev, firstCard.symbol]);
                setCards(prev => prev.map(c =>
                    c.id === first || c.id === second
                        ? { ...c, isMatched: true }
                        : c
                ));
                setFlippedCards([]);
                setIsLocked(false);
            } else {
                // No match - flip back after delay
                setTimeout(() => {
                    setFlippedCards([]);
                    setIsLocked(false);
                }, 1000);
            }
        }
    };

    // Calculate score
    const calculateScore = () => {
        const totalPairs = (gridSize * gridSize) / 2;
        const perfectMoves = totalPairs;
        const efficiency = Math.max(0, 100 - ((moves - perfectMoves) * 5));
        const timeBonus = Math.max(0, 300 - timeSpent);
        return Math.round((efficiency * 10) + timeBonus);
    };

    // Save game
    const saveGame = async () => {
        try {
            await api.post('/games/6/sessions', {
                state: { cards, matchedPairs, moves },
                score: calculateScore(),
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
        if (isLocked || showPreview) return;
        setCursor(prev => Math.max(0, prev - 1));
    };

    const handleControllerRight = () => {
        if (isLocked || showPreview) return;
        const totalCards = gridSize * gridSize;
        setCursor(prev => Math.min(totalCards - 1, prev + 1));
    };

    const handleControllerEnter = () => {
        if (isLocked || showPreview || gameOver) return;
        if (cards[cursor]) {
            handleCardClick(cards[cursor].id);
        }
    };

    const handleControllerBack = () => {
        navigate('/games');
    };

    const handleControllerHint = () => {
        setShowInstructions(prev => !prev);
    };

    return (
        <div className="memory-game">
            {/* Header */}
            <div className="game-header">
                <button className="back-btn" onClick={() => navigate('/games')}>
                    <ArrowLeft size={20} />
                    Quay lại
                </button>
                <h1>🧠 Cờ Trí Nhớ</h1>
                <div className="game-stats">
                    <span className="stat">🎯 {moves} lượt</span>
                    <span className="stat">⏱️ {formatTime(timeSpent)}</span>
                </div>
            </div>

            {/* Controls */}
            <div className="game-controls">
                <div className="size-selector">
                    <label>Kích thước:</label>
                    <select value={gridSize} onChange={(e) => setGridSize(Number(e.target.value))} disabled={isPlaying && !gameOver}>
                        <option value={4}>4×4 (8 cặp)</option>
                        <option value={6}>6×6 (18 cặp)</option>
                    </select>
                </div>
                <div className="control-buttons">
                    <button className="control-btn" onClick={handlePreview} disabled={isPlaying || showPreview}>
                        <Eye size={18} />
                        Xem trước
                    </button>
                    <button className="control-btn" onClick={initializeGame}>
                        <RotateCcw size={18} />
                        Chơi lại
                    </button>
                    <button className="control-btn" onClick={saveGame} disabled={isLocked}>
                        <Save size={18} />
                        Lưu
                    </button>
                </div>
            </div>

            {/* Game status */}
            <div className="game-status">
                {gameOver ? (
                    <div className="status-message win">
                        🎉 Chúc mừng! Bạn đã hoàn thành với {moves} lượt - Điểm: {calculateScore()}
                    </div>
                ) : showPreview ? (
                    <div className="status-message">
                        👀 Ghi nhớ vị trí các thẻ...
                    </div>
                ) : (
                    <div className="status-message">
                        {matchedPairs.length}/{(gridSize * gridSize) / 2} cặp đã tìm được
                    </div>
                )}
            </div>

            {/* Game board */}
            <div className="board-container">
                <div
                    className="game-board memory-board"
                    style={{
                        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                        gridTemplateRows: `repeat(${gridSize}, 1fr)`
                    }}
                >
                    {cards.map((card, index) => {
                        const isFlipped = flippedCards.includes(card.id) || card.isMatched || showPreview;
                        const isCursor = cursor === index;

                        return (
                            <div
                                key={card.id}
                                className={`memory-card ${isFlipped ? 'flipped' : ''} ${card.isMatched ? 'matched' : ''} ${isCursor ? 'cursor' : ''}`}
                                onClick={() => handleCardClick(card.id)}
                            >
                                <div className="card-inner">
                                    <div className="card-front">❓</div>
                                    <div className="card-back">{card.symbol}</div>
                                </div>
                            </div>
                        );
                    })}
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
                    left: isLocked || showPreview,
                    right: isLocked || showPreview,
                    enter: isLocked || showPreview || gameOver,
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
                        <li>Nhấn Enter để lật thẻ</li>
                        <li>Tìm 2 thẻ có hình giống nhau</li>
                        <li>Cố gắng hoàn thành với ít lượt nhất</li>
                        <li>Nhấn Esc để quay lại, H để ẩn/hiện hướng dẫn</li>
                    </ul>
                </div>
            )}

            {/* Rating & Comments */}
            <GameRatingComment gameId={6} />
        </div>
    );
};

export default MemoryGame;
