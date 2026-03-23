import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import authService from '../../services/authService';
import eventService from '../../services/eventService';
import '../../styles/dashboard.css';

const ClubHeadHome = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
    } else if (currentUser.role !== 'club_head') {
      navigate('/login');
    } else {
      setUser(currentUser);
    }
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchClubHeadEvents();
    }
  }, [user]);

  const fetchClubHeadEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await eventService.getClubHeadEvents();
      setEvents(data || []);
    } catch (err) {
      setError('Failed to load your events');
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
          <h1>Club Head Dashboard</h1>
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
              onClick={() => navigate('/club-head-dashboard/create-event')}
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
              <h3 style={{ margin: '0 0 8px 0', color: '#1565c0' }}>➕ Create Event</h3>
              <p style={{ margin: 0, color: '#424242', fontSize: '14px' }}>
                Create a new event for your club
              </p>
            </div>

            <div
              onClick={() => navigate('/dashboard/club-head/my-events')}
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
              <h3 style={{ margin: '0 0 8px 0', color: '#6a1b9a' }}>📋 My Events</h3>
              <p style={{ margin: 0, color: '#424242', fontSize: '14px' }}>
                Manage and view all your created events
              </p>
            </div>

            <div
              onClick={() => navigate('/dashboard/club-head/members')}
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
              <h3 style={{ margin: '0 0 8px 0', color: '#2e7d32' }}>👥 Club Members</h3>
              <p style={{ margin: 0, color: '#424242', fontSize: '14px' }}>
                Manage club members and their roles
              </p>
            </div>
          </div>

          {/* Your Events Section */}
          <div>
            <h2 style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>📌 Your Created Events</span>
              <button
                onClick={() => navigate('/club-head-dashboard/create-event')}
                style={{
                  fontSize: '14px',
                  padding: '8px 16px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = '#218838')}
                onMouseLeave={(e) => (e.target.style.backgroundColor = '#28a745')}
              >
                + New Event
              </button>
            </h2>

            {loading && (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <p style={{ color: '#666' }}>Loading your events...</p>
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
                <p>You haven't created any events yet</p>
                <button
                  onClick={() => navigate('/dashboard/club-head/create-event')}
                  style={{
                    marginTop: '12px',
                    padding: '10px 20px',
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
                  Create Your First Event
                </button>
              </div>
            )}

            {!loading && events.length > 0 && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '16px',
                }}
              >
                {events.map((event) => (
                  <div
                    key={event._id}
                    style={{
                      backgroundColor: 'white',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                    }}
                  >
                    {/* Event Image */}
                    {event.poster && (
                      <div
                        style={{
                          height: '150px',
                          backgroundColor: '#f0f0f0',
                          backgroundImage: `url(${event.poster})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      />
                    )}

                    {/* Event Content */}
                    <div style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                        <h3 style={{ margin: 0, fontSize: '16px', color: '#333', flex: 1 }}>{event.title}</h3>
                        <span
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '600',
                            backgroundColor: event.status === 'active' ? '#d4edda' : '#fff3cd',
                            color: event.status === 'active' ? '#155724' : '#856404',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {event.status}
                        </span>
                      </div>

                      <p style={{ margin: '0 0 12px 0', color: '#666', fontSize: '13px' }}>
                        {event.description.substring(0, 80)}
                        {event.description.length > 80 ? '...' : ''}
                      </p>

                      <div style={{ fontSize: '13px', color: '#555', marginBottom: '12px' }}>
                        <p style={{ margin: '4px 0' }}>📍 {event.venue}</p>
                        <p style={{ margin: '4px 0' }}>📅 {formatDate(event.eventDate)}</p>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => navigate('/dashboard/club-head/applications')}
                          style={{
                            flex: 1,
                            padding: '8px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600',
                          }}
                          onMouseEnter={(e) => (e.target.style.backgroundColor = '#0056b3')}
                          onMouseLeave={(e) => (e.target.style.backgroundColor = '#007bff')}
                        >
                          View Applications
                        </button>
                      </div>
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

export default ClubHeadHome;
