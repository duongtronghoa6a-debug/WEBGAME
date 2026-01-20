import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import LEDMatrix, { GAME_ICONS, LED_COLORS } from '../common/LEDMatrix';
import GameController from '../common/GameController';
import api from '../../services/api';
import './LEDGameMenu.css';

/**
 * LED Game Menu - Hiển thị menu chọn game trên LED Matrix
 * Navigate bằng Left/Right, chọn bằng Enter
 */

const DEFAULT_GAMES = [
    { id: 1, name: 'Caro Hàng 5', type: 'caro', icon: 'caro' },
    { id: 2, name: 'Caro Hàng 4', type: 'caro', icon: 'caro' },
    { id: 3, name: 'Tic-Tac-Toe', type: 'tictactoe', icon: 'caro' },
    { id: 4, name: 'Rắn Săn Mồi', type: 'snake', icon: 'snake' },
    { id: 5, name: 'Ghép Hàng 3', type: 'match3', icon: 'match3' },
    { id: 6, name: 'Cờ Trí Nhớ', type: 'memory', icon: 'memory' },
    { id: 7, name: 'Bảng Vẽ', type: 'drawing', icon: 'drawing' },
    { id: 8, name: 'Tetris', type: 'tetris', icon: 'tetris' },
];

const MATRIX_SIZE = 15;

const LEDGameMenu = () => {
    const navigate = useNavigate();
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [pixels, setPixels] = useState([]);
    const [isAnimating, setIsAnimating] = useState(false);
    const [apiGames, setApiGames] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isNavigating, setIsNavigating] = useState(false);

    // Fetch games from API
    useEffect(() => {
        const fetchGames = async () => {
            setIsLoading(true);
            try {
                const res = await api.get('/games');
                if (res.data.success) {
                    setApiGames(res.data.data || []);
                }
            } catch (error) {
                console.log('Using default game list');
            } finally {
                setIsLoading(false);
            }
        };
        fetchGames();
    }, []);

    // Merge API games with default games - memoized to prevent recalculation
    const games = useMemo(() => {
        if (apiGames.length > 0) {
            return DEFAULT_GAMES.map(g => {
                const apiGame = apiGames.find(ag => ag.id === g.id);
                return apiGame ? { ...g, ...apiGame, enabled: apiGame.is_enabled !== false } : g;
            }).filter(g => g.enabled !== false);
        }
        return DEFAULT_GAMES;
    }, [apiGames]);

    // Generate LED matrix pixels from current game icon
    const generatePixels = useCallback((gameIndex, gameList) => {
        const newPixels = Array(MATRIX_SIZE).fill(null).map(() =>
            Array(MATRIX_SIZE).fill(null)
        );

        const game = gameList[gameIndex];
        if (!game) return newPixels;

        const icon = GAME_ICONS[game.icon] || GAME_ICONS.caro;
        const iconSize = icon.length;

        const startRow = Math.floor((MATRIX_SIZE - iconSize * 2) / 2);
        const startCol = Math.floor((MATRIX_SIZE - iconSize * 2) / 2);

        // Scale icon 2x
        for (let r = 0; r < iconSize; r++) {
            for (let c = 0; c < iconSize; c++) {
                const color = icon[r][c];
                if (color) {
                    newPixels[startRow + r * 2][startCol + c * 2] = color;
                    newPixels[startRow + r * 2][startCol + c * 2 + 1] = color;
                    newPixels[startRow + r * 2 + 1][startCol + c * 2] = color;
                    newPixels[startRow + r * 2 + 1][startCol + c * 2 + 1] = color;
                }
            }
        }

        // Left arrow if not first
        if (gameIndex > 0) {
            newPixels[7][1] = LED_COLORS.CURSOR;
            newPixels[6][2] = LED_COLORS.CURSOR;
            newPixels[7][2] = LED_COLORS.CURSOR;
            newPixels[8][2] = LED_COLORS.CURSOR;
        }

        // Right arrow if not last
        if (gameIndex < gameList.length - 1) {
            newPixels[7][13] = LED_COLORS.CURSOR;
            newPixels[6][12] = LED_COLORS.CURSOR;
            newPixels[7][12] = LED_COLORS.CURSOR;
            newPixels[8][12] = LED_COLORS.CURSOR;
        }

        // Game index indicator at bottom
        const indicatorCount = Math.min(gameList.length, 10);
        for (let i = 0; i < indicatorCount; i++) {
            const dotCol = Math.floor((MATRIX_SIZE - indicatorCount) / 2) + i;
            newPixels[13][dotCol] = i === gameIndex
                ? LED_COLORS.WINNING
                : LED_COLORS.EMPTY;
        }

        return newPixels;
    }, []);

    // Update pixels when selection changes - fixed dependencies
    useEffect(() => {
        if (!isAnimating && games.length > 0) {
            setPixels(generatePixels(selectedIndex, games));
        }
    }, [selectedIndex, games, isAnimating, generatePixels]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (isAnimating || isNavigating) return;

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
    }, [selectedIndex, isAnimating, isNavigating, games.length]);

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
        if (game && !isNavigating) {
            setIsNavigating(true);
            navigate(`/play/${game.id}`);
        }
    };

    const handleBack = () => {
        navigate('/');
    };

    const handleHint = () => {
        const game = games[selectedIndex];
        if (game) {
            alert(`${game.name}\n\nNhấn Enter để chơi\nDùng ← → để chọn game khác`);
        }
    };

    const currentGame = games[selectedIndex];

    // Loading state
    if (isLoading) {
        return (
            <div className="led-game-menu">
                <div className="menu-header">
                    <h1>🎮 Chọn Game</h1>
                </div>
                <div className="led-loading">
                    <div className="loading-spinner"></div>
                    <p>Đang tải danh sách game...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="led-game-menu">
            <div className="menu-header">
                <h1>🎮 Chọn Game</h1>
                <p className="menu-subtitle">
                    Dùng ← → để chọn, Enter để chơi
                </p>
            </div>

            <div className="led-display-container">
                {isNavigating ? (
                    <div className="led-navigating">
                        <div className="loading-spinner"></div>
                        <p>Đang tải game...</p>
                    </div>
                ) : (
                    <LEDMatrix
                        pixels={pixels}
                        rows={MATRIX_SIZE}
                        cols={MATRIX_SIZE}
                        dotSize="medium"
                        showBorder={true}
                    />
                )}
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
                    left: selectedIndex === 0 || isNavigating,
                    right: selectedIndex === games.length - 1 || isNavigating,
                    enter: isNavigating
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
