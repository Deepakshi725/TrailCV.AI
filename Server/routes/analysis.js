import express from 'express';
import { Users } from '../models/User.js';
import { auth } from '../middleware/auth.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Helper function to call Groq API
async function callGroqAPI(prompt) {
  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2048
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Groq API Error:', errorData);
      throw new Error(errorData.error?.message || 'Failed to get response from Groq API');
    }

    const data = await response.json();
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from Groq API');
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling Groq API:', error);
    throw error;
  }
}

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
    const user = await Users.findById(req.user.id);
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
    const user = await Users.findById(req.user.id).select('analyses');
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

// Analyze resume with Groq API
router.post('/gemini-analyze', async (req, res) => {
  try {
    const { resumeText, jobDescriptionText } = req.body;

    if (!resumeText || !jobDescriptionText) {
      return res.status(400).json({ 
        error: 'resumeText and jobDescriptionText are required' 
      });
    }

    const prompt = `Analyze the following resume and job description. Return a JSON object with:
1. matched_keywords: Array of important technical or role-specific terms present in both
2. missing_keywords: Array of relevant terms from the job description not found in the resume
3. recommendations: Array of objects, each with:
   - explanation: a short, actionable explanation of what to add or improve in the resume
   - snippet: a ready-to-copy, resume-optimized text block that the user can paste directly into their resume

Resume:
${resumeText}

Job Description:
${jobDescriptionText}

Return ONLY the JSON object, no other text. Example for recommendations:
[
  {
    "explanation": "Add a 'Skills' section to highlight proficiency in React and TypeScript.",
    "snippet": "Skills: React.js, TypeScript, JavaScript, HTML5, CSS3"
  },
  {
    "explanation": "Include a bullet point about leading UI/UX improvements.",
    "snippet": "• Led UI/UX improvements that increased user engagement by 25% and reduced bounce rate by 15%."
  }
]
`;

    const analysisText = await callGroqAPI(prompt);
    
    // Extract JSON from the response
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({ error: 'Invalid response format from Groq API' });
    }

    const result = JSON.parse(jsonMatch[0]);
    
    // Validate the result structure
    if (!Array.isArray(result.matched_keywords) || 
        !Array.isArray(result.missing_keywords) || 
        !Array.isArray(result.recommendations)) {
      return res.status(500).json({ error: 'Invalid analysis result structure' });
    }

    res.json(result);
  } catch (error) {
    console.error('Error in gemini-analyze:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to analyze resume' 
    });
  }
});

// Get learning resources for skills
router.post('/learning-resources', async (req, res) => {
  try {
    const { missingSkills } = req.body;

    if (!Array.isArray(missingSkills) || missingSkills.length === 0) {
      return res.status(400).json({ 
        error: 'missingSkills array is required and must not be empty' 
      });
    }

    const skillsList = missingSkills.join(', ');
    const prompt = `For the following missing skills: ${skillsList}
    
Find the best certified courses and free resources to learn them. Return a JSON object with:
{
  "skillsToLearn": ["skill1", "skill2"],
  "certifiedCourses": [
    {
      "skill": "skill name",
      "title": "course title",
      "platform": "platform name (e.g., Coursera, Udemy)",
      "level": "beginner/intermediate/advanced",
      "rating": rating number,
      "duration": "duration in hours"
    }
  ],
  "freeResources": [
    {
      "skill": "skill name",
      "title": "resource title",
      "platform": "YouTube/FreeCodeCamp/etc",
      "type": "video/article/tutorial",
      "url": "resource URL"
    }
  ]
}

Return ONLY valid JSON, no other text.`;

    const resourcesText = await callGroqAPI(prompt);
    
    // Extract JSON from the response
    const jsonMatch = resourcesText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({ error: 'Invalid response format from Groq API' });
    }

    const result = JSON.parse(jsonMatch[0]);
    res.json(result);
  } catch (error) {
    console.error('Error in learning-resources:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to get learning resources' 
    });
  }
});

// Generate YouTube video recommendations
router.post('/youtube-resources', async (req, res) => {
  try {
    const { topic, skill } = req.body;

    if (!topic && !skill) {
      return res.status(400).json({ 
        error: 'topic or skill is required' 
      });
    }

    const searchTerm = topic || skill;
    const prompt = `Find a currently available YouTube video for the topic: '${searchTerm}' or skill: '${searchTerm}'. Return a JSON object with title, creator, duration, platform, views, image, and url. Only return a video that is available now. Return ONLY valid JSON, no other text.`;

    const resourceText = await callGroqAPI(prompt);
    
    // Extract JSON from the response
    const jsonMatch = resourceText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({ error: 'Invalid response format from Groq API' });
    }

    const result = JSON.parse(jsonMatch[0]);
    res.json(result);
  } catch (error) {
    console.error('Error in youtube-resources:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to get YouTube resources' 
    });
  }
});

export default router; 