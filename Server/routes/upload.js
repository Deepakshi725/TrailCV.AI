import express from 'express';
import multer from 'multer';
import { PDFExtract } from 'pdf.js-extract';
import { auth } from '../middleware/auth.js';
import { Users } from '../models/User.js';

const router = express.Router();
const pdfExtract = new PDFExtract();

// Configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Extract text from PDF and save to database
router.post('/extract-text', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: 'File must be a PDF' });
    }

    const data = await pdfExtract.extractBuffer(req.file.buffer);
    const text = data.pages.map(page => page.content.map(item => item.str).join(' ')).join('\n');
    
    // Get the type from query parameter (resume or jd)
    const type = req.query.type;
    if (!type || !['resume', 'jd'].includes(type)) {
      return res.status(400).json({ error: 'Invalid type specified' });
    }

    // Get user ID from the request (set by auth middleware)
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Find the user and update their analyses
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create a new analysis entry
    const newAnalysis = {
      resume: type === 'resume' ? {
        text,
        fileType: req.file.mimetype,
        fileName: req.file.originalname,
        uploadedAt: new Date()
      } : {},
      jobDescription: type === 'jd' ? {
        text,
        fileType: req.file.mimetype,
        fileName: req.file.originalname,
        uploadedAt: new Date()
      } : {}
    };

    // Add to user's analyses array
    user.analyses.push(newAnalysis);
    await user.save();

    res.json({ 
      text,
      message: 'Text extracted and saved successfully',
      analysisId: user.analyses[user.analyses.length - 1]._id
    });
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({ error: 'Failed to process file' });
  }
});

// Extract text from PDF without saving to database
router.post('/extract-text-only', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: 'File must be a PDF' });
    }

    const data = await pdfExtract.extractBuffer(req.file.buffer);
    const text = data.pages.map(page => page.content.map(item => item.str).join(' ')).join('\n');
    
    res.json({ text });
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({ error: 'Failed to process file' });
  }
});

// Get user's analyses
router.get('/analyses', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ analyses: user.analyses });
  } catch (error) {
    console.error('Error fetching analyses:', error);
    res.status(500).json({ error: 'Failed to fetch analyses' });
  }
});

// Save complete analysis (both resume and job description)
router.post('/save-analysis', auth, async (req, res) => {
  try {
    const { resume, jobDescription } = req.body;
    
    if (!resume?.text || !jobDescription?.text) {
      return res.status(400).json({ error: 'Both resume and job description text are required' });
    }

    // Get user ID from the request (set by auth middleware)
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Find the user and update their analyses
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create a new analysis entry with both resume and job description
    const newAnalysis = {
      resume: {
        text: resume.text,
        fileType: resume.fileType,
        fileName: resume.fileName,
        uploadedAt: new Date()
      },
      jobDescription: {
        text: jobDescription.text,
        fileType: jobDescription.fileType,
        fileName: jobDescription.fileName,
        uploadedAt: new Date()
      }
    };

    // Add to user's analyses array
    user.analyses.push(newAnalysis);
    await user.save();

    res.json({ 
      message: 'Analysis saved successfully',
      analysisId: user.analyses[user.analyses.length - 1]._id
    });
  } catch (error) {
    console.error('Error saving analysis:', error);
    res.status(500).json({ error: 'Failed to save analysis' });
  }
});

export default router; 