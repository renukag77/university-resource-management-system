import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import authService from '../../services/authService';
import eventService from '../../services/eventService';
import '../../styles/dashboard.css';

const PendingRequests = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('venue-requests'); // 'venue-requests' or 'event-requests'
  const [venueRequests, setVenueRequests] = useState([]);
  const [loadingVenue, setLoadingVenue] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminComment, setAdminComment] = useState('');

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/login');
    } else {
      setUser(currentUser);
      fetchVenueRequests();
    }
  }, [navigate]);

  const fetchVenueRequests = async () => {
    try {
      setLoadingVenue(true);
      const data = await eventService.getAdminPendingVenueRequests();
      setVenueRequests(data);
    } catch (err) {
      setError('Failed to load venue requests: ' + err.message);
      console.error('Fetch error:', err);
    } finally {
      setLoadingVenue(false);
    }
  };

  const handleApproveVenue = async (venueRequestId) => {
    try {
      setError('');
      setSuccess('');
      await eventService.approveVenueRequest(venueRequestId, adminComment);
      setSuccess('Venue request approved successfully!');
      setAdminComment('');
      setSelectedRequest(null);
      fetchVenueRequests();
    } catch (err) {
      setError('Failed to approve venue request: ' + err.message);
    }
  };

  const handleRejectVenue = async (venueRequestId) => {
    try {
      setError('');
      setSuccess('');
      await eventService.rejectVenueRequest(venueRequestId, adminComment);
      setSuccess('Venue request rejected');
      setAdminComment('');
      setSelectedRequest(null);
      fetchVenueRequests();
    } catch (err) {
      setError('Failed to reject venue request: ' + err.message);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="dashboard-layout">
      <Sidebar role={user.role} userName={user.name} />
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Pending Requests</h1>
          <p className="subtitle">Review and manage pending requests from club heads</p>
        </div>

        <div className="main-section">
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
              ❌ {error}
            </div>
          )}

          {success && (
            <div
              style={{
                padding: '12px',
                marginBottom: '16px',
                backgroundColor: '#efe',
                color: '#3c3',
                borderRadius: '4px',
                border: '1px solid #cfc',
              }}
            >
              ✅ {success}
            </div>
          )}

          {/* Tab Navigation */}
          <div style={{ display: 'flex', gap: '0', marginBottom: '20px', borderBottom: '2px solid #ddd' }}>
            <button
              onClick={() => setActiveTab('venue-requests')}
              style={{
                padding: '12px 24px',
                backgroundColor: activeTab === 'venue-requests' ? '#007bff' : 'transparent',
                color: activeTab === 'venue-requests' ? 'white' : '#666',
                border: 'none',
                borderBottom: activeTab === 'venue-requests' ? '3px solid #0056b3' : 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
              }}
            >
              🏢 Venue Requests ({venueRequests.length})
            </button>
          </div>

          {/* Venue Requests Tab */}
          {activeTab === 'venue-requests' && (
            <div>
              {loadingVenue ? (
                <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>Loading venue requests...</p>
              ) : venueRequests.length === 0 ? (
                <div style={{
                  padding: '40px',
                  textAlign: 'center',
                  backgroundColor: '#f9f9f9',
                  borderRadius: '4px',
                  border: '1px solid #eee',
                }}>
                  <p style={{ fontSize: '16px', color: '#666', margin: 0 }}>✅ No pending venue requests</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                  {venueRequests.map((request) => (
                    <div
                      key={request._id}
                      style={{
                        padding: '16px',
                        border: request.conflictDetected ? '2px solid #ffcc66' : '1px solid #ddd',
                        borderRadius: '4px',
                        backgroundColor: request.conflictDetected ? '#fffef5' : '#f9f9f9',
                      }}
                    >
                      {/* Request Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                        <div>
                          <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600' }}>
                            {request.eventId?.title || 'Event'}
                          </h4>
                          <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>
                            📋 Club Head: {request.clubHeadId?.name} ({request.clubHeadId?.email})
                          </p>
                        </div>
                        {request.conflictDetected && (
                          <span style={{
                            padding: '6px 12px',
                            backgroundColor: '#ffcc66',
                            color: '#996600',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '600',
                          }}>
                            ⚠️ CONFLICT DETECTED
                          </span>
                        )}
                      </div>

                      {/* Venue and Time Info */}
                      <div style={{
                        marginBottom: '12px',
                        padding: '12px',
                        backgroundColor: '#f0f8ff',
                        borderRadius: '3px',
                        border: '1px solid #b3d9ff',
                      }}>
                        <p style={{ margin: '4px 0', fontSize: '13px' }}>
                          <strong>🏟️ Venue:</strong> {request.venueId?.name} (Capacity: {request.venueId?.capacity})
                        </p>
                        <p style={{ margin: '4px 0', fontSize: '13px' }}>
                          <strong>📍 Location:</strong> {request.venueId?.location || 'Not specified'}
                        </p>
                        <p style={{ margin: '4px 0', fontSize: '13px' }}>
                          <strong>🕐 Time Slot:</strong>
                        </p>
                        <p style={{ margin: '4px 0 0 20px', fontSize: '12px', color: '#666' }}>
                          {new Date(request.startDate).toLocaleString()} - {new Date(request.endDate).toLocaleString()}
                        </p>
                      </div>

                      {/* Conflict Info */}
                      {request.conflictDetected && request.conflictingEvents && request.conflictingEvents.length > 0 && (
                        <div style={{
                          marginBottom: '12px',
                          padding: '12px',
                          backgroundColor: '#fff5f5',
                          borderRadius: '3px',
                          border: '1px solid #ffcccc',
                          borderLeft: '4px solid #ff6666',
                        }}>
                          <p style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: '600', color: '#c33' }}>
                            ⚠️ Conflicting Events:
                          </p>
                          {request.conflictingEvents.map((conflict, idx) => (
                            <p key={idx} style={{ margin: '4px 0', fontSize: '12px', color: '#666', marginLeft: '12px' }}>
                              • {conflict.eventTitle} ({new Date(conflict.startDate).toLocaleString()})
                            </p>
                          ))}
                        </div>
                      )}

                      {/* Request submitted at */}
                      <p style={{ margin: '8px 0', fontSize: '12px', color: '#999' }}>
                        📅 Requested: {new Date(request.createdAt).toLocaleString()}
                      </p>

                      {/* Action Buttons */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginTop: '12px' }}>
                        <button
                          onClick={() => setSelectedRequest(request._id)}
                          style={{
                            padding: '8px 12px',
                            backgroundColor: '#1e90ff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '600',
                          }}
                        >
                          {selectedRequest === request._id ? '✓ Selected' : 'Review'}
                        </button>
                        <button
                          onClick={() => setSelectedRequest(null)}
                          style={{
                            padding: '8px 12px',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '600',
                          }}
                        >
                          Close Details
                        </button>
                      </div>

                      {/* Detailed Review Panel */}
                      {selectedRequest === request._id && (
                        <div style={{
                          marginTop: '16px',
                          padding: '16px',
                          backgroundColor: 'white',
                          borderRadius: '4px',
                          border: '1px solid #ddd',
                        }}>
                          <h5 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>
                            📝 Review & Decision
                          </h5>

                          {/* Admin Comment */}
                          <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>
                              Admin Comment (Optional)
                            </label>
                            <textarea
                              value={adminComment}
                              onChange={(e) => setAdminComment(e.target.value)}
                              placeholder="Enter any comments for the club head..."
                              rows="3"
                              style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid #ddd',
                                borderRadius: '3px',
                                fontSize: '12px',
                                fontFamily: 'inherit',
                                boxSizing: 'border-box',
                              }}
                            />
                          </div>

                          {/* Decision Buttons */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <button
                              onClick={() => handleApproveVenue(request._id)}
                              style={{
                                padding: '10px',
                                backgroundColor: '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '3px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: '600',
                              }}
                            >
                              ✅ Approve
                            </button>
                            <button
                              onClick={() => handleRejectVenue(request._id)}
                              style={{
                                padding: '10px',
                                backgroundColor: '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '3px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: '600',
                              }}
                            >
                              ❌ Reject
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PendingRequests;
