import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import api from '../../../utils/api'
import {
  fetchClassification,
  clearClassification,
  receiveNewTOS,
  createTos
} from '../reducer';
import classification from '../../../utils/mocks/classification.json';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('ViewClassification reducer', () => {
  it('should fetch classification successfully', () => {
    const classificationId = 1;

    const expectedActions = [
      { type: 'requestClassificationAction' },
      { type: 'receiveClassificationAction', payload: classification }
    ];
    const store = mockStore({});

    const mockApiGet = vi.fn().mockImplementation(() => Promise.resolve({ ok: true, json: () => classification }));
    vi.spyOn(api, 'get').mockImplementationOnce(mockApiGet);

    return store.dispatch(fetchClassification(classificationId)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should handle fetch classification error', () => {
    const classificationId = 1;

    const expectedActions = [
      { type: 'requestClassificationAction' },
      { type: 'classificationErrorAction' }
    ];
    const store = mockStore({});

    const mockApiGet = vi.fn().mockImplementation(() => Promise.reject(new Error('ERROR')));
    vi.spyOn(api, 'get').mockImplementationOnce(mockApiGet);

    return store.dispatch(fetchClassification(classificationId)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should clear classification', () => {
    const expectedAction = { type: 'clearClassificationAction' };
    expect(clearClassification()).toEqual(expectedAction);
  });

  it('should receive new TOS', () => {
    const tos = { id: 1, version: 1 };
    const expectedAction = { type: 'receiveNewTosAction', payload: tos };
    expect(receiveNewTOS(tos)).toEqual(expectedAction);
  });

  it('should create TOS successfully', () => {
    const newTos = { id: 1 };
    const expectedActions = [
      { type: 'createTosAction' },
      { type: 'requestNavigationAction', payload: { includeRelated: true } },
      { type: 'receiveNewTosAction', payload: newTos }
    ];
    const store = mockStore({ classification, navigation: { includeRelated: true } });

    const mockApiPost = vi.fn().mockImplementation(() => Promise.resolve({ ok: true, json: () => newTos }));
    vi.spyOn(api, 'post').mockImplementationOnce(mockApiPost);

    return store.dispatch(createTos()).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should handle create TOS error', () => {
    const expectedActions = [
      { type: 'createTosAction' },
      { type: 'tosErrorAction', }
    ];
    const store = mockStore({ classification, navigation: { includeRelated: true } });

    const mockApiPost = vi.fn().mockImplementation(() => Promise.reject(new Error('ERROR')));
    vi.spyOn(api, 'post').mockImplementationOnce(mockApiPost);

    return store.dispatch(createTos()).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});
