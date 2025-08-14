// User-related mock helpers
import apiUserData from './api/user.json';

/**
 * Gets the first user from API data
 * @returns {Object|null} First user or null if none available
 */
export const getFirstUser = () => {
  if (apiUserData.results && apiUserData.results.length > 0) {
    return apiUserData.results[0];
  }
  return apiUserData; // Return the whole object if no results array
};

// Legacy named export for backward compatibility with existing tests
export const user = getFirstUser();
