import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Navbar from './components/Navbar';
import LoginPage from './pages/Login/LoginPage';
import RegisterPage from './pages/Register/RegisterPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import GamePage from './pages/Game/GamePage';
import OnlineArenaPage from './pages/Game/OnlineArenaPage';
import OnlineGamePage from './pages/Game/OnlineGamePage';
import PremiumPage from './pages/Premium/PremiumPage';
import AdminPage from './pages/Admin/AdminPage';
import ProfilePage from './pages/Profile/ProfilePage';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner" />;
  return user ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner" />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

function GuestRoute({ children }) {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/"          element={<Navigate to="/dashboard" replace />} />
          <Route path="/login"     element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/register"  element={<GuestRoute><RegisterPage /></GuestRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path="/game/local"   element={<PrivateRoute><GamePage /></PrivateRoute>} />
          <Route path="/game/arena"   element={<PrivateRoute><OnlineArenaPage /></PrivateRoute>} />
          <Route path="/game/online/:roomId" element={<PrivateRoute><OnlineGamePage /></PrivateRoute>} />
          <Route path="/premium"   element={<PrivateRoute><PremiumPage /></PrivateRoute>} />
          <Route path="/profile"   element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
          <Route path="/admin"     element={<AdminRoute><AdminPage /></AdminRoute>} />
          <Route path="*"          element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
