import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Save, Trash2 } from 'lucide-react';
import api from '../../services/api';
import LEDMatrix, { LED_COLORS } from '../common/LEDMatrix';
import GameController from '../common/GameController';
import GameRatingComment from '../common/GameRatingComment';
import './DrawingBoard.css';

// Drawing colors palette
const COLORS = [
    LED_COLORS.CANDY_RED,
    LED_COLORS.CANDY_ORANGE,
    LED_COLORS.CANDY_YELLOW,
    LED_COLORS.CANDY_GREEN,
    LED_COLORS.CANDY_BLUE,
    LED_COLORS.CANDY_PURPLE,
    '#ffffff', // White
    LED_COLORS.PLAYER_1,
];

const BOARD_SIZE = 16;

const DrawingBoard = () => {
    const navigate = useNavigate();

    const [pixels, setPixels] = useState([]);
    const [cursor, setCursor] = useState({ row: 8, col: 8 });
    const [currentColor, setCurrentColor] = useState(0);
    const [isDrawing, setIsDrawing] = useState(false);
    const [timeSpent, setTimeSpent] = useState(0);
    const [showInstructions, setShowInstructions] = useState(true);

    // Initialize canvas
    useEffect(() => {
        const emptyCanvas = Array(BOARD_SIZE).fill(null).map(() =>
            Array(BOARD_SIZE).fill(null)
        );
        setPixels(emptyCanvas);
    }, []);

    // Timer
    useEffect(() => {
        const interval = setInterval(() => {
            setTimeSpent(prev => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Keyboard controls
    useEffect(() => {
        const handleKeyDown = (e) => {
            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    moveCursor(-1, 0);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    moveCursor(1, 0);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    moveCursor(0, -1);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    moveCursor(0, 1);
                    break;
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    togglePixel();
                    break;
                case 'c':
                case 'C':
                    e.preventDefault();
                    cycleColor();
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
    }, [cursor, currentColor, pixels]);

    const moveCursor = (dx, dy) => {
        setCursor(prev => ({
            row: Math.max(0, Math.min(BOARD_SIZE - 1, prev.row + dy)),
            col: Math.max(0, Math.min(BOARD_SIZE - 1, prev.col + dx))
        }));

        // If drawing mode is on, paint while moving
        if (isDrawing) {
            paintPixel();
        }
    };

    const togglePixel = () => {
        setPixels(prev => {
            const newPixels = prev.map(row => [...row]);
            if (newPixels[cursor.row][cursor.col] === COLORS[currentColor]) {
                newPixels[cursor.row][cursor.col] = null; // Erase
            } else {
                newPixels[cursor.row][cursor.col] = COLORS[currentColor];
            }
            return newPixels;
        });
    };

    const paintPixel = () => {
        setPixels(prev => {
            const newPixels = prev.map(row => [...row]);
            newPixels[cursor.row][cursor.col] = COLORS[currentColor];
            return newPixels;
        });
    };

    const cycleColor = () => {
        setCurrentColor(prev => (prev + 1) % COLORS.length);
    };

    const clearCanvas = () => {
        const emptyCanvas = Array(BOARD_SIZE).fill(null).map(() =>
            Array(BOARD_SIZE).fill(null)
        );
        setPixels(emptyCanvas);
    };

    // Controller handlers
    const handleLeft = () => moveCursor(-1, 0);
    const handleRight = () => moveCursor(1, 0);
    const handleEnter = () => togglePixel();
    const handleBack = () => navigate('/games');
    const handleHint = () => cycleColor();

    // Save artwork
    const saveArtwork = async () => {
        try {
            await api.post('/games/7/sessions', {
                state: { pixels },
                score: 0,
                time_spent: timeSpent
            });
            alert('Bức vẽ đã được lưu!');
        } catch (error) {
            console.error('Save error:', error);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="drawing-board led-drawing-board">
            <div className="game-header">
                <button className="back-btn" onClick={() => navigate('/games')}>
                    <ArrowLeft size={20} />
                    Quay lại
                </button>
                <h1>🎨 Bảng Vẽ Tự Do</h1>
                <div className="game-stats">
                    <span className="stat">⏱️ {formatTime(timeSpent)}</span>
                </div>
            </div>

            <div className="game-controls">
                <button className="control-btn" onClick={clearCanvas}>
                    <Trash2 size={18} />
                    Xóa tất cả
                </button>
                <button className="control-btn" onClick={saveArtwork}>
                    <Save size={18} />
                    Lưu
                </button>
                <button
                    className={`control-btn ${isDrawing ? 'active' : ''}`}
                    onClick={() => setIsDrawing(!isDrawing)}
                >
                    ✏️ {isDrawing ? 'Đang vẽ' : 'Bật vẽ'}
                </button>
            </div>

            {/* Color palette */}
            <div className="color-palette">
                <span>Màu hiện tại:</span>
                <div className="color-options">
                    {COLORS.map((color, index) => (
                        <button
                            key={index}
                            className={`color-btn ${index === currentColor ? 'selected' : ''}`}
                            style={{ backgroundColor: color }}
                            onClick={() => setCurrentColor(index)}
                        />
                    ))}
                </div>
                <small>(Nhấn H/Hint để đổi màu)</small>
            </div>

            <div className="game-status">
                <div className="status-message">
                    🎨 Di chuyển bằng ← ↑ → ↓, Enter để vẽ
                </div>
            </div>

            <div className="board-container">
                <LEDMatrix
                    pixels={pixels}
                    rows={BOARD_SIZE}
                    cols={BOARD_SIZE}
                    cursor={cursor}
                    dotSize="medium"
                    showBorder={true}
                />
            </div>

            <GameController
                onLeft={handleLeft}
                onRight={handleRight}
                onEnter={handleEnter}
                onBack={handleBack}
                onHint={handleHint}
                disabledButtons={{}}
            />

            {showInstructions && (
                <div className="game-instructions">
                    <h3>Hướng dẫn</h3>
                    <ul>
                        <li>← ↑ → ↓ để di chuyển cursor</li>
                        <li>Enter để vẽ/xóa pixel</li>
                        <li>H hoặc Hint để đổi màu</li>
                        <li>Bật "Đang vẽ" để vẽ khi di chuyển</li>
                    </ul>
                </div>
            )}

            <GameRatingComment gameId={7} />
        </div>
    );
};

export default DrawingBoard;
