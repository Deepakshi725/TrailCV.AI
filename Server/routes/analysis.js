import express from 'express';
import { User } from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Submit new analysis
router.post('/submit', auth, async (req, res) => {
  try {
    const { resume, jobDescription } = req.body;
    
    // Create new analysis object
    const newAnalysis = {
      resume: {
        text: resume.text || '',
        fileUrl: resume.fileUrl || '',
        fileType: resume.fileType || '',
        fileName: resume.fileName || ''
      },
      jobDescription: {
        text: jobDescription.text || '',
        fileUrl: jobDescription.fileUrl || '',
        fileType: jobDescription.fileType || '',
        fileName: jobDescription.fileName || ''
      }
    };

    // Add analysis to user's analyses array
    const user = await User.findById(req.user.id);
    user.analyses.push(newAnalysis);
    await user.save();

    res.status(201).json({
      success: true,
      data: newAnalysis
    });
  } catch (error) {
    console.error('Error submitting analysis:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

// Get user's analyses
router.get('/my-analyses', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('analyses');
    res.status(200).json({
      success: true,
      data: user.analyses
    });
  } catch (error) {
    console.error('Error fetching analyses:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

export default router; 