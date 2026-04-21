import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import authService from '../../services/authService';
import eventService from '../../services/eventService';

const ClubHeadHome = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [allEvents, setAllEvents] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [allEventsData, myEventsData] = await Promise.all([
        eventService.getPublicEvents(),
        eventService.getClubHeadEvents(),
      ]);
      setAllEvents(allEventsData || []);
      setMyEvents(myEventsData || []);
    } catch (err) {
      console.error('Fetch events error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getEventsForDate = (date) => {
    return allEvents.filter((event) => {
      const eventDate = new Date(event.eventDate);
      return (
        eventDate.getDate() === date &&
        eventDate.getMonth() === currentMonth.getMonth() &&
        eventDate.getFullYear() === currentMonth.getFullYear()
      );
    });
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

  const formatDate = (dateString) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const monthYear = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const calendarDays = [];

  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  if (!user) {
    return null;
  }

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex' }}>
      <Sidebar role={user.role} userName={user.name} />
      
      <div style={{ flex: 1, marginLeft: '260px', padding: '40px' }}>
        {/* Header Section */}
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
          Club Head Dashboard
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#64748b', marginBottom: '40px' }}>
          Welcome back, <span style={{ color: '#3b82f6', fontWeight: '600' }}>{user.name}</span>!
        </p>

        {/* Action Buttons Bar */}
        <div style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '50px',
          width: '100%',
          flexWrap: 'wrap',
        }}>
          <button
            onClick={() => navigate('/dashboard/club-head/create-event')}
            style={{
              flex: '1 1 auto',
              minWidth: '200px',
              padding: '18px 24px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: 'white',
              borderRadius: '14px',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '1.05rem',
              border: 'none',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-4px)';
              e.target.style.boxShadow = '0 12px 30px rgba(59, 130, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3)';
            }}
          >
            <span style={{ marginRight: '8px' }}>➕</span>
            Create Event
          </button>

          <button
            onClick={() => navigate('/dashboard/club-head/my-events')}
            style={{
              flex: '1 1 auto',
              minWidth: '200px',
              padding: '18px 24px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              color: 'white',
              borderRadius: '14px',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '1.05rem',
              border: 'none',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-4px)';
              e.target.style.boxShadow = '0 12px 30px rgba(139, 92, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(139, 92, 246, 0.3)';
            }}
          >
            <span style={{ marginRight: '8px' }}>📋</span>
            My Events
          </button>

          <button
            onClick={() => navigate('/dashboard/club-head/applications')}
            style={{
              flex: '1 1 auto',
              minWidth: '200px',
              padding: '18px 24px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              borderRadius: '14px',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '1.05rem',
              border: 'none',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-4px)';
              e.target.style.boxShadow = '0 12px 30px rgba(16, 185, 129, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)';
            }}
          >
            <span style={{ marginRight: '8px' }}>📊</span>
            Applications
          </button>

          <button
            onClick={() => navigate('/dashboard/club-head/venue-requests')}
            style={{
              flex: '1 1 auto',
              minWidth: '200px',
              padding: '18px 24px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: 'white',
              borderRadius: '14px',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '1.05rem',
              border: 'none',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-4px)';
              e.target.style.boxShadow = '0 12px 30px rgba(245, 158, 11, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(245, 158, 11, 0.3)';
            }}
          >
            <span style={{ marginRight: '8px' }}>🏢</span>
            Venue Requests
          </button>
        </div>

        {/* Main Content - Calendar + My Events */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '40px', alignItems: 'start' }}>
          {/* Calendar Section */}
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', marginBottom: '24px' }}>
              📅 All Events Calendar
            </h2>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'white', borderRadius: '16px' }}>
                <p style={{ color: '#64748b' }}>Loading calendar...</p>
              </div>
            ) : (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '20px',
                padding: '32px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                border: '1px solid #e2e8f0'
              }}>
                {/* Calendar Navigation */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '32px'
                }}>
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#e2e8f0',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#cbd5e1'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#e2e8f0'}
                  >
                    ← Prev
                  </button>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                    {monthYear}
                  </h3>
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#e2e8f0',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#cbd5e1'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#e2e8f0'}
                  >
                    Next →
                  </button>
                </div>

                {/* Calendar Grid - Day Headers */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: '8px',
                  marginBottom: '16px'
                }}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div
                      key={day}
                      style={{
                        textAlign: 'center',
                        fontWeight: '700',
                        color: '#64748b',
                        padding: '12px 0',
                        fontSize: '0.9rem',
                        textTransform: 'uppercase'
                      }}
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid - Days */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: '8px'
                }}>
                  {calendarDays.map((day, idx) => {
                    const eventsForDay = day ? getEventsForDate(day) : [];
                    return (
                      <div
                        key={idx}
                        onClick={() => day && setSelectedDate(day)}
                        style={{
                          minHeight: '100px',
                          padding: '8px',
                          backgroundColor: day && selectedDate === day ? '#eff6ff' : '#f8fafc',
                          border: day && selectedDate === day ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                          borderRadius: '12px',
                          cursor: day ? 'pointer' : 'default',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          flexDirection: 'column'
                        }}
                        onMouseEnter={(e) => {
                          if (day) {
                            e.currentTarget.style.backgroundColor = '#f1f5f9';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (day && selectedDate !== day) {
                            e.currentTarget.style.backgroundColor = '#f8fafc';
                            e.currentTarget.style.boxShadow = 'none';
                          }
                        }}
                      >
                        {day && (
                          <>
                            <div style={{
                              fontWeight: '700',
                              color: '#0f172a',
                              marginBottom: '6px',
                              fontSize: '1rem'
                            }}>
                              {day}
                            </div>
                            {eventsForDay.length > 0 && (
                              <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '4px',
                                flex: 1
                              }}>
                                {eventsForDay.slice(0, 2).map((event) => (
                                  <div
                                    key={event._id}
                                    style={{
                                      fontSize: '0.7rem',
                                      padding: '4px 6px',
                                      backgroundColor: getStatusColor(event.status),
                                      color: getStatusTextColor(event.status),
                                      borderRadius: '4px',
                                      fontWeight: '600',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      cursor: 'pointer',
                                      transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.transform = 'scale(1.05)';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.transform = 'scale(1)';
                                    }}
                                    title={event.title}
                                  >
                                    {event.title}
                                  </div>
                                ))}
                                {eventsForDay.length > 2 && (
                                  <div style={{
                                    fontSize: '0.7rem',
                                    color: '#64748b',
                                    fontWeight: '600',
                                    padding: '2px 6px'
                                  }}>
                                    +{eventsForDay.length - 2} more
                                  </div>
                                )}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Selected Date Events Detail */}
                {selectedDate && getEventsForDate(selectedDate).length > 0 && (
                  <div style={{ marginTop: '32px', paddingTop: '32px', borderTop: '1px solid #e2e8f0' }}>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>
                      Events on {currentMonth.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {getEventsForDate(selectedDate).map((event) => (
                        <div
                          key={event._id}
                          style={{
                            padding: '12px',
                            backgroundColor: getStatusColor(event.status),
                            borderLeft: `4px solid ${getStatusTextColor(event.status)}`,
                            borderRadius: '8px'
                          }}
                        >
                          <p style={{ margin: '0 0 4px 0', fontWeight: '700', color: '#0f172a', fontSize: '0.95rem' }}>
                            {event.title}
                          </p>
                          <p style={{ margin: '0', fontSize: '0.85rem', color: '#475569' }}>
                            📍 {event.venue} • 🕐 {new Date(event.eventDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* My Events Sidebar */}
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', marginBottom: '24px' }}>
              🎯 My Club Events
            </h2>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: 'white', borderRadius: '16px' }}>
                <p style={{ color: '#64748b' }}>Loading...</p>
              </div>
            ) : myEvents.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '48px 24px',
                backgroundColor: 'white',
                borderRadius: '16px',
                border: '2px dashed #e2e8f0'
              }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>📋</div>
                <h4 style={{ color: '#64748b', marginBottom: '16px' }}>No events yet</h4>
                <button
                  onClick={() => navigate('/dashboard/club-head/create-event')}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  Create First Event
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {myEvents.map((event) => (
                  <div
                    key={event._id}
                    style={{
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      padding: '16px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.12)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.04)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>
                      {event.title}
                    </h4>
                    <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: '#475569', lineHeight: 1.4 }}>
                      📍 {event.venue}
                    </p>
                    <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: '#475569' }}>
                      📅 {formatDate(event.eventDate)}
                    </p>
                    <div style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      backgroundColor: getStatusColor(event.status),
                      color: getStatusTextColor(event.status),
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      textTransform: 'capitalize'
                    }}>
                      {event.status}
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
