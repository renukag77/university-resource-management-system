const TimeSlot = require('../models/TimeSlot');
const VenueRequest = require('../models/VenueRequest');
const Event = require('../models/Event');

/**
 * Check for conflicts when booking a venue for a specific time slot
 * Returns an object with conflict status and details
 */
async function checkVenueConflicts(venueId, startDate, endDate) {
  try {
    // Find all approved venue requests for this venue that overlap with the requested time
    const conflictingRequests = await VenueRequest.find({
      venueId: venueId,
      status: 'approved',
      startDate: { $lt: endDate },
      endDate: { $gt: startDate },
    }).populate('eventId');

    if (conflictingRequests.length > 0) {
      return {
        hasConflict: true,
        conflicts: conflictingRequests.map((req) => ({
          eventId: req.eventId._id,
          eventTitle: req.eventId.title,
          startDate: req.startDate,
          endDate: req.endDate,
          venueRequestId: req._id,
        })),
      };
    }

    return {
      hasConflict: false,
      conflicts: [],
    };
  } catch (error) {
    throw new Error(`Error checking venue conflicts: ${error.message}`);
  }
}

/**
 * Check for soft conflicts (pending requests that might lead to actual conflicts)
 * This helps warn club heads about pending requests
 */
async function checkPendingConflicts(venueId, startDate, endDate) {
  try {
    const pendingRequests = await VenueRequest.find({
      venueId: venueId,
      status: 'pending',
      startDate: { $lt: endDate },
      endDate: { $gt: startDate },
    }).populate('eventId');

    return {
      hasPendingConflicts: pendingRequests.length > 0,
      pendingConflicts: pendingRequests.map((req) => ({
        eventId: req.eventId._id,
        eventTitle: req.eventId.title,
        startDate: req.startDate,
        endDate: req.endDate,
        venueRequestId: req._id,
      })),
    };
  } catch (error) {
    throw new Error(`Error checking pending conflicts: ${error.message}`);
  }
}

/**
 * Check if venue is available during the requested time period
 * Considers both approved requests and time slots
 */
async function isVenueAvailable(venueId, startDate, endDate) {
  try {
    const conflictCheck = await checkVenueConflicts(venueId, startDate, endDate);
    return !conflictCheck.hasConflict;
  } catch (error) {
    throw new Error(`Error checking venue availability: ${error.message}`);
  }
}

module.exports = {
  checkVenueConflicts,
  checkPendingConflicts,
  isVenueAvailable,
};
