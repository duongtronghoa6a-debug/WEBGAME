import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
    Sun, Moon, User, LogOut, Settings,
    MessageSquare, Users, Trophy, Home, Gamepad2
} from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
    const { theme, toggleTheme } = useTheme();
    const { user, isAuthenticated, isAdmin, logout } = useAuth();
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    <Gamepad2 size={28} />
                    <span>Board Game</span>
                </Link>

                <div className="navbar-links">
                    <Link to="/" className="nav-link">
                        <Home size={18} />
                        Trang chủ
                    </Link>
                    <Link to="/games" className="nav-link">
                        <Gamepad2 size={18} />
                        Games
                    </Link>
                    {isAuthenticated && (
                        <>
                            <Link to="/friends" className="nav-link">
                                <Users size={18} />
                                Bạn bè
                            </Link>
                            <Link to="/messages" className="nav-link">
                                <MessageSquare size={18} />
                                Tin nhắn
                            </Link>
                            <Link to="/rankings" className="nav-link">
                                <Trophy size={18} />
                                Xếp hạng
                            </Link>
                        </>
                    )}
                </div>

                <div className="navbar-actions">
                    <button
                        className="theme-toggle"
                        onClick={toggleTheme}
                        title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    {isAuthenticated ? (
                        <div className="user-menu">
                            <button
                                className="user-avatar"
                                onClick={() => setShowDropdown(!showDropdown)}
                            >
                                {user.avatar_url ? (
                                    <img src={user.avatar_url} alt={user.username} />
                                ) : (
                                    <User size={20} />
                                )}
                                <span>{user.username}</span>
                            </button>

                            {showDropdown && (
                                <div className="dropdown-menu">
                                    <Link to="/profile" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                                        <User size={16} />
                                        Profile
                                    </Link>
                                    <Link to="/achievements" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                                        <Trophy size={16} />
                                        Thành tựu
                                    </Link>
                                    {isAdmin && (
                                        <Link to="/admin" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                                            <Settings size={16} />
                                            Admin
                                        </Link>
                                    )}
                                    <hr className="dropdown-divider" />
                                    <button className="dropdown-item" onClick={handleLogout}>
                                        <LogOut size={16} />
                                        Đăng xuất
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="auth-buttons">
                            <Link to="/login" className="btn btn-outline">
                                Đăng nhập
                            </Link>
                            <Link to="/register" className="btn btn-primary">
                                Đăng ký
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
