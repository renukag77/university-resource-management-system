const User = require('../models/User');
const Event = require('../models/Event');
const Club = require('../models/Club');
const StudentApplication = require('../models/StudentApplication');
const Venue = require('../models/Venue');
const TimeSlot = require('../models/TimeSlot');
const VenueRequest = require('../models/VenueRequest');
const { checkVenueConflicts, checkPendingConflicts, isVenueAvailable } = require('../utils/venueConflictChecker');

// Get club head dashboard
const getClubHeadDashboard = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);

    if (!user || user.role !== 'club_head') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get club associated with club head
    const club = await Club.findOne({ headId: userId }).populate('members');

    // Get events created by this club head
    const events = await Event.find({ clubHeadId: userId }).sort({
      createdAt: -1,
    });

    res.json({
      user,
      club,
      events,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get available venues and time slots
const getAvailableVenues = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let venueQuery = {};
    let timeSlotQuery = {};

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      timeSlotQuery = {
        isBooked: false,
        startDate: { $gte: start },
        endDate: { $lte: end },
      };
    }

    const venues = await Venue.find(venueQuery);
    const availableSlots = await TimeSlot.find(timeSlotQuery).populate(
      'venueId'
    );

    res.json({
      venues,
      availableSlots,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create event
const createEvent = async (req, res) => {
  try {
    const userId = req.userId;
    const { title, description, venue, eventDate, poster, requiredSkills, capacity, problemStatement, ideationNeeded } = req.body;

    // Validation
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Event name is required' });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ message: 'Event description is required' });
    }
    if (!eventDate) {
      return res.status(400).json({ message: 'Event date is required' });
    }

    // Validate date is in the future
    const eventDateTime = new Date(eventDate);
    if (eventDateTime <= new Date()) {
      return res.status(400).json({ message: 'Event date must be in the future' });
    }

    // Verify user is a club head
    const user = await User.findById(userId);
    if (!user || user.role !== 'club_head') {
      return res.status(403).json({ message: 'Access denied. Only club heads can create events' });
    }

    // Create event
    const event = new Event({
      title,
      description,
      venue,
      eventDate: eventDateTime,
      poster: poster || null,
      clubHeadId: userId,
      requiredSkills: requiredSkills || [],
      capacity: capacity || 0,
      problemStatement: problemStatement || null,
      ideationNeeded: ideationNeeded || false,
      status: 'active', // Immediately active for students to see
    });

    await event.save();

    // Populate club head info before returning
    await event.populate('clubHeadId', 'name email');

    res.status(201).json({
      message: 'Event created successfully',
      event,
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Request venue and date
const submitEventApplication = async (req, res) => {
  try {
    const userId = req.userId;
    const { eventId, venueId, startDate, endDate } = req.body;

    const event = await Event.findById(eventId);

    if (!event || event.clubHeadId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const venue = await Venue.findById(venueId);
    if (!venue) {
      return res.status(404).json({ message: 'Venue not found' });
    }

    // Check if slot is available
    const existingSlot = await TimeSlot.findOne({
      venueId,
      isBooked: true,
      startDate: { $lt: new Date(endDate) },
      endDate: { $gt: new Date(startDate) },
    });

    if (existingSlot) {
      return res
        .status(400)
        .json({ message: 'Selected time slot is not available' });
    }

    event.appliedLocation = venue.name;
    event.appliedStartDate = new Date(startDate);
    event.appliedEndDate = new Date(endDate);
    event.status = 'submitted';

    await event.save();

    res.json({
      message: 'Event application submitted to admin',
      event,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get event applications (students applying to this club head's events)
const getEventApplications = async (req, res) => {
  try {
    const userId = req.userId;
    const { eventId } = req.params;

    const event = await Event.findById(eventId);

    if (!event || event.clubHeadId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const applications = await StudentApplication.find({ eventId })
      .populate('userId', 'name email idNumber')
      .sort({ appliedAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Accept student application
const acceptStudentApplication = async (req, res) => {
  try {
    const userId = req.userId;
    const { applicationId } = req.params;

    const application = await StudentApplication.findById(applicationId);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const event = await Event.findById(application.eventId);

    if (!event || event.clubHeadId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    application.status = 'accepted';
    application.respondedAt = new Date();

    await application.save();

    res.json({ message: 'Application accepted', application });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Reject student application
const rejectStudentApplication = async (req, res) => {
  try {
    const userId = req.userId;
    const { applicationId } = req.params;
    const { comment } = req.body;

    const application = await StudentApplication.findById(applicationId);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const event = await Event.findById(application.eventId);

    if (!event || event.clubHeadId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    application.status = 'rejected';
    application.clubHeadComment = comment || '';
    application.respondedAt = new Date();

    await application.save();

    res.json({ message: 'Application rejected', application });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Unified respond to application (accept or reject with comment)
const respondToApplication = async (req, res) => {
  try {
    const userId = req.userId;
    const { applicationId } = req.params;
    const { status, clubHeadComment } = req.body;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be accepted or rejected.' });
    }

    const application = await StudentApplication.findById(applicationId).populate('eventId');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const event = application.eventId;

    if (!event || event.clubHeadId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    application.status = status;
    application.clubHeadComment = clubHeadComment || '';
    application.respondedAt = new Date();

    await application.save();

    res.json({ 
      message: `Application ${status} successfully`, 
      application 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Request a venue for an event with conflict checking
const requestVenue = async (req, res) => {
  try {
    const userId = req.userId;
    const { eventId, venueId, customVenue, startDate, endDate } = req.body;

    // Validate inputs
    if (!eventId || !startDate || !endDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (!venueId && !customVenue) {
      return res.status(400).json({ message: 'Either venue selection or custom venue name is required' });
    }

    // Verify user owns the event
    const event = await Event.findById(eventId);
    if (!event || event.clubHeadId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized access to this event' });
    }

    let venue = null;
    let venueName = '';
    let conflictInfo = { hasConflict: false, conflicts: [] };

    if (venueId) {
      // Verify venue exists
      venue = await Venue.findById(venueId);
      if (!venue) {
        return res.status(404).json({ message: 'Venue not found' });
      }

      venueName = venue.name;

      // Check for conflicts
      conflictInfo = await checkVenueConflicts(venueId, new Date(startDate), new Date(endDate));
    } else if (customVenue) {
      // Custom venue - no conflict checking needed
      venueName = customVenue.trim();
      if (!venueName) {
        return res.status(400).json({ message: 'Custom venue name cannot be empty' });
      }
    }

    // Create venue request
    const venueRequest = new VenueRequest({
      eventId,
      venueId: venueId || null,
      customVenueName: customVenue || null,
      clubHeadId: userId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      conflictDetected: conflictInfo.hasConflict,
      conflictingEvents: conflictInfo.conflicts,
      status: 'pending',
    });

    await venueRequest.save();

    // Update event with venue reference
    event.venueId = venueId || null;
    event.venueRequestId = venueRequest._id;
    event.venue = venueName;
    event.appliedLocation = venueName;
    event.appliedStartDate = new Date(startDate);
    event.appliedEndDate = new Date(endDate);
    event.status = 'submitted';
    await event.save();

    res.status(201).json({
      message: 'Venue request submitted successfully',
      venueRequest,
      conflictDetected: conflictInfo.hasConflict,
      conflicts: conflictInfo.conflicts,
    });
  } catch (error) {
    console.error('Request venue error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all venue requests for the club head
const getVenueRequests = async (req, res) => {
  try {
    const userId = req.userId;

    const venueRequests = await VenueRequest.find({ clubHeadId: userId })
      .populate('eventId', 'title description')
      .populate('venueId', 'name capacity location')
      .sort({ createdAt: -1 });

    res.json(venueRequests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get venue requests for a specific event
const getEventVenueRequests = async (req, res) => {
  try {
    const userId = req.userId;
    const { eventId } = req.params;

    // Verify user owns the event
    const event = await Event.findById(eventId);
    if (!event || event.clubHeadId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const venueRequests = await VenueRequest.find({ eventId })
      .populate('venueId', 'name capacity location')
      .sort({ createdAt: -1 });

    res.json(venueRequests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Cancel a venue request (only if pending)
const cancelVenueRequest = async (req, res) => {
  try {
    const userId = req.userId;
    const { venueRequestId } = req.params;

    const venueRequest = await VenueRequest.findById(venueRequestId);
    if (!venueRequest) {
      return res.status(404).json({ message: 'Venue request not found' });
    }

    if (venueRequest.clubHeadId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (venueRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Can only cancel pending requests' });
    }

    venueRequest.status = 'cancelled';
    await venueRequest.save();

    res.json({ message: 'Venue request cancelled', venueRequest });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get available venues with conflict information for a given time period
const getAvailableVenuesWithConflicts = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    const venues = await Venue.find({ isAvailable: true });

    const startTime = new Date(startDate);
    const endTime = new Date(endDate);

    const venuesWithConflicts = await Promise.all(
      venues.map(async (venue) => {
        const conflictInfo = await checkVenueConflicts(venue._id, startTime, endTime);
        const pendingInfo = await checkPendingConflicts(venue._id, startTime, endTime);

        return {
          ...venue.toObject(),
          hasConflict: conflictInfo.hasConflict,
          conflicts: conflictInfo.conflicts,
          hasPendingConflicts: pendingInfo.hasPendingConflicts,
          pendingConflicts: pendingInfo.pendingConflicts,
        };
      })
    );

    res.json(venuesWithConflicts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
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
};
