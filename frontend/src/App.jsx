import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
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
import CaroGame from './components/games/CaroGame';
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

// Guest Route (redirect if logged in)
const GuestRoute = ({ children }) => {
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

  if (isAuthenticated) {
    return <Navigate to="/games" replace />;
  }

  return children;
};

// App Routes
const AppRoutes = () => {
  return (
    <Routes>
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
        <Route path="admin" element={
          <ProtectedRoute><Admin /></ProtectedRoute>
        } />
        <Route path="*" element={
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <h1>404</h1>
            <p>Trang không tồn tại</p>
          </div>
        } />
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
