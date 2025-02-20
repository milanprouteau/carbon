import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header/Header';
import { ProtectedRoute } from './components/protected-route/protected-route.component';
import Homepage from './pages/homepage/homepage';
import Login from './pages/login/login';
import Dashboard from './pages/dashboard/dashboard';
import Authentication from './pages/authentication/authentication';
import { AuthProvider } from './contexts/auth.context';
import { useAuth } from './contexts/auth.context';
import About from './pages/about/about';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Header />
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path='/about' element={<About />} />
            <Route path="/auth" element={<Authentication />} />
            <Route path="/login" element={<Navigate to="/auth" replace />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
