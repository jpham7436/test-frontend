const SAVED_JOBS_KEY = 'jobhunting_saved_jobs';

export const getSavedJobs = () => {
  const saved = localStorage.getItem(SAVED_JOBS_KEY);
  return saved ? JSON.parse(saved) : [];
};

export const saveJob = (jobId) => {
  const saved = getSavedJobs();
  if (!saved.includes(jobId)) {
    saved.push(jobId);
    localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(saved));
  }
};

export const unsaveJob = (jobId) => {
  const saved = getSavedJobs();
  const filtered = saved.filter(id => id !== jobId);
  localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(filtered));
};

export const isJobSaved = (jobId) => {
  return getSavedJobs().includes(jobId);
};