// Bulk update related mock helpers
import apiBulkUpdateData from './api/bulkUpdate.json';

/**
 * Creates bulk update data from API source
 * @param {Object} apiData - API bulk update data (defaults to bulkUpdate.json)
 * @returns {Object} Bulk update data for testing
 */
export const createBulkUpdateFromApi = (apiData = apiBulkUpdateData) => {
  return apiData;
};

/**
 * Gets the first bulk update from API data
 * @returns {Object|null} First bulk update or null if none available
 */
export const getFirstBulkUpdate = () => {
  if (apiBulkUpdateData.results && apiBulkUpdateData.results.length > 0) {
    return apiBulkUpdateData.results[0];
  }
  // If API data is a single object instead of results array, return it directly
  if (apiBulkUpdateData && apiBulkUpdateData.id) {
    return apiBulkUpdateData;
  }
  return null;
};

/**
 * Gets a bulk update by ID from API data
 * @param {string} id - Bulk update ID to search for
 * @returns {Object|null} Bulk update object or null if not found
 */
export const getBulkUpdateById = (id) => {
  if (apiBulkUpdateData.results) {
    return apiBulkUpdateData.results.find(b => b.id === id) || null;
  }
  // If API data is a single object, check if it matches the ID
  if (apiBulkUpdateData && apiBulkUpdateData.id && String(apiBulkUpdateData.id) === String(id)) {
    return apiBulkUpdateData;
  }
  return null;
};

/**
 * Creates mock bulk update array for testing
 * @param {number} count - Number of bulk updates to create
 * @returns {Array} Array of bulk update objects
 */
export const createMockBulkUpdates = (count = 1) => {
  if (apiBulkUpdateData.results && apiBulkUpdateData.results.length > 0) {
    return Array.from({ length: count }, (_, i) => {
      const index = i % apiBulkUpdateData.results.length;
      return {
        ...apiBulkUpdateData.results[index],
        id: `${apiBulkUpdateData.results[index].id}-${i}`
      };
    });
  }

  // If API data is a single object, create array based on it
  if (apiBulkUpdateData && apiBulkUpdateData.id) {
    return Array.from({ length: count }, (_, i) => ({
      ...apiBulkUpdateData,
      id: `${apiBulkUpdateData.id}-${i}`
    }));
  }

  return [];
};

/**
 * Creates a bulk update operation object for testing bulk processing scenarios.
 * Provides configurable bulk update structure for testing batch operations,
 * status tracking, operation types, and bulk processing workflows.
 * Essential for testing bulk update UI components, progress tracking, and
 * batch operation validation logic.
 * @param {Object} options - Options for the bulk update
 * @returns {Object} Bulk update operation object
 */
export const createBulkUpdateOperation = (options = {}) => {
  const baseBulkUpdate = getFirstBulkUpdate();
  if (!baseBulkUpdate) {
    return {
      id: 'test-bulk-update',
      operation: options.operation || 'update',
      targets: options.targets || [],
      changes: options.changes || {},
      status: options.status || 'pending'
    };
  }

  return {
    ...baseBulkUpdate,
    ...options
  };
};

/**
 * Validates if a bulk update has the correct structure
 * @param {Object} bulkUpdate - Bulk update to validate
 * @returns {boolean} True if bulk update has proper structure
 */
export const isValidBulkUpdateStructure = (bulkUpdate) => {
  return !!(bulkUpdate && typeof bulkUpdate === 'object' && bulkUpdate.id);
};

// Legacy named export for backward compatibility with existing tests
export const bulkUpdate = getFirstBulkUpdate();
