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

export const createMockComponentProps = (type = 'component', overrides = {}) => {
  const baseProps = {
    id: generateMockId(type),
    name: `Mock ${type}`,
    isOpen: false,
    isDirty: false,
    isLoading: false,
    attributes: {},
    children: [],
    ...overrides,
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
      TypeSpecifier: 'Mock Phase',
    },
    ...overrides,
  };
};

export const createMockAction = (overrides = {}) => {
  return {
    id: generateMockId('action'),
    name: 'Mock Action',
    phase: null,
    records: [],
    attributes: {
      ActionType: 'Selvitys',
      TypeSpecifier: 'Mock Action',
    },
    ...overrides,
  };
};

export const createRecord = (overrides = {}) => {
  return {
    id: generateMockId('record'),
    name: 'Mock Record',
    action: null,
    is_open: true, // Default to open state for testing
    attributes: {
      TypeSpecifier: 'Mock Record',
      RecordType: 'arviointi',
    },
    ...overrides,
  };
};
