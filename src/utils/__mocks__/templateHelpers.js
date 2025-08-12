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

/**
 * Gets the first template from API data
 * @returns {Object|null} First template or null if none available
 */
export const getFirstTemplate = () => {
  if (apiTemplateData.results && apiTemplateData.results.length > 0) {
    return apiTemplateData.results[0];
  }
  return null;
};

/**
 * Gets a template by ID from API data
 * @param {string} id - Template ID to search for
 * @returns {Object|null} Template object or null if not found
 */
export const getTemplateById = (id) => {
  if (!apiTemplateData.results) return null;
  return apiTemplateData.results.find(t => t.id === id) || null;
};

/**
 * Creates mock template array for testing
 * @param {number} count - Number of templates to create
 * @returns {Array} Array of template objects
 */
export const createMockTemplates = (count = 1) => {
  if (!apiTemplateData.results) return [];

  return Array.from({ length: count }, (_, i) => {
    const index = i % apiTemplateData.results.length;
    return {
      ...apiTemplateData.results[index],
      id: `${apiTemplateData.results[index].id}-${i}`
    };
  });
};

/**
 * Creates a template with specific attributes for customized testing scenarios.
 * Allows testing of template-based functionality with tailored attribute sets,
 * enabling validation of template processing, attribute inheritance, and
 * template-driven form generation behaviors.
 * @param {Object} attributes - Custom attributes to add to template
 * @returns {Object} Template with custom attributes
 */
export const createTemplateWithAttributes = (attributes = {}) => {
  const baseTemplate = getFirstTemplate();
  if (!baseTemplate) return null;

  return {
    ...baseTemplate,
    attributes: {
      ...baseTemplate.attributes,
      ...attributes
    }
  };
};

/**
 * Validates if a template has the correct structure
 * @param {Object} template - Template to validate
 * @returns {boolean} True if template has proper structure
 */
export const isValidTemplateStructure = (template) => {
  return !!(template && typeof template === 'object' && template.id);
};

// Legacy named export for backward compatibility with existing tests
export const template = createTemplateFromApi();
