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

// Get student's events (authenticated endpoint)
export const getStudentEvents = async () => {
  try {
    const token = authService.getToken();
    const response = await fetch(`${API_URL}/student/events`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch student events');
    }
    return await response.json();
  } catch (error) {
    console.error('Get student events error:', error);
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
export const applyForEvent = async (eventId, skills) => {
  try {
    const token = authService.getToken();
    const response = await fetch(`${API_URL}/student/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ eventId, skills }),
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

export default {
  getPublicEvents,
  searchPublicEvents,
  getStudentEvents,
  createEvent,
  applyForEvent,
  getClubHeadEvents,
};
