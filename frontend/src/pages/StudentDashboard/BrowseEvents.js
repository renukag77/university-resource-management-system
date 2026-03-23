import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import authService from '../../services/authService';
import eventService from '../../services/eventService';
import '../../styles/dashboard.css';

const BrowseEvents = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [allSkills, setAllSkills] = useState([]);
  const [applyingEventId, setApplyingEventId] = useState(null);
  const [applyMessage, setApplyMessage] = useState('');

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'student') {
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
      setEvents(data || []);
      
      // Extract all unique skills
      const skills = new Set();
      data.forEach((event) => {
        if (event.requiredSkills && Array.isArray(event.requiredSkills)) {
          event.requiredSkills.forEach((skill) => skills.add(skill));
        }
      });
      setAllSkills(Array.from(skills).sort());
    } catch (err) {
      setError('Failed to load events');
      console.error('Fetch events error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await eventService.searchPublicEvents(searchTerm, selectedSkill);
      setEvents(data || []);
    } catch (err) {
      setError('Failed to search events');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedSkill('');
    fetchEvents();
  };

  const handleApplyEvent = async (eventId) => {
    setApplyingEventId(eventId);
    setApplyMessage('');
    try {
      await eventService.applyForEvent(eventId, []);
      setApplyMessage('✅ Application submitted successfully!');
      
      // Reset after 2 seconds
      setTimeout(() => {
        setApplyingEventId(null);
        setApplyMessage('');
      }, 2000);
    } catch (err) {
      setApplyMessage(`❌ ${err.message}`);
      setTimeout(() => {
        setApplyingEventId(null);
        setApplyMessage('');
      }, 3000);
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
          <h1>Browse Events</h1>
          <p className="subtitle">Discover and apply for campus events</p>
        </div>
        <div className="main-section">
          {/* Filters */}
          <div
            style={{
              backgroundColor: '#f5f5f5',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '24px',
              border: '1px solid #ddd',
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: '16px' }}>🔍 Filter Events</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px', alignItems: 'flex-end' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
                  Search Events
                </label>
                <input
                  type="text"
                  placeholder="Search by event name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
                  Filter by Skill
                </label>
                <select
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                  }}
                >
                  <option value="">All Skills</option>
                  {allSkills.map((skill) => (
                    <option key={skill} value={skill}>
                      {skill}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleSearch}
                  style={{
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
                  Search
                </button>
                <button
                  onClick={handleClearFilters}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = '#5a6268')}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = '#6c757d')}
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
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

          {/* Event Message */}
          {applyMessage && (
            <div
              style={{
                padding: '12px',
                marginBottom: '16px',
                backgroundColor: applyMessage.includes('✅') ? '#efe' : '#fee',
                color: applyMessage.includes('✅') ? '#3c3' : '#c33',
                borderRadius: '4px',
                border: applyMessage.includes('✅') ? '1px solid #cfc' : '1px solid #fcc',
              }}
            >
              {applyMessage}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ fontSize: '16px', color: '#666' }}>Loading events...</p>
            </div>
          )}

          {/* Events Grid */}
          {!loading && events.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
              <h3>No events found</h3>
              <p style={{ color: '#666' }}>Try adjusting your filters or check back later</p>
            </div>
          )}

          {!loading && events.length > 0 && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '20px',
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
                    cursor: 'pointer',
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
                        height: '200px',
                        backgroundColor: '#f0f0f0',
                        backgroundImage: `url(${event.poster})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    />
                  )}

                  {/* Event Content */}
                  <div style={{ padding: '16px' }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#333' }}>{event.title}</h3>

                    <p style={{ margin: '0 0 12px 0', color: '#666', fontSize: '14px', flex: 1 }}>
                      {event.description.substring(0, 100)}
                      {event.description.length > 100 ? '...' : ''}
                    </p>

                    <div style={{ marginBottom: '12px' }}>
                      <p style={{ margin: '4px 0', fontSize: '13px', color: '#555' }}>
                        📍 <strong>{event.venue}</strong>
                      </p>
                      <p style={{ margin: '4px 0', fontSize: '13px', color: '#555' }}>
                        📅 {formatDate(event.eventDate)}
                      </p>
                      {event.clubHeadId && (
                        <p style={{ margin: '4px 0', fontSize: '13px', color: '#555' }}>
                          👤 {event.clubHeadId.name}
                        </p>
                      )}
                    </div>

                    {/* Skills Tags */}
                    {event.requiredSkills && event.requiredSkills.length > 0 && (
                      <div style={{ marginBottom: '12px' }}>
                        {event.requiredSkills.map((skill, index) => (
                          <span
                            key={index}
                            style={{
                              display: 'inline-block',
                              backgroundColor: '#e3f2fd',
                              color: '#1976d2',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              marginRight: '6px',
                              marginBottom: '6px',
                            }}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Capacity Info */}
                    {event.capacity > 0 && (
                      <p style={{ margin: '8px 0', fontSize: '13px', color: '#666' }}>
                        Capacity: <strong>{event.capacity}</strong> seats
                      </p>
                    )}

                    {/* Apply Button */}
                    <button
                      onClick={() => handleApplyEvent(event._id)}
                      disabled={applyingEventId === event._id}
                      style={{
                        width: '100%',
                        padding: '10px',
                        marginTop: '12px',
                        backgroundColor: applyingEventId === event._id ? '#ccc' : '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: applyingEventId === event._id ? 'not-allowed' : 'pointer',
                        fontWeight: '600',
                        fontSize: '14px',
                      }}
                      onMouseEnter={(e) => {
                        if (applyingEventId !== event._id) {
                          e.target.style.backgroundColor = '#218838';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (applyingEventId !== event._id) {
                          e.target.style.backgroundColor = '#28a745';
                        }
                      }}
                    >
                      {applyingEventId === event._id ? 'Applying...' : 'Apply Now'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrowseEvents;
