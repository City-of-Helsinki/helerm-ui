// Universal helpers and utilities for mock data generation

/**
 * Universal mock builder - creates mock objects from any API data source.
 * Provides a flexible foundation for generating mock objects from various API responses,
 * handling different response structures (arrays, objects, wrapped results) and
 * applying type-specific defaults and custom overrides. Essential for creating
 * consistent mock data across different object types in testing scenarios.
 * @param {string} type - Type of object being created
 * @param {Object} apiData - Source API data
 * @param {Object} overrides - Properties to override in the mock
 * @returns {Object} Mock object
 */
export const createMock = (type, apiData, overrides = {}) => {
  let baseObject = {};

  // Handle different API response structures
  if (apiData) {
    if (apiData.results && Array.isArray(apiData.results) && apiData.results.length > 0) {
      // API data with results array
      baseObject = { ...apiData.results[0] };
    } else if (typeof apiData === 'object') {
      // Direct object or single result
      baseObject = { ...apiData };
    }
  }

  // Apply type-specific defaults
  const typeDefaults = {
    tos: { attributes: {} },
    record: { attributes: {} },
    classification: { children: [] },
    user: { permissions: [] },
    template: { attributes: {} },
    bulkUpdate: { status: 'pending' }
  };

  const defaults = typeDefaults[type] || {};

  return {
    ...defaults,
    ...baseObject,
    ...overrides
  };
};

/**
 * Creates a mock API response structure for testing API integration.
 * Wraps data in the standard API response format with count, pagination metadata,
 * and results array. Essential for testing components that consume API responses,
 * pagination logic, and API response handling behaviors.
 * @param {Array|Object} data - Data to wrap in API response
 * @param {Object} meta - Optional metadata
 * @returns {Object} API response structure
 */
export const createMockApiResponse = (data, meta = {}) => {
  const isArray = Array.isArray(data);

  return {
    count: isArray ? data.length : 1,
    next: meta.next || null,
    previous: meta.previous || null,
    results: isArray ? data : [data],
    ...meta
  };
};

/**
 * Creates mock error response
 * @param {string} message - Error message
 * @param {number} status - HTTP status code
 * @returns {Object} Error response
 */
export const createMockError = (message = 'Mock error', status = 400) => {
  return {
    error: true,
    message,
    status,
    details: {}
  };
};

/**
 * Creates mock success response
 * @param {Object} data - Success data
 * @param {string} message - Success message
 * @returns {Object} Success response
 */
export const createMockSuccess = (data = {}, message = 'Success') => {
  return {
    success: true,
    message,
    data
  };
};

/**
 * Utility to generate unique IDs for mock objects
 * @param {string} prefix - Prefix for the ID
 * @returns {string} Unique ID
 */
export const generateMockId = (prefix = 'mock') => {
  // For testing purposes, a simple counter-based approach is sufficient
  const timestamp = Date.now();
  const counter = Math.floor(timestamp / 1000) % 10000; // Simple counter from timestamp
  return `${prefix}-${timestamp}-${counter}`;
};

/**
 * Utility to deep clone objects for mock modifications
 * @param {Object} obj - Object to clone
 * @returns {Object} Deep cloned object
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (Array.isArray(obj)) return obj.map(deepClone);

  const cloned = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
};

/**
 * Utility to merge objects deeply
 * @param {Object} target - Target object
 * @param {Object} source - Source object
 * @returns {Object} Merged object
 */
export const deepMerge = (target, source) => {
  const result = deepClone(target);

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
        result[key] = deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
  }

  return result;
};

/**
 * Utility to create paginated mock responses for testing pagination scenarios.
 * Simulates server-side pagination by slicing data arrays and providing appropriate
 * pagination metadata. Essential for testing pagination components, infinite scroll
 * behaviors, and paginated data loading scenarios.
 * @param {Array} data - Full data array
 * @param {number} page - Page number (1-based)
 * @param {number} pageSize - Items per page
 * @returns {Object} Paginated response
 */
export const createMockPaginatedResponse = (data, page = 1, pageSize = 10) => {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = data.slice(startIndex, endIndex);

  const totalPages = Math.ceil(data.length / pageSize);
  const hasNext = page < totalPages;
  const hasPrevious = page > 1;

  return {
    count: data.length,
    next: hasNext ? `?page=${page + 1}` : null,
    previous: hasPrevious ? `?page=${page - 1}` : null,
    results: paginatedData,
    page,
    pageSize,
    totalPages
  };
};

/**
 * Utility to validate mock object structure
 * @param {Object} obj - Object to validate
 * @param {Array} requiredFields - Required field names
 * @returns {boolean} True if object is valid
 */
export const validateMockStructure = (obj, requiredFields = []) => {
  if (!obj || typeof obj !== 'object') return false;

  return requiredFields.every(field => {
    return Object.prototype.hasOwnProperty.call(obj, field) && obj[field] !== undefined;
  });
};

/**
 * Utility to create mock data with realistic timestamps for temporal testing.
 * Adds created_at and modified_at timestamps to mock objects, allowing testing
 * of time-based functionality, sorting by date, and timestamp validation.
 * Provides configurable time options for testing various temporal scenarios.
 * @param {Object} baseData - Base data object
 * @param {Object} timeOptions - Time configuration options
 * @returns {Object} Object with timestamps
 */
export const addMockTimestamps = (baseData = {}, timeOptions = {}) => {
  const now = new Date();
  const created = timeOptions.created || new Date(now.getTime() - (24 * 60 * 60 * 1000)); // 1 day ago
  const modified = timeOptions.modified || now;

  return {
    ...baseData,
    created_at: created.toISOString(),
    modified_at: modified.toISOString()
  };
};

// Legacy named exports for backward compatibility with existing tests
export const createMockObject = createMock;

export const createMockComponentProps = (type = 'component', overrides = {}) => {
  const baseProps = {
    id: generateMockId(type),
    name: `Mock ${type}`,
    isOpen: false,
    isDirty: false,
    isLoading: false,
    attributes: {},
    children: [],
    ...overrides
  };

  return baseProps;
};

export const createMockPhase = (overrides = {}) => {
  return {
    id: generateMockId('phase'),
    name: 'Mock Phase',
    actions: [],
    attributes: {
      PhaseType: 'Valmistelu/Käsittely',
      TypeSpecifier: 'Mock Phase'
    },
    ...overrides
  };
};

export const createRecord = (overrides = {}) => {
  return {
    id: generateMockId('record'),
    name: 'Mock Record',
    action: null,
    attributes: {
      TypeSpecifier: 'Mock Record',
      RecordType: 'arviointi'
    },
    ...overrides
  };
};
