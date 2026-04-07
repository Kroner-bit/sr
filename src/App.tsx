import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import Dashboard from './pages/Dashboard';
import SessionView from './pages/SessionView';
import ProfileView from './pages/ProfileView';
import Login from './pages/Login';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center space-y-6">
        <img src="https://kephost.net/p/MjM1NTEzMQ.png" alt="ShootingRange" className="h-20 w-auto drop-shadow-[0_0_15px_rgba(34,211,238,0.3)] animate-pulse" referrerPolicy="no-referrer" />
        <div className="flex items-center space-x-3 text-zinc-400">
          <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <span className="font-display font-medium">Betöltés</span>
        </div>
      </div>
    );
  }
  
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/session/:id" element={<PrivateRoute><SessionView /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><ProfileView /></PrivateRoute>} />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}
