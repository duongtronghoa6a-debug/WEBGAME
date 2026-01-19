import { useState, useEffect } from 'react';
import {
    Users, Gamepad2, BarChart3, Settings,
    Trash2, Edit, Eye, Shield, TrendingUp,
    MessageSquare, Star, Activity
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
                            <div key={game.id} className="game-admin-card">
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
                                    <button className="btn btn-sm btn-outline">
                                        <Edit size={14} /> Sửa
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Admin;
