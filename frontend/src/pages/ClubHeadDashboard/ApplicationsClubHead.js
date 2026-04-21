import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import authService from '../../services/authService';
import eventService from '../../services/eventService';
import '../../styles/dashboard.css';

const ApplicationsClubHead = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [respondingAppId, setRespondingAppId] = useState(null);
  const [responseComment, setResponseComment] = useState('');
  const [responseStatus, setResponseStatus] = useState('accepted');
  const [responseMessage, setResponseMessage] = useState('');

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchClubHeadData();
    }
  }, [user]);

  const fetchClubHeadData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await eventService.getClubHeadDashboard();
      setEvents(data.events || []);
      
      // Load applications for the first event if available
      if (data.events && data.events.length > 0) {
        setSelectedEventId(data.events[0]._id);
        await loadApplicationsForEvent(data.events[0]._id);
      }
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Fetch dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadApplicationsForEvent = async (eventId) => {
    try {
      const data = await eventService.getEventApplications(eventId);
      setApplications(data || []);
    } catch (err) {
      setError('Failed to load applications');
      console.error('Load applications error:', err);
    }
  };

  const handleEventChange = (eventId) => {
    setSelectedEventId(eventId);
    loadApplicationsForEvent(eventId);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return '#dcfce7';
      case 'rejected':
        return '#fee';
      case 'applied':
        return '#eff6ff';
      default:
        return '#f3f4f6';
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case 'accepted':
        return '#15803d';
      case 'rejected':
        return '#c33';
      case 'applied':
        return '#1e40af';
      default:
        return '#6b7280';
    }
  };

  const filteredApplications = applications.filter((app) => {
    if (filterStatus === 'all') return true;
    return app.status === filterStatus;
  });

  const handleDownloadDocument = (docUrl) => {
    // Open PDF directly in new tab/window for viewing
    window.open(docUrl, '_blank', 'noopener,noreferrer');
  };

  const handleRespondToApplication = async () => {
    if (!responseComment.trim()) {
      setResponseMessage('❌ Please provide a comment');
      return;
    }

    setRespondingAppId(selectedApplication._id);
    try {
      await eventService.respondToApplication(selectedApplication._id, responseStatus, responseComment);
      setResponseMessage(`✅ Application ${responseStatus} successfully!`);
      
      // Reload applications
      setTimeout(() => {
        setSelectedApplication(null);
        setResponseComment('');
        setResponseStatus('accepted');
        setResponseMessage('');
        loadApplicationsForEvent(selectedEventId);
      }, 1500);
    } catch (err) {
      setResponseMessage(`❌ ${err.message}`);
    } finally {
      setRespondingAppId(null);
    }
  };

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
            Student Applications
          </h1>
          <p style={{ fontSize: '1rem', color: '#64748b', marginTop: '8px' }}>
            Review and manage applications from students
          </p>
        </div>

        {error && (
          <div style={{
            padding: '16px',
            backgroundColor: '#fee',
            color: '#c33',
            borderRadius: '12px',
            border: '1px solid #fcc',
            marginBottom: '24px'
          }}>
            ❌ {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
            <p style={{ fontSize: '1.1rem' }}>Loading applications...</p>
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
            <p style={{ color: '#94a3b8', marginBottom: '24px' }}>Create an event first to view applications</p>
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
            {/* Event Selection */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '20px',
              padding: '24px',
              marginBottom: '32px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              border: '1px solid #e2e8f0'
            }}>
              <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600', color: '#0f172a' }}>
                Select Event to View Applications:
              </label>
              <select
                value={selectedEventId || ''}
                onChange={(e) => handleEventChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  backgroundColor: 'white',
                  color: '#0f172a'
                }}
              >
                {events.map((event) => (
                  <option key={event._id} value={event._id}>
                    {event.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Filters */}
            <div style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '32px',
              flexWrap: 'wrap'
            }}>
              {['all', 'applied', 'accepted', 'rejected'].map((status) => (
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
                  {status === 'all' ? 'All Applications' : status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>

            {/* Applications List */}
            {filteredApplications.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 40px',
                backgroundColor: 'white',
                borderRadius: '24px',
                border: '2px dashed #e2e8f0'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
                <h3 style={{ color: '#64748b', marginBottom: '8px' }}>No applications yet</h3>
                <p style={{ color: '#94a3b8' }}>Applications will appear here once students apply to your events</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {filteredApplications.map((application) => (
                  <div
                    key={application._id}
                    style={{
                      backgroundColor: 'white',
                      borderRadius: '16px',
                      padding: '24px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.05)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      borderLeft: `4px solid ${getStatusTextColor(application.status)}`
                    }}
                    onClick={() => setSelectedApplication(application)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.05)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 1fr auto',
                      gap: '20px',
                      alignItems: 'center'
                    }}>
                      <div>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>
                          Student
                        </p>
                        <p style={{ margin: '6px 0 0 0', fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>
                          {application.userId?.name || 'Unknown'}
                        </p>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: '#64748b' }}>
                          {application.userId?.email || 'N/A'}
                        </p>
                      </div>

                      <div>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>
                          Applied On
                        </p>
                        <p style={{ margin: '6px 0 0 0', fontSize: '0.95rem', fontWeight: '700', color: '#0f172a' }}>
                          {formatDate(application.appliedAt)}
                        </p>
                      </div>

                      <div>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>
                          Documents
                        </p>
                        <p style={{ margin: '6px 0 0 0', fontSize: '0.95rem', fontWeight: '700', color: '#0f172a' }}>
                          {application.submittedDocumentation?.length || 0} file(s)
                        </p>
                      </div>

                      <div style={{
                        padding: '8px 16px',
                        backgroundColor: getStatusColor(application.status),
                        color: getStatusTextColor(application.status),
                        borderRadius: '12px',
                        fontWeight: '700',
                        fontSize: '0.9rem',
                        textAlign: 'center',
                        textTransform: 'capitalize',
                        whiteSpace: 'nowrap'
                      }}>
                        {application.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Application Detail Modal */}
        {selectedApplication && (
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
              maxWidth: '700px',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              width: '90%',
              padding: '40px'
            }}>
              {/* Close Button */}
              <button
                onClick={() => setSelectedApplication(null)}
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

              {/* Student Info */}
              <h2 style={{ margin: '0 0 24px 0', fontSize: '2rem', color: '#0f172a', fontWeight: '800' }}>
                {selectedApplication.userId?.name}
              </h2>

              <div style={{
                padding: '20px',
                backgroundColor: '#f8fafc',
                borderRadius: '16px',
                marginBottom: '24px'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>Email</p>
                    <p style={{ margin: '8px 0 0 0', fontSize: '0.95rem', color: '#0f172a' }}>
                      {selectedApplication.userId?.email}
                    </p>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>Applied</p>
                    <p style={{ margin: '8px 0 0 0', fontSize: '0.95rem', color: '#0f172a' }}>
                      {formatDate(selectedApplication.appliedAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Submitted Documents */}
              {selectedApplication.submittedDocumentation && selectedApplication.submittedDocumentation.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <p style={{ margin: '0 0 12px 0', fontSize: '0.9rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>
                    📎 Submitted Documents
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                    {selectedApplication.submittedDocumentation.map((docUrl, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleDownloadDocument(docUrl)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#eff6ff',
                          color: '#1e40af',
                          textDecoration: 'none',
                          borderRadius: '12px',
                          fontWeight: '600',
                          fontSize: '0.9rem',
                          border: '2px solid #bfdbfe',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#bfdbfe';
                          e.target.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = '#eff6ff';
                          e.target.style.transform = 'translateY(0)';
                        }}
                      >
                        📄 Document {idx + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Current Status */}
              <div style={{
                padding: '12px 16px',
                backgroundColor: getStatusColor(selectedApplication.status),
                color: getStatusTextColor(selectedApplication.status),
                borderRadius: '12px',
                marginBottom: '24px',
                fontWeight: '700',
                textAlign: 'center',
                textTransform: 'capitalize'
              }}>
                Current Status: {selectedApplication.status}
              </div>

              {/* Response Section */}
              {selectedApplication.status === 'applied' && (
                <div style={{
                  padding: '20px',
                  backgroundColor: '#fef3c7',
                  borderRadius: '16px',
                  marginBottom: '24px',
                  border: '2px dashed #f59e0b'
                }}>
                  <p style={{ margin: '0 0 16px 0', fontSize: '0.9rem', fontWeight: '600', color: '#92400e' }}>
                    Respond to Application
                  </p>

                  {responseMessage && (
                    <div style={{
                      padding: '12px',
                      backgroundColor: responseMessage.includes('✅') ? '#dcfce7' : '#fee',
                      color: responseMessage.includes('✅') ? '#15803d' : '#c33',
                      borderRadius: '8px',
                      marginBottom: '16px',
                      fontSize: '0.9rem'
                    }}>
                      {responseMessage}
                    </div>
                  )}

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem', color: '#0f172a' }}>
                      Decision
                    </label>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      {['accepted', 'rejected'].map((status) => (
                        <button
                          key={status}
                          onClick={() => setResponseStatus(status)}
                          style={{
                            flex: 1,
                            padding: '10px',
                            backgroundColor: responseStatus === status ? '#3b82f6' : '#e2e8f0',
                            color: responseStatus === status ? 'white' : '#475569',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            textTransform: 'capitalize',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {status === 'accepted' ? '✅ Accept' : '❌ Reject'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem', color: '#0f172a' }}>
                      Comment/Feedback
                    </label>
                    <textarea
                      value={responseComment}
                      onChange={(e) => setResponseComment(e.target.value)}
                      placeholder="Provide feedback to the student..."
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #f59e0b',
                        borderRadius: '8px',
                        fontFamily: 'inherit',
                        fontSize: '0.9rem',
                        minHeight: '100px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <button
                    onClick={handleRespondToApplication}
                    disabled={respondingAppId === selectedApplication._id}
                    style={{
                      width: '100%',
                      marginTop: '16px',
                      padding: '12px',
                      backgroundColor: respondingAppId === selectedApplication._id ? '#cbd5e1' : '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '700',
                      cursor: respondingAppId === selectedApplication._id ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {respondingAppId === selectedApplication._id ? 'Submitting...' : 'Submit Response'}
                  </button>
                </div>
              )}

              {selectedApplication.clubHeadComment && (
                <div style={{
                  padding: '16px',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '12px',
                  marginBottom: '24px'
                }}>
                  <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '600', color: '#64748b' }}>
                    Your Comment
                  </p>
                  <p style={{ margin: '8px 0 0 0', fontSize: '0.95rem', color: '#0f172a', lineHeight: 1.6 }}>
                    {selectedApplication.clubHeadComment}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationsClubHead;
