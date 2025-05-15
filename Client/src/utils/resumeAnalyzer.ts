interface AnalysisResult {
  matched_keywords: string[];
  missing_keywords: string[];
  recommendations: string[];
}

const GEMINI_API_KEY = 'AIzaSyDK0MN67mdl6-RdQaYr4Vadgfwg_JXU-AQ';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Function to call Gemini API
async function callGeminiAPI(resumeText: string, jobDescriptionText: string): Promise<AnalysisResult> {
  const prompt = `Analyze the following resume and job description. Return a JSON object with:
1. matched_keywords: Array of important technical or role-specific terms present in both
2. missing_keywords: Array of relevant terms from the job description not found in the resume
3. recommendations: Array of short, impactful recommendations to improve the resume based on missing keywords

Resume:
${resumeText}

Job Description:
${jobDescriptionText}

Return ONLY the JSON object, no other text.`;

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