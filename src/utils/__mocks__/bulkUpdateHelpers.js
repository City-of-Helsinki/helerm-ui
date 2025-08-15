// Bulk update related mock helpers
import apiBulkUpdateData from './api/bulkUpdate.json';

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

// Legacy named export for backward compatibility with existing tests
export const bulkUpdate = getFirstBulkUpdate();
