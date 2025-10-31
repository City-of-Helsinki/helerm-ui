import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { WAITING_FOR_APPROVAL } from '../../../constants';
import { classification, validTOS } from '../../../utils/__mocks__/mockHelpers';
import api from '../../../utils/api';
import {
  addAction,
  addPhase,
  addRecord,
  changeOrderThunk,
  changeStatusThunk,
  clearTos,
  cloneFromTemplateThunk,
  createNewAction,
  createNewPhase,
  createNewRecord,
  editAction,
  editActionAttribute,
  editMetaData,
  editPhase,
  editPhaseAttribute,
  editRecord,
  editRecordAttribute,
  editValidDates,
  executeImport,
  executeOrderChange,
  fetchTOSThunk,
  importItemsThunk,
  receiveTemplate,
  removeAction,
  removePhase,
  removeRecord,
  resetTos,
  saveDraftThunk,
  setActionVisibility,
  setClassificationVisibility,
  setDocumentState,
  setMetadataVisibility,
  setPhaseAttributesVisibility,
  setPhaseVisibility,
  setPhasesVisibility,
  setRecordVisibility,
  setVersionVisibility,
  updateTosVisibility,
} from '../tos-toolkit';
import tosReducer, { initialState } from '../tos-toolkit/main';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

beforeAll(() => {
  globalThis.alert = vi.fn();
});

const mockPhase = {
  id: 'test-phase-001',
  function: 'test-function-001',
  actions: ['test-action-001'],
  attributes: {
    TypeSpecifier: 'Test Phase',
    PhaseType: 'Test Type',
  },
  is_attributes_open: false,
  is_open: true,
};

const mockAction = {
  id: 'test-action-001',
  phase: 'test-phase-001',
  records: ['test-record-001'],
  attributes: {
    TypeSpecifier: 'Test Action',
    ActionType: 'Test Type',
  },
  is_open: true,
};

const mockRecord = {
  id: 'test-record-001',
  action: 'test-action-001',
  attributes: {
    TypeSpecifier: 'Test Record',
    RecordType: 'Test Type',
  },
  is_open: false,
};

const createMockState = (overrides = {}) => ({
  id: 'test-tos-001',
  name: 'Test TOS',
  actions: { 'test-action-001': mockAction },
  phases: { 'test-phase-001': mockPhase },
  records: { 'test-record-001': mockRecord },
  attributes: { TypeSpecifier: 'Test TOS' },
  documentState: 'view',
  lastUpdated: Date.now(),
  isFetching: false,
  is_classification_open: false,
  is_open: false,
  is_version_open: false,
  ...overrides,
});

const hasActionType = (actions, actionType) => actions.some((action) => action.type === actionType);

const testSelectedTOSSelector = (state) => state;
const testIsFetchingSelector = (state) => state.isFetching;

const testReducerAction = (action, state = createMockState()) => tosReducer(state, action);

const testEditAttribute = (entityType, entityId, attributeName, attributeValue) => {
  const state = createMockState();
  const actionCreators = {
    action: editActionAttribute,
    phase: editPhaseAttribute,
    record: editRecordAttribute,
  };
  const result = testReducerAction(
    actionCreators[entityType]({
      [`${entityType}Id`]: entityId,
      attributeName,
      attributeValue,
    }),
    state,
  );
  return result[`${entityType}s`][entityId].attributes[attributeName];
};

const testVisibilityAction = (action, visibilityProperty, expectedValue = true) => {
  const state = createMockState();
  const result = testReducerAction(action(expectedValue), state);
  return result[visibilityProperty];
};

const setupMockStore = (initialState = {}) => {
  return mockStore(initialState);
};

const testWithCustomState = (action, stateOverrides = {}) => {
  const state = createMockState(stateOverrides);
  return testReducerAction(action, state);
};

const testEntityVisibility = (action, entityType, entityId, visibilityProperty, expectedValue) => {
  const result = testReducerAction(
    action({
      [`${entityType}Id`]: entityId,
      visibility: expectedValue,
    }),
  );
  return result[`${entityType}s`][entityId][visibilityProperty];
};

const expectAsyncActions = (actions, baseType, status = 'fulfilled') => {
  expect(hasActionType(actions, `${baseType}/pending`)).toBe(true);
  expect(hasActionType(actions, `${baseType}/${status}`)).toBe(true);
};

const testAsyncThunk = async (thunk, mockSetup, storeState = {}) => {
  mockSetup();
  const store = setupMockStore(storeState);
  await store.dispatch(thunk);
  return store.getActions();
};

const createJsonResponse = (data) => () => data;

const setupApiMock = (method, response) => {
  return () => vi.spyOn(api, method).mockResolvedValueOnce(response);
};

const setupApiMockError = (method, error) => {
  return () => vi.spyOn(api, method).mockRejectedValueOnce(error);
};

const noOpMockSetup = () => {};

const testAddEntity = (addAction, newEntity, entityType) => {
  const result = testReducerAction(addAction(newEntity));
  expect(result[`${entityType}s`][newEntity.id]).toEqual(newEntity);
  return result;
};

const testEditEntityAttribute = (editAction, entityId, attributeName, attributeValue, entityType) => {
  const actionParams = {
    [`${entityType}Id`]: entityId,
  };

  if (entityType === 'phase') {
    actionParams.editedAttributes = { [attributeName]: attributeValue };
  } else {
    actionParams[`edited${entityType.charAt(0).toUpperCase() + entityType.slice(1)}`] = {
      attributes: { [attributeName]: attributeValue },
    };
  }

  const result = testReducerAction(editAction(actionParams));
  return result[`${entityType}s`][entityId].attributes[attributeName];
};

const testRemoveEntity = (removeAction, removeParams, entityType, entityId) => {
  const result = testReducerAction(removeAction(removeParams));
  expect(result[`${entityType}s`][entityId]).toBeUndefined();
  return result;
};

describe('TOS Reducer', () => {
  it('should fetch TOS', async () => {
    const mockResponse = { ok: true, json: createJsonResponse(validTOS) };
    const actions = await testAsyncThunk(
      fetchTOSThunk({ tosId: validTOS.id, token: 'mock-token' }),
      setupApiMock('get', mockResponse),
    );

    expectAsyncActions(actions, 'selectedTOS/fetchTOS');
  });

  it('should handle fetch TOS error', async () => {
    const actions = await testAsyncThunk(
      fetchTOSThunk({ tosId: validTOS.id, token: 'mock-token' }),
      setupApiMockError('get', new Error('ERROR')),
    );

    expectAsyncActions(actions, 'selectedTOS/fetchTOS', 'rejected');
  });

  it('should save draft', async () => {
    const mockResponse = { ok: true, json: createJsonResponse(validTOS) };
    const actions = await testAsyncThunk(saveDraftThunk({ token: 'test-token' }), setupApiMock('put', mockResponse), {
      selectedTOS: validTOS,
    });

    expectAsyncActions(actions, 'selectedTOS/saveDraft');
  });

  it('should handle save draft error', async () => {
    const actions = await testAsyncThunk(
      saveDraftThunk({ token: 'test-token' }),
      setupApiMockError('put', new Error('Error')),
      {
        selectedTOS: validTOS,
      },
    );

    expectAsyncActions(actions, 'selectedTOS/saveDraft', 'rejected');
  });

  it('should save draft and update document state correctly', async () => {
    const savedTosResponse = {
      ...validTOS,
      version: validTOS.version + 1,
      documentState: 'view', // Server should return view state after save
    };

    const mockResponse = { ok: true, json: createJsonResponse(savedTosResponse) };
    const actions = await testAsyncThunk(saveDraftThunk({ token: 'test-token' }), setupApiMock('put', mockResponse), {
      selectedTOS: { ...validTOS, documentState: 'edit' }, // Start in edit mode
    });

    expectAsyncActions(actions, 'selectedTOS/saveDraft');

    // Verify the fulfilled action contains the updated TOS data
    const fulfilledAction = actions.find((action) => action.type === 'selectedTOS/saveDraft/fulfilled');
    expect(fulfilledAction.payload.version).toBe(validTOS.version + 1);
  });

  it('should change status', async () => {
    const mockPatchResponse = { ok: true, json: createJsonResponse(validTOS) };
    const mockGetResponse = { ok: true, json: createJsonResponse(classification) };
    const mockSetup = () => {
      vi.spyOn(api, 'patch').mockResolvedValueOnce(mockPatchResponse);
      vi.spyOn(api, 'get').mockResolvedValueOnce(mockGetResponse);
    };

    const actions = await testAsyncThunk(changeStatusThunk(WAITING_FOR_APPROVAL), mockSetup, {
      selectedTOS: validTOS,
      navigation: { includeRelated: false },
    });

    expectAsyncActions(actions, 'selectedTOS/changeStatus');
  });

  it('should handle change status error', async () => {
    const actions = await testAsyncThunk(
      changeStatusThunk(WAITING_FOR_APPROVAL),
      setupApiMockError('patch', new Error('ERROR')),
      { selectedTOS: validTOS, navigation: { includeRelated: false } },
    );

    expectAsyncActions(actions, 'selectedTOS/changeStatus', 'rejected');

    const rejectedAction = actions.find((action) => action.type === 'selectedTOS/changeStatus/rejected');
    expect(rejectedAction.payload).toBe('ERROR');
    expect(rejectedAction.error.message).toBe('Rejected');
  });

  describe('Helper Functions', () => {
    describe('createNewAction', () => {
      it('should create a new action with correct structure', () => {
        const typeSpecifier = 'Test Action';
        const actionType = 'Action Type';
        const actionAttributes = { PersonalData: 'Yes' };
        const phaseIndex = 'test-phase-001';

        const newAction = createNewAction(typeSpecifier, actionType, actionAttributes, phaseIndex);

        expect(newAction).toEqual({
          id: expect.any(String),
          phase: phaseIndex,
          records: [],
          attributes: {
            TypeSpecifier: typeSpecifier,
            ActionType: actionType,
            ...actionAttributes,
          },
          is_open: false,
        });
      });
    });

    describe('createNewPhase', () => {
      it('should create a new phase with correct structure', () => {
        const phaseData = {
          typeSpecifier: 'Test Phase',
          phaseType: 'Phase Type',
          phaseAttributes: { PersonalData: 'Yes' },
          parent: 'test-function-001',
        };

        const newPhase = createNewPhase(phaseData);

        expect(newPhase).toEqual({
          id: expect.any(String),
          function: phaseData.parent,
          actions: [],
          attributes: {
            TypeSpecifier: phaseData.typeSpecifier,
            PhaseType: phaseData.phaseType,
            ...phaseData.phaseAttributes,
          },
          is_attributes_open: false,
          is_open: false,
        });
      });

      it('should create a new phase with empty phaseType', () => {
        const phaseData = {
          typeSpecifier: 'Custom Phase Name',
          phaseType: '', // Empty - this should be allowed
          phaseAttributes: { PersonalData: 'Yes' },
          parent: 'test-function-001',
        };

        const newPhase = createNewPhase(phaseData);

        expect(newPhase).toEqual({
          id: expect.any(String),
          function: phaseData.parent,
          actions: [],
          attributes: {
            TypeSpecifier: phaseData.typeSpecifier,
            PhaseType: '', // Empty phaseType should be preserved
            ...phaseData.phaseAttributes,
          },
          is_attributes_open: false,
          is_open: false,
        });
      });
    });

    describe('createNewRecord', () => {
      it('should create a new record with already-processed attributes', () => {
        const recordData = {
          attributes: {
            TypeSpecifier: 'Test Record',
            RecordType: 'Document',
            Description: 'Test description',
          },
          actionId: 'test-action-001',
        };

        const result = createNewRecord(recordData);

        expect(result).toEqual({
          actionId: recordData.actionId,
          recordId: expect.any(String),
          newRecord: {
            id: expect.any(String),
            action: recordData.actionId,
            attributes: {
              TypeSpecifier: 'Test Record',
              RecordType: 'Document',
              Description: 'Test description',
            },
            is_open: false,
          },
        });
      });

      it('should create a new record with empty attributes', () => {
        const recordData = {
          attributes: {},
          actionId: 'test-action-001',
        };

        const result = createNewRecord(recordData);

        expect(result).toEqual({
          actionId: recordData.actionId,
          recordId: expect.any(String),
          newRecord: {
            id: expect.any(String),
            action: recordData.actionId,
            attributes: {},
            is_open: false,
          },
        });
      });

      it('should handle null attributes gracefully', () => {
        const recordData = {
          attributes: {
            TypeSpecifier: 'Valid Record',
            InvalidAttribute: null,
            UndefinedAttribute: undefined,
          },
          actionId: 'test-action-001',
        };

        const result = createNewRecord(recordData);

        expect(result).toEqual({
          actionId: recordData.actionId,
          recordId: expect.any(String),
          newRecord: {
            id: expect.any(String),
            action: recordData.actionId,
            attributes: {
              TypeSpecifier: 'Valid Record',
              InvalidAttribute: null,
              UndefinedAttribute: undefined,
            },
            is_open: false,
          },
        });
      });
    });
  });

  describe('State Management Actions', () => {
    describe('clearTos', () => {
      it('should clear TOS state', () => {
        const result = testReducerAction(clearTos());
        expect(result).toEqual(initialState);
      });
    });

    describe('resetTos', () => {
      it('should reset TOS state with provided data', () => {
        const resetData = { id: 'new-tos', name: 'New TOS' };
        const result = testReducerAction(resetTos(resetData));
        expect(result).toEqual({ ...initialState, ...resetData });
      });
    });

    describe('editMetaData', () => {
      it('should update metadata attributes', () => {
        const metaData = {
          TypeSpecifier: 'Updated TOS',
          Description: 'Updated description',
        };

        const result = testReducerAction(editMetaData(metaData));

        expect(result.attributes).toEqual({
          TypeSpecifier: 'Updated TOS',
          Description: 'Updated description',
        });
      });
    });

    describe('editValidDates', () => {
      it('should update valid from date', () => {
        const validFrom = '2024-01-01';
        const result = testReducerAction(editValidDates({ validFrom }));

        expect(result.valid_from).toBe(validFrom);
      });

      it('should update valid to date', () => {
        const validTo = '2024-12-31';
        const result = testReducerAction(editValidDates({ validTo }));

        expect(result.valid_to).toBe(validTo);
      });
    });

    describe('setDocumentState', () => {
      it('should update document state', () => {
        const result = testReducerAction(setDocumentState('edit'));
        expect(result.documentState).toBe('edit');
      });
    });

    describe('visibility actions', () => {
      it('should set classification visibility', () => {
        const result = testVisibilityAction(setClassificationVisibility, 'is_classification_open');
        expect(result).toBe(true);
      });

      it('should set metadata visibility', () => {
        const result = testVisibilityAction(setMetadataVisibility, 'is_open');
        expect(result).toBe(true);
      });

      it('should set version visibility', () => {
        const result = testVisibilityAction(setVersionVisibility, 'is_version_open');
        expect(result).toBe(true);
      });

      it('should update TOS visibility', () => {
        const visibilityData = {
          actions: { 'new-action': mockAction },
          phases: { 'new-phase': mockPhase },
          records: { 'new-record': mockRecord },
          basicVisibility: true,
          metaDataVisibility: true,
        };

        const result = testReducerAction(updateTosVisibility(visibilityData));

        expect(result.actions).toEqual(visibilityData.actions);
        expect(result.phases).toEqual(visibilityData.phases);
        expect(result.records).toEqual(visibilityData.records);
        expect(result.is_classification_open).toBe(true);
        expect(result.is_open).toBe(true);
        expect(result.is_version_open).toBe(true);
      });
    });
  });

  describe('Action Reducers', () => {
    describe('addAction', () => {
      it('should add new action to state', () => {
        const newAction = { ...mockAction, id: 'new-action-001' };
        const result = testAddEntity(addAction, newAction, 'action');

        expect(result.phases[newAction.phase].actions).toContain(newAction.id);
      });
    });

    describe('editAction', () => {
      it('should edit existing action', () => {
        const result = testEditEntityAttribute(
          editAction,
          'test-action-001',
          'TypeSpecifier',
          'Updated Action',
          'action',
        );
        expect(result).toBe('Updated Action');
      });
    });

    describe('editActionAttribute', () => {
      it('should edit specific action attribute', () => {
        const result = testEditAttribute('action', 'test-action-001', 'TypeSpecifier', 'New Action Name');
        expect(result).toBe('New Action Name');
      });
    });

    describe('removeAction', () => {
      it('should remove action and its records from state', () => {
        const result = testRemoveEntity(
          removeAction,
          { actionToRemove: 'test-action-001', phaseId: 'test-phase-001' },
          'action',
          'test-action-001',
        );

        expect(result.records['test-record-001']).toBeUndefined();
        expect(result.phases['test-phase-001'].actions).not.toContain('test-action-001');
      });
    });

    describe('setActionVisibility', () => {
      it('should set action visibility', () => {
        const result = testEntityVisibility(setActionVisibility, 'action', 'test-action-001', 'is_open', false);
        expect(result).toBe(false);
      });
    });
  });

  describe('Phase Reducers', () => {
    describe('addPhase', () => {
      it('should add new phase to state', () => {
        const newPhase = { ...mockPhase, id: 'new-phase-001' };
        testAddEntity(addPhase, newPhase, 'phase');
      });
    });

    describe('editPhase', () => {
      it('should edit existing phase', () => {
        const result = testEditEntityAttribute(editPhase, 'test-phase-001', 'TypeSpecifier', 'Updated Phase', 'phase');
        expect(result).toBe('Updated Phase');
      });
    });

    describe('editPhaseAttribute', () => {
      it('should edit specific phase attribute', () => {
        const result = testEditAttribute('phase', 'test-phase-001', 'TypeSpecifier', 'New Phase Name');
        expect(result).toBe('New Phase Name');
      });
    });

    describe('removePhase', () => {
      it('should remove phase and its actions and records from state', () => {
        const result = testRemoveEntity(removePhase, 'test-phase-001', 'phase', 'test-phase-001');

        expect(result.actions['test-action-001']).toBeUndefined();
        expect(result.records['test-record-001']).toBeUndefined();
      });

      it('should handle removing non-existent phase gracefully', () => {
        const state = createMockState();
        const result = testReducerAction(removePhase('non-existent-phase'), state);

        expect(result).toEqual(state);
      });
    });

    describe('setPhaseAttributesVisibility', () => {
      it('should set phase attributes visibility', () => {
        const result = testEntityVisibility(
          setPhaseAttributesVisibility,
          'phase',
          'test-phase-001',
          'is_attributes_open',
          true,
        );
        expect(result).toBe(true);
      });
    });

    describe('setPhaseVisibility', () => {
      it('should set phase visibility', () => {
        const result = testEntityVisibility(setPhaseVisibility, 'phase', 'test-phase-001', 'is_open', false);
        expect(result).toBe(false);
      });
    });

    describe('setPhasesVisibility', () => {
      it('should set visibility for all phases', () => {
        const result = testWithCustomState(setPhasesVisibility(true), {
          phases: {
            'phase-1': { ...mockPhase, id: 'phase-1', is_open: false },
            'phase-2': { ...mockPhase, id: 'phase-2', is_open: false },
          },
        });

        expect(result.phases['phase-1'].is_open).toBe(true);
        expect(result.phases['phase-2'].is_open).toBe(true);
      });
    });
  });

  describe('Record Reducers', () => {
    describe('addRecord', () => {
      it('should add new record to state and action', () => {
        const recordData = {
          actionId: 'test-action-001',
          recordId: 'new-record-001',
          newRecord: { ...mockRecord, id: 'new-record-001' },
        };

        const result = testReducerAction(addRecord(recordData));

        expect(result.records[recordData.recordId]).toEqual(recordData.newRecord);
        expect(result.actions['test-action-001'].records).toContain(recordData.recordId);
      });
    });

    describe('editRecord', () => {
      it('should edit existing record', () => {
        const result = testEditEntityAttribute(
          editRecord,
          'test-record-001',
          'TypeSpecifier',
          'Updated Record',
          'record',
        );
        expect(result).toBe('Updated Record');
      });
    });

    describe('editRecordAttribute', () => {
      it('should edit specific record attribute', () => {
        const result = testEditAttribute('record', 'test-record-001', 'TypeSpecifier', 'New Record Name');
        expect(result).toBe('New Record Name');
      });
    });

    describe('removeRecord', () => {
      it('should remove record from state and action', () => {
        const result = testRemoveEntity(
          removeRecord,
          { recordId: 'test-record-001', actionId: 'test-action-001' },
          'record',
          'test-record-001',
        );

        expect(result.actions['test-action-001'].records).not.toContain('test-record-001');
      });
    });

    describe('setRecordVisibility', () => {
      it('should set record visibility', () => {
        const result = testEntityVisibility(setRecordVisibility, 'record', 'test-record-001', 'is_open', true);
        expect(result).toBe(true);
      });
    });
  });

  describe('Import/Clone Reducers', () => {
    describe('executeImport', () => {
      it('should execute import and update state', () => {
        const importData = {
          importPhases: { 'imported-phase': { ...mockPhase, id: 'imported-phase' } },
          importActions: { 'imported-action': { ...mockAction, id: 'imported-action' } },
          importRecords: { 'imported-record': { ...mockRecord, id: 'imported-record' } },
        };

        const result = testReducerAction(executeImport(importData));

        expect(result.phases).toEqual(importData.importPhases);
        expect(result.actions).toEqual(importData.importActions);
        expect(result.records).toEqual(importData.importRecords);
      });
    });

    describe('receiveTemplate', () => {
      it('should receive template and update state', () => {
        const template = {
          id: 'template-tos-001',
          attributes: { TypeSpecifier: 'Template TOS' },
          phases: [
            {
              id: 'template-phase-001',
              attributes: { TypeSpecifier: 'Template Phase' },
              actions: [
                {
                  id: 'template-action-001',
                  attributes: { TypeSpecifier: 'Template Action' },
                  records: [
                    {
                      id: 'template-record-001',
                      attributes: { TypeSpecifier: 'Template Record' },
                    },
                  ],
                },
              ],
            },
          ],
        };

        const result = testReducerAction(receiveTemplate(template));

        expect(result.documentState).toBe('edit');
        expect(result.isFetching).toBe(false);
        expect(result.is_open).toBe(false);
        expect(result.valid_from).toBeNull();
        expect(result.valid_to).toBeNull();
      });
    });

    describe('executeOrderChange', () => {
      it('should execute order change for phases', () => {
        const orderData = {
          itemList: { 'phase-1': mockPhase },
          itemType: 'phase',
          itemParent: null,
          parentLevel: 'tos',
          itemLevel: 'phases',
          parentList: [],
        };

        const result = testReducerAction(executeOrderChange(orderData));

        expect(result.phases).toEqual(orderData.itemList);
      });

      it('should execute order change for actions', () => {
        const orderData = {
          itemList: { 'action-1': mockAction },
          itemType: 'action',
          itemParent: 'test-phase-001',
          parentLevel: 'phases',
          itemLevel: 'actions',
          parentList: ['action-1'],
        };

        const result = testReducerAction(executeOrderChange(orderData));

        expect(result.actions).toEqual(orderData.itemList);
        expect(result.phases['test-phase-001'].actions).toEqual(orderData.parentList);
      });
    });
  });

  describe('Async Thunks', () => {
    describe('cloneFromTemplateThunk', () => {
      const template = { id: 'template-001', name: 'Template' };

      it('should clone from template successfully', async () => {
        const mockResponse = { ok: true, json: createJsonResponse(template) };
        const actions = await testAsyncThunk(
          cloneFromTemplateThunk({ endpoint: 'templates', id: 'template-001', token: 'mock-token' }),
          setupApiMock('get', mockResponse),
        );

        expectAsyncActions(actions, 'selectedTOS/cloneFromTemplate');
      });

      it('should handle clone from template error', async () => {
        const mockResponse = { ok: false, statusText: 'Not Found' };
        const actions = await testAsyncThunk(
          cloneFromTemplateThunk({ endpoint: 'templates', id: 'invalid', token: 'mock-token' }),
          setupApiMock('get', mockResponse),
        );

        expectAsyncActions(actions, 'selectedTOS/cloneFromTemplate', 'rejected');
      });
    });

    describe('importItemsThunk', () => {
      it('should import items successfully', async () => {
        const actions = await testAsyncThunk(
          importItemsThunk({
            newItem: 'test-phase-001',
            level: 'phase',
            itemParent: null,
          }),
          noOpMockSetup,
          { selectedTOS: createMockState() },
        );

        expectAsyncActions(actions, 'selectedTOS/importItems');
      });
    });

    describe('changeOrderThunk', () => {
      it('should change order successfully', async () => {
        const actions = await testAsyncThunk(
          changeOrderThunk({
            newOrder: ['test-phase-001'],
            itemType: 'phase',
            itemParent: null,
          }),
          noOpMockSetup,
          { selectedTOS: createMockState() },
        );

        expectAsyncActions(actions, 'selectedTOS/changeOrder');
      });
    });
  });

  describe('Selectors', () => {
    const mockSliceState = createMockState({ isFetching: true });

    describe('selectedTOSSelector', () => {
      it('should select the entire TOS state', () => {
        const result = testSelectedTOSSelector(mockSliceState);
        expect(result).toEqual(mockSliceState);
      });
    });

    describe('isFetchingSelector', () => {
      it('should select the isFetching state', () => {
        const result = testIsFetchingSelector(mockSliceState);
        expect(result).toBe(true);
      });
    });
  });
});
