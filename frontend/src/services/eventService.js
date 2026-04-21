import authService from './authService';

const API_URL = process.env.REACT_APP_API_URL ? 
  (process.env.REACT_APP_API_URL.endsWith('/api') ? process.env.REACT_APP_API_URL : `${process.env.REACT_APP_API_URL}/api`) : 
  'http://localhost:5000/api';

// Get all active events (public endpoint)
export const getPublicEvents = async () => {
  try {
    const response = await fetch(`${API_URL}/events`);
    if (!response.ok) {
      throw new Error('Failed to fetch events');
    }
    return await response.json();
  } catch (error) {
    console.error('Get public events error:', error);
    throw error;
  }
};

// Get events with filters (public endpoint)
export const searchPublicEvents = async (search, skill) => {
  try {
    let url = `${API_URL}/events`;
    const params = [];
    
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    if (skill) params.push(`skill=${encodeURIComponent(skill)}`);
    
    if (params.length > 0) {
      url += '?' + params.join('&');
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to search events');
    }
    return await response.json();
  } catch (error) {
    console.error('Search events error:', error);
    throw error;
  }
};

// Get student's applications
export const getStudentApplications = async () => {
  try {
    const token = authService.getToken();
    const response = await fetch(`${API_URL}/student/my-applications`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch applications');
    }
    return await response.json();
  } catch (error) {
    console.error('Get student applications error:', error);
    throw error;
  }
};

// Withdraw from an application
export const withdrawApplication = async (applicationId) => {
  try {
    const token = authService.getToken();
    const response = await fetch(`${API_URL}/student/applications/${applicationId}/withdraw`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to withdraw application');
    }
    return await response.json();
  } catch (error) {
    console.error('Withdraw application error:', error);
    throw error;
  }
};

// Create new event (club head only)
export const createEvent = async (eventData) => {
  try {
    const token = authService.getToken();
    const response = await fetch(`${API_URL}/club-head/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(eventData),
    });
    
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create event');
      }
      return data;
    } else {
      const text = await response.text();
      throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}...`);
    }
  } catch (error) {
    console.error('Create event error:', error);
    throw error;
  }
};

// Apply for an event (student only)
export const applyForEvent = async (eventId, skills, documentationUrls = []) => {
  try {
    const token = authService.getToken();
    const response = await fetch(`${API_URL}/student/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ eventId, skills, documentationUrls }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to apply for event');
    }
    return data;
  } catch (error) {
    console.error('Apply for event error:', error);
    throw error;
  }
};

// Get club head's events
export const getClubHeadEvents = async () => {
  try {
    const token = authService.getToken();
    const response = await fetch(`${API_URL}/club-head/dashboard`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    // Check if response is JSON before parsing
    const contentType = response.headers.get("content-type");
    if (!response.ok) {
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch club head events');
      }
      throw new Error(`Failed to fetch club head events (${response.status})`);
    }
    
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      return data.events || [];
    }
    return [];
  } catch (error) {
    console.error('Get club head events error:', error);
    throw error;
  }
};

// Get club head dashboard (events and basic data)
export const getClubHeadDashboard = async () => {
  try {
    const token = authService.getToken();
    const response = await fetch(`${API_URL}/club-head/dashboard`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch dashboard');
    }
    return data;
  } catch (error) {
    console.error('Get club head dashboard error:', error);
    throw error;
  }
};

// Get applications for a specific event
export const getEventApplications = async (eventId) => {
  try {
    const token = authService.getToken();
    const response = await fetch(`${API_URL}/club-head/events/${eventId}/applications`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch applications');
    }
    return data;
  } catch (error) {
    console.error('Get event applications error:', error);
    throw error;
  }
};

// Respond to an application (accept/reject with comment)
export const respondToApplication = async (applicationId, status, comment) => {
  try {
    const token = authService.getToken();
    const response = await fetch(`${API_URL}/club-head/applications/${applicationId}/respond`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status, clubHeadComment: comment }),
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to respond to application');
    }
    return data;
  } catch (error) {
    console.error('Respond to application error:', error);
    throw error;
  }
};

// Get available venues with conflict information
export const getAvailableVenuesWithConflicts = async (startDate, endDate) => {
  try {
    const token = authService.getToken();
    const response = await fetch(
      `${API_URL}/club-head/venues-with-conflicts?startDate=${startDate}&endDate=${endDate}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch venues');
    }
    return data;
  } catch (error) {
    console.error('Get venues with conflicts error:', error);
    throw error;
  }
};

// Request a venue for an event
export const requestVenue = async (eventId, venueId, startDate, endDate, customVenue = null) => {
  try {
    const token = authService.getToken();
    const response = await fetch(`${API_URL}/club-head/events/${eventId}/request-venue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ 
        eventId, 
        venueId: venueId || null, 
        startDate, 
        endDate,
        customVenue: customVenue || null
      }),
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to request venue');
    }
    return data;
  } catch (error) {
    console.error('Request venue error:', error);
    throw error;
  }
};

// Get venue requests for a club head
export const getVenueRequests = async () => {
  try {
    const token = authService.getToken();
    const response = await fetch(`${API_URL}/club-head/venue-requests`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch venue requests');
    }
    return data;
  } catch (error) {
    console.error('Get venue requests error:', error);
    throw error;
  }
};

// Get venue requests for a specific event
export const getEventVenueRequests = async (eventId) => {
  try {
    const token = authService.getToken();
    const response = await fetch(`${API_URL}/club-head/events/${eventId}/venue-requests`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch venue requests for event');
    }
    return data;
  } catch (error) {
    console.error('Get event venue requests error:', error);
    throw error;
  }
};

// Cancel a venue request
export const cancelVenueRequest = async (venueRequestId) => {
  try {
    const token = authService.getToken();
    const response = await fetch(`${API_URL}/club-head/venue-requests/${venueRequestId}/cancel`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to cancel venue request');
    }
    return data;
  } catch (error) {
    console.error('Cancel venue request error:', error);
    throw error;
  }
};

// Get admin pending venue requests
export const getAdminPendingVenueRequests = async () => {
  try {
    const token = authService.getToken();
    const response = await fetch(`${API_URL}/admin/venue-requests`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch pending venue requests');
    }
    return data;
  } catch (error) {
    console.error('Get admin pending venue requests error:', error);
    throw error;
  }
};

// Approve venue request
export const approveVenueRequest = async (venueRequestId, comment = '') => {
  try {
    const token = authService.getToken();
    const response = await fetch(`${API_URL}/admin/venue-requests/${venueRequestId}/approve`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ adminComment: comment }),
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to approve venue request');
    }
    return data;
  } catch (error) {
    console.error('Approve venue request error:', error);
    throw error;
  }
};

// Reject venue request
export const rejectVenueRequest = async (venueRequestId, comment = '') => {
  try {
    const token = authService.getToken();
    const response = await fetch(`${API_URL}/admin/venue-requests/${venueRequestId}/reject`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ adminComment: comment }),
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to reject venue request');
    }
    return data;
  } catch (error) {
    console.error('Reject venue request error:', error);
    throw error;
  }
};

// Get all approved or pending events for admin
export const getAllEventsForAdmin = async (status = null) => {
  try {
    const token = authService.getToken();
    let url = `${API_URL}/admin/all-events`;
    
    if (status) {
      url += `?status=${encodeURIComponent(status)}`;
    }
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch events');
    }
    return data;
  } catch (error) {
    console.error('Get all events error:', error);
    throw error;
  }
};

export default {
  getPublicEvents,
  searchPublicEvents,
  getStudentApplications,
  withdrawApplication,
  createEvent,
  applyForEvent,
  getClubHeadEvents,
  getClubHeadDashboard,
  getEventApplications,
  respondToApplication,
  getAvailableVenuesWithConflicts,
  requestVenue,
  getVenueRequests,
  getEventVenueRequests,
  cancelVenueRequest,
  getAdminPendingVenueRequests,
  approveVenueRequest,
  rejectVenueRequest,
  getAllEventsForAdmin,
};
