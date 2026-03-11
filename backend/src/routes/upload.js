const express = require('express');
const multer = require('multer');
const config = require('../config');
const { validateApiKey } = require('../middleware/auth');
const { parseFile } = require('../services/parserService');
const { generateSummary } = require('../services/aiService');
const { sendEmail } = require('../services/emailService');

const router = express.Router();

// Configure multer for file upload (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.maxFileSizeBytes,
  },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.csv', '.xlsx'];
    const ext = '.' + file.originalname.toLowerCase().split('.').pop();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only .csv and .xlsx files are accepted.'));
    }
  },
});

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Upload Sales Data
 *     description: |
 *       Upload a CSV or XLSX sales data file and provide a recipient email.
 *       The API will parse the data, generate an AI-powered executive summary
 *       using Google Gemini, and email the results to the specified recipient.
 *     tags: [Upload]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - email
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Sales data file (.csv or .xlsx)
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Recipient email address
 *                 example: manager@company.com
 *     responses:
 *       200:
 *         description: Summary generated and emailed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Sales summary generated and emailed successfully!
 *                 summary:
 *                   type: string
 *                   example: "Q1 2026 Sales Report: Total revenue of $684,000..."
 *                 email_sent:
 *                   type: boolean
 *                   example: true
 *                 recipient:
 *                   type: string
 *                   example: manager@company.com
 *       400:
 *         description: Bad Request (invalid file type, email, or data)
 *       403:
 *         description: Forbidden (invalid API key)
 *       413:
 *         description: File too large
 *       429:
 *         description: Rate limit exceeded
 *       500:
 *         description: Internal Server Error
 */
router.post('/upload', validateApiKey, (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          success: false,
          detail: `File too large. Maximum size is ${config.maxFileSizeMB}MB.`,
        });
      }
      return res.status(400).json({ success: false, detail: err.message });
    }
    if (err) {
      return res.status(400).json({ success: false, detail: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    // Validate file exists
    if (!req.file) {
      return res.status(400).json({
        success: false,
        detail: 'No file uploaded. Please upload a .csv or .xlsx file.',
      });
    }

    // Validate email
    const email = req.body.email;
    if (!email || !EMAIL_REGEX.test(email)) {
      return res.status(400).json({
        success: false,
        detail: 'Invalid email address format.',
      });
    }

    console.log(`📁 Parsing file: ${req.file.originalname}`);

    // Step 1: Parse the file
    const dataText = await parseFile(req.file.buffer, req.file.originalname);

    // Step 2: Generate AI summary
    console.log('🤖 Generating AI summary via Gemini...');
    const summary = await generateSummary(dataText);

    // Step 3: Send email (non-fatal — summary still returned if email fails)
    console.log(`📧 Sending summary to ${email}...`);
    let emailSent = false;
    let emailWarning = null;
    try {
      emailSent = await sendEmail(email, summary);
    } catch (emailError) {
      console.error('⚠️ Email sending failed (non-fatal):', emailError.message);
      emailWarning = `Email delivery failed: ${emailError.message}. The summary is shown below.`;
    }

    res.json({
      success: true,
      message: emailSent
        ? 'Sales summary generated and emailed successfully!'
        : 'Sales summary generated! (Email delivery failed — see warning)',
      summary,
      email_sent: emailSent,
      recipient: email,
      ...(emailWarning && { warning: emailWarning }),
    });

  } catch (error) {
    console.error('❌ Upload error:', error.message);
    res.status(500).json({
      success: false,
      detail: error.message || 'An unexpected error occurred. Please try again later.',
    });
  }
});

module.exports = router;
