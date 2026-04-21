const express = require('express');
const authMiddleware = require('../middleware/auth');
const {
  getAdminDashboard,
  getPendingRequests,
  approveEventRequest,
  rejectEventRequest,
  requestChanges,
  suggestAlternative,
  getAllVenues,
  addVenue,
  getPendingVenueRequests,
  getVenueRequestDetails,
  approveVenueRequest,
  rejectVenueRequest,
  getAllEvents,
} = require('../controllers/adminController');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get dashboard data
router.get('/dashboard', getAdminDashboard);

// Get pending event requests
router.get('/pending-requests', getPendingRequests);

// Get all events (approved or pending)
router.get('/all-events', getAllEvents);

// Approve event request
router.put('/events/:eventId/approve', approveEventRequest);

// Reject event request
router.put('/events/:eventId/reject', rejectEventRequest);

// Request changes
router.put('/events/:eventId/request-changes', requestChanges);

// Suggest alternative venue and date
router.put('/events/:eventId/suggest-alternative', suggestAlternative);

// Get all venues
router.get('/venues', getAllVenues);

// Add new venue
router.post('/venues', addVenue);

// Venue request endpoints
router.get('/venue-requests', getPendingVenueRequests);
router.get('/venue-requests/:venueRequestId', getVenueRequestDetails);
router.put('/venue-requests/:venueRequestId/approve', approveVenueRequest);
router.put('/venue-requests/:venueRequestId/reject', rejectVenueRequest);

module.exports = router;
