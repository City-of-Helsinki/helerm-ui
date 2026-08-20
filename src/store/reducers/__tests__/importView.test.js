import { createTestStore } from '../../../utils/renderWithProviders';
import { importItemsThunk, prepareImport } from '../tos-toolkit/importView';

vi.mock('../../../utils/helpers', () => ({
  randomActionId: () => 'test-id-123',
}));

// Single-use test helpers - specific to this import test file only
const createMockPhase = (overrides = {}) => ({
  id: 'mock-phase',
  name: 'Mock Phase',
  actions: [],
  attributes: {
    PhaseType: 'Valmistelu/Käsittely',
    TypeSpecifier: 'Mock Phase',
  },
  ...overrides,
});

const createRecord = (overrides = {}) => ({
  id: 'mock-record',
  name: 'Mock Record',
  action: null,
  attributes: {
    TypeSpecifier: 'Mock Record',
    RecordType: 'arviointi',
  },
  ...overrides,
});

// Create local test data for import functionality
const createImportTestMocks = () => {
  const mockPhases = {
    phase1: createMockPhase({
      id: 'phase1',
      name: 'Import Test Phase',
      actions: ['action1'],
      attributes: {
        PhaseType: 'Valmistelu/Käsittely',
        TypeSpecifier: 'Import Test Phase',
      },
    }),
  };

  const mockActions = {
    action1: {
      id: 'action1',
      name: 'Import Test Action',
      phase: 'phase1',
      records: ['record1'],
      attributes: {
        ActionType: 'Päätös',
        TypeSpecifier: 'Import Test Action',
      },
    },
  };

  const mockRecords = {
    record1: createRecord({
      id: 'record1',
      name: 'Import Test Record',
      action: 'action1',
    }),
  };

  return {
    completeTOS: {
      phases: mockPhases,
      actions: mockActions,
      records: mockRecords,
    },
  };
};

const importTestMocks = createImportTestMocks();

// Use centralized mock data
const mockTOS = importTestMocks.completeTOS;

describe('Import View', () => {
  describe('prepareImport', () => {
    it('should prepare phase import correctly', () => {
      const result = prepareImport('phase1', 'phase', null, { selectedTOS: mockTOS });

      expect(result.importPhases).toBeDefined();
      expect(result.importActions).toBeDefined();
      expect(result.importRecords).toBeDefined();

      const newPhaseKeys = Object.keys(result.importPhases).filter((key) => key !== 'phase1');
      expect(newPhaseKeys.length).toBe(1);

      const newPhaseKey = newPhaseKeys[0];
      expect(result.importPhases[newPhaseKey].name).toContain('KOPIO');
      expect(result.importPhases[newPhaseKey].attributes).toBeDefined();
    });

    it('should prepare action import correctly', () => {
      const result = prepareImport('action1', 'action', 'phase1', { selectedTOS: mockTOS });

      expect(result.importPhases).toBeDefined();
      expect(result.importActions).toBeDefined();
      expect(result.importRecords).toBeDefined();

      const newActionKeys = Object.keys(result.importActions).filter((key) => key !== 'action1');
      expect(newActionKeys.length).toBe(1);

      const newActionKey = newActionKeys[0];
      expect(result.importActions[newActionKey].name).toContain('KOPIO');
      expect(result.importActions[newActionKey].phase).toBe('phase1');
    });

    it('should deep clone source data so mutating the result does not affect the original state', () => {
      const currentState = { selectedTOS: JSON.parse(JSON.stringify(mockTOS)) };

      const result = prepareImport('phase1', 'phase', null, currentState);

      // Mutate the returned (cloned) data structures.
      result.importPhases.phase1.name = 'Mutated Phase Name';
      result.importPhases.phase1.attributes.TypeSpecifier = 'Mutated';
      result.importActions.action1.name = 'Mutated Action Name';
      result.importRecords.record1.name = 'Mutated Record Name';

      // The original state passed in must remain untouched.
      expect(currentState.selectedTOS.phases.phase1.name).toBe('Import Test Phase');
      expect(currentState.selectedTOS.phases.phase1.attributes.TypeSpecifier).toBe('Import Test Phase');
      expect(currentState.selectedTOS.actions.action1.name).toBe('Import Test Action');
      expect(currentState.selectedTOS.records.record1.name).toBe('Import Test Record');
    });

    it('should prepare record import correctly', () => {
      const result = prepareImport('record1', 'record', 'action1', { selectedTOS: mockTOS });

      expect(result.importPhases).toBeDefined();
      expect(result.importActions).toBeDefined();
      expect(result.importRecords).toBeDefined();

      const newRecordKeys = Object.keys(result.importRecords).filter((key) => key !== 'record1');
      expect(newRecordKeys.length).toBe(1);

      const newRecordKey = newRecordKeys[0];
      expect(result.importRecords[newRecordKey].name).toContain('KOPIO');
      expect(result.importRecords[newRecordKey].action).toBe('action1');
    });
  });

  describe('importItemsThunk', () => {
    it('should dispatch thunk lifecycle actions with prepared data', async () => {
      const store = createTestStore({
        selectedTOS: mockTOS,
      });

      await store.dispatch(
        importItemsThunk({
          newItem: 'record1',
          level: 'record',
          itemParent: 'action1',
        }),
      );

      const actions = store.getActions();

      expect(actions[0].type).toBe('selectedTOS/importItems/pending');

      const lastAction = actions[actions.length - 1];
      expect(lastAction.type).toBe('selectedTOS/importItems/fulfilled');
      expect(lastAction.payload).toBeDefined();
      expect(lastAction.payload.importPhases).toBeDefined();
      expect(lastAction.payload.importActions).toBeDefined();
      expect(lastAction.payload.importRecords).toBeDefined();

      expect(Object.keys(lastAction.payload.importRecords).length).toBeGreaterThan(1);
    });
  });
});
