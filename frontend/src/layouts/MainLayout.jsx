import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import './MainLayout.css';

const MainLayout = () => {
    return (
        <div className="main-layout">
            <Navbar />
            <main className="main-content">
                <Outlet />
            </main>
            <footer className="main-footer">
                <div className="footer-content">
                    <p>🎮 Board Game App © 2026</p>
                    <p>Đồ án Web - Express.js + React</p>
                </div>
            </footer>
        </div>
    );
};

export default MainLayout;
