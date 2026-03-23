const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    venue: {
      type: String,
      required: true,
      trim: true,
    },
    eventDate: {
      type: Date,
      required: true,
    },
    poster: {
      type: String, // URL or file path
      default: null,
    },
    clubHeadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    clubId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club',
      default: null,
    },
    requiredSkills: [
      {
        type: String,
        trim: true,
      },
    ],
    capacity: {
      type: Number,
      default: 0,
    },
    appliedLocation: {
      type: String,
      default: null,
    },
    appliedStartDate: {
      type: Date,
      default: null,
    },
    appliedEndDate: {
      type: Date,
      default: null,
    },
    approvedLocation: {
      type: String,
      default: null,
    },
    approvedStartDate: {
      type: Date,
      default: null,
    },
    approvedEndDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: [
        'draft',
        'submitted',
        'approved',
        'rejected',
        'changes_requested',
        'active',
        'completed',
        'cancelled',
      ],
      default: 'draft',
    },
    adminComment: {
      type: String,
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

module.exports = mongoose.model('Event', eventSchema);
