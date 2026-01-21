import { Outlet } from 'react-router-dom';
import AdminNavbar from '../components/common/AdminNavbar';
import './AdminLayout.css';

const AdminLayout = () => {
    return (
        <div className="admin-layout">
            <AdminNavbar />
            <main className="admin-content">
                <Outlet />
            </main>
            <footer className="admin-footer">
                <div className="footer-content">
                    <p>🛡️ Admin Panel © 2026</p>
                    <p>Board Game App - Quản trị hệ thống</p>
                </div>
            </footer>
        </div>
    );
};

export default AdminLayout;
