/* Cleary App Component
   Root router + providers + protected routes
*/

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { ThemeProvider } from './contexts/ThemeContext';

import LandingPage from './pages/LandingPage';
import CommandCenterPage from './pages/CommandCenterPage';
import FeedPage from './pages/FeedPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import CategoryPage from './pages/CategoryPage';
import VideosPage from './pages/VideosPage';
import ArticlePage from './pages/ArticlePage';
import ElectionPage from './pages/ElectionPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AppProvider>
            <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route
              path="/feed"
              element={
                <ProtectedRoute>
                  <FeedPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/elections"
              element={
                <ProtectedRoute>
                  <ElectionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route path="/categories/:category" element={<ProtectedRoute><CategoryPage /></ProtectedRoute>} />
            <Route path="/article/:id" element={<ProtectedRoute><ArticlePage /></ProtectedRoute>} />
            <Route path="/command" element={<ProtectedRoute><CommandCenterPage /></ProtectedRoute>} />
            <Route path="/videos" element={<ProtectedRoute><VideosPage /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
