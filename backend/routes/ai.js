const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const openRouterService = require('../services/openrouter');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
    }
  }
});

// Analyze uploaded image
router.post('/analyze', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const imageBuffer = fs.readFileSync(req.file.path);
    const mimeType = req.file.mimetype;

    const result = await openRouterService.analyzeImage(imageBuffer, mimeType);

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json(result);
  } catch (error) {
    console.error('AI analysis error:', error);

    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      error: error.message || 'Failed to analyze image',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Analyze image from URL
router.post('/analyze-url', async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    const result = await openRouterService.analyzeImageFromUrl(imageUrl);
    res.json(result);
  } catch (error) {
    console.error('AI analysis error:', error);
    res.status(500).json({
      error: error.message || 'Failed to analyze image',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Check API status
router.get('/status', (req, res) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const isConfigured = apiKey && apiKey !== 'your-openrouter-api-key-here';

  res.json({
    configured: isConfigured,
    model: process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5'
  });
});

module.exports = router;
