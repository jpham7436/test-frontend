const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const fetchJobs = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE}/api/jobs${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch jobs');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching jobs:', error);
    throw error;
  }
};

export const fetchJobById = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/api/jobs/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch job');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching job:', error);
    throw error;
  }
};