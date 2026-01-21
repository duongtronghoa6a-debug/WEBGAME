import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import {
    Sun, Moon, User, LogOut, Settings,
    Trophy, LayoutDashboard, Gamepad2
} from 'lucide-react';
import './AdminNavbar.css';

const AdminNavbar = () => {
    const { theme, toggleTheme } = useTheme();
    const { user, logout } = useAuth();
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="admin-navbar">
            <div className="admin-navbar-container">
                <Link to="/admin" className="admin-navbar-logo">
                    <LayoutDashboard size={28} />
                    <span>Admin Panel</span>
                </Link>

                <div className="admin-navbar-links">
                    <Link
                        to="/admin"
                        className={`admin-nav-link ${isActive('/admin') ? 'active' : ''}`}
                    >
                        <LayoutDashboard size={18} />
                        Dashboard
                    </Link>
                    <Link
                        to="/admin/rankings"
                        className={`admin-nav-link ${isActive('/admin/rankings') ? 'active' : ''}`}
                    >
                        <Trophy size={18} />
                        Xếp hạng
                    </Link>
                </div>

                <div className="admin-navbar-actions">
                    <button
                        className="theme-toggle"
                        onClick={toggleTheme}
                        title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    <div className="admin-user-menu">
                        <button
                            className="admin-user-avatar"
                            onClick={() => setShowDropdown(!showDropdown)}
                        >
                            {user?.avatar_url ? (
                                <img src={user.avatar_url} alt={user.username} />
                            ) : (
                                <User size={20} />
                            )}
                            <span>{user?.username}</span>
                        </button>

                        {showDropdown && (
                            <div className="admin-dropdown-menu">
                                <Link to="/admin/profile" className="admin-dropdown-item" onClick={() => setShowDropdown(false)}>
                                    <User size={16} />
                                    Profile
                                </Link>
                                <Link to="/admin/settings" className="admin-dropdown-item" onClick={() => setShowDropdown(false)}>
                                    <Settings size={16} />
                                    Cài đặt
                                </Link>
                                <hr className="dropdown-divider" />
                                <Link to="/games" className="admin-dropdown-item" onClick={() => setShowDropdown(false)}>
                                    <Gamepad2 size={16} />
                                    Về trang User
                                </Link>
                                <button className="admin-dropdown-item logout" onClick={handleLogout}>
                                    <LogOut size={16} />
                                    Đăng xuất
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default AdminNavbar;
