import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import authService from '../../services/authService';
import eventService from '../../services/eventService';
import '../../styles/dashboard.css';

const AllEvents = () => {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/login');
    } else {
      setUser(currentUser);
    }
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchEvents();
    }
  }, [user, statusFilter]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await eventService.getAllEventsForAdmin(statusFilter === 'all' ? null : statusFilter);
      setEvents(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch events');
      console.error('Fetch events error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      approved: { bg: '#d4edda', color: '#155724', border: '#c3e6cb' },
      submitted: { bg: '#fff3cd', color: '#856404', border: '#ffeaa7' },
      active: { bg: '#cce5ff', color: '#004085', border: '#b8daff' },
      draft: { bg: '#e2e3e5', color: '#383d41', border: '#d6d8db' },
      rejected: { bg: '#f8d7da', color: '#721c24', border: '#f5c6cb' },
    };

    const style = statusStyles[status] || statusStyles.draft;

    return (
      <span
        style={{
          display: 'inline-block',
          padding: '4px 12px',
          backgroundColor: style.bg,
          color: style.color,
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: '500',
          border: `1px solid ${style.border}`,
        }}
      >
        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
      </span>
    );
  };

  if (!user) {
    return null;
  }

  return (
    <div className="dashboard-layout">
      <Sidebar role={user.role} userName={user.name} />
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>All Events</h1>
          <p className="subtitle">View all approved and pending events in the system</p>
        </div>

        <div className="main-section">
          {/* Status Filter */}
          <div style={{ marginBottom: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {['all', 'approved', 'submitted', 'active', 'draft', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                style={{
                  padding: '8px 16px',
                  border: statusFilter === status ? '2px solid #007bff' : '1px solid #ddd',
                  backgroundColor: statusFilter === status ? '#e7f3ff' : 'white',
                  color: statusFilter === status ? '#007bff' : '#666',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: statusFilter === status ? '600' : '400',
                  transition: 'all 0.2s ease',
                }}
                onMouseOver={(e) => {
                  if (statusFilter !== status) {
                    e.target.style.borderColor = '#007bff';
                    e.target.style.backgroundColor = '#f9f9f9';
                  }
                }}
                onMouseOut={(e) => {
                  if (statusFilter !== status) {
                    e.target.style.borderColor = '#ddd';
                    e.target.style.backgroundColor = 'white';
                  }
                }}
              >
                {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
              </button>
            ))}
          </div>

          {error && (
            <div
              style={{
                padding: '12px',
                marginBottom: '16px',
                backgroundColor: '#fee',
                color: '#c33',
                borderRadius: '4px',
                border: '1px solid #fcc',
              }}
            >
              Error: {error}
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>Loading events...</p>
            </div>
          ) : events.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
              <p>No events found</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {events.map((event) => (
                <div
                  key={event._id}
                  style={{
                    padding: '16px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    backgroundColor: 'white',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                    <div>
                      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600' }}>
                        {event.title}
                      </h3>
                      <p style={{ margin: '0', fontSize: '13px', color: '#666' }}>
                        Club Head: {event.clubHeadId?.name || 'N/A'} ({event.clubHeadId?.email || 'N/A'})
                      </p>
                    </div>
                    {getStatusBadge(event.status)}
                  </div>

                  <p style={{ margin: '8px 0', fontSize: '13px', color: '#666' }}>
                    {event.description}
                  </p>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '12px',
                      marginTop: '12px',
                      paddingTop: '12px',
                      borderTop: '1px solid #eee',
                    }}
                  >
                    <div>
                      <p style={{ margin: '0', fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Event Date
                      </p>
                      <p style={{ margin: '4px 0 0 0', fontSize: '13px', fontWeight: '500' }}>
                        {new Date(event.eventDate).toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <p style={{ margin: '0', fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Venue
                      </p>
                      <p style={{ margin: '4px 0 0 0', fontSize: '13px', fontWeight: '500' }}>
                        {event.approvedLocation || event.venue || 'Pending'}
                      </p>
                    </div>

                    <div>
                      <p style={{ margin: '0', fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Capacity
                      </p>
                      <p style={{ margin: '4px 0 0 0', fontSize: '13px', fontWeight: '500' }}>
                        {event.capacity || 'Unlimited'}
                      </p>
                    </div>

                    <div>
                      <p style={{ margin: '0', fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Created
                      </p>
                      <p style={{ margin: '4px 0 0 0', fontSize: '13px', fontWeight: '500' }}>
                        {new Date(event.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {event.requiredSkills && event.requiredSkills.length > 0 && (
                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #eee' }}>
                      <p style={{ margin: '0 0 8px 0', fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Required Skills
                      </p>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {event.requiredSkills.map((skill, idx) => (
                          <span
                            key={idx}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: '#f0f0f0',
                              borderRadius: '3px',
                              fontSize: '12px',
                            }}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {event.ideationNeeded && (
                    <div style={{ marginTop: '12px', padding: '8px 12px', backgroundColor: '#fffef5', borderRadius: '4px', border: '1px solid #ffeb99' }}>
                      <p style={{ margin: '0', fontSize: '12px', color: '#996600' }}>
                        📝 Ideation/Documentation Required
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllEvents;
