// Utility to clear potentially corrupted localStorage data
export const clearAuthStorage = () => {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('Auth storage cleared successfully');
  } catch (error) {
    console.error('Error clearing auth storage:', error);
  }
};

// Run this immediately to clear any corrupted data
if (typeof window !== 'undefined') {
  // Check if there's corrupted data
  const savedUser = localStorage.getItem('user');
  if (savedUser === 'undefined' || savedUser === 'null') {
    clearAuthStorage();
    console.log('Cleared corrupted localStorage data');
  }
}