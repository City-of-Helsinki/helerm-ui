// TOS (Terms of Service) and Function-related mock helpers
import apiFunctionData from './api/function.json';

// Transform function API data for test compatibility
export const transformFunctionToTOS = (func) => {
  return {
    id: func.id,
    attributes: func.attributes,
    function_id: func.function_id,
    name: func.name,
    classification: func.classification,
    parent: func.parent,
    phases: func.phases,
    version: func.version,
    version_history: func.version_history,
    state: func.state,
    created_at: func.created_at,
    modified_at: func.modified_at,
    modified_by: func.modified_by,
    valid_from: func.valid_from,
    valid_to: func.valid_to
  };
};

/**
 * Creates a TOS object for validation testing
 * @returns {Object} TOS object with attributes structure for validation
 */
export const createTOS = () => {
  // The API function data is a direct object, not wrapped in results
  if (apiFunctionData && apiFunctionData.attributes) {
    const baseTOS = transformFunctionToTOS(apiFunctionData);
    // Add the missing structures that normalizeTosForApi expects
    return {
      ...baseTOS,
      actions: {}, // Empty actions object
      records: {}  // Empty records object
    };
  }
  return {};
};

/**
 * Creates a TOS object with errors and warnings for validation testing.
 * This object is carefully crafted to trigger specific validation failures:
 * - Contains invalid attribute values that should fail validation rules
 * - Has missing conditionally required attributes
 * - Includes values outside allowed choice lists
 * Designed to produce exactly 2 errors (PublicityClass invalid value, missing RetentionPeriodStart)
 * and 1 warning (InformationSystem contains value outside allowed list).
 * Essential for testing that validation logic correctly identifies and reports issues.
 */
export const errorsAndWarningsTOS = {
  id: 'function-with-errors',
  attributes: {
    // This should NOT trigger a validation error (kept from original function data)
    PersonalData: apiFunctionData.attributes?.PersonalData || 'Sisältää henkilötietoja',
    SocialSecurityNumber: apiFunctionData.attributes?.SocialSecurityNumber || 'Sisältää henkilötunnuksen',
    RetentionReason: apiFunctionData.attributes?.RetentionReason || 'Retention reason',

    // These should trigger the expected 2 errors:
    PublicityClass: 'Not_allowed_outside_value_list', // Invalid value - triggers error
    RetentionPeriod: '10', // Non-permanent (not -1)
    // RetentionPeriodStart is missing - this should cause an error for conditional requirement

    // This should trigger the expected warning:
    InformationSystem: ['Ahjo', 'Tietojärjestelmä'] // Second value should trigger warning
  },
  function_id: 'function-errors',
  name: 'Function with Errors',
  classification: {
    id: 'classification-errors'
  },
  parent: null,
  phases: {},
  actions: {},
  records: {},
  phasesOrder: []
};

/**
 * Creates a function/TOS structure from API data
 * @param {Object} apiData - API function data
 * @returns {Array} Array of transformed function objects
 */
export const createFunctionStructureFromApi = (apiData = apiFunctionData) => {
  // API function data is a direct object, not an array
  if (apiData && apiData.attributes) {
    return [transformFunctionToTOS(apiData)];
  }
  return [];
};

/**
 * Gets the first available function/TOS from API data
 * @returns {Object|null} First function object or null if none available
 */
export const getFirstFunction = () => {
  if (apiFunctionData && apiFunctionData.attributes) {
    return transformFunctionToTOS(apiFunctionData);
  }
  return null;
};

/**
 * Gets a function by ID from API data
 * @param {string} id - Function ID to search for
 * @returns {Object|null} Function object or null if not found
 */
export const getFunctionById = (id) => {
  // API function data is a single object, check if ID matches
  if (apiFunctionData && apiFunctionData.id === id) {
    return transformFunctionToTOS(apiFunctionData);
  }
  return null;
};

/**
 * Creates mock TOS data for testing scenarios requiring multiple TOS objects.
 * Generates arrays of TOS objects with unique IDs for testing list rendering,
 * bulk operations, search functionality, and pagination scenarios.
 * Each generated TOS maintains the base structure while having distinct identifiers
 * to enable proper testing of multi-object operations.
 * @param {number} count - Number of TOS objects to create
 * @returns {Array} Array of TOS objects
 */
export const createMockTOSArray = (count = 1) => {
  const functions = createFunctionStructureFromApi();
  if (functions.length === 0) return [];

  return Array.from({ length: count }, (_, i) => {
    const index = i % functions.length;
    return {
      ...functions[index],
      id: `${functions[index].id}-${i}`
    };
  });
};

/**
 * Validates if a TOS object has the correct structure for validation
 * @param {Object} tos - TOS object to validate
 * @returns {boolean} True if TOS has proper structure
 */
export const isValidTOSStructure = (tos) => {
  return !!(tos && typeof tos === 'object' && tos.attributes);
};

// Legacy named exports for backward compatibility
/**
 * Valid TOS object for testing scenarios that should pass validation.
 * This object represents a properly structured TOS/Function with all required
 * attributes correctly formatted. Used in validation tests as the baseline
 * "correct" object that should produce 0 errors and 0 warnings.
 * Contains complete attribute set from API data for testing valid state scenarios,
 * bulk operations, and component rendering with proper TOS structure.
 */
export const validTOS = createTOS();

// Legacy named export for backward compatibility with existing tests
export const validTOSWithChildren = {
  ...createTOS(),
  children: [
    {
      id: 'child-1',
      name: 'Child TOS 1',
      attributes: createTOS().attributes
    },
    {
      id: 'child-2',
      name: 'Child TOS 2',
      attributes: createTOS().attributes
    }
  ]
};
