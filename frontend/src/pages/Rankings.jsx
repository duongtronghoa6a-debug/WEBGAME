import { useState, useEffect } from 'react';
import { Trophy, Medal, Star, Gamepad2, Clock, Target } from 'lucide-react';
import api from '../services/api';
import Pagination from '../components/common/Pagination';
import './Rankings.css';

const Rankings = () => {
    const [rankings, setRankings] = useState([]);
    const [selectedGame, setSelectedGame] = useState('all');
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchGames();
        fetchRankings();
    }, [selectedGame]);

    const fetchGames = async () => {
        try {
            const res = await api.get('/games');
            setGames(res.data.data || []);
        } catch (error) {
            console.error('Error fetching games:', error);
            setGames([
                { id: 1, name: 'Caro Hàng 5' },
                { id: 4, name: 'Rắn Săn Mồi' },
                { id: 5, name: 'Ghép Hàng 3' },
                { id: 6, name: 'Cờ Trí Nhớ' },
            ]);
        }
    };

    const fetchRankings = async () => {
        try {
            const url = selectedGame === 'all'
                ? '/rankings'
                : `/rankings?game_id=${selectedGame}`;
            const res = await api.get(url);
            setRankings(res.data.data || []);
        } catch (error) {
            console.error('Error fetching rankings:', error);
            // Demo rankings
            setRankings([
                { rank: 1, username: 'pro_gamer', total_score: 15000, games_played: 50, avg_score: 300 },
                { rank: 2, username: 'player1', total_score: 12500, games_played: 45, avg_score: 278 },
                { rank: 3, username: 'caro_master', total_score: 10800, games_played: 40, avg_score: 270 },
                { rank: 4, username: 'snake_king', total_score: 9500, games_played: 38, avg_score: 250 },
                { rank: 5, username: 'memory_pro', total_score: 8200, games_played: 35, avg_score: 234 },
                { rank: 6, username: 'gamer_123', total_score: 7500, games_played: 30, avg_score: 250 },
                { rank: 7, username: 'newbie_player', total_score: 5000, games_played: 25, avg_score: 200 },
                { rank: 8, username: 'casual_gamer', total_score: 4200, games_played: 20, avg_score: 210 },
                { rank: 9, username: 'fun_player', total_score: 3500, games_played: 18, avg_score: 194 },
                { rank: 10, username: 'beginner', total_score: 2000, games_played: 15, avg_score: 133 },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const getRankIcon = (rank) => {
        switch (rank) {
            case 1: return <Trophy className="gold" size={24} />;
            case 2: return <Medal className="silver" size={24} />;
            case 3: return <Medal className="bronze" size={24} />;
            default: return <span className="rank-number">{rank}</span>;
        }
    };

    const getRankClass = (rank) => {
        if (rank === 1) return 'first';
        if (rank === 2) return 'second';
        if (rank === 3) return 'third';
        return '';
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Đang tải bảng xếp hạng...</p>
            </div>
        );
    }

    return (
        <div className="rankings-page">
            <div className="page-header">
                <h1>🏆 Bảng Xếp Hạng</h1>
                <p>Top người chơi xuất sắc nhất</p>
            </div>

            {/* Filter */}
            <div className="filter-section">
                <label>Lọc theo game:</label>
                <select value={selectedGame} onChange={(e) => setSelectedGame(e.target.value)}>
                    <option value="all">Tất cả games</option>
                    {games.map(game => (
                        <option key={game.id} value={game.id}>{game.name}</option>
                    ))}
                </select>
            </div>

            {/* Stats Cards */}
            <div className="stats-cards">
                <div className="stat-card">
                    <Gamepad2 size={24} />
                    <div className="stat-info">
                        <span className="stat-value">{rankings.length}</span>
                        <span className="stat-label">Người chơi</span>
                    </div>
                </div>
                <div className="stat-card">
                    <Target size={24} />
                    <div className="stat-info">
                        <span className="stat-value">{rankings.reduce((a, b) => a + b.games_played, 0)}</span>
                        <span className="stat-label">Tổng games</span>
                    </div>
                </div>
                <div className="stat-card">
                    <Star size={24} />
                    <div className="stat-info">
                        <span className="stat-value">{rankings[0]?.total_score || 0}</span>
                        <span className="stat-label">Điểm cao nhất</span>
                    </div>
                </div>
            </div>

            {/* Rankings Table */}
            <div className="rankings-table">
                <div className="table-header">
                    <span className="col-rank">Hạng</span>
                    <span className="col-player">Người chơi</span>
                    <span className="col-score">Tổng điểm</span>
                    <span className="col-games">Số games</span>
                    <span className="col-avg">Điểm TB</span>
                </div>

                <div className="table-body">
                    {rankings.map((player) => (
                        <div key={player.rank} className={`table-row ${getRankClass(player.rank)}`}>
                            <span className="col-rank">
                                {getRankIcon(player.rank)}
                            </span>
                            <span className="col-player">
                                <div className="player-avatar">
                                    {player.username.charAt(0).toUpperCase()}
                                </div>
                                <span className="player-name">{player.username}</span>
                            </span>
                            <span className="col-score">{player.total_score.toLocaleString()}</span>
                            <span className="col-games">{player.games_played}</span>
                            <span className="col-avg">{player.avg_score}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pagination */}
            {rankings.length > itemsPerPage && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(rankings.length / itemsPerPage)}
                    onPageChange={setCurrentPage}
                    totalItems={rankings.length}
                    itemsPerPage={itemsPerPage}
                />
            )}
        </div>
    );
};

export default Rankings;
