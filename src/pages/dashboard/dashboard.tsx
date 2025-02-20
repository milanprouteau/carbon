import React from 'react';
import { useAuth } from '../../contexts/auth.context';
import './dashboard.scss';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <h1>Welcome back, {user?.email}</h1>
        <p>Track and manage your carbon footprint</p>
      </div>
      
      <div className="dashboard__content">
        <div className="dashboard__card">
          <h2>Recent Trips</h2>
          {/* Add your trip history component here */}
        </div>
        
        <div className="dashboard__card">
          <h2>Carbon Impact</h2>
          {/* Add your carbon impact visualization here */}
        </div>
        
        <div className="dashboard__card">
          <h2>Quick Actions</h2>
          <div className="dashboard__actions">
            <button className="dashboard__action-btn">New Trip</button>
            <button className="dashboard__action-btn">View Reports</button>
            <button className="dashboard__action-btn">Set Goals</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
