const mongoose = require('mongoose');

const venueRequestSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    venueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Venue',
      required: false,
      default: null,
    },
    customVenueName: {
      type: String,
      required: false,
      default: null,
      trim: true,
    },
    clubHeadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled'],
      default: 'pending',
    },
    conflictDetected: {
      type: Boolean,
      default: false,
    },
    conflictingEvents: [
      {
        eventId: mongoose.Schema.Types.ObjectId,
        eventTitle: String,
        conflictReason: String,
      },
    ],
    adminComment: {
      type: String,
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    rejectedAt: {
      type: Date,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('VenueRequest', venueRequestSchema);
