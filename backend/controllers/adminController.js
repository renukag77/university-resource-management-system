const User = require('../models/User');
const Event = require('../models/Event');
const Venue = require('../models/Venue');
const TimeSlot = require('../models/TimeSlot');
const VenueRequest = require('../models/VenueRequest');

// Get admin dashboard
const getAdminDashboard = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get pending event applications
    const pendingEvents = await Event.find({ status: 'submitted' })
      .populate('clubHeadId', 'name email')
      .sort({ createdAt: -1 });

    // Get all events
    const allEvents = await Event.find().sort({ createdAt: -1 });

    // Get venues
    const venues = await Venue.find();

    // Get pending venue requests
    const pendingVenueRequests = await VenueRequest.find({ status: 'pending' })
      .populate('eventId', 'title')
      .populate('venueId', 'name capacity')
      .populate('clubHeadId', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      user,
      pendingEvents,
      allEvents,
      venues,
      pendingVenueRequests,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get pending event requests
const getPendingRequests = async (req, res) => {
  try {
    const pendingEvents = await Event.find({
      status: { $in: ['submitted', 'changes_requested'] },
    })
      .populate('clubHeadId', 'name email')
      .sort({ createdAt: -1 });

    res.json(pendingEvents);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Approve event request
const approveEventRequest = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.status !== 'submitted' && event.status !== 'changes_requested') {
      return res
        .status(400)
        .json({ message: 'Event cannot be approved in current status' });
    }

    // Approve the applied location and date
    event.approvedLocation = event.appliedLocation;
    event.approvedStartDate = event.appliedStartDate;
    event.approvedEndDate = event.appliedEndDate;
    event.status = 'approved';
    event.adminComment = null;

    // Create time slot booking
    const venue = await Venue.findOne({ name: event.appliedLocation });
    if (venue) {
      const timeSlot = new TimeSlot({
        venueId: venue._id,
        eventId: event._id,
        startDate: event.appliedStartDate,
        endDate: event.appliedEndDate,
        isBooked: true,
        bookedBy: event.clubHeadId,
      });
      await timeSlot.save();
    }

    await event.save();

    res.json({ message: 'Event approved', event });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Reject event request
const rejectEventRequest = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { comment } = req.body;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    event.status = 'rejected';
    event.adminComment = comment || 'Your event request was rejected by admin';

    await event.save();

    res.json({ message: 'Event rejected', event });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Request changes
const requestChanges = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { comment } = req.body;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    event.status = 'changes_requested';
    event.adminComment = comment || 'Please make changes to your event request';

    await event.save();

    res.json({ message: 'Changes requested', event });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Suggest alternative venue and date
const suggestAlternative = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { alternateLocation, alternateStartDate, alternateEndDate, comment } =
      req.body;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    event.status = 'changes_requested';
    event.adminComment =
      comment ||
      `Please consider using ${alternateLocation} instead. Suggested dates: ${alternateStartDate} to ${alternateEndDate}`;

    await event.save();

    res.json({
      message: 'Alternative suggestion sent to club head',
      event,
      suggestion: {
        location: alternateLocation,
        startDate: alternateStartDate,
        endDate: alternateEndDate,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all venues
const getAllVenues = async (req, res) => {
  try {
    const venues = await Venue.find().sort({ name: 1 });
    res.json(venues);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add new venue
const addVenue = async (req, res) => {
  try {
    const { name, capacity, location, description } = req.body;

    const existingVenue = await Venue.findOne({ name });
    if (existingVenue) {
      return res.status(400).json({ message: 'Venue already exists' });
    }

    const venue = new Venue({
      name,
      capacity,
      location,
      description,
    });

    await venue.save();

    res.status(201).json({ message: 'Venue added successfully', venue });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all pending venue requests
const getPendingVenueRequests = async (req, res) => {
  try {
    const venueRequests = await VenueRequest.find({ status: 'pending' })
      .populate('eventId', 'title description')
      .populate('venueId', 'name capacity location')
      .populate('clubHeadId', 'name email idNumber')
      .sort({ createdAt: -1 });

    res.json(venueRequests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get details of a specific venue request
const getVenueRequestDetails = async (req, res) => {
  try {
    const { venueRequestId } = req.params;

    const venueRequest = await VenueRequest.findById(venueRequestId)
      .populate({
        path: 'eventId',
        select: 'title description capacity',
      })
      .populate({
        path: 'venueId',
        select: 'name capacity location description',
      })
      .populate({
        path: 'clubHeadId',
        select: 'name email idNumber',
      });

    if (!venueRequest) {
      return res.status(404).json({ message: 'Venue request not found' });
    }

    res.json(venueRequest);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Approve a venue request
const approveVenueRequest = async (req, res) => {
  try {
    const { venueRequestId } = req.params;
    const { adminComment } = req.body;

    const venueRequest = await VenueRequest.findById(venueRequestId)
      .populate('eventId')
      .populate('venueId');

    if (!venueRequest) {
      return res.status(404).json({ message: 'Venue request not found' });
    }

    if (venueRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending requests can be approved' });
    }

    // Approve the request
    venueRequest.status = 'approved';
    venueRequest.approvedAt = new Date();
    venueRequest.adminComment = adminComment || '';
    await venueRequest.save();

    // Create a time slot booking only for system venues (not custom venues)
    if (venueRequest.venueId) {
      const timeSlot = new TimeSlot({
        venueId: venueRequest.venueId._id,
        eventId: venueRequest.eventId._id,
        startDate: venueRequest.startDate,
        endDate: venueRequest.endDate,
        isBooked: true,
        bookedBy: venueRequest.clubHeadId,
      });
      await timeSlot.save();
    }

    // Update event status if all approvals are done
    const event = venueRequest.eventId;
    event.approvedLocation = venueRequest.venueId ? venueRequest.venueId.name : venueRequest.customVenueName;
    event.approvedStartDate = venueRequest.startDate;
    event.approvedEndDate = venueRequest.endDate;
    event.status = 'approved';
    event.adminComment = null;
    await event.save();

    const populatedRequest = await VenueRequest.findById(venueRequestId)
      .populate('eventId')
      .populate('venueId')
      .populate('clubHeadId', 'name email');

    res.json({
      message: 'Venue request approved successfully',
      venueRequest: populatedRequest,
    });
  } catch (error) {
    console.error('Approve venue request error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Reject a venue request
const rejectVenueRequest = async (req, res) => {
  try {
    const { venueRequestId } = req.params;
    const { adminComment } = req.body;

    const venueRequest = await VenueRequest.findById(venueRequestId)
      .populate('eventId');

    if (!venueRequest) {
      return res.status(404).json({ message: 'Venue request not found' });
    }

    if (venueRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending requests can be rejected' });
    }

    // Reject the request
    venueRequest.status = 'rejected';
    venueRequest.rejectedAt = new Date();
    venueRequest.adminComment = adminComment || 'Venue request was rejected by admin';
    await venueRequest.save();

    // Update event status back to draft for re-submission
    const event = venueRequest.eventId;
    event.status = 'draft';
    event.adminComment = adminComment || 'Venue request was rejected';
    await event.save();

    const populatedRequest = await VenueRequest.findById(venueRequestId)
      .populate('eventId')
      .populate('venueId')
      .populate('clubHeadId', 'name email');

    res.json({
      message: 'Venue request rejected',
      venueRequest: populatedRequest,
    });
  } catch (error) {
    console.error('Reject venue request error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all approved or pending events
const getAllEvents = async (req, res) => {
  try {
    const { status } = req.query;

    let query = {};
    
    // If status filter is provided, use it; otherwise get approved or pending/submitted
    if (status) {
      query.status = status;
    } else {
      query.status = { $in: ['approved', 'submitted', 'active'] };
    }

    const events = await Event.find(query)
      .populate('clubHeadId', 'name email')
      .populate('venueId', 'name capacity location')
      .populate('clubId', 'name')
      .sort({ createdAt: -1 });

    res.json(events);
  } catch (error) {
    console.error('Get all events error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
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
};
