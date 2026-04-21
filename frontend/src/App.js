import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import MainDashboard from './pages/MainDashboard';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

// Student Pages
import StudentHome from './pages/StudentDashboard/StudentHome';
import BrowseEvents from './pages/StudentDashboard/BrowseEvents';
import MyApplications from './pages/StudentDashboard/MyApplications';
import MySchedule from './pages/StudentDashboard/MySchedule';

// Club Head Pages
import ClubHeadHome from './pages/ClubHeadDashboard/ClubHeadHome';
import CreateEvent from './pages/ClubHeadDashboard/CreateEvent';
import MyEvents from './pages/ClubHeadDashboard/MyEvents';
import ApplicationsClubHead from './pages/ClubHeadDashboard/ApplicationsClubHead';
import ClubMembers from './pages/ClubHeadDashboard/ClubMembers';
import VenueRequests from './pages/ClubHeadDashboard/VenueRequests';

// Admin Pages
import AdminHome from './pages/AdminDashboard/AdminHome';
import PendingRequests from './pages/AdminDashboard/PendingRequests';
import AllEvents from './pages/AdminDashboard/AllEvents';
import Venues from './pages/AdminDashboard/Venues';
import Users from './pages/AdminDashboard/Users';

import authService from './services/authService';
import './App.css';

function App() {
  const [isReady, setIsReady] = useState(true);

  useEffect(() => {
    // Initialize app
    const token = authService.getToken();
    if (token) {
      setIsReady(true);
    }
  }, []);

  if (!isReady) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Main Dashboard - Redirects to role-specific dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainDashboard />
            </ProtectedRoute>
          }
        />

        {/* Student Dashboard Routes */}
        <Route
          path="/dashboard/student"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/student/events"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <BrowseEvents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/student/applications"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <MyApplications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/student/schedule"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <MySchedule />
            </ProtectedRoute>
          }
        />

        {/* Club Head Dashboard Routes */}
        <Route
          path="/dashboard/club-head"
          element={
            <ProtectedRoute allowedRoles={['club_head']}>
              <ClubHeadHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/club-head/create-event"
          element={
            <ProtectedRoute allowedRoles={['club_head']}>
              <CreateEvent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/club-head/my-events"
          element={
            <ProtectedRoute allowedRoles={['club_head']}>
              <MyEvents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/club-head/applications"
          element={
            <ProtectedRoute allowedRoles={['club_head']}>
              <ApplicationsClubHead />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/club-head/members"
          element={
            <ProtectedRoute allowedRoles={['club_head']}>
              <ClubMembers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/club-head/venue-requests"
          element={
            <ProtectedRoute allowedRoles={['club_head']}>
              <VenueRequests />
            </ProtectedRoute>
          }
        />

        {/* Admin Dashboard Routes */}
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/pending-requests"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <PendingRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/all-events"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AllEvents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/venues"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Venues />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Users />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
