import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import authService from '../../services/authService';
import eventService from '../../services/eventService';
import '../../styles/dashboard.css';

const MyApplications = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [withdrawingAppId, setWithdrawingAppId] = useState(null);
  const [withdrawMessage, setWithdrawMessage] = useState('');

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await eventService.getStudentApplications();
      setApplications(data || []);
    } catch (err) {
      setError('Failed to load applications');
      console.error('Fetch applications error:', err);
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
      case 'accepted':
        return '#dcfce7';
      case 'rejected':
        return '#fee';
      case 'applied':
        return '#eff6ff';
      case 'withdrawn':
        return '#f3f4f6';
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
      case 'withdrawn':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const handleWithdrawApplication = async (appId) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) {
      return;
    }

    setWithdrawingAppId(appId);
    setWithdrawMessage('');
    try {
      await eventService.withdrawApplication(appId);
      setWithdrawMessage('✅ Application withdrawn successfully!');
      
      setTimeout(() => {
        setSelectedApplication(null);
        setWithdrawMessage('');
        fetchApplications();
      }, 1500);
    } catch (err) {
      setWithdrawMessage(`❌ ${err.message}`);
    } finally {
      setWithdrawingAppId(null);
    }
  };

  const handleDownloadDocument = (docUrl) => {
    // Open PDF directly in new tab/window for viewing
    window.open(docUrl, '_blank', 'noopener,noreferrer');
  };

  const filteredApplications = applications.filter((app) => {
    if (filterStatus === 'all') return true;
    return app.status === filterStatus;
  });

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
            My Applications
          </h1>
          <p style={{ fontSize: '1rem', color: '#64748b', marginTop: '8px' }}>
            Track and manage your event applications
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
        ) : applications.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '80px 40px',
            backgroundColor: 'white',
            borderRadius: '24px',
            border: '2px dashed #e2e8f0'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
            <h3 style={{ color: '#64748b', marginBottom: '8px' }}>No applications yet</h3>
            <p style={{ color: '#94a3b8', marginBottom: '24px' }}>You haven't applied for any events yet</p>
            <button
              onClick={() => navigate('/student-dashboard/student-home')}
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
              Browse Events
            </button>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '32px',
              flexWrap: 'wrap'
            }}>
              {['all', 'applied', 'accepted', 'rejected', 'withdrawn'].map((status) => (
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
                <h3 style={{ color: '#64748b', marginBottom: '8px' }}>No {filterStatus} applications</h3>
                <p style={{ color: '#94a3b8' }}>You don't have any applications in this category</p>
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
                          Event
                        </p>
                        <p style={{ margin: '6px 0 0 0', fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>
                          {application.eventId?.title || 'Unknown Event'}
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

              {/* Event Info */}
              <h2 style={{ margin: '0 0 8px 0', fontSize: '2rem', color: '#0f172a', fontWeight: '800' }}>
                {selectedApplication.eventId?.title}
              </h2>

              <p style={{ margin: '0 0 24px 0', color: '#64748b', fontSize: '0.95rem' }}>
                {selectedApplication.eventId?.description}
              </p>

              <div style={{
                padding: '20px',
                backgroundColor: '#f8fafc',
                borderRadius: '16px',
                marginBottom: '24px'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>📍 Venue</p>
                    <p style={{ margin: '8px 0 0 0', fontSize: '0.95rem', color: '#0f172a', fontWeight: '700' }}>
                      {selectedApplication.eventId?.venue}
                    </p>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>📅 Event Date</p>
                    <p style={{ margin: '8px 0 0 0', fontSize: '0.95rem', color: '#0f172a', fontWeight: '700' }}>
                      {selectedApplication.eventId?.eventDate ? formatDate(selectedApplication.eventId.eventDate) : 'N/A'}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>📋 Applied</p>
                    <p style={{ margin: '8px 0 0 0', fontSize: '0.95rem', color: '#0f172a', fontWeight: '700' }}>
                      {formatDate(selectedApplication.appliedAt)}
                    </p>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>📊 Status</p>
                    <p style={{ margin: '8px 0 0 0', fontSize: '0.95rem', color: getStatusTextColor(selectedApplication.status), fontWeight: '700', textTransform: 'capitalize' }}>
                      {selectedApplication.status}
                    </p>
                  </div>
                </div>
              </div>

              {/* Problem Statement */}
              {selectedApplication.eventId?.problemStatement && (
                <div style={{ marginBottom: '24px', padding: '20px', backgroundColor: '#eff6ff', borderRadius: '16px', border: '1px solid #bfdbfe' }}>
                  <p style={{ margin: '0 0 12px 0', fontSize: '0.9rem', fontWeight: '600', color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    💡 Problem Statement
                  </p>
                  <p style={{ margin: 0, fontSize: '0.95rem', color: '#1e293b', lineHeight: 1.6 }}>
                    {selectedApplication.eventId.problemStatement}
                  </p>
                </div>
              )}

              {/* Submitted Documents */}
              {selectedApplication.submittedDocumentation && selectedApplication.submittedDocumentation.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <p style={{ margin: '0 0 12px 0', fontSize: '0.9rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>
                    📎 Your Submitted Documents
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
                          border: '2px solid #bfdbfe',
                          borderRadius: '12px',
                          fontWeight: '600',
                          fontSize: '0.9rem',
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

              {/* Club Head Feedback */}
              {selectedApplication.clubHeadComment && (
                <div style={{
                  padding: '16px',
                  backgroundColor: '#fef3c7',
                  borderRadius: '16px',
                  border: '1px solid #fcd34d',
                  marginBottom: '24px'
                }}>
                  <p style={{ margin: '0 0 12px 0', fontSize: '0.9rem', fontWeight: '600', color: '#92400e', textTransform: 'uppercase' }}>
                    💬 Club Head's Feedback
                  </p>
                  <p style={{ margin: 0, fontSize: '0.95rem', color: '#1f2937', lineHeight: 1.6 }}>
                    {selectedApplication.clubHeadComment}
                  </p>
                </div>
              )}

              {withdrawMessage && (
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: withdrawMessage.includes('✅') ? '#dcfce7' : '#fee',
                  color: withdrawMessage.includes('✅') ? '#15803d' : '#c33',
                  borderRadius: '12px',
                  border: withdrawMessage.includes('✅') ? '1px solid #86efac' : '1px solid #fcc',
                  marginBottom: '24px'
                }}>
                  {withdrawMessage}
                </div>
              )}

              {/* Withdraw Button */}
              {selectedApplication.status === 'applied' && (
                <button
                  onClick={() => handleWithdrawApplication(selectedApplication._id)}
                  disabled={withdrawingAppId === selectedApplication._id}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    backgroundColor: withdrawingAppId === selectedApplication._id ? '#cbd5e1' : '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: '700',
                    cursor: withdrawingAppId === selectedApplication._id ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (withdrawingAppId !== selectedApplication._id) {
                      e.target.style.backgroundColor = '#dc2626';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (withdrawingAppId !== selectedApplication._id) {
                      e.target.style.backgroundColor = '#ef4444';
                    }
                  }}
                >
                  {withdrawingAppId === selectedApplication._id ? 'Withdrawing...' : 'Withdraw Application'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApplications;
