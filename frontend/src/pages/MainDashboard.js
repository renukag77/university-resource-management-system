import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import '../styles/mainDashboard.css';

const MainDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      const roleDashboards = {
        student: '/dashboard/student',
        club_head: '/dashboard/club-head',
        admin: '/dashboard/admin',
      };
      
      if (roleDashboards[currentUser.role]) {
        navigate(roleDashboards[currentUser.role], { replace: true });
      }
    }
  }, [navigate]);

  return null;
};

export default MainDashboard;
