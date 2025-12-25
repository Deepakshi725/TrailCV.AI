interface Suggestion {
  explanation: string;
  snippet: string;
}

interface AnalysisResult {
  matched_keywords: string[];
  missing_keywords: string[];
  recommendations: Suggestion[];
}

const API_BASE_URL = 'http://localhost:5001/api';

// Main analysis function - calls backend
export async function analyzeResume(resumeText: string, jobDescriptionText: string): Promise<AnalysisResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/analysis/gemini-analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resumeText,
        jobDescriptionText
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to analyze resume');
    }

    return await response.json();
  } catch (error) {
    console.error('Error calling backend analysis:', error);
    throw error;
  }
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
  try {
    const response = await fetch(`${API_BASE_URL}/analysis/learning-resources`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        missingSkills
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get learning resources');
    }

    return await response.json();
  } catch (error) {
    console.error('Error calling backend learning resources:', error);
    throw error;
  }
} 