import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Trash2, Eraser } from 'lucide-react';
import api from '../../services/api';
import LEDMatrix, { LED_COLORS } from '../common/LEDMatrix';
import GameController from '../common/GameController';
import ExitDialog from '../common/ExitDialog';
import GameRatingComment from '../common/GameRatingComment';
import './DrawingBoard.css';

// Drawing colors palette - includes eraser as first item
const COLORS = [
    null, // Eraser (background color)
    LED_COLORS.CANDY_RED,
    LED_COLORS.CANDY_ORANGE,
    LED_COLORS.CANDY_YELLOW,
    LED_COLORS.CANDY_GREEN,
    LED_COLORS.CANDY_BLUE,
    LED_COLORS.CANDY_PURPLE,
    '#ffffff', // White
    LED_COLORS.PLAYER_1,
];

// Color names for display
const COLOR_NAMES = [
    'Tẩy',
    'Đỏ',
    'Cam',
    'Vàng',
    'Xanh lá',
    'Xanh dương',
    'Tím',
    'Trắng',
    'Hồng',
];

const BOARD_SIZE = 16;

const DrawingBoard = () => {
    const navigate = useNavigate();

    const [pixels, setPixels] = useState([]);
    const [cursor, setCursor] = useState({ row: 8, col: 8 });
    const [currentColor, setCurrentColor] = useState(1); // Start with red, not eraser
    const [isDrawing, setIsDrawing] = useState(false);
    const [timeSpent, setTimeSpent] = useState(0);
    const [showInstructions, setShowInstructions] = useState(true);
    const [showExitDialog, setShowExitDialog] = useState(false);
    const [loadedFromSave, setLoadedFromSave] = useState(false);

    // Load saved artwork on mount OR initialize empty canvas
    useEffect(() => {
        const loadSavedGame = async () => {
            try {
                const res = await api.get('/games/sessions?completed=false');
                if (res.data.success && res.data.data && res.data.data.length > 0) {
                    const saved = res.data.data.find(s => s.game_id === 7);
                    if (saved && saved.state && saved.state.pixels) {
                        setPixels(saved.state.pixels);
                        if (saved.state.currentColor !== undefined) {
                            setCurrentColor(saved.state.currentColor);
                        }
                        if (saved.state.cursor) {
                            setCursor(saved.state.cursor);
                        }
                        setLoadedFromSave(true);
                        return;
                    }
                }
            } catch (error) {
                console.error('Load saved artwork error:', error);
            }
            // Initialize empty canvas if no saved data
            const emptyCanvas = Array(BOARD_SIZE).fill(null).map(() =>
                Array(BOARD_SIZE).fill(null)
            );
            setPixels(emptyCanvas);
        };
        loadSavedGame();
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
            // Block keyboard when exit dialog is open
            if (showExitDialog) return;

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
                    paintOrErase();
                    break;
                case 'c':
                case 'C':
                    e.preventDefault();
                    cycleColor();
                    break;
                case 'Escape':
                    e.preventDefault();
                    // Check if canvas has any content
                    const hasContent = pixels.some(row => row.some(cell => cell !== null));
                    if (hasContent) {
                        setShowExitDialog(true);
                    } else {
                        navigate('/games');
                    }
                    break;
                case 'h':
                case 'H':
                    e.preventDefault();
                    cycleColor();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [cursor, currentColor, pixels, isDrawing, showExitDialog, navigate]);

    const moveCursor = (dx, dy) => {
        setCursor(prev => ({
            row: Math.max(0, Math.min(BOARD_SIZE - 1, prev.row + dy)),
            col: Math.max(0, Math.min(BOARD_SIZE - 1, prev.col + dx))
        }));

        // If drawing mode is on, paint while moving
        if (isDrawing) {
            paintOrErase();
        }
    };

    const paintOrErase = () => {
        setPixels(prev => {
            const newPixels = prev.map(row => [...row]);
            // If eraser selected (index 0), set to null
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
    const handleEnter = () => paintOrErase();
    const handleBack = () => {
        // Check if canvas has any content
        const hasContent = pixels.some(row => row.some(cell => cell !== null));
        if (hasContent) {
            setShowExitDialog(true);
        } else {
            navigate('/games');
        }
    };
    const handleHint = () => cycleColor();

    // Save artwork and exit
    const saveArtworkAndExit = async () => {
        try {
            await api.post('/games/7/sessions', {
                state: { pixels, currentColor, cursor },
                score: 0,
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

    // Get current cursor color for highlight
    const getCursorColor = () => {
        if (currentColor === 0) {
            return '#888888'; // Gray for eraser
        }
        return COLORS[currentColor] || '#ffd93d';
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

            <div className="game-controls drawing-toolbar">
                <button className="control-btn" onClick={clearCanvas}>
                    <Trash2 size={18} />
                    Xóa tất cả
                </button>

                {/* Color palette - horizontal */}
                <div className="color-palette-inline">
                    <span className="color-label">Màu: <strong>{COLOR_NAMES[currentColor]}</strong></span>
                    <div className="color-options-horizontal">
                        {COLORS.map((color, index) => (
                            <button
                                key={index}
                                className={`color-btn ${index === currentColor ? 'selected' : ''} ${index === 0 ? 'eraser-btn' : ''}`}
                                style={{ backgroundColor: color || '#2d2d44' }}
                                onClick={() => setCurrentColor(index)}
                                title={COLOR_NAMES[index]}
                            >
                                {index === 0 && <Eraser size={14} />}
                            </button>
                        ))}
                    </div>
                    <small className="hint-text">(Nhấn H để đổi màu)</small>
                </div>
            </div>

            <div className="game-status">
                <div className="status-message">
                    🎨 Di chuyển: ← ↑ → ↓ | Vẽ: Enter | Đổi màu: H
                </div>
            </div>

            <div className="board-container">
                <LEDMatrix
                    pixels={pixels}
                    rows={BOARD_SIZE}
                    cols={BOARD_SIZE}
                    cursor={cursor}
                    cursorColor={getCursorColor()}
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
                        <li>Enter để vẽ hoặc xóa</li>
                        <li>H để đổi màu (cursor sẽ đổi màu theo)</li>
                        <li>Chọn Tẩy (🧹) để xóa pixel</li>
                        <li>Bật "Đang vẽ" để vẽ khi di chuyển</li>
                    </ul>
                </div>
            )}

            <GameRatingComment gameId={7} />

            {/* Exit Dialog */}
            <ExitDialog
                isOpen={showExitDialog}
                onSave={saveArtworkAndExit}
                onDiscard={discardAndExit}
                onCancel={() => setShowExitDialog(false)}
                gameName="Bảng Vẽ"
            />
        </div>
    );
};

export default DrawingBoard;
