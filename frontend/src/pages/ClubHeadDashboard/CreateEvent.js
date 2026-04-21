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
  const [imagePreview, setImagePreview] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Step management
  const [step, setStep] = useState(1); // 1 = basic info, 2 = venue selection
  const [eventId, setEventId] = useState(null);
  
  // Venue selection state
  const [venues, setVenues] = useState([]);
  const [loadingVenues, setLoadingVenues] = useState(false);
  const [selectedVenueId, setSelectedVenueId] = useState('');
  const [venueConflicts, setVenueConflicts] = useState(null);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [useCustomVenue, setUseCustomVenue] = useState(false);
  const [customVenue, setCustomVenue] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    venue: '',
    eventDate: '',
    poster: '',
    requiredSkills: '',
    capacity: '',
    problemStatement: '',
    ideationNeeded: false,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Event name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Event description is required';
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

  const validateVenueSelection = () => {
    const newErrors = {};

    if (!useCustomVenue && !selectedVenueId) {
      newErrors.venue = 'Please select a venue';
    }

    if (useCustomVenue && !customVenue.trim()) {
      newErrors.customVenue = 'Please enter a custom venue name';
    }

    if (!startTime) {
      newErrors.startTime = 'Start time is required';
    }

    if (!endTime) {
      newErrors.endTime = 'End time is required';
    }

    if (startTime && endTime && new Date(startTime) >= new Date(endTime)) {
      newErrors.endTime = 'End time must be after start time';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      setSelectedFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      setError('');
    }
  };

  const uploadImage = async () => {
    if (!selectedFile) {
      return null;
    }

    setUploadingImage(true);
    try {
      const fileFormData = new FormData();
      fileFormData.append('poster', selectedFile);

      const API_URL = process.env.REACT_APP_API_URL 
        ? (process.env.REACT_APP_API_URL.endsWith('/api') 
            ? process.env.REACT_APP_API_URL 
            : `${process.env.REACT_APP_API_URL}/api`)
        : 'http://localhost:5000/api';

      const token = authService.getToken();
      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: fileFormData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload image to Cloudinary');
      }

      const data = await response.json();
      return data.imageUrl;
    } catch (err) {
      setError(err.message || 'Failed to upload image');
      console.error('Image upload error:', err);
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      let posterUrl = formData.poster;
      if (selectedFile && !formData.poster) {
        posterUrl = await uploadImage();
        if (!posterUrl) {
          setLoading(false);
          return;
        }
      }

      const eventData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        venue: '', // Will be set when venue is selected
        eventDate: new Date(formData.eventDate).toISOString(),
        poster: posterUrl || null,
        requiredSkills: formData.requiredSkills
          .split(',')
          .map((skill) => skill.trim())
          .filter((skill) => skill),
        capacity: formData.capacity ? parseInt(formData.capacity) : 0,
        problemStatement: formData.problemStatement.trim() || null,
        ideationNeeded: formData.ideationNeeded,
      };

      const response = await eventService.createEvent(eventData);
      
      setEventId(response.event._id);
      setStep(2);
      
      // Fetch available venues for the selected date
      await fetchAvailableVenues(response.event._id, formData.eventDate);
    } catch (err) {
      setError(err.message || 'Failed to create event');
      console.error('Create event error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableVenues = async (id, eventDate) => {
    try {
      setLoadingVenues(true);
      const eventDateTime = new Date(eventDate);
      
      // Set default times (1 hour event)
      const defaultStart = new Date(eventDateTime);
      const defaultEnd = new Date(eventDateTime);
      defaultEnd.setHours(defaultEnd.getHours() + 1);
      
      setStartTime(defaultStart.toISOString().slice(0, 16));
      setEndTime(defaultEnd.toISOString().slice(0, 16));

      const venuesData = await eventService.getAvailableVenuesWithConflicts(
        defaultStart.toISOString(),
        defaultEnd.toISOString()
      );
      
      setVenues(venuesData);
    } catch (err) {
      setError('Failed to load venues: ' + err.message);
      console.error('Fetch venues error:', err);
    } finally {
      setLoadingVenues(false);
    }
  };

  const handleVenueSelect = async (venueId) => {
    setSelectedVenueId(venueId);
    
    if (startTime && endTime) {
      try {
        const venue = venues.find(v => v._id === venueId);
        if (venue) {
          const conflictInfo = venue.hasConflict ? {
            hasConflict: true,
            conflicts: venue.conflicts,
            hasPendingConflicts: venue.hasPendingConflicts,
            pendingConflicts: venue.pendingConflicts,
          } : {
            hasConflict: false,
            conflicts: [],
            hasPendingConflicts: venue.hasPendingConflicts || false,
            pendingConflicts: venue.pendingConflicts || [],
          };
          setVenueConflicts(conflictInfo);
        }
      } catch (err) {
        console.error('Error checking conflicts:', err);
      }
    }
  };

  const handleTimeChange = async (e, type) => {
    const value = e.target.value;
    
    if (type === 'start') {
      setStartTime(value);
    } else {
      setEndTime(value);
    }

    // Re-fetch venues with new time if venue is already selected
    if (value && selectedVenueId) {
      try {
        setLoadingVenues(true);
        const startDate = type === 'start' ? value : startTime;
        const endDate = type === 'end' ? value : endTime;
        
        if (startDate && endDate && new Date(startDate) < new Date(endDate)) {
          const venuesData = await eventService.getAvailableVenuesWithConflicts(startDate, endDate);
          setVenues(venuesData);
          
          // Update conflict info for selected venue
          const venue = venuesData.find(v => v._id === selectedVenueId);
          if (venue) {
            setVenueConflicts({
              hasConflict: venue.hasConflict,
              conflicts: venue.conflicts || [],
              hasPendingConflicts: venue.hasPendingConflicts || false,
              pendingConflicts: venue.pendingConflicts || [],
            });
          }
        }
      } catch (err) {
        console.error('Error fetching venues:', err);
      } finally {
        setLoadingVenues(false);
      }
    }
  };

  const handleSubmitVenueRequest = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateVenueSelection()) {
      return;
    }

    setLoading(true);

    try {
      const response = await eventService.requestVenue(
        eventId,
        useCustomVenue ? null : selectedVenueId,
        startTime,
        endTime,
        useCustomVenue ? customVenue : null
      );

      setSuccess(
        `Venue request submitted successfully! ${
          response.conflictDetected
            ? 'Note: Conflicts were detected, admin will review.'
            : ''
        }`
      );

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/dashboard/club-head');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to request venue');
      console.error('Request venue error:', err);
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
          <p className="subtitle">{step === 1 ? 'Step 1: Basic Event Information' : 'Step 2: Select Venue & Date/Time'}</p>
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

            {/* Step 1: Basic Event Info */}
            {step === 1 && (
              <form onSubmit={handleCreateEvent}>
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

                {/* Event Date */}
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label htmlFor="eventDate" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Event Date *
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

                {/* Event Poster Image */}
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label htmlFor="posterFile" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Event Poster Image
                  </label>
                  <input
                    type="file"
                    id="posterFile"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      cursor: 'pointer',
                    }}
                  />
                  <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    Upload an image file (JPG, PNG, GIF, WebP - Max 5MB) or paste a URL below
                  </p>

                  {imagePreview && (
                    <div style={{ marginTop: '12px' }}>
                      <img
                        src={imagePreview}
                        alt="Event poster preview"
                        style={{
                          maxWidth: '100%',
                          height: 'auto',
                          maxHeight: '200px',
                          borderRadius: '4px',
                          border: '1px solid #ddd',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          setImagePreview('');
                          document.getElementById('posterFile').value = '';
                        }}
                        style={{
                          marginTop: '8px',
                          padding: '6px 12px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                        }}
                      >
                        Remove Image
                      </button>
                    </div>
                  )}

                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #eee' }}>
                    <label htmlFor="posterUrl" style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
                      Or paste image URL:
                    </label>
                    <input
                      type="url"
                      id="posterUrl"
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
                      disabled={selectedFile ? true : false}
                    />
                    {selectedFile && (
                      <p style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                        (URL field disabled - using uploaded image)
                      </p>
                    )}
                  </div>
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
                <div className="form-group" style={{ marginBottom: '16px' }}>
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

                {/* Problem Statement */}
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label htmlFor="problemStatement" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Problem Statement
                  </label>
                  <textarea
                    id="problemStatement"
                    name="problemStatement"
                    value={formData.problemStatement}
                    onChange={handleChange}
                    placeholder="Describe the problem that this event aims to solve or explore"
                    rows="3"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit',
                    }}
                  />
                  <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    Optional - Briefly explain the problem your event is addressing
                  </p>
                </div>

                {/* Ideation Documentation Needed */}
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      id="ideationNeeded"
                      name="ideationNeeded"
                      checked={formData.ideationNeeded}
                      onChange={handleChange}
                      style={{
                        width: '18px',
                        height: '18px',
                        cursor: 'pointer',
                      }}
                    />
                    <span style={{ fontWeight: '500' }}>Ideation/Documentation Required</span>
                  </label>
                  <p style={{ fontSize: '12px', color: '#666', marginTop: '8px', marginLeft: '26px' }}>
                    Check this if students need to submit documentation or ideation for their applications
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || uploadingImage}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: loading || uploadingImage ? '#999' : '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: loading || uploadingImage ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!loading && !uploadingImage) e.target.style.backgroundColor = '#0056b3';
                  }}
                  onMouseLeave={(e) => {
                    if (!loading && !uploadingImage) e.target.style.backgroundColor = '#007bff';
                  }}
                >
                  {loading || uploadingImage ? 'Processing...' : 'Next: Select Venue'}
                </button>
              </form>
            )}

            {/* Step 2: Venue Selection */}
            {step === 2 && (
              <form onSubmit={handleSubmitVenueRequest}>
                <div style={{ marginBottom: '24px', padding: '12px', backgroundColor: '#f0f8ff', borderRadius: '4px', border: '1px solid #b3d9ff' }}>
                  <p style={{ margin: 0, fontSize: '14px' }}>
                    <strong>Event:</strong> {formData.title}
                  </p>
                </div>

                {/* Start Time */}
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label htmlFor="startTime" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Start Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    id="startTime"
                    value={startTime}
                    onChange={(e) => handleTimeChange(e, 'start')}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: errors.startTime ? '1px solid #c33' : '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                  />
                  {errors.startTime && <p style={{ color: '#c33', fontSize: '12px', marginTop: '4px' }}>{errors.startTime}</p>}
                </div>

                {/* End Time */}
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label htmlFor="endTime" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    End Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    id="endTime"
                    value={endTime}
                    onChange={(e) => handleTimeChange(e, 'end')}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: errors.endTime ? '1px solid #c33' : '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                  />
                  {errors.endTime && <p style={{ color: '#c33', fontSize: '12px', marginTop: '4px' }}>{errors.endTime}</p>}
                </div>

                {/* Venue Selection */}
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '12px', fontWeight: '500' }}>
                    Venue *
                  </label>

                  {/* Toggle between venue selection and custom */}
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="venueType"
                        checked={!useCustomVenue}
                        onChange={() => {
                          setUseCustomVenue(false);
                          setCustomVenue('');
                          setSelectedVenueId('');
                          setErrors({});
                        }}
                        style={{ cursor: 'pointer' }}
                      />
                      <span>Select from available</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="venueType"
                        checked={useCustomVenue}
                        onChange={() => {
                          setUseCustomVenue(true);
                          setSelectedVenueId('');
                          setErrors({});
                        }}
                        style={{ cursor: 'pointer' }}
                      />
                      <span>Request custom venue</span>
                    </label>
                  </div>

                  {/* Available Venues */}
                  {!useCustomVenue && (
                    <>
                      {loadingVenues ? (
                        <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>Loading venues...</p>
                      ) : venues.length === 0 ? (
                        <p style={{ color: '#c33', textAlign: 'center', padding: '20px' }}>No venues available</p>
                      ) : (
                        <div style={{ display: 'grid', gap: '12px' }}>
                          {venues.map((venue) => (
                            <div
                              key={venue._id}
                              onClick={() => handleVenueSelect(venue._id)}
                              style={{
                                padding: '12px',
                                border: selectedVenueId === venue._id ? '2px solid #007bff' : '1px solid #ddd',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                backgroundColor: selectedVenueId === venue._id ? '#f0f8ff' : 'white',
                                transition: 'all 0.2s ease',
                              }}
                              onMouseOver={(e) => {
                                if (selectedVenueId !== venue._id) {
                                  e.currentTarget.style.borderColor = '#b3d9ff';
                                  e.currentTarget.style.backgroundColor = '#f9f9f9';
                                }
                              }}
                              onMouseOut={(e) => {
                                if (selectedVenueId !== venue._id) {
                                  e.currentTarget.style.borderColor = '#ddd';
                                  e.currentTarget.style.backgroundColor = 'white';
                                }
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <div>
                                  <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '600' }}>
                                    {venue.name}
                                  </h4>
                                  <p style={{ margin: '2px 0', fontSize: '12px', color: '#666' }}>
                                    Capacity: {venue.capacity} | Location: {venue.location || 'Not specified'}
                                  </p>
                                </div>
                                {venue.hasConflict && (
                                  <span style={{
                                    padding: '4px 8px',
                                    backgroundColor: '#ff9999',
                                    color: '#990000',
                                    borderRadius: '3px',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                  }}>
                                    ⚠️ CONFLICT
                                  </span>
                                )}
                                {venue.hasPendingConflicts && !venue.hasConflict && (
                                  <span style={{
                                    padding: '4px 8px',
                                    backgroundColor: '#ffeb99',
                                    color: '#996600',
                                    borderRadius: '3px',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                  }}>
                                    ⏳ PENDING
                                  </span>
                                )}
                              </div>

                              {venue.hasConflict && (
                                <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#fff5f5', borderRadius: '3px', borderLeft: '3px solid #ff6666' }}>
                                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', fontWeight: '600', color: '#c33' }}>
                                    Conflicts detected on selected date/time:
                                  </p>
                                  {venue.conflicts.map((conflict, idx) => (
                                    <p key={idx} style={{ margin: '2px 0', fontSize: '11px', color: '#666' }}>
                                      • {conflict.eventTitle} ({new Date(conflict.startDate).toLocaleString()})
                                    </p>
                                  ))}
                                </div>
                              )}

                              {venue.hasPendingConflicts && !venue.hasConflict && (
                                <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#fffef5', borderRadius: '3px', borderLeft: '3px solid #ffcc66' }}>
                                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', fontWeight: '600', color: '#996600' }}>
                                    Pending requests (awaiting admin approval):
                                  </p>
                                  {venue.pendingConflicts.map((conflict, idx) => (
                                    <p key={idx} style={{ margin: '2px 0', fontSize: '11px', color: '#666' }}>
                                      • {conflict.eventTitle}
                                    </p>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      {errors.venue && <p style={{ color: '#c33', fontSize: '12px', marginTop: '4px' }}>{errors.venue}</p>}
                    </>
                  )}

                  {/* Custom Venue */}
                  {useCustomVenue && (
                    <>
                      <input
                        type="text"
                        value={customVenue}
                        onChange={(e) => {
                          setCustomVenue(e.target.value);
                          if (errors.customVenue) {
                            setErrors({ ...errors, customVenue: '' });
                          }
                        }}
                        placeholder="Enter custom venue name (e.g., Outdoor Auditorium, Off-campus venue)"
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: errors.customVenue ? '1px solid #c33' : '1px solid #ddd',
                          borderRadius: '4px',
                          fontSize: '14px',
                          boxSizing: 'border-box',
                        }}
                      />
                      <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                        Enter the name or description of the venue you'd like to request. Admin will review and approve.
                      </p>
                      {errors.customVenue && <p style={{ color: '#c33', fontSize: '12px', marginTop: '4px' }}>{errors.customVenue}</p>}
                    </>
                  )}
                </div>

                {/* Conflict Warning Summary */}
                {venueConflicts && venueConflicts.hasConflict && (
                  <div style={{
                    marginBottom: '20px',
                    padding: '12px',
                    backgroundColor: '#fee',
                    border: '1px solid #fcc',
                    borderRadius: '4px',
                  }}>
                    <p style={{ margin: '0 0 8px 0', fontWeight: '600', color: '#c33' }}>
                      ⚠️ Conflict Warning
                    </p>
                    <p style={{ margin: '0', fontSize: '13px', color: '#666' }}>
                      The selected venue has scheduling conflicts during this time period. Your request will be submitted to the admin for review and priority resolution.
                    </p>
                  </div>
                )}

                {/* Button Group */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setError('');
                    }}
                    style={{
                      padding: '12px',
                      backgroundColor: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'background-color 0.3s ease',
                    }}
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      padding: '12px',
                      backgroundColor: loading ? '#999' : '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      transition: 'background-color 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) e.target.style.backgroundColor = '#219653';
                    }}
                    onMouseLeave={(e) => {
                      if (!loading) e.target.style.backgroundColor = '#28a745';
                    }}
                  >
                    {loading ? 'Submitting...' : 'Submit Venue Request'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;
