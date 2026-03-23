import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import authService from '../../services/authService';
import eventService from '../../services/eventService';
import '../../styles/dashboard.css';

const StudentHome = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
    } else if (currentUser.role !== 'student') {
      navigate('/login');
    } else {
      setUser(currentUser);
    }
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchEvents();
    }
  }, [user]);

  const fetchEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await eventService.getPublicEvents();
      // Get only the first 3 upcoming events
      setEvents((data || []).slice(0, 3));
    } catch (err) {
      setError('Failed to load events');
      console.error('Fetch events error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="dashboard-layout">
      <Sidebar role={user.role} userName={user.name} />
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Student Dashboard</h1>
          <p className="welcome-text">Welcome, {user.name}!</p>
        </div>
        <div className="main-section">
          {/* Quick Actions */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '16px',
              marginBottom: '32px',
            }}
          >
            <div
              onClick={() => navigate('/student-dashboard/browse-events')}
              style={{
                padding: '20px',
                backgroundColor: '#e3f2fd',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                border: '1px solid #90caf9',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <h3 style={{ margin: '0 0 8px 0', color: '#1565c0' }}>📋 Browse Events</h3>
              <p style={{ margin: 0, color: '#424242', fontSize: '14px' }}>
                Explore available campus events and apply to ones that interest you
              </p>
            </div>

            <div
              onClick={() => navigate('/dashboard/student/applications')}
              style={{
                padding: '20px',
                backgroundColor: '#f3e5f5',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                border: '1px solid #ce93d8',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <h3 style={{ margin: '0 0 8px 0', color: '#6a1b9a' }}>📝 My Applications</h3>
              <p style={{ margin: 0, color: '#424242', fontSize: '14px' }}>
                Track your event applications and see their current status
              </p>
            </div>

            <div
              onClick={() => navigate('/dashboard/student/schedule')}
              style={{
                padding: '20px',
                backgroundColor: '#e8f5e9',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                border: '1px solid #81c784',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <h3 style={{ margin: '0 0 8px 0', color: '#2e7d32' }}>📅 My Schedule</h3>
              <p style={{ margin: 0, color: '#424242', fontSize: '14px' }}>
                View all accepted events in your personal schedule
              </p>
            </div>
          </div>

          {/* Upcoming Events Section */}
          <div>
            <h2 style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>📌 Upcoming Events</span>
              <button
                onClick={() => navigate('/student-dashboard/browse-events')}
                style={{
                  fontSize: '14px',
                  padding: '8px 16px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = '#0056b3')}
                onMouseLeave={(e) => (e.target.style.backgroundColor = '#007bff')}
              >
                View All
              </button>
            </h2>

            {loading && (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <p style={{ color: '#666' }}>Loading upcoming events...</p>
              </div>
            )}

            {error && (
              <div
                style={{
                  padding: '12px',
                  backgroundColor: '#fee',
                  color: '#c33',
                  borderRadius: '4px',
                  border: '1px solid #fcc',
                }}
              >
                ❌ {error}
              </div>
            )}

            {!loading && events.length === 0 && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '40px',
                  backgroundColor: '#f9f9f9',
                  borderRadius: '8px',
                  color: '#666',
                }}
              >
                <p>No events available at the moment</p>
              </div>
            )}

            {!loading && events.length > 0 && (
              <div style={{ display: 'grid', gap: '16px' }}>
                {events.map((event) => (
                  <div
                    key={event._id}
                    style={{
                      display: 'flex',
                      gap: '16px',
                      padding: '16px',
                      backgroundColor: 'white',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                    }}
                  >
                    {/* Event Image */}
                    {event.poster && (
                      <div
                        style={{
                          width: '120px',
                          height: '120px',
                          backgroundColor: '#f0f0f0',
                          backgroundImage: `url(${event.poster})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          borderRadius: '8px',
                          flexShrink: 0,
                        }}
                      />
                    )}

                    {/* Event Info */}
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#333' }}>
                        {event.title}
                      </h3>
                      <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '14px' }}>
                        {event.description.substring(0, 80)}...
                      </p>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#555' }}>
                        <span>📍 {event.venue}</span>
                        <span>📅 {formatDate(event.eventDate)}</span>
                      </div>
                    </div>

                    {/* Apply Button */}
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <button
                        onClick={() => navigate('/dashboard/student/events')}
                        style={{
                          padding: '10px 20px',
                          backgroundColor: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          whiteSpace: 'nowrap',
                        }}
                        onMouseEnter={(e) => (e.target.style.backgroundColor = '#218838')}
                        onMouseLeave={(e) => (e.target.style.backgroundColor = '#28a745')}
                      >
                        Learn More
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentHome;
