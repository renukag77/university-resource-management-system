const User = require('../models/User');
const Event = require('../models/Event');
const StudentApplication = require('../models/StudentApplication');

// Get student dashboard data
const getStudentDashboard = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);

    if (!user || user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get all approved events
    const events = await Event.find({ status: 'active' })
      .populate('clubHeadId', 'name email')
      .lean();

    // Get student applications
    const applications = await StudentApplication.find({ userId }).populate(
      'eventId',
      'title status'
    );

    res.json({
      user,
      events,
      applications,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get events with filters
const getAllEvents = async (req, res) => {
  try {
    const { skill, search } = req.query;
    let query = { status: 'active' };

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    if (skill) {
      query.requiredSkills = { $in: [skill] };
    }

    const events = await Event.find(query)
      .populate('clubHeadId', 'name email')
      .sort({ createdAt: -1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Apply for an event
const applyForEvent = async (req, res) => {
  try {
    const userId = req.userId;
    const { eventId, skills, documentationUrls } = req.body;

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if already applied
    const existingApplication = await StudentApplication.findOne({
      userId,
      eventId,
    });

    if (existingApplication) {
      return res
        .status(400)
        .json({ message: 'You have already applied for this event' });
    }

    // Create application
    const application = new StudentApplication({
      userId,
      eventId,
      userSkills: skills || [],
      submittedDocumentation: documentationUrls || [],
    });

    await application.save();

    res.status(201).json({
      message: 'Application submitted successfully',
      application,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get student applications
const getStudentApplications = async (req, res) => {
  try {
    const userId = req.userId;

    const applications = await StudentApplication.find({ userId })
      .populate('eventId', 'title status')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Withdraw application
const withdrawApplication = async (req, res) => {
  try {
    const userId = req.userId;
    const { applicationId } = req.params;

    const application = await StudentApplication.findById(applicationId);

    if (!application || application.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (application.status === 'withdrawn') {
      return res
        .status(400)
        .json({ message: 'Application already withdrawn' });
    }

    application.status = 'withdrawn';
    await application.save();

    res.json({ message: 'Application withdrawn', application });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getStudentDashboard,
  getAllEvents,
  applyForEvent,
  getStudentApplications,
  withdrawApplication,
};
