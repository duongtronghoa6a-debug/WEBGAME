import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Play, Clock, Users } from 'lucide-react';
import api from '../services/api';
import './Games.css';

// Game emojis mapping
const gameEmojis = {
    caro: '🎯',
    tictactoe: '⭕',
    snake: '🐍',
    match3: '🍬',
    memory: '🧠',
    drawing: '🎨',
    tetris: '🧱',
    doodlejump: '🦘',
    arkanoid: '🧱',
    minesweeper: '💣',
    fifteenpuzzle: '🔢',
    racing: '🏎️',
    xonix: '⬜',
    mahjong: '🀄',
    chess: '♟️',
    asteroids: '☄️'
};

const Games = () => {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchGames();
    }, []);

    const fetchGames = async () => {
        try {
            const res = await api.get('/games');
            setGames(res.data.data || []);
        } catch (err) {
            setError('Không thể tải danh sách games');
            // Use demo data if API fails
            setGames(getDemoGames());
        } finally {
            setLoading(false);
        }
    };

    const getDemoGames = () => [
        { id: 1, name: 'Caro Hàng 5', type: 'caro', stats: { total_plays: 150, avg_rating: '4.8' } },
        { id: 2, name: 'Caro Hàng 4', type: 'caro', stats: { total_plays: 80, avg_rating: '4.5' } },
        { id: 3, name: 'Tic-Tac-Toe', type: 'tictactoe', stats: { total_plays: 200, avg_rating: '4.2' } },
        { id: 4, name: 'Rắn Săn Mồi', type: 'snake', stats: { total_plays: 320, avg_rating: '4.7' } },
        { id: 5, name: 'Ghép Hàng 3', type: 'match3', stats: { total_plays: 180, avg_rating: '4.6' } },
        { id: 6, name: 'Cờ Trí Nhớ', type: 'memory', stats: { total_plays: 90, avg_rating: '4.4' } },
        { id: 7, name: 'Bảng Vẽ Tự Do', type: 'drawing', stats: { total_plays: 60, avg_rating: '4.3' } },
        { id: 8, name: 'Tetris', type: 'tetris', stats: { total_plays: 250, avg_rating: '4.9' } },
    ];

    if (loading) {
        return (
            <div className="games-loading">
                <div className="spinner"></div>
                <p>Đang tải games...</p>
            </div>
        );
    }

    return (
        <div className="games-page">
            <div className="games-header">
                <h1>🎮 Danh sách Games</h1>
                <p>Chọn game yêu thích và bắt đầu chơi!</p>
            </div>

            {error && <div className="games-error">{error}</div>}

            <div className="games-grid">
                {games.map((game) => (
                    <Link to={`/play/${game.id}`} key={game.id} className="game-card">
                        <div className="game-emoji">
                            {gameEmojis[game.type] || '🎲'}
                        </div>
                        <div className="game-info">
                            <h3>{game.name}</h3>
                            <div className="game-stats">
                                <span>
                                    <Star size={14} />
                                    {game.stats?.avg_rating || '0.0'}
                                </span>
                                <span>
                                    <Play size={14} />
                                    {game.stats?.total_plays || 0}
                                </span>
                            </div>
                        </div>
                        <div className="game-play-btn">
                            <Play size={24} />
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Games;
