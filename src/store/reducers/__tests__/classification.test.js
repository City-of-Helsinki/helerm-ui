import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import api from '../../../utils/api';
import { clearClassification, fetchClassificationThunk, createTosThunk } from '../classification';
import { classification } from '../../../utils/__mocks__/mockHelpers';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('ViewClassification reducer', () => {
  it('should fetch classification with thunk', () => {
    const classificationId = 1;
    const params = { version: 1 };

    const expectedActions = [
      {
        type: 'classification/fetchClassification/pending',
        meta: expect.anything(),
        payload: undefined,
      },
      {
        type: 'classification/fetchClassification/fulfilled',
        meta: expect.anything(),
        payload: expect.anything(),
      },
    ];
    const store = mockStore({});

    const mockApiGet = vi.fn().mockImplementation(() => Promise.resolve({ ok: true, json: () => classification }));
    vi.spyOn(api, 'get').mockImplementationOnce(mockApiGet);

    return store.dispatch(fetchClassificationThunk({ id: classificationId, params })).then(() => {
      const actions = store.getActions();
      expect(actions.length).toBe(2);
      expect(actions[0].type).toEqual(expectedActions[0].type);
      expect(actions[1].type).toEqual(expectedActions[1].type);
    });
  });

  it('should handle fetch classification error with thunk', () => {
    const classificationId = 1;

    const expectedActions = [
      {
        type: 'classification/fetchClassification/pending',
        meta: expect.anything(),
        payload: undefined,
      },
      {
        type: 'classification/fetchClassification/rejected',
        error: {
          message: 'Rejected',
        },
        meta: expect.anything(),
        payload: 'ERROR',
      },
    ];
    const store = mockStore({});

    const mockApiGet = vi.fn().mockImplementation(() => Promise.reject(new Error('ERROR')));
    vi.spyOn(api, 'get').mockImplementationOnce(mockApiGet);

    return store.dispatch(fetchClassificationThunk({ id: classificationId })).then(() => {
      const actions = store.getActions();
      expect(actions.length).toBe(2);
      expect(actions[0].type).toEqual(expectedActions[0].type);
      expect(actions[1].type).toEqual(expectedActions[1].type);
    });
  });

  it('should clear classification', () => {
    const expectedAction = { type: 'classification/clearClassification', payload: undefined };
    expect(clearClassification()).toEqual(expectedAction);
  });

  it('should create TOS successfully with thunk', () => {
    const newTos = { id: 1 };
    const expectedActions = [
      {
        type: 'classification/createTos/pending',
        meta: expect.anything(),
        payload: undefined,
      },
      {
        type: 'navigation/fetchNavigation/pending',
        meta: expect.anything(),
        payload: undefined,
      },
      {
        type: 'navigation/receiveNavigation',
        payload: {
          includeRelated: true,
          items: undefined,
          page: 1,
        },
      },
      { type: 'navigation/parseNavigation', payload: { items: [] } },
      {
        type: 'classification/createTos/fulfilled',
        meta: expect.anything(),
        payload: {
          id: 1,
        },
      },
    ];
    const store = mockStore({ classification, navigation: { includeRelated: true } });

    const mockApiGet = vi.fn().mockImplementation(() => Promise.resolve({ ok: true, json: () => classification }));
    const mockApiPost = vi.fn().mockImplementation(() => Promise.resolve({ ok: true, json: () => newTos }));

    vi.spyOn(api, 'get').mockImplementationOnce(mockApiGet);
    vi.spyOn(api, 'post').mockImplementationOnce(mockApiPost);

    return store.dispatch(createTosThunk({ token: 'mock-token' })).then(() => {
      const actions = store.getActions();

      expect(actions).toEqual(expectedActions);
    });
  });

  it('should handle create TOS error with thunk', () => {
    const expectedActions = [
      { type: 'classification/createTos/pending', meta: expect.anything(), payload: undefined },
      {
        type: 'classification/createTos/rejected',
        error: {
          message: 'Rejected',
        },
        meta: expect.anything(),
        payload: 'ERROR',
      },
    ];
    const store = mockStore({ classification, navigation: { includeRelated: true } });

    const mockApiPost = vi.fn().mockImplementation(() => Promise.reject(new Error('ERROR')));
    vi.spyOn(api, 'post').mockImplementationOnce(mockApiPost);

    return store.dispatch(createTosThunk()).then(() => {
      const actions = store.getActions();
      expect(actions.length).toBe(2);
      expect(actions[0].type).toEqual(expectedActions[0].type);
      expect(actions[1].type).toEqual(expectedActions[1].type);
    });
  });
});
