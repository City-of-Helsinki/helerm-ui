// Classification-related mock helpers
import apiClassificationData from './api/classification.json';

/**
 * Creates a complete tree of classification data from API source
 * @param {Object} apiData - API classification data (defaults to classification.json)
 * @returns {Object} Classification data ready for tree navigation
 */
export const createClassificationFromApi = (apiData = apiClassificationData) => {
  return apiData;
};

/**
 * Gets the first classification item from API data
 * @returns {Object|null} First classification or null if none available
 */
export const getFirstClassification = () => {
  if (apiClassificationData.results && apiClassificationData.results.length > 0) {
    return apiClassificationData.results[0];
  }
  return null;
};

/**
 * Gets a classification by ID
 * @param {string} id - Classification ID to search for
 * @returns {Object|null} Classification object or null if not found
 */
export const getClassificationById = (id) => {
  if (!apiClassificationData.results) return null;
  return apiClassificationData.results.find(c => c.id === id) || null;
};

/**
 * Creates mock classification array for testing
 * @param {number} count - Number of classifications to create
 * @returns {Array} Array of classification objects
 */
export const createMockClassifications = (count = 1) => {
  if (!apiClassificationData.results) return [];

  return Array.from({ length: count }, (_, i) => {
    const index = i % apiClassificationData.results.length;
    return {
      ...apiClassificationData.results[index],
      id: `${apiClassificationData.results[index].id}-${i}`
    };
  });
};

/**
 * Navigation test data for classification tree components.
 * Provides a structured hierarchy suitable for testing tree navigation, rendering,
 * and interaction behaviors. Contains nested children to test recursive tree operations
 * and multi-level navigation scenarios. Each item includes id, title, type, and children
 * properties essential for tree component functionality testing.
 */
export const navigationTestData = [
  {
    id: '1',
    title: 'Test Item 1',
    type: 'testtype',
    children: [
      {
        id: '1.1',
        title: 'Test Sub Item 1.1',
        type: 'testtype',
        children: []
      }
    ]
  },
  {
    id: '2',
    title: 'Test Item 2',
    type: 'testtype',
    children: [
      {
        id: '2.1',
        title: 'Test Sub Item 2.1',
        type: 'testtype',
        children: [
          {
            id: '2.1.1',
            title: 'Test Sub Sub Item 2.1.1',
            type: 'testtype',
            children: []
          }
        ]
      }
    ]
  }
];

/**
 * Creates a classification tree structure compatible with tree navigation components.
 * Transforms API classification data into the hierarchical structure required by
 * tree components, ensuring proper id, title, type, and children properties.
 * Provides fallback to static navigation test data when API data is unavailable,
 * ensuring consistent tree structure for testing component behavior.
 * @param {Object} apiData - Source API data
 * @returns {Array} Tree structure for navigation components
 */
export const createClassificationTree = (apiData = apiClassificationData) => {
  if (!apiData.results) return navigationTestData;

  // Transform API data to tree structure
  return apiData.results.map(item => ({
    id: item.id,
    title: item.title || item.name || 'Unnamed',
    type: item.type || 'classification',
    children: item.children || []
  }));
};

/**
 * Validates if a classification has proper structure
 * @param {Object} classification - Classification to validate
 * @returns {boolean} True if classification is valid
 */
export const isValidClassification = (classification) => {
  return !!(classification && classification.id && (classification.title || classification.name));
};

// Legacy named export for backward compatibility with existing tests
export const classification = apiClassificationData;
