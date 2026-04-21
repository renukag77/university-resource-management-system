import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import authService from '../../services/authService';
import eventService from '../../services/eventService';
import '../../styles/dashboard.css';

const StudentHome = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [allEvents, setAllEvents] = useState([]);
  const [displayedEvents, setDisplayedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [applyingEventId, setApplyingEventId] = useState(null);
  const [applyMessage, setApplyMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [appliedEventIds, setAppliedEventIds] = useState([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessageTimeout, setSuccessMessageTimeout] = useState(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchEvents();
      fetchStudentApplications();
    }
  }, [user]);

  const fetchStudentApplications = async () => {
    try {
      const myApps = await eventService.getStudentApplications();
      const appliedIds = myApps.map(app => app.eventId?._id || app.eventId);
      setAppliedEventIds(appliedIds);
    } catch (err) {
      console.error('Fetch applications error:', err);
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await eventService.getPublicEvents();
      setAllEvents(data || []);
      setDisplayedEvents((data || []).slice(0, 6));
    } catch (err) {
      setError('Failed to load events');
      console.error('Fetch events error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (term.trim() === '') {
      setDisplayedEvents(allEvents.slice(0, 6));
    } else {
      const filtered = allEvents.filter((event) =>
        event.title.toLowerCase().includes(term.toLowerCase()) ||
        event.description.toLowerCase().includes(term.toLowerCase()) ||
        event.venue.toLowerCase().includes(term.toLowerCase())
      );
      setDisplayedEvents(filtered);
    }
  };

  const handleApplyEvent = async (eventId) => {
    setApplyingEventId(eventId);
    setApplyMessage('');
    try {
      let documentationUrls = [];

      // Upload files if any are selected and event requires documentation
      if (selectedFiles.length > 0 && selectedEvent?.ideationNeeded) {
        setUploadingFiles(true);
        documentationUrls = await uploadDocumentation();
        if (!documentationUrls.length && selectedEvent.ideationNeeded) {
          throw new Error('Failed to upload documentation files');
        }
        setUploadingFiles(false);
      }

      await eventService.applyForEvent(eventId, [], documentationUrls);
      setApplyMessage('✅ Application submitted successfully!');
      setShowSuccessMessage(true);
      
      // Add to applied events
      setAppliedEventIds([...appliedEventIds, eventId]);
      
      // Reset after 3 seconds
      const timeout = setTimeout(() => {
        setApplyingEventId(null);
        setApplyMessage('');
        setShowSuccessMessage(false);
        setSelectedEvent(null);
        setSelectedFiles([]);
      }, 3000);
      setSuccessMessageTimeout(timeout);
    } catch (err) {
      setApplyMessage(`❌ ${err.message}`);
      setTimeout(() => {
        setApplyingEventId(null);
        setApplyMessage('');
      }, 3000);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    
    // Validate file sizes (max 10MB each)
    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        setApplyMessage(`❌ ${file.name} is too large (max 10MB)`);
        return false;
      }
      return true;
    });

    setSelectedFiles(validFiles);
  };

  const uploadDocumentation = async () => {
    const uploadedUrls = [];
    
    for (const file of selectedFiles) {
      try {
        const formData = new FormData();
        formData.append('file', file);

        const API_URL = process.env.REACT_APP_API_URL 
          ? (process.env.REACT_APP_API_URL.endsWith('/api') 
              ? process.env.REACT_APP_API_URL 
              : `${process.env.REACT_APP_API_URL}/api`)
          : 'http://localhost:5000/api';

        const token = authService.getToken();
        const response = await fetch(`${API_URL}/upload/document`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        const data = await response.json();
        uploadedUrls.push(data.imageUrl);
      } catch (err) {
        console.error('File upload error:', err);
        throw err;
      }
    }

    return uploadedUrls;
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (!user) {
    return null;
  }

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex' }}>
      <Sidebar role={user.role} userName={user.name} />
      
      <div style={{ flex: 1, marginLeft: '260px', padding: '40px' }}>
        {/* Header Section */}
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
          Discover Events
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#64748b', marginBottom: '40px' }}>
          Welcome back, <span style={{ color: '#3b82f6', fontWeight: '600' }}>{user.name}</span>! Find and apply for amazing campus events.
        </p>

        {/* Search Bar */}
        <div style={{
          marginBottom: '50px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            flex: 1,
            position: 'relative'
          }}>
            <input
              type="text"
              placeholder="Search events by name, venue, or description..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '16px 20px',
                fontSize: '1rem',
                border: '2px solid #e2e8f0',
                borderRadius: '14px',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 4px 16px rgba(59, 130, 246, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
              }}
            />
            <span style={{
              position: 'absolute',
              right: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '1.2rem'
            }}>🔍</span>
          </div>
          <button
            onClick={() => navigate('/student-dashboard/browse-events')}
            style={{
              padding: '16px 28px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '14px',
              fontWeight: '700',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#2563eb';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#3b82f6';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3)';
            }}
          >
            View All
          </button>
        </div>

        {/* Featured Events Section */}
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', marginBottom: '32px' }}>
            {searchTerm ? '🔍 Search Results' : '🌟 Upcoming Events'}
          </h2>

          {loading && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
              <p style={{ fontSize: '1.1rem' }}>Loading events...</p>
            </div>
          )}

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

          {!loading && displayedEvents.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '80px 40px',
              backgroundColor: 'white',
              borderRadius: '24px',
              border: '2px dashed #e2e8f0'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎭</div>
              <h3 style={{ color: '#64748b', marginBottom: '8px' }}>No events found</h3>
              <p style={{ color: '#94a3b8' }}>Try adjusting your search or check back later</p>
            </div>
          )}

          {/* Event Cards Grid */}
          {!loading && displayedEvents.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '28px'
            }}>
              {displayedEvents.map((event) => (
                <div
                  key={event._id}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
                  }}
                >
                  {/* Event Image - Poster */}
                  {event.poster && (
                    <div
                      style={{
                        height: '240px',
                        backgroundColor: '#f1f5f9',
                        backgroundImage: `url(${event.poster})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        position: 'relative'
                      }}
                    >
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        padding: '8px 16px',
                        borderRadius: '24px',
                        fontSize: '12px',
                        fontWeight: '800',
                        backgroundColor: '#dcfce7',
                        color: '#15803d',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Active
                      </div>
                    </div>
                  )}

                  {/* Event Content */}
                  <div style={{ padding: '24px' }}>
                    <h3 style={{ margin: '0 0 12px 0', fontSize: '1.25rem', color: '#0f172a', fontWeight: '800', lineHeight: 1.3 }}>
                      {event.title}
                    </h3>

                    <p style={{ margin: '0 0 16px 0', color: '#475569', fontSize: '0.95rem', lineHeight: 1.6 }}>
                      {event.description.substring(0, 90)}
                      {event.description.length > 90 ? '...' : ''}
                    </p>

                    {/* Event Details */}
                    <div style={{ marginBottom: '16px', fontSize: '0.9rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', marginBottom: '8px' }}>
                        <span>📍</span>
                        <span style={{ fontWeight: '600', color: '#334155' }}>{event.venue}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
                        <span>📅</span>
                        <span style={{ fontWeight: '600', color: '#334155' }}>{formatDate(event.eventDate)}</span>
                      </div>
                    </div>

                    {/* Skills Tags */}
                    {event.requiredSkills && event.requiredSkills.length > 0 && (
                      <div style={{ marginBottom: '16px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {event.requiredSkills.slice(0, 2).map((skill, idx) => (
                          <span
                            key={idx}
                            style={{
                              backgroundColor: '#eff6ff',
                              color: '#1e40af',
                              padding: '4px 12px',
                              borderRadius: '20px',
                              fontSize: '0.8rem',
                              fontWeight: '600'
                            }}
                          >
                            {skill}
                          </span>
                        ))}
                        {event.requiredSkills.length > 2 && (
                          <span style={{
                            backgroundColor: '#f3f4f6',
                            color: '#6b7280',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: '600'
                          }}>
                            +{event.requiredSkills.length - 2}
                          </span>
                        )}
                      </div>
                    )}

                    {/* CTA Button */}
                    <button
                      onClick={() => setSelectedEvent(event)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontWeight: '700',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
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
                      Explore Event
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Event Details Modal */}
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
              maxWidth: '700px',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              width: '90%'
            }}>
              {/* Modal Image */}
              {selectedEvent.poster && (
                <div
                  style={{
                    height: '320px',
                    backgroundColor: '#f1f5f9',
                    backgroundImage: `url(${selectedEvent.poster})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative'
                  }}
                >
                  <button
                    onClick={() => setSelectedEvent(null)}
                    style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      border: 'none',
                      fontSize: '24px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = 'white';
                      e.target.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                      e.target.style.transform = 'scale(1)';
                    }}
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Modal Content */}
              <div style={{ padding: '40px' }}>
                <h2 style={{ margin: '0 0 16px 0', fontSize: '2rem', color: '#0f172a', fontWeight: '800' }}>
                  {selectedEvent.title}
                </h2>

                <p style={{ margin: '0 0 24px 0', color: '#475569', fontSize: '1.05rem', lineHeight: 1.7 }}>
                  {selectedEvent.description}
                </p>

                {/* Modal Status Message */}
                {applyMessage && (
                  <div style={{
                    padding: '12px 16px',
                    backgroundColor: applyMessage.includes('✅') ? '#efe' : '#fee',
                    color: applyMessage.includes('✅') ? '#3c3' : '#c33',
                    borderRadius: '12px',
                    border: applyMessage.includes('✅') ? '1px solid #cfc' : '1px solid #fcc',
                    marginBottom: '24px'
                  }}>
                    {applyMessage}
                  </div>
                )}

                {/* Event Details Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '20px',
                  marginBottom: '32px',
                  padding: '24px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '16px'
                }}>
                  <div>
                    <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      📍 Venue
                    </p>
                    <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>
                      {selectedEvent.venue}
                    </p>
                  </div>

                  <div>
                    <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      📅 Date & Time
                    </p>
                    <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>
                      {formatDate(selectedEvent.eventDate)}
                    </p>
                  </div>

                  {selectedEvent.capacity && (
                    <div>
                      <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        🎟️ Capacity
                      </p>
                      <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>
                        {selectedEvent.capacity} seats
                      </p>
                    </div>
                  )}

                  {selectedEvent.clubHeadId && (
                    <div>
                      <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        👤 Organized By
                      </p>
                      <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>
                        {selectedEvent.clubHeadId.name}
                      </p>
                    </div>
                  )}
                </div>

                {/* Skills Tags */}
                {selectedEvent.requiredSkills && selectedEvent.requiredSkills.length > 0 && (
                  <div style={{ marginBottom: '32px' }}>
                    <p style={{ margin: '0 0 12px 0', fontSize: '0.9rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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

                {/* Documentation Upload Section */}
                {selectedEvent.ideationNeeded && (
                  <div style={{ marginBottom: '32px', padding: '20px', backgroundColor: '#fef3c7', borderRadius: '16px', border: '2px dashed #f59e0b' }}>
                    <p style={{ margin: '0 0 12px 0', fontSize: '0.9rem', fontWeight: '600', color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      📎 Required: Ideation/Documentation
                    </p>
                    <p style={{ margin: '0 0 16px 0', fontSize: '0.95rem', color: '#b45309' }}>
                      This event requires you to submit documentation (PPT, PDF, Word, etc.) with your application.
                    </p>
                    
                    <input
                      type="file"
                      id="documentationFiles"
                      multiple
                      onChange={handleFileChange}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #f59e0b',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                      }}
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
                    />
                    
                    <p style={{ fontSize: '0.8rem', color: '#92400e', marginTop: '8px' }}>
                      Allowed: PDF, Word, PowerPoint, Excel (Max 10MB each file)
                    </p>

                    {selectedFiles.length > 0 && (
                      <div style={{ marginTop: '16px' }}>
                        <p style={{ margin: '0 0 8px 0', fontWeight: '600', color: '#1f2937' }}>
                          Selected files: {selectedFiles.length}
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {selectedFiles.map((file, idx) => (
                            <span
                              key={idx}
                              style={{
                                backgroundColor: '#dcfce7',
                                color: '#15803d',
                                padding: '6px 12px',
                                borderRadius: '12px',
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              📄 {file.name.substring(0, 20)}...
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Problem Statement */}
                {selectedEvent.problemStatement && (
                  <div style={{ marginBottom: '32px', padding: '20px', backgroundColor: '#eff6ff', borderRadius: '16px', border: '1px solid #bfdbfe' }}>
                    <p style={{ margin: '0 0 12px 0', fontSize: '0.9rem', fontWeight: '600', color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      💡 Problem Statement
                    </p>
                    <p style={{ margin: 0, fontSize: '0.95rem', color: '#1e293b', lineHeight: 1.6 }}>
                      {selectedEvent.problemStatement}
                    </p>
                  </div>
                )}

                {/* Apply Button */}
                {/* Apply Button */}
                <button
                  onClick={() => handleApplyEvent(selectedEvent._id)}
                  disabled={applyingEventId === selectedEvent._id || appliedEventIds.includes(selectedEvent._id)}
                  style={{
                    width: '100%',
                    padding: '16px 24px',
                    backgroundColor: appliedEventIds.includes(selectedEvent._id) ? '#10b981' : (applyingEventId === selectedEvent._id ? '#cbd5e1' : '#3b82f6'),
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: '700',
                    fontSize: '1.1rem',
                    cursor: appliedEventIds.includes(selectedEvent._id) || applyingEventId === selectedEvent._id ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: appliedEventIds.includes(selectedEvent._id) ? '0 4px 12px rgba(16, 185, 129, 0.3)' : '0 4px 12px rgba(59, 130, 246, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    if (applyingEventId !== selectedEvent._id && !appliedEventIds.includes(selectedEvent._id)) {
                      e.target.style.backgroundColor = '#2563eb';
                      e.target.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (applyingEventId !== selectedEvent._id && !appliedEventIds.includes(selectedEvent._id)) {
                      e.target.style.backgroundColor = '#3b82f6';
                      e.target.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  {applyingEventId === selectedEvent._id ? 'Applying...' : appliedEventIds.includes(selectedEvent._id) ? '✅ Already Applied' : 'Apply Now'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentHome;
