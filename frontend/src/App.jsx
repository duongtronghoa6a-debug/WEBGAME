import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Games from './pages/Games';
import Friends from './pages/Friends';
import Messages from './pages/Messages';
import Rankings from './pages/Rankings';
import Profile from './pages/Profile';
import Achievements from './pages/Achievements';
import Admin from './pages/Admin';
import GameRouter from './components/games/GameRouter';
import './styles/globals.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh'
      }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Admin Route (requires admin privileges)
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh'
      }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/games" replace />;
  }

  return children;
};

// Guest Route (redirect if logged in)
const GuestRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh'
      }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    // Admin goes to admin dashboard, users go to games
    return <Navigate to={isAdmin ? "/admin" : "/games"} replace />;
  }

  return children;
};

// App Routes
const AppRoutes = () => {
  return (
    <Routes>
      {/* User Routes */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="login" element={
          <GuestRoute><Login /></GuestRoute>
        } />
        <Route path="register" element={
          <GuestRoute><Register /></GuestRoute>
        } />
        <Route path="games" element={
          <ProtectedRoute><Games /></ProtectedRoute>
        } />
        {/* Game routes */}
        <Route path="play/:gameId" element={
          <ProtectedRoute>
            <GameRouter />
          </ProtectedRoute>
        } />
        <Route path="friends" element={
          <ProtectedRoute><Friends /></ProtectedRoute>
        } />
        <Route path="messages" element={
          <ProtectedRoute><Messages /></ProtectedRoute>
        } />
        <Route path="rankings" element={
          <ProtectedRoute><Rankings /></ProtectedRoute>
        } />
        <Route path="profile" element={
          <ProtectedRoute><Profile /></ProtectedRoute>
        } />
        <Route path="achievements" element={
          <ProtectedRoute><Achievements /></ProtectedRoute>
        } />
        <Route path="*" element={
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <h1>404</h1>
            <p>Trang không tồn tại</p>
          </div>
        } />
      </Route>

      {/* Admin Routes - Separate Layout */}
      <Route path="/admin" element={
        <AdminRoute><AdminLayout /></AdminRoute>
      }>
        <Route index element={<Admin />} />
        <Route path="rankings" element={<Rankings />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Profile />} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;

