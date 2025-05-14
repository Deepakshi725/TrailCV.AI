const API_URL = 'http://localhost:5000';

export const api = {
  async signup(data: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNum: number;
    password: string;
  }) {
    const response = await fetch(`${API_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Signup failed');
    }
    
    return response.json();
  },

  async login(data: {
    email: string;
    password: string;
  }) {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }
    
    return response.json();
  },

  async extractPdfText(file: File, type: 'resume' | 'jd'): Promise<{ text: string; analysisId: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/api/upload/extract-text?type=${type}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to extract text from PDF');
    }

    const data = await response.json();
    return {
      text: data.text,
      analysisId: data.analysisId
    };
  },

  async saveText(text: string, type: 'resume' | 'jd'): Promise<{ analysisId: string }> {
    const response = await fetch(`${API_URL}/api/upload/extract-text?type=${type}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save text');
    }

    const data = await response.json();
    return {
      analysisId: data.analysisId
    };
  },

  async getAnalyses() {
    const response = await fetch(`${API_URL}/api/upload/analyses`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch analyses');
    }

    return response.json();
  },
}; 