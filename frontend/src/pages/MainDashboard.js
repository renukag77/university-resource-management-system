import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import '../styles/mainDashboard.css';

const MainDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
    } else {
      setUser(currentUser);
      setLoading(false);
    }
  }, [navigate]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  // Redirect to role-specific dashboard
  const roleDashboards = {
    student: '/dashboard/student',
    club_head: '/dashboard/club-head',
    admin: '/dashboard/admin',
  };

  if (roleDashboards[user.role]) {
    navigate(roleDashboards[user.role]);
  }

  return null;
};

export default MainDashboard;
