import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import LEDMatrix, { GAME_ICONS, LED_COLORS } from '../common/LEDMatrix';
import GameController from '../common/GameController';
import api from '../../services/api';
import './LEDGameMenu.css';

/**
 * LED Game Menu - Hiển thị menu chọn game trên LED Matrix
 * Navigate bằng Left/Right, chọn bằng Enter
 */

const GAMES = [
    { id: 1, name: 'Caro Hàng 5', type: 'caro', icon: 'caro' },
    { id: 2, name: 'Caro Hàng 4', type: 'caro', icon: 'caro' },
    { id: 3, name: 'Tic-Tac-Toe', type: 'tictactoe', icon: 'caro' },
    { id: 4, name: 'Rắn Săn Mồi', type: 'snake', icon: 'snake' },
    { id: 5, name: 'Ghép Hàng 3', type: 'match3', icon: 'match3' },
    { id: 6, name: 'Cờ Trí Nhớ', type: 'memory', icon: 'memory' },
    { id: 7, name: 'Bảng Vẽ', type: 'drawing', icon: 'drawing' },
    { id: 8, name: 'Tetris', type: 'tetris', icon: 'tetris' },
    { id: 9, name: '2048', type: '2048', icon: 'game2048' },
    { id: 10, name: 'Dò Mìn', type: 'minesweeper', icon: 'minesweeper' },
];

const MATRIX_SIZE = 15; // 15x15 display

const LEDGameMenu = () => {
    const navigate = useNavigate();
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [pixels, setPixels] = useState([]);
    const [isAnimating, setIsAnimating] = useState(false);
    const [apiGames, setApiGames] = useState([]);

    // Fetch games from API
    useEffect(() => {
        const fetchGames = async () => {
            try {
                const res = await api.get('/games');
                if (res.data.success) {
                    setApiGames(res.data.data || []);
                }
            } catch (error) {
                console.log('Using default game list');
            }
        };
        fetchGames();
    }, []);

    // Merge API games with default games
    const games = apiGames.length > 0
        ? GAMES.map(g => {
            const apiGame = apiGames.find(ag => ag.id === g.id);
            return apiGame ? { ...g, ...apiGame, enabled: apiGame.is_enabled !== false } : g;
        }).filter(g => g.enabled !== false)
        : GAMES;

    // Generate LED matrix pixels from current game icon
    const generatePixels = useCallback((gameIndex) => {
        const newPixels = Array(MATRIX_SIZE).fill(null).map(() =>
            Array(MATRIX_SIZE).fill(null)
        );

        const game = games[gameIndex];
        if (!game) return newPixels;

        const icon = GAME_ICONS[game.icon] || GAME_ICONS.caro;
        const iconSize = icon.length;

        // Center the 5x5 icon in the 15x15 matrix, scaled 2x
        const startRow = Math.floor((MATRIX_SIZE - iconSize * 2) / 2);
        const startCol = Math.floor((MATRIX_SIZE - iconSize * 2) / 2);

        // Scale icon 2x
        for (let r = 0; r < iconSize; r++) {
            for (let c = 0; c < iconSize; c++) {
                const color = icon[r][c];
                if (color) {
                    // 2x2 block for each pixel
                    newPixels[startRow + r * 2][startCol + c * 2] = color;
                    newPixels[startRow + r * 2][startCol + c * 2 + 1] = color;
                    newPixels[startRow + r * 2 + 1][startCol + c * 2] = color;
                    newPixels[startRow + r * 2 + 1][startCol + c * 2 + 1] = color;
                }
            }
        }

        // Add navigation indicators (arrows) at sides
        // Left arrow if not first
        if (gameIndex > 0) {
            newPixels[7][1] = LED_COLORS.CURSOR;
            newPixels[6][2] = LED_COLORS.CURSOR;
            newPixels[7][2] = LED_COLORS.CURSOR;
            newPixels[8][2] = LED_COLORS.CURSOR;
        }

        // Right arrow if not last
        if (gameIndex < games.length - 1) {
            newPixels[7][13] = LED_COLORS.CURSOR;
            newPixels[6][12] = LED_COLORS.CURSOR;
            newPixels[7][12] = LED_COLORS.CURSOR;
            newPixels[8][12] = LED_COLORS.CURSOR;
        }

        // Game index indicator at bottom
        for (let i = 0; i < games.length && i < 10; i++) {
            const dotCol = Math.floor((MATRIX_SIZE - games.length) / 2) + i;
            newPixels[13][dotCol] = i === gameIndex
                ? LED_COLORS.WINNING
                : LED_COLORS.EMPTY;
        }

        return newPixels;
    }, [games]);

    // Update pixels when selection changes
    useEffect(() => {
        if (!isAnimating) {
            setPixels(generatePixels(selectedIndex));
        }
    }, [selectedIndex, generatePixels, isAnimating]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (isAnimating) return;

            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    handleLeft();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    handleRight();
                    break;
                case 'Enter':
                    e.preventDefault();
                    handleEnter();
                    break;
                case 'Escape':
                    e.preventDefault();
                    handleBack();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedIndex, isAnimating, games.length]);

    // Navigation handlers
    const handleLeft = () => {
        if (selectedIndex > 0) {
            setIsAnimating(true);
            setSelectedIndex(prev => prev - 1);
            setTimeout(() => setIsAnimating(false), 150);
        }
    };

    const handleRight = () => {
        if (selectedIndex < games.length - 1) {
            setIsAnimating(true);
            setSelectedIndex(prev => prev + 1);
            setTimeout(() => setIsAnimating(false), 150);
        }
    };

    const handleEnter = () => {
        const game = games[selectedIndex];
        if (game) {
            navigate(`/play/${game.id}`);
        }
    };

    const handleBack = () => {
        navigate('/');
    };

    const handleHint = () => {
        // Show game info or instructions
        const game = games[selectedIndex];
        if (game) {
            alert(`${game.name}\n\nNhấn Enter để chơi\nDùng ← → để chọn game khác`);
        }
    };

    const currentGame = games[selectedIndex];

    return (
        <div className="led-game-menu">
            <div className="menu-header">
                <h1>🎮 Chọn Game</h1>
                <p className="menu-subtitle">
                    Dùng ← → để chọn, Enter để chơi
                </p>
            </div>

            <div className="led-display-container">
                <LEDMatrix
                    pixels={pixels}
                    rows={MATRIX_SIZE}
                    cols={MATRIX_SIZE}
                    dotSize="medium"
                    showBorder={true}
                />
            </div>

            <div className="current-game-info">
                <h2 className="game-title">{currentGame?.name || 'Loading...'}</h2>
                <p className="game-index">
                    {selectedIndex + 1} / {games.length}
                </p>
            </div>

            <GameController
                onLeft={handleLeft}
                onRight={handleRight}
                onEnter={handleEnter}
                onBack={handleBack}
                onHint={handleHint}
                disabledButtons={{
                    left: selectedIndex === 0,
                    right: selectedIndex === games.length - 1
                }}
            />

            <div className="menu-instructions">
                <small>
                    ⌨️ Phím tắt: ← → để chọn | Enter để chơi | Esc để quay lại
                </small>
            </div>
        </div>
    );
};

export default LEDGameMenu;
