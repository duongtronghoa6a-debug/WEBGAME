import { useState, useEffect } from 'react';
import { User, Mail, Calendar, Edit2, Save, X, Camera, Trophy, Gamepad2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

const Profile = () => {
    const authContext = useAuth();
    const user = authContext?.user;
    const setUser = authContext?.setUser;
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        bio: ''
    });
    const [stats, setStats] = useState({
        gamesPlayed: 0,
        totalScore: 0,
        achievements: 0,
        friends: 0
    });

    useEffect(() => {
        fetchProfile();
        fetchStats();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/auth/me');
            setProfile(res.data.data);
            setFormData({
                username: res.data.data.username || '',
                email: res.data.data.email || '',
                bio: res.data.data.bio || ''
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
            // Fallback to auth user
            if (user) {
                setProfile(user);
                setFormData({
                    username: user.username || '',
                    email: user.email || '',
                    bio: user.bio || ''
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await api.get('/users/profile/stats');
            setStats(res.data.data);
        } catch (error) {
            // Demo stats
            setStats({
                gamesPlayed: 45,
                totalScore: 12500,
                achievements: 8,
                friends: 12
            });
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        try {
            const res = await api.put('/users/profile', formData);
            setProfile(res.data.data);
            if (setUser) {
                setUser(prev => ({ ...prev, ...res.data.data }));
            }
            setIsEditing(false);
            alert('Cập nhật thành công!');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Lỗi khi cập nhật');
        }
    };

    const handleCancel = () => {
        setFormData({
            username: profile?.username || '',
            email: profile?.email || '',
            bio: profile?.bio || ''
        });
        setIsEditing(false);
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Đang tải...</p>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <div className="profile-header">
                <h1>👤 Hồ sơ cá nhân</h1>
            </div>

            <div className="profile-content">
                {/* Avatar Section */}
                <div className="profile-avatar-section">
                    <div className="avatar-wrapper">
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt={profile.username} />
                        ) : (
                            <div className="avatar-placeholder">
                                <User size={48} />
                            </div>
                        )}
                        <button className="avatar-edit-btn" title="Đổi ảnh">
                            <Camera size={16} />
                        </button>
                    </div>
                    <h2>{profile?.username}</h2>
                    <span className={`role-badge ${profile?.role}`}>{profile?.role}</span>
                </div>

                {/* Stats Cards */}
                <div className="profile-stats">
                    <div className="stat-card">
                        <Gamepad2 size={24} />
                        <div className="stat-info">
                            <span className="stat-value">{stats.gamesPlayed}</span>
                            <span className="stat-label">Games đã chơi</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <Trophy size={24} />
                        <div className="stat-info">
                            <span className="stat-value">{(stats?.totalScore || 0).toLocaleString()}</span>
                            <span className="stat-label">Tổng điểm</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <span className="stat-icon">🏅</span>
                        <div className="stat-info">
                            <span className="stat-value">{stats.achievements}</span>
                            <span className="stat-label">Thành tựu</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <span className="stat-icon">👥</span>
                        <div className="stat-info">
                            <span className="stat-value">{stats.friends}</span>
                            <span className="stat-label">Bạn bè</span>
                        </div>
                    </div>
                </div>

                {/* Profile Form */}
                <div className="profile-form">
                    <div className="form-header">
                        <h3>Thông tin cá nhân</h3>
                        {!isEditing ? (
                            <button className="btn btn-outline" onClick={() => setIsEditing(true)}>
                                <Edit2 size={16} />
                                Chỉnh sửa
                            </button>
                        ) : (
                            <div className="form-actions">
                                <button className="btn btn-outline" onClick={handleCancel}>
                                    <X size={16} />
                                    Hủy
                                </button>
                                <button className="btn btn-primary" onClick={handleSave}>
                                    <Save size={16} />
                                    Lưu
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>
                            <User size={16} />
                            Tên người dùng
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                                placeholder="Nhập tên người dùng"
                            />
                        ) : (
                            <p>{profile?.username}</p>
                        )}
                    </div>

                    <div className="form-group">
                        <label>
                            <Mail size={16} />
                            Email
                        </label>
                        {isEditing ? (
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Nhập email"
                            />
                        ) : (
                            <p>{profile?.email}</p>
                        )}
                    </div>

                    <div className="form-group">
                        <label>
                            <Edit2 size={16} />
                            Giới thiệu
                        </label>
                        {isEditing ? (
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleInputChange}
                                placeholder="Viết vài dòng về bản thân..."
                                rows={3}
                            />
                        ) : (
                            <p>{profile?.bio || 'Chưa có giới thiệu'}</p>
                        )}
                    </div>

                    <div className="form-group">
                        <label>
                            <Calendar size={16} />
                            Ngày tham gia
                        </label>
                        <p>{profile?.created_at ? new Date(profile.created_at).toLocaleDateString('vi-VN') : 'N/A'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
