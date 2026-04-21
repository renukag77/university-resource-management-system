const express = require('express');
const authMiddleware = require('../middleware/auth');
const { upload, documentUpload, uploadToCloudinary } = require('../middleware/upload');

const router = express.Router();

// Upload image to Cloudinary
router.post('/', authMiddleware, upload, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, req.file.originalname, 'campus-events/posters');

    res.json({
      success: true,
      imageUrl: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      message: 'Failed to upload image to Cloudinary',
      error: error.message 
    });
  }
});

// Upload document to Cloudinary (for student applications)
router.post('/document', authMiddleware, documentUpload, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    // Upload to Cloudinary in documents folder
    const result = await uploadToCloudinary(
      req.file.buffer, 
      req.file.originalname, 
      'campus-events/applications'
    );

    res.json({
      success: true,
      imageUrl: result.secure_url, // Same response field for consistency
      publicId: result.public_id,
      fileName: req.file.originalname,
      fileSize: req.file.size,
    });
  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({ 
      message: 'Failed to upload document to Cloudinary',
      error: error.message 
    });
  }
});

module.exports = router;
