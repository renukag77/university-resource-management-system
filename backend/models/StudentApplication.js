const mongoose = require('mongoose');

const studentApplicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    userSkills: [
      {
        type: String,
        trim: true,
      },
    ],
    submittedDocumentation: [
      {
        type: String, // File URL from Cloudinary or storage
      },
    ],
    status: {
      type: String,
      enum: ['applied', 'accepted', 'rejected', 'withdrawn'],
      default: 'applied',
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    clubHeadComment: {
      type: String,
      default: null,
    },
    respondedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StudentApplication', studentApplicationSchema);
