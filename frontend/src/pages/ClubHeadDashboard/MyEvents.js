import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import authService from '../../services/authService';
import eventService from '../../services/eventService';
import '../../styles/dashboard.css';

const MyEvents = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchMyEvents();
    }
  }, [user]);

  const fetchMyEvents = async () => {
    setLoading(true);
    try {
      const data = await eventService.getClubHeadEvents();
      setEvents(data || []);
    } catch (err) {
      console.error('Fetch events error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return '#dcfce7';
      case 'approved':
        return '#dbeafe';
      case 'submitted':
        return '#fef9c3';
      case 'rejected':
        return '#fee';
      default:
        return '#f3f4f6';
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case 'active':
        return '#15803d';
      case 'approved':
        return '#1e40af';
      case 'submitted':
        return '#a16207';
      case 'rejected':
        return '#c33';
      default:
        return '#6b7280';
    }
  };

  const filteredEvents = events.filter((event) => {
    if (filterStatus === 'all') return true;
    return event.status === filterStatus;
  });

  const statusOptions = ['all', 'draft', 'submitted', 'approved', 'active', 'completed', 'rejected', 'cancelled'];

  if (!user) {
    return null;
  }

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex' }}>
      <Sidebar role={user.role} userName={user.name} />
      
      <div style={{ flex: 1, marginLeft: '260px', padding: '40px' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
            My Club Events
          </h1>
          <p style={{ fontSize: '1rem', color: '#64748b', marginTop: '8px' }}>
            Manage all events created by your club
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
            <p style={{ fontSize: '1.1rem' }}>Loading your events...</p>
          </div>
        ) : events.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '80px 40px',
            backgroundColor: 'white',
            borderRadius: '24px',
            border: '2px dashed #e2e8f0'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
            <h3 style={{ color: '#64748b', marginBottom: '8px' }}>No events created yet</h3>
            <p style={{ color: '#94a3b8', marginBottom: '24px' }}>Start creating events for your club</p>
            <button
              onClick={() => navigate('/dashboard/club-head/create-event')}
              style={{
                padding: '12px 28px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#2563eb';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#3b82f6';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Create Event
            </button>
          </div>
        ) : (
          <>
            {/* Filter Buttons */}
            <div style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '32px',
              flexWrap: 'wrap'
            }}>
              {statusOptions.map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: filterStatus === status ? '#3b82f6' : '#e2e8f0',
                    color: filterStatus === status ? 'white' : '#475569',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textTransform: 'capitalize'
                  }}
                  onMouseEnter={(e) => {
                    if (filterStatus !== status) {
                      e.target.style.backgroundColor = '#cbd5e1';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (filterStatus !== status) {
                      e.target.style.backgroundColor = '#e2e8f0';
                    }
                  }}
                >
                  {status === 'all' ? 'All Events' : status}
                </button>
              ))}
            </div>

            {/* Events List */}
            {filteredEvents.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 40px',
                backgroundColor: 'white',
                borderRadius: '24px',
                border: '2px dashed #e2e8f0'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
                <h3 style={{ color: '#64748b', marginBottom: '8px' }}>No {filterStatus} events</h3>
                <p style={{ color: '#94a3b8' }}>You don't have any events in this category</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '24px' }}>
                {filteredEvents.map((event) => (
                  <div
                    key={event._id}
                    style={{
                      backgroundColor: 'white',
                      borderRadius: '16px',
                      padding: '24px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.05)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      borderLeft: `4px solid ${getStatusTextColor(event.status)}`
                    }}
                    onClick={() => setSelectedEvent(event)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.05)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '20px', alignItems: 'center' }}>
                      <div>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>
                          Event Name
                        </p>
                        <p style={{ margin: '6px 0 0 0', fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>
                          {event.title}
                        </p>
                      </div>

                      <div>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>
                          Date & Venue
                        </p>
                        <p style={{ margin: '6px 0 0 0', fontSize: '0.95rem', color: '#0f172a' }}>
                          <span style={{ fontWeight: '600' }}>📍</span> {event.venue}
                        </p>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.95rem', color: '#0f172a' }}>
                          <span style={{ fontWeight: '600' }}>📅</span> {formatDate(event.eventDate)}
                        </p>
                      </div>

                      <div>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>
                          Details
                        </p>
                        <p style={{ margin: '6px 0 0 0', fontSize: '0.95rem', color: '#0f172a' }}>
                          <span style={{ fontWeight: '600' }}>🎟️</span> Capacity: {event.capacity || 0}
                        </p>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.95rem', color: '#0f172a' }}>
                          <span style={{ fontWeight: '600' }}>{event.ideationNeeded ? '📎' : '✓'}</span> {event.ideationNeeded ? 'Requires Docs' : 'No Docs'}
                        </p>
                      </div>

                      <div style={{
                        padding: '8px 16px',
                        backgroundColor: getStatusColor(event.status),
                        color: getStatusTextColor(event.status),
                        borderRadius: '12px',
                        fontWeight: '700',
                        fontSize: '0.9rem',
                        textAlign: 'center',
                        textTransform: 'capitalize',
                        whiteSpace: 'nowrap'
                      }}>
                        {event.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Event Detail Modal */}
        {selectedEvent && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '24px',
              maxWidth: '800px',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              width: '90%',
              padding: '40px'
            }}>
              {/* Close Button */}
              <button
                onClick={() => setSelectedEvent(null)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#f1f5f9',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#e2e8f0';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#f1f5f9';
                }}
              >
                ✕
              </button>

              {/* Event Header */}
              <h2 style={{ margin: '0 0 8px 0', fontSize: '2rem', color: '#0f172a', fontWeight: '800' }}>
                {selectedEvent.title}
              </h2>

              <div style={{
                display: 'inline-block',
                padding: '8px 16px',
                backgroundColor: getStatusColor(selectedEvent.status),
                color: getStatusTextColor(selectedEvent.status),
                borderRadius: '12px',
                fontWeight: '700',
                fontSize: '0.9rem',
                textTransform: 'capitalize',
                marginBottom: '24px'
              }}>
                {selectedEvent.status}
              </div>

              {/* Event Poster */}
              {selectedEvent.poster && (
                <div style={{
                  width: '100%',
                  height: '300px',
                  backgroundImage: `url(${selectedEvent.poster})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderRadius: '16px',
                  marginBottom: '24px',
                  border: '1px solid #e2e8f0'
                }}
                />
              )}

              {/* Event Description */}
              <p style={{ fontSize: '1rem', color: '#475569', lineHeight: 1.7, marginBottom: '24px' }}>
                {selectedEvent.description}
              </p>

              {/* Event Details Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                marginBottom: '24px',
                padding: '24px',
                backgroundColor: '#f8fafc',
                borderRadius: '16px'
              }}>
                <div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>
                    📍 Venue
                  </p>
                  <p style={{ margin: '8px 0 0 0', fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>
                    {selectedEvent.venue}
                  </p>
                </div>

                <div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>
                    📅 Date & Time
                  </p>
                  <p style={{ margin: '8px 0 0 0', fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>
                    {formatDate(selectedEvent.eventDate)}
                  </p>
                </div>

                <div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>
                    🎟️ Capacity
                  </p>
                  <p style={{ margin: '8px 0 0 0', fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>
                    {selectedEvent.capacity} seats
                  </p>
                </div>

                <div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>
                    📎 Documentation
                  </p>
                  <p style={{ margin: '8px 0 0 0', fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>
                    {selectedEvent.ideationNeeded ? '✅ Required' : '❌ Not Required'}
                  </p>
                </div>
              </div>

              {/* Required Skills */}
              {selectedEvent.requiredSkills && selectedEvent.requiredSkills.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <p style={{ margin: '0 0 12px 0', fontSize: '0.9rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>
                    🎯 Required Skills
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {selectedEvent.requiredSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        style={{
                          backgroundColor: '#eff6ff',
                          color: '#1e40af',
                          padding: '8px 16px',
                          borderRadius: '20px',
                          fontSize: '0.9rem',
                          fontWeight: '600'
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Problem Statement */}
              {selectedEvent.problemStatement && (
                <div style={{
                  padding: '20px',
                  backgroundColor: '#eff6ff',
                  borderRadius: '16px',
                  border: '1px solid #bfdbfe',
                  marginBottom: '24px'
                }}>
                  <p style={{ margin: '0 0 12px 0', fontSize: '0.9rem', fontWeight: '600', color: '#1e40af', textTransform: 'uppercase' }}>
                    💡 Problem Statement
                  </p>
                  <p style={{ margin: 0, fontSize: '0.95rem', color: '#1e293b', lineHeight: 1.6 }}>
                    {selectedEvent.problemStatement}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-start' }}>
                <button
                  onClick={() => navigate(`/dashboard/club-head/applications`)}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#2563eb';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#3b82f6';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  View Applications
                </button>

                <button
                  onClick={() => setSelectedEvent(null)}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#e2e8f0',
                    color: '#0f172a',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#cbd5e1';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#e2e8f0';
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyEvents;
