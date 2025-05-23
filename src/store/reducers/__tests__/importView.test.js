import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { importItemsThunk, prepareImport } from '../tos-toolkit/importView';

vi.mock('../../../utils/helpers', () => ({
  randomActionId: () => 'test-id-123'
}));

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

const mockTOS = {
  phases: {
    phase1: {
      id: 'phase1',
      index: 1,
      name: 'Test Phase',
      actions: ['action1'],
      attributes: { TypeSpecifier: 'Test Phase' }
    }
  },
  actions: {
    action1: {
      id: 'action1',
      phase: 'phase1',
      index: 1,
      name: 'Test Action',
      records: ['record1'],
      attributes: { TypeSpecifier: 'Test Action' }
    }
  },
  records: {
    record1: {
      id: 'record1',
      action: 'action1',
      index: 1,
      name: 'Test Record',
      attributes: { TypeSpecifier: 'Test Record' }
    }
  }
};

describe('Import View', () => {
  describe('prepareImport', () => {
    it('should prepare phase import correctly', () => {
      const result = prepareImport('phase1', 'phase', null, { selectedTOS: mockTOS });

      expect(result.importPhases).toBeDefined();
      expect(result.importActions).toBeDefined();
      expect(result.importRecords).toBeDefined();

      const newPhaseKeys = Object.keys(result.importPhases).filter(key => key !== 'phase1');
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

      const newActionKeys = Object.keys(result.importActions).filter(key => key !== 'action1');
      expect(newActionKeys.length).toBe(1);

      const newActionKey = newActionKeys[0];
      expect(result.importActions[newActionKey].name).toContain('KOPIO');
      expect(result.importActions[newActionKey].phase).toBe('phase1');
    });

    it('should prepare record import correctly', () => {
      const result = prepareImport('record1', 'record', 'action1', { selectedTOS: mockTOS });

      expect(result.importPhases).toBeDefined();
      expect(result.importActions).toBeDefined();
      expect(result.importRecords).toBeDefined();

      const newRecordKeys = Object.keys(result.importRecords).filter(key => key !== 'record1');
      expect(newRecordKeys.length).toBe(1);

      const newRecordKey = newRecordKeys[0];
      expect(result.importRecords[newRecordKey].name).toContain('KOPIO');
      expect(result.importRecords[newRecordKey].action).toBe('action1');
    });
  });

  describe('importItemsThunk', () => {
    it('should dispatch thunk lifecycle actions with prepared data', async () => {
      const store = mockStore({
        selectedTOS: mockTOS
      });

      await store.dispatch(importItemsThunk({
        newItem: 'record1',
        level: 'record',
        itemParent: 'action1'
      }));

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
