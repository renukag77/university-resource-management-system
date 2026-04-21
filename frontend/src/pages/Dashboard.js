import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import '../styles/dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Campus Events Dashboard</h1>
        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>
      </div>

      <div className="dashboard-content">
        <div className="user-info-card">
          <h2>Welcome, {user.name}!</h2>
          <div className="user-details">
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>ID Number:</strong> {user.idNumber}
            </p>
            <p>
              <strong>Role:</strong>{' '}
              <span className={`role-badge role-${user.role}`}>
                {user.role.replace('_', ' ').toUpperCase()}
              </span>
            </p>
          </div>
        </div>

        <div className="dashboard-info">
          <h3>Your Portal</h3>
          <p>
            You are logged in as a <strong>{user.role}</strong>.
          </p>
          {user.role === 'student' && (
            <p>You can view and register for campus events.</p>
          )}
          {user.role === 'admin' && (
            <p>You have administrative access to manage events and users.</p>
          )}
          {user.role === 'club_head' && (
            <p>
              You can create and manage events for your club.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
