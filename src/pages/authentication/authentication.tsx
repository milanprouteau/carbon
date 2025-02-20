import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Auth } from '../../components/auth/auth.component';
import { useAuth } from '../../contexts/auth.context';
import './authentication.scss';

const Authentication: React.FC = () => {
  const { user } = useAuth();
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="authentication-page">
      <div className="authentication-container">
        <div className="authentication-header">
          <h1>Welcome to CarbonTrip</h1>
          <div className="auth-tabs">
            <button
              className={`auth-tab ${authMode === 'signin' ? 'active' : ''}`}
              onClick={() => setAuthMode('signin')}
            >
              Sign In
            </button>
            <button
              className={`auth-tab ${authMode === 'signup' ? 'active' : ''}`}
              onClick={() => setAuthMode('signup')}
            >
              Sign Up
            </button>
          </div>
        </div>
        
        <div className="authentication-content">
          <div className="auth-description">
            {authMode === 'signin' ? (
              <p>Welcome back! Sign in to continue tracking your carbon footprint.</p>
            ) : (
              <p>Join us in making a difference! Create an account to start tracking your carbon footprint.</p>
            )}
          </div>
          <Auth initialMode={authMode} />
        </div>

        <div className="authentication-features">
          <h2>Why Join CarbonTrip?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>Track Your Impact</h3>
              <p>Monitor and understand your carbon footprint across different transportation methods.</p>
            </div>
            <div className="feature-card">
              <h3>Make Better Choices</h3>
              <p>Get personalized recommendations for reducing your environmental impact.</p>
            </div>
            <div className="feature-card">
              <h3>Join the Community</h3>
              <p>Connect with others who are committed to sustainable travel.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Authentication;
