interface Suggestion {
  explanation: string;
  snippet: string;
}

interface AnalysisResult {
  matched_keywords: string[];
  missing_keywords: string[];
  recommendations: Suggestion[];
}

const GEMINI_API_KEY = 'AIzaSyDK0MN67mdl6-RdQaYr4Vadgfwg_JXU-AQ';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Function to call Gemini API
async function callGeminiAPI(resumeText: string, jobDescriptionText: string): Promise<AnalysisResult> {
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

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API Error:', errorData);
      throw new Error(errorData.error?.message || 'Failed to get analysis from Gemini API');
    }

    const data = await response.json();
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response format from Gemini API');
    }

    const analysisText = data.candidates[0].content.parts[0].text;
    
    // Extract JSON from the response
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from Gemini API');
    }

    const result = JSON.parse(jsonMatch[0]);
    
    // Validate the result structure
    if (!Array.isArray(result.matched_keywords) || 
        !Array.isArray(result.missing_keywords) || 
        !Array.isArray(result.recommendations)) {
      throw new Error('Invalid analysis result structure');
    }

    return result;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
}

// Main analysis function
export async function analyzeResume(resumeText: string, jobDescriptionText: string): Promise<AnalysisResult> {
  return callGeminiAPI(resumeText, jobDescriptionText);
}

// Function to get analysis from localStorage
export async function getAnalysisFromStorage(): Promise<AnalysisResult | null> {
  const lastAnalysis = localStorage.getItem('lastAnalysis');
  if (!lastAnalysis) return null;
  
  try {
    const { resume, jobDescription } = JSON.parse(lastAnalysis);
    if (!resume?.text || !jobDescription?.text) {
      throw new Error('Invalid data format in localStorage');
    }
    return analyzeResume(resume.text, jobDescription.text);
  } catch (error) {
    console.error('Error parsing localStorage data:', error);
    throw new Error('Failed to parse analysis data from localStorage');
  }
}

// Gemini-powered function to get best certified courses and free resources for missing skills
export async function getLearningResourcesForSkills(missingSkills: string[]): Promise<{
  skillsToLearn: string[];
  certifiedCourses: Array<{
    title: string;
    provider: string;
    duration: string;
    level: string;
    price: string;
    rating: number;
    image: string;
    url: string;
  }>;
  freeResources: Array<{
    title: string;
    creator: string;
    duration: string;
    platform: string;
    views: string;
    image: string;
    url: string;
    type: string; // 'video', 'article', 'blog', 'docs', etc.
  }>;
}> {
  const prompt = `Given the following list of missing skills: [${missingSkills.join(", ")}], return a JSON object with:
1. skillsToLearn: Array of the most important skills to learn from this list (prioritize those most in-demand for tech jobs)
2. certifiedCourses: Array of up to 5 objects, each with:
   - title: course title
   - provider: e.g. Udemy, Coursera, etc.
   - duration: e.g. '20 hours'
   - level: e.g. Beginner/Intermediate/Advanced
   - price: e.g. '$49', 'Free', etc.
   - rating: e.g. 4.8
   - image: thumbnail URL (from the course platform)
   - url: direct link to the course
3. freeResources: Array of up to 7 objects, each with:
   - title: resource title
   - creator: e.g. YouTube channel, blog author, or website
   - duration: e.g. '1 hour', '45 minutes', or '5 min read'
   - platform: e.g. YouTube, Blog, Docs, GeeksforGeeks, MDN, freeCodeCamp, etc.
   - views: e.g. '250K+', '1M+', or '' for articles
   - image: thumbnail URL (YouTube preview, blog logo, or leave blank if not available)
   - url: direct link to the resource
   - type: 'video', 'article', 'blog', 'docs', etc.
Return a mix of high-quality videos, articles, blogs, and official documentation. Prefer resources that are currently available and reputable. If no thumbnail is available, leave the image field blank. Return ONLY the JSON object, no other text. Example:
{
  "skillsToLearn": ["GraphQL", "CI/CD", "Next.js"],
  "certifiedCourses": [
    {
      "title": "GraphQL with React & NodeJS",
      "provider": "Udemy",
      "duration": "12 hours",
      "level": "Intermediate",
      "price": "$49",
      "rating": 4.7,
      "image": "https://img-c.udemycdn.com/course/480x270/123456.jpg",
      "url": "https://www.udemy.com/course/graphql-with-react-nodejs/"
    }
  ],
  "freeResources": [
    {
      "title": "GraphQL Crash Course",
      "creator": "Web Dev Simplified",
      "duration": "45 minutes",
      "platform": "YouTube",
      "views": "250K+",
      "image": "https://i.ytimg.com/vi/1234567890/hqdefault.jpg",
      "url": "https://youtube.com/watch?v=1234567890",
      "type": "video"
    },
    {
      "title": "GraphQL Introduction Article",
      "creator": "GeeksforGeeks",
      "duration": "7 min read",
      "platform": "GeeksforGeeks",
      "views": "",
      "image": "",
      "url": "https://www.geeksforgeeks.org/introduction-to-graphql/",
      "type": "article"
    }
  ]
}`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API Error:', errorData);
      throw new Error(errorData.error?.message || 'Failed to get learning resources from Gemini API');
    }

    const data = await response.json();
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response format from Gemini API');
    }
    const resourcesText = data.candidates[0].content.parts[0].text;
    const jsonMatch = resourcesText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from Gemini API');
    }
    const result = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(result.skillsToLearn) || !Array.isArray(result.certifiedCourses) || !Array.isArray(result.freeResources)) {
      throw new Error('Invalid learning resources result structure');
    }
    return result;
  } catch (error) {
    console.error('Error calling Gemini API for learning resources:', error);
    throw error;
  }
} 