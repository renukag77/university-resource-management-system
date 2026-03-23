import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import authService from '../../services/authService';
import eventService from '../../services/eventService';
import '../../styles/dashboard.css';

const CreateEvent = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    venue: '',
    eventDate: '',
    poster: '',
    requiredSkills: '',
    capacity: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'club_head') {
      navigate('/login');
    } else {
      setUser(currentUser);
    }
  }, [navigate]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Event name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Event description is required';
    }

    if (!formData.venue.trim()) {
      newErrors.venue = 'Venue is required';
    }

    if (!formData.eventDate) {
      newErrors.eventDate = 'Event date is required';
    } else {
      const selectedDate = new Date(formData.eventDate);
      if (selectedDate <= new Date()) {
        newErrors.eventDate = 'Event date must be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const eventData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        venue: formData.venue.trim(),
        eventDate: new Date(formData.eventDate).toISOString(),
        poster: formData.poster.trim() || null,
        requiredSkills: formData.requiredSkills
          .split(',')
          .map((skill) => skill.trim())
          .filter((skill) => skill),
        capacity: formData.capacity ? parseInt(formData.capacity) : 0,
      };

      const response = await eventService.createEvent(eventData);
      
      setSuccess(`Event "${response.event.title}" created successfully!`);
      setFormData({
        title: '',
        description: '',
        venue: '',
        eventDate: '',
        poster: '',
        requiredSkills: '',
        capacity: '',
      });

      // Redirect to club head dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard/club-head');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to create event');
      console.error('Create event error:', err);
    } finally {
      setLoading(false);
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
          <h1>Create Event</h1>
          <p className="subtitle">Create a new event for your club</p>
        </div>
        <div className="main-section">
          <div className="form-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
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

            <form onSubmit={handleSubmit}>
              {/* Event Name */}
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label htmlFor="title" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Event Name *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter event name"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: errors.title ? '1px solid #c33' : '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
                {errors.title && <p style={{ color: '#c33', fontSize: '12px', marginTop: '4px' }}>{errors.title}</p>}
              </div>

              {/* Description */}
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label htmlFor="description" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter event description"
                  rows="4"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: errors.description ? '1px solid #c33' : '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                  }}
                />
                {errors.description && <p style={{ color: '#c33', fontSize: '12px', marginTop: '4px' }}>{errors.description}</p>}
              </div>

              {/* Venue */}
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label htmlFor="venue" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Venue *
                </label>
                <input
                  type="text"
                  id="venue"
                  name="venue"
                  value={formData.venue}
                  onChange={handleChange}
                  placeholder="e.g., Auditorium A, Library Hall"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: errors.venue ? '1px solid #c33' : '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
                {errors.venue && <p style={{ color: '#c33', fontSize: '12px', marginTop: '4px' }}>{errors.venue}</p>}
              </div>

              {/* Event Date */}
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label htmlFor="eventDate" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Event Date & Time *
                </label>
                <input
                  type="datetime-local"
                  id="eventDate"
                  name="eventDate"
                  value={formData.eventDate}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: errors.eventDate ? '1px solid #c33' : '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
                {errors.eventDate && <p style={{ color: '#c33', fontSize: '12px', marginTop: '4px' }}>{errors.eventDate}</p>}
              </div>

              {/* Event Poster URL */}
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label htmlFor="poster" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Event Poster Image URL
                </label>
                <input
                  type="url"
                  id="poster"
                  name="poster"
                  value={formData.poster}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
                <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  Leave empty if no poster is available
                </p>
              </div>

              {/* Required Skills */}
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label htmlFor="requiredSkills" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Required Skills
                </label>
                <input
                  type="text"
                  id="requiredSkills"
                  name="requiredSkills"
                  value={formData.requiredSkills}
                  onChange={handleChange}
                  placeholder="e.g., teamwork, leadership, communication (comma-separated)"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
                <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  Separate multiple skills with commas
                </p>
              </div>

              {/* Capacity */}
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label htmlFor="capacity" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Event Capacity
                </label>
                <input
                  type="number"
                  id="capacity"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  placeholder="e.g., 50"
                  min="0"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
                <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  Optional - Leave empty for unlimited capacity
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: loading ? '#999' : '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  if (!loading) e.target.style.backgroundColor = '#0056b3';
                }}
                onMouseLeave={(e) => {
                  if (!loading) e.target.style.backgroundColor = '#007bff';
                }}
              >
                {loading ? 'Creating Event...' : 'Create Event'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;
