// Record-related mock helpers
import apiRecordData from './api/record.json';

/**
 * Creates a record object from API data
 * @param {Object} apiData - API record data (defaults to record.json)
 * @returns {Object} Record object for testing
 */
export const createRecordFromApi = (apiData = apiRecordData) => {
  // API record data is a direct object, not wrapped in results
  if (apiData && apiData.attributes) {
    return apiData;
  }
  return {};
};

/**
 * Creates a record specifically for validation testing scenarios.
 * This record is engineered to trigger specific validation outcomes for comprehensive testing:
 * - Contains attributes that should pass basic validation
 * - Has conditionally required attributes missing to test conditional logic
 * - Includes values outside allowed choice lists to test constraint validation
 * - Structured to produce predictable validation results (1 error, 1 warning)
 * Essential for testing that record validation logic correctly identifies and categorizes issues.
 * @returns {Object} A record object that will generate expected validation errors
 */
export const createValidationTestRecord = () => {
  // Use the exact structure from the original working record
  return {
    id: 'test-record-validation',
    name: 'Test Record for Validation',
    action: 'test-action-001',
    is_open: true,
    index: 1,
    attributes: {
      TypeSpecifier: 'Test Record for Validation',
      RecordType: 'arviointi',
      PersonalData: 'Sisältää henkilötietoja',
      PublicityClass: 'Ei-julkinen',
      RetentionPeriod: '10', // Non-permanent retention (not -1)
      SocialSecurityNumber: 'Ei sisällä henkilötunnusta',
      RetentionReason: 'Ei sp:Taloushallinto 2 - kunnallisten asiakirjojen säilytysaikasuositus',
      // RetentionPeriodStart is missing - this should cause an error for conditional requirement
      InformationSystem: ['Lupapiste', 'OutsideValueTest'] // Contains a value outside allowed list - should cause warning
    },
    created_at: apiRecordData.created_at || new Date().toISOString(),
    modified_at: apiRecordData.modified_at || new Date().toISOString()
  };
};

/**
 * Gets the first record from API data
 * @returns {Object|null} First record or null if none available
 */
export const getFirstRecord = () => {
  return createRecordFromApi();
};

/**
 * Gets a record by ID from API data
 * @param {string} id - Record ID to search for
 * @returns {Object|null} Record object or null if not found
 */
export const getRecordById = (id) => {
  // API record data is a single object, check if ID matches
  if (apiRecordData && apiRecordData.id === id) {
    return apiRecordData;
  }
  return null;
};

/**
 * Creates mock record array for testing
 * @param {number} count - Number of records to create
 * @returns {Array} Array of record objects
 */
export const createMockRecords = (count = 1) => {
  // API record data is a single object, duplicate it for multiple records
  if (!apiRecordData || !apiRecordData.attributes) return [];

  return Array.from({ length: count }, (_, i) => ({
    ...apiRecordData,
    id: `${apiRecordData.id}-${i}`
  }));
};

/**
 * Creates a record with specific attributes for customized testing scenarios.
 * Allows testing of record functionality with tailored attribute combinations,
 * enabling validation of attribute inheritance, custom validation rules, and
 * record-specific business logic with controlled attribute data sets.
 * @param {Object} attributes - Custom attributes to add to the record
 * @returns {Object} Record with custom attributes
 */
export const createRecordWithAttributes = (attributes = {}) => {
  const baseRecord = createRecordFromApi();
  return {
    ...baseRecord,
    attributes: {
      ...baseRecord.attributes,
      ...attributes
    }
  };
};

/**
 * Validates if a record has the correct structure
 * @param {Object} record - Record to validate
 * @returns {boolean} True if record has proper structure
 */
export const isValidRecordStructure = (record) => {
  return !!(record && typeof record === 'object' && record.id);
};

// Legacy named export for backward compatibility with existing tests
// Provides a validation-ready record object that produces expected validation outcomes
export const record = createValidationTestRecord();
