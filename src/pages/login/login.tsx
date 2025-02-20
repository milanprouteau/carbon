import React from 'react';
import { Navigate } from 'react-router-dom';
import { Auth } from '../../components/auth/auth.component';
import { useAuth } from '../../contexts/auth.context';
import './login.scss';

const Login: React.FC = () => {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>Welcome to CarbonTrip</h1>
        <p>Sign in to track and manage your carbon footprint</p>
        <Auth />
      </div>
    </div>
  );
};

export default Login;
