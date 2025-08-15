// Template-related mock helpers
import apiTemplateData from './api/template.json';

/**
 * Creates template data from API source
 * @param {Object} apiData - API template data (defaults to template.json)
 * @returns {Object} Template data for testing
 */
export const createTemplateFromApi = (apiData = apiTemplateData) => {
  return apiData;
};

// Legacy named export for backward compatibility with existing tests
export const template = createTemplateFromApi();
