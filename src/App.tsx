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
  if (loading) return <div className="min-h-screen flex items-center justify-center">Betöltés...</div>;
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
