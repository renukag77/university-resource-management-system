import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import authService from '../../services/authService';
import eventService from '../../services/eventService';
import '../../styles/dashboard.css';

const VenueRequests = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [venueRequests, setVenueRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, pending, approved, rejected

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'club_head') {
      navigate('/login');
    } else {
      setUser(currentUser);
      fetchVenueRequests();
    }
  }, [navigate]);

  const fetchVenueRequests = async () => {
    try {
      setLoading(true);
      const data = await eventService.getVenueRequests();
      setVenueRequests(data);
    } catch (err) {
      setError('Failed to load venue requests: ' + err.message);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async (venueRequestId) => {
    if (!window.confirm('Are you sure you want to cancel this venue request?')) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      await eventService.cancelVenueRequest(venueRequestId);
      setSuccess('Venue request cancelled successfully');
      fetchVenueRequests();
    } catch (err) {
      setError('Failed to cancel venue request: ' + err.message);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: '#fff3cd', color: '#856404', label: '⏳ Pending', emoji: '⏳' },
      approved: { bg: '#d4edda', color: '#155724', label: '✅ Approved', emoji: '✅' },
      rejected: { bg: '#f8d7da', color: '#721c24', label: '❌ Rejected', emoji: '❌' },
      cancelled: { bg: '#e2e3e5', color: '#383d41', label: '⛔ Cancelled', emoji: '⛔' },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span
        style={{
          padding: '4px 12px',
          backgroundColor: config.bg,
          color: config.color,
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '600',
        }}
      >
        {config.emoji} {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredRequests = venueRequests.filter((req) => {
    if (filterStatus === 'all') return true;
    return req.status === filterStatus;
  });

  if (!user) {
    return null;
  }

  return (
    <div className="dashboard-layout">
      <Sidebar role={user.role} userName={user.name} />
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Venue Requests</h1>
          <p className="subtitle">Monitor and manage your venue booking requests</p>
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

          {/* Filter Buttons */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {['all', 'pending', 'approved', 'rejected', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: filterStatus === status ? '#007bff' : '#f0f0f0',
                  color: filterStatus === status ? 'white' : '#333',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                }}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)} (
                {venueRequests.filter((r) => (status === 'all' ? true : r.status === status)).length})
              </button>
            ))}
          </div>

          {/* Requests List */}
          {loading ? (
            <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>Loading venue requests...</p>
          ) : filteredRequests.length === 0 ? (
            <div style={{
              padding: '40px',
              textAlign: 'center',
              backgroundColor: '#f9f9f9',
              borderRadius: '4px',
              border: '1px solid #eee',
            }}>
              <p style={{ fontSize: '16px', color: '#666', margin: 0 }}>
                {filterStatus === 'all' ? '📭 No venue requests yet' : `📭 No ${filterStatus} requests`}
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {filteredRequests.map((request) => (
                <div
                  key={request._id}
                  style={{
                    padding: '16px',
                    border: request.conflictDetected ? '2px solid #ffcc66' : '1px solid #ddd',
                    borderRadius: '4px',
                    backgroundColor: request.conflictDetected ? '#fffef5' : '#f9f9f9',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600' }}>
                        {request.eventId?.title || 'Event'}
                      </h4>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {request.conflictDetected && (
                        <span style={{
                          padding: '4px 8px',
                          backgroundColor: '#ffcc66',
                          color: '#996600',
                          borderRadius: '3px',
                          fontSize: '11px',
                          fontWeight: '600',
                        }}>
                          ⚠️ CONFLICT
                        </span>
                      )}
                      {getStatusBadge(request.status)}
                    </div>
                  </div>

                  {/* Venue Info */}
                  <div style={{
                    marginBottom: '12px',
                    padding: '12px',
                    backgroundColor: '#f0f8ff',
                    borderRadius: '3px',
                    border: '1px solid #b3d9ff',
                  }}>
                    <p style={{ margin: '4px 0', fontSize: '13px' }}>
                      <strong>🏟️ Venue:</strong> {request.venueId?.name}
                    </p>
                    <p style={{ margin: '4px 0', fontSize: '13px' }}>
                      <strong>💺 Capacity:</strong> {request.venueId?.capacity}
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

                  {/* Conflicts */}
                  {request.conflictDetected && request.conflictingEvents?.length > 0 && (
                    <div style={{
                      marginBottom: '12px',
                      padding: '12px',
                      backgroundColor: '#fff5f5',
                      borderRadius: '3px',
                      border: '1px solid #ffcccc',
                      borderLeft: '4px solid #ff6666',
                    }}>
                      <p style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: '600', color: '#c33' }}>
                        ⚠️ Scheduling Conflicts:
                      </p>
                      {request.conflictingEvents.map((conflict, idx) => (
                        <p key={idx} style={{ margin: '4px 0', fontSize: '12px', color: '#666', marginLeft: '12px' }}>
                          • {conflict.eventTitle}
                        </p>
                      ))}
                      <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#999', fontStyle: 'italic' }}>
                        The admin will review and make a final decision.
                      </p>
                    </div>
                  )}

                  {/* Admin Comment */}
                  {request.adminComment && (
                    <div style={{
                      marginBottom: '12px',
                      padding: '12px',
                      backgroundColor: '#e7f3ff',
                      borderRadius: '3px',
                      border: '1px solid #b3d9ff',
                      borderLeft: '4px solid #0066cc',
                    }}>
                      <p style={{ margin: '0 0 6px 0', fontSize: '12px', fontWeight: '600', color: '#0066cc' }}>
                        💬 Admin Comment:
                      </p>
                      <p style={{ margin: '0', fontSize: '12px', color: '#333' }}>
                        {request.adminComment}
                      </p>
                    </div>
                  )}

                  {/* Timeline */}
                  <div style={{ fontSize: '12px', color: '#999', marginBottom: '12px' }}>
                    {request.status === 'approved' && request.approvedAt && (
                      <p style={{ margin: '4px 0' }}>✅ Approved on: {new Date(request.approvedAt).toLocaleString()}</p>
                    )}
                    {request.status === 'rejected' && request.rejectedAt && (
                      <p style={{ margin: '4px 0' }}>❌ Rejected on: {new Date(request.rejectedAt).toLocaleString()}</p>
                    )}
                    <p style={{ margin: '4px 0' }}>📅 Requested: {new Date(request.createdAt).toLocaleString()}</p>
                  </div>

                  {/* Action Buttons */}
                  {request.status === 'pending' && (
                    <button
                      onClick={() => handleCancelRequest(request._id)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '600',
                      }}
                    >
                      Cancel Request
                    </button>
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

export default VenueRequests;
