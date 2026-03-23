const User = require('../models/User');
const Event = require('../models/Event');
const Club = require('../models/Club');
const StudentApplication = require('../models/StudentApplication');
const Venue = require('../models/Venue');
const TimeSlot = require('../models/TimeSlot');

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
    const { title, description, venue, eventDate, poster, requiredSkills, capacity } = req.body;

    // Validation
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Event name is required' });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ message: 'Event description is required' });
    }
    if (!venue || !venue.trim()) {
      return res.status(400).json({ message: 'Venue is required' });
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

module.exports = {
  getClubHeadDashboard,
  getAvailableVenues,
  createEvent,
  submitEventApplication,
  getEventApplications,
  acceptStudentApplication,
  rejectStudentApplication,
};
