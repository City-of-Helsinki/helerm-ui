// Attribute-related mock helpers
import apiAttributeData from './api/attribute.json';
import apiAttributeRulesData from './api/attributeRules.json';

// Transform API format to legacy format for backward compatibility
export const transformApiAttributesToLegacyFormat = (apiData) => {
  const legacy = {};

  if (apiData.results) {
    apiData.results.forEach((attribute) => {
      if (attribute.identifier && attribute.values) {
        legacy[attribute.identifier] = {
          index: attribute.index || 1,
          name: attribute.name,
          values: attribute.values,
          // API data is missing these properties that components expect
          // We'll add defaults for now
          defaultIn: [],
          allowedIn: [],
          multiIn: [],
          requiredIf: [],
          requiredIn: [],
          required: false,
          allowValuesOutsideChoicesIn: [],
        };
      }
    });
  }

  return legacy;
};

/**
 * Creates attribute types using API data as the single source of truth
 * @param {Object} apiData - API format attribute data (defaults to imported attribute.json)
 * @returns {Object} Complete attribute types object compatible with components
 */
export const createAttributeTypesFromApi = (apiData = apiAttributeData) => {
  return transformApiAttributesToLegacyFormat(apiData);
};

/**
 * Main attribute types object used extensively in component tests.
 * Contains attribute definitions keyed by identifier (e.g., 'PhaseType', 'PublicityClass').
 * Provides the complete attribute metadata needed for:
 * - Form validation: Defines available options, constraints, and validation rules
 * - UI component rendering: Supplies display names, value lists, and configuration
 * - Validation testing: Establishes the attribute structure for testing validation logic
 * - Bulk operations: Provides attribute schemas for batch processing scenarios
 * Each attribute includes: name, values array, index, and validation rule properties
 */
export const attributeTypes = createAttributeTypesFromApi();

/**
 * Gets a specific attribute type by identifier for targeted testing.
 * Provides safe access to individual attribute definitions, enabling tests
 * to focus on specific attribute types without accessing the entire collection.
 * Returns null for non-existent attributes, allowing tests to verify
 * error handling for missing attribute types.
 * @param {string} identifier - The attribute identifier (e.g., 'PhaseType')
 * @param {Object} source - Source attribute types object (defaults to exported attributeTypes)
 * @returns {Object|null} The attribute type object or null if not found
 */
export const getAttributeType = (identifier, source = attributeTypes) => {
  return source[identifier] || null;
};

/**
 * Gets all values for a specific attribute type
 * @param {string} identifier - The attribute identifier
 * @param {Object} source - Source attribute types object
 * @returns {Array} Array of value objects
 */
export const getAttributeValues = (identifier, source = attributeTypes) => {
  const attributeType = getAttributeType(identifier, source);
  return attributeType?.values || [];
};

/**
 * Get attribute rules directly from API data
 * This replaces the need for complex generation by using the complete
 * attribute rules data as the source of truth
 * @param {Object} attributeRulesData - API attribute rules data (defaults to attributeRules.json)
 * @returns {Object} Attribute rules ready for validation
 */
export const createAttributeRules = (attributeRulesData = apiAttributeRulesData) => {
  // Return the rules directly since they're already in the correct format
  return attributeRulesData;
};

/**
 * Attribute rules used in validation tests.
 * Contains validation rule definitions that specify attribute requirements, dependencies,
 * and conditional logic for different contexts. Defines which attributes are:
 * - Required unconditionally
 * - Required based on other attribute values (conditional requirements)
 * - Optional but constrained by specific rules
 * - Subject to multi-value restrictions or choice list validation
 * Critical for testing validation logic, form behavior, and data integrity checks.
 */
export const attributeRules = apiAttributeRulesData;
