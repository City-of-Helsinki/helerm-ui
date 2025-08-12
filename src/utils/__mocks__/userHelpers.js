// User-related mock helpers
import apiUserData from './api/user.json';

/**
 * Creates user data from API source
 * @param {Object} apiData - API user data (defaults to user.json)
 * @returns {Object} User data for testing
 */
export const createUserFromApi = (apiData = apiUserData) => {
  return apiData;
};

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

/**
 * Gets a user by ID from API data
 * @param {string} id - User ID to search for
 * @returns {Object|null} User object or null if not found
 */
export const getUserById = (id) => {
  if (apiUserData.results) {
    return apiUserData.results.find(u => u.id === id) || null;
  }
  // If no results array, check if the main object matches
  return apiUserData.id === id ? apiUserData : null;
};

/**
 * Creates mock user array for testing
 * @param {number} count - Number of users to create
 * @returns {Array} Array of user objects
 */
export const createMockUsers = (count = 1) => {
  const users = apiUserData.results || [apiUserData];

  return Array.from({ length: count }, (_, i) => {
    const index = i % users.length;
    return {
      ...users[index],
      id: `${users[index].id || 'user'}-${i}`
    };
  });
};

/**
 * Creates a user with specific permissions for authorization testing.
 * Allows testing of permission-based functionality by providing a user object
 * with custom permission sets. Essential for testing role-based access control,
 * UI element visibility based on permissions, and restricted action scenarios.
 * @param {Array} permissions - Array of permissions to assign
 * @returns {Object} User object with specified permissions
 */
export const createUserWithPermissions = (permissions = []) => {
  const baseUser = getFirstUser();
  return {
    ...baseUser,
    permissions: permissions
  };
};

/**
 * Validates if a user has the correct structure
 * @param {Object} user - User to validate
 * @returns {boolean} True if user has proper structure
 */
export const isValidUserStructure = (user) => {
  return !!(user && typeof user === 'object');
};

// Legacy named export for backward compatibility with existing tests
export const user = getFirstUser();
