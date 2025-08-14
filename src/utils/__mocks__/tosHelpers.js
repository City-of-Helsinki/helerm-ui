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
    valid_to: func.valid_to,
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
      records: {}, // Empty records object
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
    InformationSystem: ['Ahjo', 'Tietojärjestelmä'], // Second value should trigger warning
  },
  function_id: 'function-errors',
  name: 'Function with Errors',
  classification: {
    id: 'classification-errors',
  },
  parent: null,
  phases: {},
  actions: {},
  records: {},
  phasesOrder: [],
};

// Legacy named export for backward compatibility with existing tests
export const validTOS = createTOS();

// Legacy named export for backward compatibility with existing tests
export const validTOSWithChildren = {
  ...createTOS(),
  children: [
    {
      id: 'child-1',
      name: 'Child TOS 1',
      attributes: createTOS().attributes,
    },
    {
      id: 'child-2',
      name: 'Child TOS 2',
      attributes: createTOS().attributes,
    },
  ],
};
