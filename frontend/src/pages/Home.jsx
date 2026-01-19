import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Gamepad2, Users, Trophy, Star, Zap, Shield } from 'lucide-react';
import './Home.css';

const Home = () => {
    const { isAuthenticated } = useAuth();

    return (
        <div className="home">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <h1 className="hero-title">
                        <span className="gradient-text">Board Game</span>
                        <br />Web Application
                    </h1>
                    <p className="hero-description">
                        Chơi hơn 17 game hấp dẫn: Caro, Snake, Match-3, Tetris, Chess và nhiều hơn nữa!
                        Kết nối với bạn bè, leo rank và chinh phục thành tựu.
                    </p>
                    <div className="hero-buttons">
                        {isAuthenticated ? (
                            <Link to="/games" className="btn btn-primary btn-lg">
                                <Gamepad2 size={20} />
                                Chơi ngay
                            </Link>
                        ) : (
                            <>
                                <Link to="/register" className="btn btn-primary btn-lg">
                                    Đăng ký miễn phí
                                </Link>
                                <Link to="/login" className="btn btn-outline btn-lg">
                                    Đăng nhập
                                </Link>
                            </>
                        )}
                    </div>
                </div>
                <div className="hero-visual">
                    <div className="game-grid-preview">
                        {['🎯', '🐍', '🍬', '🧠', '🧱', '♟️', '🎨', '🚀', '💣'].map((emoji, i) => (
                            <div key={i} className="preview-cell" style={{ animationDelay: `${i * 0.1}s` }}>
                                {emoji}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="features">
                <h2 className="section-title">Tính năng nổi bật</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon"><Gamepad2 size={32} /></div>
                        <h3>17+ Games</h3>
                        <p>Caro, Snake, Match-3, Tetris, Chess, Memory và nhiều game khác</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon"><Users size={32} /></div>
                        <h3>Kết nối bạn bè</h3>
                        <p>Tìm kiếm, kết bạn và nhắn tin với người chơi khác</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon"><Trophy size={32} /></div>
                        <h3>Bảng xếp hạng</h3>
                        <p>Cạnh tranh với toàn cầu hoặc chỉ trong nhóm bạn bè</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon"><Star size={32} /></div>
                        <h3>Thành tựu</h3>
                        <p>Mở khóa huy hiệu và theo dõi tiến trình của bạn</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon"><Zap size={32} /></div>
                        <h3>Save/Load Game</h3>
                        <p>Lưu tiến trình và tiếp tục chơi bất cứ lúc nào</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon"><Shield size={32} /></div>
                        <h3>Bảo mật</h3>
                        <p>HTTPS, JWT authentication và API Key bảo vệ</p>
                    </div>
                </div>
            </section>

            {/* Games Preview */}
            <section className="games-preview">
                <h2 className="section-title">Danh sách Games</h2>
                <div className="games-preview-grid">
                    {[
                        { emoji: '🎯', name: 'Caro', desc: 'Xếp 5 quân liên tiếp' },
                        { emoji: '🐍', name: 'Snake', desc: 'Rắn săn mồi cổ điển' },
                        { emoji: '🍬', name: 'Match-3', desc: 'Ghép 3 viên cùng màu' },
                        { emoji: '🧠', name: 'Memory', desc: 'Trò chơi trí nhớ' },
                        { emoji: '🧱', name: 'Tetris', desc: 'Xếp gạch huyền thoại' },
                        { emoji: '♟️', name: 'Chess', desc: 'Cờ vua trí tuệ' },
                        { emoji: '💣', name: 'Minesweeper', desc: 'Dò mìn' },
                        { emoji: '🎨', name: 'Drawing', desc: 'Bảng vẽ tự do' },
                    ].map((game, i) => (
                        <div key={i} className="game-preview-card">
                            <span className="game-emoji">{game.emoji}</span>
                            <h4>{game.name}</h4>
                            <p>{game.desc}</p>
                        </div>
                    ))}
                </div>
                <div className="games-cta">
                    <Link to="/games" className="btn btn-primary btn-lg">
                        Xem tất cả games →
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Home;
