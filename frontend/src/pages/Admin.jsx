import { useState, useEffect } from 'react';
import {
    Users, Gamepad2, BarChart3, Settings,
    Trash2, Edit, Eye, Shield, TrendingUp,
    MessageSquare, Star, Activity, Power, X
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Admin.css';

const Admin = () => {
    const { user, isAdmin } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingGame, setEditingGame] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    useEffect(() => {
        if (isAdmin) {
            fetchStats();
            fetchUsers();
            fetchGames();
        }
    }, [isAdmin]);

    const fetchStats = async () => {
        try {
            const res = await api.get('/admin/stats');
            setStats(res.data.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
            // Demo stats
            setStats({
                totalUsers: 156,
                totalGames: 17,
                totalSessions: 1234,
                activeToday: 45,
                newUsersThisWeek: 23,
                totalMessages: 890
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await api.get('/admin/users');
            setUsers(res.data.data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
            // Demo users
            setUsers([
                { id: '1', username: 'admin', email: 'admin@boardgame.com', role: 'admin', status: 'active', created_at: '2024-01-01' },
                { id: '2', username: 'player1', email: 'player1@example.com', role: 'player', status: 'active', created_at: '2024-01-15' },
                { id: '3', username: 'player2', email: 'player2@example.com', role: 'player', status: 'active', created_at: '2024-01-20' },
                { id: '4', username: 'gamer_pro', email: 'gamer@example.com', role: 'player', status: 'banned', created_at: '2024-02-01' },
                { id: '5', username: 'newbie', email: 'newbie@example.com', role: 'player', status: 'active', created_at: '2024-02-10' },
            ]);
        }
    };

    const fetchGames = async () => {
        try {
            const res = await api.get('/games');
            setGames(res.data.data || []);
        } catch (error) {
            console.error('Error fetching games:', error);
            // Demo games
            setGames([
                { id: 1, name: 'Caro Hàng 5', category: 'strategy', play_count: 450, is_active: true },
                { id: 4, name: 'Rắn Săn Mồi', category: 'arcade', play_count: 320, is_active: true },
                { id: 5, name: 'Ghép Hàng 3', category: 'puzzle', play_count: 280, is_active: true },
                { id: 6, name: 'Cờ Trí Nhớ', category: 'puzzle', play_count: 200, is_active: true },
                { id: 7, name: 'Bảng Vẽ', category: 'creative', play_count: 150, is_active: true },
            ]);
        }
    };

    const toggleUserStatus = async (userId, currentStatus) => {
        try {
            const newStatus = currentStatus === 'active' ? 'banned' : 'active';
            await api.put(`/admin/users/${userId}`, { status: newStatus });
            setUsers(prev => prev.map(u =>
                u.id === userId ? { ...u, status: newStatus } : u
            ));
        } catch (error) {
            console.error('Error updating user:', error);
            // Update locally for demo
            setUsers(prev => prev.map(u =>
                u.id === userId ? { ...u, status: currentStatus === 'active' ? 'banned' : 'active' } : u
            ));
        }
    };

    const deleteUser = async (userId) => {
        if (!confirm('Bạn có chắc muốn xóa người dùng này?')) return;
        try {
            await api.delete(`/admin/users/${userId}`);
            setUsers(prev => prev.filter(u => u.id !== userId));
        } catch (error) {
            console.error('Error deleting user:', error);
            setUsers(prev => prev.filter(u => u.id !== userId));
        }
    };

    // Toggle game active status
    const toggleGameStatus = async (gameId, currentStatus) => {
        try {
            await api.put(`/admin/games/${gameId}`, { is_active: !currentStatus });
            setGames(prev => prev.map(g =>
                g.id === gameId ? { ...g, is_active: !currentStatus } : g
            ));
        } catch (error) {
            console.error('Error toggling game:', error);
            // Update locally for demo
            setGames(prev => prev.map(g =>
                g.id === gameId ? { ...g, is_active: !currentStatus } : g
            ));
        }
    };

    // Open edit modal
    const openEditModal = (game) => {
        setEditingGame({ ...game, board_size: game.board_size || 15 });
        setShowEditModal(true);
    };

    // Update game settings
    const updateGameSettings = async () => {
        if (!editingGame) return;
        try {
            await api.put(`/admin/games/${editingGame.id}`, {
                board_size: editingGame.board_size,
                is_active: editingGame.is_active
            });
            setGames(prev => prev.map(g =>
                g.id === editingGame.id ? { ...g, ...editingGame } : g
            ));
            setShowEditModal(false);
            setEditingGame(null);
        } catch (error) {
            console.error('Error updating game:', error);
            // Update locally for demo
            setGames(prev => prev.map(g =>
                g.id === editingGame.id ? { ...g, ...editingGame } : g
            ));
            setShowEditModal(false);
            setEditingGame(null);
        }
    };

    if (!isAdmin) {
        return (
            <div className="access-denied">
                <Shield size={64} />
                <h2>Truy cập bị từ chối</h2>
                <p>Bạn cần quyền Admin để truy cập trang này</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Đang tải Admin Panel...</p>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="admin-header">
                <h1>⚙️ Admin Dashboard</h1>
                <p>Xin chào, {user?.username}!</p>
            </div>

            {/* Tabs */}
            <div className="admin-tabs">
                <button
                    className={`admin-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
                    onClick={() => setActiveTab('dashboard')}
                >
                    <BarChart3 size={18} />
                    Tổng quan
                </button>
                <button
                    className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
                    onClick={() => setActiveTab('users')}
                >
                    <Users size={18} />
                    Người dùng
                </button>
                <button
                    className={`admin-tab ${activeTab === 'games' ? 'active' : ''}`}
                    onClick={() => setActiveTab('games')}
                >
                    <Gamepad2 size={18} />
                    Games
                </button>
            </div>

            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
                <div className="dashboard-content">
                    <div className="stats-grid">
                        <div className="stat-card primary">
                            <Users size={32} />
                            <div className="stat-content">
                                <span className="stat-value">{stats?.totalUsers || 0}</span>
                                <span className="stat-label">Tổng người dùng</span>
                            </div>
                        </div>
                        <div className="stat-card success">
                            <Activity size={32} />
                            <div className="stat-content">
                                <span className="stat-value">{stats?.activeToday || 0}</span>
                                <span className="stat-label">Đang online</span>
                            </div>
                        </div>
                        <div className="stat-card warning">
                            <Gamepad2 size={32} />
                            <div className="stat-content">
                                <span className="stat-value">{stats?.totalSessions || 0}</span>
                                <span className="stat-label">Phiên chơi</span>
                            </div>
                        </div>
                        <div className="stat-card info">
                            <MessageSquare size={32} />
                            <div className="stat-content">
                                <span className="stat-value">{stats?.totalMessages || 0}</span>
                                <span className="stat-label">Tin nhắn</span>
                            </div>
                        </div>
                        <div className="stat-card secondary">
                            <TrendingUp size={32} />
                            <div className="stat-content">
                                <span className="stat-value">+{stats?.newUsersThisWeek || 0}</span>
                                <span className="stat-label">User mới tuần này</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <Star size={32} />
                            <div className="stat-content">
                                <span className="stat-value">{stats?.totalGames || 0}</span>
                                <span className="stat-label">Tổng games</span>
                            </div>
                        </div>
                    </div>

                    {/* Top Games & User Growth */}
                    <div className="dashboard-charts">
                        <div className="chart-card">
                            <h3>🎮 Top Games được chơi nhiều nhất</h3>
                            <div className="top-games-list">
                                {games.slice(0, 5).map((game, idx) => (
                                    <div key={game.id} className="top-game-item">
                                        <span className={`rank rank-${idx + 1}`}>{idx + 1}</span>
                                        <span className="game-name">{game.name}</span>
                                        <div className="game-bar">
                                            <div
                                                className="game-bar-fill"
                                                style={{ width: `${Math.min(100, (game.play_count / 500) * 100)}%` }}
                                            />
                                        </div>
                                        <span className="play-count">{game.play_count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="chart-card">
                            <h3>📈 Thống kê người dùng</h3>
                            <div className="user-stats-grid">
                                <div className="user-stat-box">
                                    <span className="stat-number">{users.filter(u => u.status === 'active').length}</span>
                                    <span className="stat-name">Active</span>
                                </div>
                                <div className="user-stat-box banned">
                                    <span className="stat-number">{users.filter(u => u.status === 'banned').length}</span>
                                    <span className="stat-name">Banned</span>
                                </div>
                                <div className="user-stat-box admin">
                                    <span className="stat-number">{users.filter(u => u.role === 'admin').length}</span>
                                    <span className="stat-name">Admins</span>
                                </div>
                                <div className="user-stat-box">
                                    <span className="stat-number">{users.filter(u => u.role === 'player').length}</span>
                                    <span className="stat-name">Players</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="recent-section">
                        <h3>📊 Hoạt động gần đây</h3>
                        <div className="activity-list">
                            <div className="activity-item">
                                <span className="activity-icon">🎮</span>
                                <span className="activity-text">player1 đã chơi Caro</span>
                                <span className="activity-time">5 phút trước</span>
                            </div>
                            <div className="activity-item">
                                <span className="activity-icon">👤</span>
                                <span className="activity-text">newbie123 đã đăng ký</span>
                                <span className="activity-time">15 phút trước</span>
                            </div>
                            <div className="activity-item">
                                <span className="activity-icon">🏆</span>
                                <span className="activity-text">pro_gamer đạt 10000 điểm</span>
                                <span className="activity-time">30 phút trước</span>
                            </div>
                            <div className="activity-item">
                                <span className="activity-icon">💬</span>
                                <span className="activity-text">player2 gửi tin nhắn cho player1</span>
                                <span className="activity-time">45 phút trước</span>
                            </div>
                            <div className="activity-item">
                                <span className="activity-icon">⭐</span>
                                <span className="activity-text">gamer_pro đánh giá 5* cho Snake</span>
                                <span className="activity-time">1 giờ trước</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
                <div className="users-content">
                    <div className="section-header">
                        <h3>👥 Quản lý người dùng ({users.length})</h3>
                    </div>
                    <div className="users-table">
                        <div className="table-header">
                            <span>Username</span>
                            <span>Email</span>
                            <span>Role</span>
                            <span>Trạng thái</span>
                            <span>Ngày tạo</span>
                            <span>Hành động</span>
                        </div>
                        {users.map(u => (
                            <div key={u.id} className="table-row">
                                <span className="user-name">{u.username}</span>
                                <span className="user-email">{u.email}</span>
                                <span className={`role-badge ${u.role}`}>{u.role}</span>
                                <span className={`status-badge ${u.status}`}>{u.status}</span>
                                <span>{new Date(u.created_at).toLocaleDateString('vi-VN')}</span>
                                <span className="actions">
                                    <button
                                        className="action-btn"
                                        onClick={() => toggleUserStatus(u.id, u.status)}
                                        title={u.status === 'active' ? 'Ban' : 'Unban'}
                                    >
                                        <Shield size={16} />
                                    </button>
                                    <button
                                        className="action-btn danger"
                                        onClick={() => deleteUser(u.id)}
                                        disabled={u.role === 'admin'}
                                        title="Xóa"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Games Tab */}
            {activeTab === 'games' && (
                <div className="games-content">
                    <div className="section-header">
                        <h3>🎮 Quản lý Games ({games.length})</h3>
                    </div>
                    <div className="games-grid">
                        {games.map(game => (
                            <div key={game.id} className={`game-admin-card ${!game.is_active ? 'disabled' : ''}`}>
                                <div className="game-info">
                                    <h4>{game.name}</h4>
                                    <span className="game-category">{game.category}</span>
                                </div>
                                <div className="game-stats">
                                    <span><Eye size={14} /> {game.play_count} lượt chơi</span>
                                    <span className={`status ${game.is_active ? 'active' : 'inactive'}`}>
                                        {game.is_active ? 'Hoạt động' : 'Tắt'}
                                    </span>
                                </div>
                                <div className="game-actions">
                                    <button
                                        className={`btn btn-sm ${game.is_active ? 'btn-warning' : 'btn-success'}`}
                                        onClick={() => toggleGameStatus(game.id, game.is_active)}
                                        title={game.is_active ? 'Tắt game' : 'Bật game'}
                                    >
                                        <Power size={14} />
                                        {game.is_active ? 'Tắt' : 'Bật'}
                                    </button>
                                    <button
                                        className="btn btn-sm btn-outline"
                                        onClick={() => openEditModal(game)}
                                    >
                                        <Edit size={14} /> Sửa
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Edit Game Modal */}
            {showEditModal && editingGame && (
                <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>⚙️ Chỉnh sửa: {editingGame.name}</h3>
                            <button className="modal-close" onClick={() => setShowEditModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Kích thước bàn cờ:</label>
                                <select
                                    value={editingGame.board_size}
                                    onChange={(e) => setEditingGame(prev => ({
                                        ...prev,
                                        board_size: parseInt(e.target.value)
                                    }))}
                                >
                                    <option value={3}>3x3 (Tic-Tac-Toe)</option>
                                    <option value={5}>5x5</option>
                                    <option value={10}>10x10</option>
                                    <option value={15}>15x15 (Chuẩn Caro)</option>
                                    <option value={20}>20x20</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Trạng thái:</label>
                                <div className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        id="gameStatus"
                                        checked={editingGame.is_active}
                                        onChange={(e) => setEditingGame(prev => ({
                                            ...prev,
                                            is_active: e.target.checked
                                        }))}
                                    />
                                    <label htmlFor="gameStatus">
                                        {editingGame.is_active ? 'Hoạt động' : 'Tắt'}
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={() => setShowEditModal(false)}>
                                Hủy
                            </button>
                            <button className="btn btn-primary" onClick={updateGameSettings}>
                                Lưu thay đổi
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Admin;
