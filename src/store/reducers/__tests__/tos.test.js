import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import {
  fetchTOSThunk,
  saveDraftThunk,
  changeStatusThunk,
} from '../tos-toolkit';
import api from '../../../utils/api';
import validTOS from '../../../utils/mocks/validTOS.json';
import classification from '../../../utils/mocks/classification.json';
import { WAITING_FOR_APPROVAL } from '../../../constants';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('TOS Reducer', () => {
  it('should fetch TOS', () => {
    const expectedActions = [
    {
      type: 'selectedTOS/fetchTOS/pending',
      payload: undefined,
      meta: expect.anything()
    },
    {
      type: 'selectedTOS/fetchTOS/fulfilled',
      payload: {
        ...validTOS,
      },
      meta: expect.anything()
    }];

    const mockApiGet = vi.fn().mockImplementation(() => Promise.resolve({ ok: true, json: () => validTOS }));
    vi.spyOn(api, 'get').mockImplementationOnce(mockApiGet);

    const store = mockStore({});

    return store.dispatch(fetchTOSThunk({ tosId: validTOS.id })).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    })
  });

  it('should handle fetch TOS error', () => {
    const expectedActions = [
      {
        type: 'selectedTOS/fetchTOS/pending',
        meta: expect.anything(),
        payload: undefined
      },
      {
        type: 'selectedTOS/fetchTOS/rejected',
        payload: "ERROR",
        error: {
          message: 'Rejected'
        },
        meta: expect.anything()
      }
    ]

    const mockApiGet = vi.fn().mockImplementation(() => Promise.reject(new Error('ERROR')));
    vi.spyOn(api, 'get').mockImplementationOnce(mockApiGet);

    const store = mockStore({});

    return store.dispatch(fetchTOSThunk({ tosId: validTOS.id })).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    })
  });

  it('should save draft', () => {
    const expectedActions = [
    {
      type: 'selectedTOS/saveDraft/pending',
      meta: expect.anything(),
      payload: undefined
    },
    {
      type: 'selectedTOS/saveDraft/fulfilled',
      payload: {
        ...validTOS,
      },
      meta: expect.anything()
    }];

    const mockApiPut = vi.fn().mockImplementation(() => Promise.resolve({ ok: true, json: () => validTOS }));
    vi.spyOn(api, 'put').mockImplementationOnce(mockApiPut);

    const store = mockStore({
      selectedTOS: validTOS
    });

    return store.dispatch(saveDraftThunk()).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    })
  });

  it('should handle save draft error', () => {
    const expectedActions = [
      {
        type: 'selectedTOS/saveDraft/pending',
        meta: expect.anything(),
        payload: undefined
      },
      {
        type: 'selectedTOS/saveDraft/rejected',
        payload: "Error",
        error: {
          message: 'Rejected'
        },
        meta: expect.anything()
      }
    ];

    const mockApiPut = vi.fn().mockImplementation(() => Promise.reject(new Error('Error')));
    vi.spyOn(api, 'put').mockImplementationOnce(mockApiPut);

    const store = mockStore({
      selectedTOS: validTOS
    });

    return store.dispatch(saveDraftThunk()).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    })
  });

  it('should change status', () => {
    const mockApiPatch = vi.fn().mockImplementation(() => Promise.resolve({ ok: true, json: () => validTOS }));
    const mockApiGet = vi.fn().mockImplementation(() => Promise.resolve({ ok: true, json: () => classification }));

    vi.spyOn(api, 'patch').mockImplementationOnce(mockApiPatch);
    vi.spyOn(api, 'get').mockImplementationOnce(mockApiGet);

    const store = mockStore({
      selectedTOS: validTOS,
      navigation: {
        includeRelated: false
      }
    });

    return store.dispatch(changeStatusThunk(WAITING_FOR_APPROVAL)).then(() => {
      const actions = store.getActions();
      expect(actions.some(action => action.type === 'selectedTOS/changeStatus/pending')).toBe(true);
      expect(actions.some(action => action.type === 'selectedTOS/changeStatus/fulfilled')).toBe(true);
    })
  });

  it('should handle change status error', () => {
    const expectedActions = [
      {
        type: 'selectedTOS/changeStatus/pending',
        meta: expect.anything(),
        payload: undefined
      },
      {
        type: 'selectedTOS/changeStatus/rejected',
        payload: "ERROR",
        error: {
          message: 'Rejected'
        },
        meta: expect.anything()
      },
    ];

    const mockApiPatch = vi.fn().mockImplementation(() => Promise.reject(new Error('ERROR')));

    vi.spyOn(api, 'patch').mockImplementationOnce(mockApiPatch);

    const store = mockStore({
      selectedTOS: validTOS,
      navigation: {
        includeRelated: false
      }
    });

    return store.dispatch(changeStatusThunk(WAITING_FOR_APPROVAL)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    })
  });
});
