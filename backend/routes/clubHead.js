const express = require('express');
const authMiddleware = require('../middleware/auth');
const {
  getClubHeadDashboard,
  getAvailableVenues,
  createEvent,
  submitEventApplication,
  getEventApplications,
  acceptStudentApplication,
  rejectStudentApplication,
  respondToApplication,
  requestVenue,
  getVenueRequests,
  getEventVenueRequests,
  cancelVenueRequest,
  getAvailableVenuesWithConflicts,
} = require('../controllers/clubHeadController');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get dashboard data
router.get('/dashboard', getClubHeadDashboard);

// Get available venues and slots
router.get('/venues', getAvailableVenues);

// Get available venues with conflict information
router.get('/venues-with-conflicts', getAvailableVenuesWithConflicts);

// Create new event
router.post('/events', createEvent);

// Submit event application (request venue and date)
router.post('/events/:eventId/submit', submitEventApplication);

// Get applications for an event
router.get('/events/:eventId/applications', getEventApplications);

// Accept student application
router.put('/applications/:applicationId/accept', acceptStudentApplication);

// Reject student application
router.put('/applications/:applicationId/reject', rejectStudentApplication);

// Unified respond to application (accept or reject with comment)
router.put('/applications/:applicationId/respond', respondToApplication);

// Venue request endpoints
router.post('/events/:eventId/request-venue', requestVenue);
router.get('/venue-requests', getVenueRequests);
router.get('/events/:eventId/venue-requests', getEventVenueRequests);
router.delete('/venue-requests/:venueRequestId/cancel', cancelVenueRequest);

module.exports = router;
