import { useState, useEffect } from 'react';
import { Trophy, Star, Target, Clock, Gamepad2, Lock } from 'lucide-react';
import api from '../services/api';
import './Achievements.css';

const Achievements = () => {
    const [achievements, setAchievements] = useState([]);
    const [userAchievements, setUserAchievements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, unlocked, locked

    useEffect(() => {
        fetchAchievements();
    }, []);

    const fetchAchievements = async () => {
        try {
            const [allRes, userRes] = await Promise.all([
                api.get('/achievements'),
                api.get('/users/achievements')
            ]);
            setAchievements(allRes.data.data || []);
            setUserAchievements(userRes.data.data || []);
        } catch (error) {
            console.error('Error fetching achievements:', error);
            // Demo achievements
            setAchievements([
                { id: 1, name: 'Người mới', description: 'Chơi game đầu tiên', icon: '🎮', points: 10, category: 'beginner' },
                { id: 2, name: 'Chiến thần Caro', description: 'Thắng 10 ván Caro', icon: '🎯', points: 50, category: 'caro' },
                { id: 3, name: 'Rắn săn mồi', description: 'Đạt 100 điểm trong Snake', icon: '🐍', points: 30, category: 'snake' },
                { id: 4, name: 'Master ghép kẹo', description: 'Đạt combo x5 trong Match-3', icon: '🍬', points: 40, category: 'match3' },
                { id: 5, name: 'Trí nhớ siêu phàm', description: 'Hoàn thành Memory dưới 1 phút', icon: '🧠', points: 60, category: 'memory' },
                { id: 6, name: 'Họa sĩ', description: 'Lưu 5 bức tranh', icon: '🎨', points: 20, category: 'drawing' },
                { id: 7, name: 'Kết bạn', description: 'Có 5 bạn bè', icon: '👥', points: 25, category: 'social' },
                { id: 8, name: 'Vua điểm', description: 'Đạt 10000 tổng điểm', icon: '👑', points: 100, category: 'score' },
                { id: 9, name: 'Cày cuốc', description: 'Chơi 50 games', icon: '⚡', points: 75, category: 'games' },
                { id: 10, name: 'Đại cao thủ', description: 'Mở khóa tất cả thành tựu', icon: '🏆', points: 200, category: 'master' },
            ]);
            setUserAchievements([1, 2, 3, 6]); // Demo: đã mở khóa 4 thành tựu
        } finally {
            setLoading(false);
        }
    };

    const isUnlocked = (achievementId) => {
        return userAchievements.includes(achievementId) ||
            userAchievements.some(ua => ua.achievement_id === achievementId);
    };

    const filteredAchievements = achievements.filter(a => {
        if (filter === 'unlocked') return isUnlocked(a.id);
        if (filter === 'locked') return !isUnlocked(a.id);
        return true;
    });

    const totalPoints = achievements.reduce((sum, a) =>
        isUnlocked(a.id) ? sum + a.points : sum, 0
    );

    const unlockedCount = achievements.filter(a => isUnlocked(a.id)).length;

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Đang tải...</p>
            </div>
        );
    }

    return (
        <div className="achievements-page">
            <div className="page-header">
                <h1>🏅 Thành tựu</h1>
                <p>Hoàn thành các thử thách để mở khóa thành tựu</p>
            </div>

            {/* Stats */}
            <div className="achievements-stats">
                <div className="stat-card">
                    <Trophy size={24} />
                    <div className="stat-info">
                        <span className="stat-value">{unlockedCount}/{achievements.length}</span>
                        <span className="stat-label">Đã mở khóa</span>
                    </div>
                </div>
                <div className="stat-card">
                    <Star size={24} />
                    <div className="stat-info">
                        <span className="stat-value">{totalPoints}</span>
                        <span className="stat-label">Tổng điểm</span>
                    </div>
                </div>
                <div className="stat-card progress-card">
                    <div className="progress-info">
                        <span>Tiến độ</span>
                        <span>{Math.round((unlockedCount / achievements.length) * 100)}%</span>
                    </div>
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Filter */}
            <div className="filter-section">
                <button
                    className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    Tất cả ({achievements.length})
                </button>
                <button
                    className={`filter-btn ${filter === 'unlocked' ? 'active' : ''}`}
                    onClick={() => setFilter('unlocked')}
                >
                    Đã mở ({unlockedCount})
                </button>
                <button
                    className={`filter-btn ${filter === 'locked' ? 'active' : ''}`}
                    onClick={() => setFilter('locked')}
                >
                    Chưa mở ({achievements.length - unlockedCount})
                </button>
            </div>

            {/* Achievements Grid */}
            <div className="achievements-grid">
                {filteredAchievements.map(achievement => {
                    const unlocked = isUnlocked(achievement.id);

                    return (
                        <div
                            key={achievement.id}
                            className={`achievement-card ${unlocked ? 'unlocked' : 'locked'}`}
                        >
                            <div className="achievement-icon">
                                {unlocked ? (
                                    <span>{achievement.icon}</span>
                                ) : (
                                    <Lock size={24} />
                                )}
                            </div>
                            <div className="achievement-info">
                                <h4>{achievement.name}</h4>
                                <p>{achievement.description}</p>
                            </div>
                            <div className="achievement-points">
                                <Star size={14} />
                                <span>{achievement.points}</span>
                            </div>
                            {unlocked && (
                                <div className="unlocked-badge">✓</div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Achievements;
