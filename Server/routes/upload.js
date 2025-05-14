import express from 'express';
import multer from 'multer';
import { PDFExtract } from 'pdf.js-extract';
import { auth } from '../middleware/auth.js';

const router = express.Router();
const pdfExtract = new PDFExtract();

// Configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Extract text from PDF
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
    
    res.json({ text });
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    res.status(500).json({ error: 'Failed to extract text from PDF' });
  }
});

export default router; 