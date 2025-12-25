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
            role: 'system',
            content: 'You are a highly specialized AI assistant for career development, technical analysis, and educational recommendations. Provide precise, actionable insights optimized for professional growth in 2026. Always return valid JSON without markdown formatting or code blocks.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 2048,
        top_p: 0.9
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

    const prompt = `You are an expert resume analyst and career coach specializing in ATS optimization and job market alignment for 2026.

Analyze the following resume against the job description using these criteria:
1. Technical skill alignment (keywords, frameworks, tools)
2. Experience level and role progression fit
3. Industry-standard practices and modern tech stack
4. Quantifiable achievements and impact metrics
5. Career trajectory and growth potential

Resume:
${resumeText}

Job Description:
${jobDescriptionText}

Return a JSON object with:
{
  "matched_keywords": [array of technical/role-specific terms present in both documents, prioritized by importance],
  "missing_keywords": [array of critical terms from job description absent in resume, prioritized by impact],
  "recommendations": [
    {
      "explanation": "Clear, actionable improvement with context of why it matters for this role",
      "snippet": "Ready-to-paste, ATS-optimized text that can be directly inserted into resume"
    }
  ]
}

Guidelines:
- Match should reflect 2026 industry standards and emerging technologies
- Recommendations should be specific, measurable, and directly address gaps
- Snippets must be resume-formatted, ATS-friendly, and immediately usable
- Prioritize modern practices: cloud infrastructure, AI/ML applications, DevOps, system design
- Include quantifiable metrics where applicable (20% improvement, 3 years, etc.)

Return ONLY valid JSON, no additional text or explanation.`;

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
    const prompt = `You are a career development expert providing 2026-aligned learning recommendations for professional skill development.

For the following in-demand skills that need development: ${skillsList}

Recommend the most effective learning path combining certified, industry-recognized courses and high-quality free resources.

Return a JSON object with:
{
  "skillsToLearn": ["skill1", "skill2"],
  "certifiedCourses": [
    {
      "skill": "skill name matching the input",
      "title": "exact course title",
      "platform": "platform name (Coursera, Udemy, LinkedIn Learning, A Cloud Guru, Plural Sight, etc.)",
      "level": "beginner/intermediate/advanced - aligned with career progression",
      "rating": "4.0-5.0 rating",
      "duration": "total hours/weeks of content",
      "keyLearnings": "2-3 key outcomes learners can expect"
    }
  ],
  "freeResources": [
    {
      "skill": "skill name matching the input",
      "title": "resource title",
      "platform": "YouTube/FreeCodeCamp/GitHub/Dev.to/Official Docs/etc",
      "type": "video/interactive-tutorial/documentation/project-based/course",
      "url": "accessible, working resource URL",
      "completionTime": "estimated time to complete"
    }
  ],
  "learningPathSequence": "recommended order to learn these skills for maximum impact"
}

Requirements:
- Prioritize 2026-relevant technologies and modern practices
- Include diverse learning formats (video, hands-on, documentation)
- Ensure free resources are actively maintained and current
- Focus on skills with highest market demand and job market relevance
- Courses should have strong industry recognition and job placement alignment

Return ONLY valid JSON, no explanation or additional text.`;

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
    const prompt = `You are a learning resource curator specializing in high-quality technical education for 2026 skill development.

Find the most relevant, high-quality learning resource for: "${searchTerm}"

Prioritize:
1. Official/creator channels with active maintenance (last update within 6 months)
2. Production quality and clear explanations
3. Practical, hands-on approach with real-world applications
4. Content aligned with current 2026 industry standards
5. Resources that provide certifiable value or portfolio-building opportunities

Return a JSON object with:
{
  "title": "exact video/resource title",
  "creator": "channel/creator name",
  "platform": "YouTube/FreeCodeCamp/Scrimba/etc",
  "duration": "video length in HH:MM:SS format",
  "views": "view count (e.g., '245K' or '1.2M')",
  "rating": "quality rating out of 5 if available",
  "description": "2-3 sentence description of what viewers will learn",
  "url": "direct, accessible link to resource",
  "lastUpdated": "approximate upload/update date",
  "difficulty": "beginner/intermediate/advanced",
  "keyTopics": ["topic1", "topic2"] - specific concepts covered
}

Only return resources that are:
- Currently available and accessible
- Actively maintained (recent videos/updates)
- Relevant to 2026 technology standards
- High-quality production with clear explanations

Return ONLY valid JSON, no additional commentary.`;

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