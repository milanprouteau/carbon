import React, { useState } from 'react';
import { signIn, signUp, signInWithGoogle, logout } from '../../services/auth.service';
import { useAuth } from '../../contexts/auth.context';
import './auth.styles.scss';

interface AuthProps {
  initialMode?: 'signin' | 'signup';
}

export const Auth: React.FC<AuthProps> = ({ initialMode = 'signin' }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');
  const [error, setError] = useState('');
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error: any) {
      setError(error.message);
    }
  };

  if (user) {
    return (
      <div className="auth-container">
        <p>Welcome, {user.email}!</p>
        <button onClick={handleLogout} className="auth-button">
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <h2>{isSignUp ? 'Sign Up' : 'Sign In'}</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="auth-input"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="auth-input"
        />
        <button type="submit" className="auth-button">
          {isSignUp ? 'Sign Up' : 'Sign In'}
        </button>
      </form>

      <button onClick={handleGoogleSignIn} className="auth-button google">
        Sign in with Google
      </button>

      <button
        onClick={() => setIsSignUp(!isSignUp)}
        className="auth-button switch"
      >
        {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
      </button>

      {error && <p className="auth-error">{error}</p>}
    </div>
  );
};
