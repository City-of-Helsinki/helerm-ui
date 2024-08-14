import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import {
  fetchBulkUpdates,
  fetchBulkUpdate,
  approveBulkUpdate,
  deleteBulkUpdate,
  saveBulkUpdate,
  updateBulkUpdate,
  clearSelectedBulkUpdate,
  FETCH_BULK_UPDATES_RECEIVE,
  FETCH_BULK_UPDATE_RECEIVE,
  APPROVE_BULK_UPDATE_RECEIVE,
  DELETE_BULK_UPDATE_RECEIVE,
  SAVE_BULK_UPDATE_REQUEST,
  SAVE_BULK_UPDATE_RECEIVE,
  UPDATE_BULK_UPDATE_REQUEST,
  UPDATE_BULK_UPDATE_RECEIVE,
  CLEAR_SELECTED_BULK_UPDATE,
  FETCH_BULK_UPDATES_ERROR,
  APPROVE_BULK_UPDATE_ERROR,
  DELETE_BULK_UPDATE_ERROR,
  SAVE_BULK_UPDATE_ERROR,
  UPDATE_BULK_UPDATE_ERROR
} from '../reducer';
import api from '../../../utils/api';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('Bulk reducer', () => {
  it('should create an action to fetch bulk updates', async () => {
    const expectedActions = [
      { type: FETCH_BULK_UPDATES_RECEIVE, payload: [] }
    ];
    const store = mockStore({});

    const mockApiGet = vi.fn().mockImplementation(() => Promise.resolve({ json: () => ({ results: [] }) }));
    vi.spyOn(api, 'get').mockImplementationOnce(mockApiGet);

    return store.dispatch(fetchBulkUpdates()).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should create an action to fetch bulk updates failure', async () => {
    const expectedActions = [
      { type: FETCH_BULK_UPDATES_ERROR }
    ];
    const store = mockStore({});

    const mockApiGet = vi.fn().mockImplementation(() => Promise.reject(new Error('ERROR')));
    vi.spyOn(api, 'get').mockImplementationOnce(mockApiGet);

    return store.dispatch(fetchBulkUpdates()).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should create an action to fetch a bulk update', () => {
    const bulkUpdateId = 1;
    const expectedActions = [
      { type: FETCH_BULK_UPDATE_RECEIVE, payload: {} }
    ];
    const store = mockStore({});

    const mockApiGet = vi.fn().mockImplementation(() => Promise.resolve({ json: () => ({}) }));
    vi.spyOn(api, 'get').mockImplementationOnce(mockApiGet);

    return store.dispatch(fetchBulkUpdate(bulkUpdateId)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should create an action to approve a bulk update', () => {
    const bulkUpdateId = 1;
    const expectedActions = [
      { type: APPROVE_BULK_UPDATE_RECEIVE, payload: true }
    ];
    const store = mockStore({});

    const mockApiGet = vi.fn().mockImplementation(() => Promise.resolve({ ok: true, json: () => ({}) }));
    vi.spyOn(api, 'post').mockImplementationOnce(mockApiGet);

    return store.dispatch(approveBulkUpdate(bulkUpdateId)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should create an action to approve a bulk update failure', () => {
    const bulkUpdateId = 1;
    const expectedActions = [
      { type: APPROVE_BULK_UPDATE_ERROR }
    ];
    const store = mockStore({});

    const mockApiGet = vi.fn().mockImplementation(() => Promise.reject(new Error('ERROR')));
    vi.spyOn(api, 'post').mockImplementationOnce(mockApiGet);

    return store.dispatch(approveBulkUpdate(bulkUpdateId)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should create an action to delete a bulk update', () => {
    const bulkUpdateId = 1;
    const expectedActions = [
      { type: DELETE_BULK_UPDATE_RECEIVE, payload: true }
    ];
    const store = mockStore({});

    const mockApiGet = vi.fn().mockImplementation(() => Promise.resolve({ ok: true, json: () => ({}) }));
    vi.spyOn(api, 'del').mockImplementationOnce(mockApiGet);

    return store.dispatch(deleteBulkUpdate(bulkUpdateId)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should create an action to delete a bulk update failure', () => {
    const bulkUpdateId = 1;
    const expectedActions = [
      { type: DELETE_BULK_UPDATE_ERROR }
    ];
    const store = mockStore({});

    const mockApiGet = vi.fn().mockImplementation(() => Promise.reject(new Error('ERROR')));
    vi.spyOn(api, 'del').mockImplementationOnce(mockApiGet);

    return store.dispatch(deleteBulkUpdate(bulkUpdateId)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should create an action to save a bulk update', () => {
    const bulkUpdate = {};
    const expectedActions = [
      { type: SAVE_BULK_UPDATE_REQUEST },
      { type: SAVE_BULK_UPDATE_RECEIVE, payload: {} }
    ];
    const store = mockStore({});

    const mockApiGet = vi.fn().mockImplementation(() => Promise.resolve({ ok: true, json: () => ({}) }));
    vi.spyOn(api, 'post').mockImplementationOnce(mockApiGet);

    return store.dispatch(saveBulkUpdate(bulkUpdate)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should create an action to save a bulk update error', () => {
    const bulkUpdate = {};
    const expectedActions = [
      { type: SAVE_BULK_UPDATE_REQUEST },
      { type: SAVE_BULK_UPDATE_ERROR },
    ];
    const store = mockStore({});

    const mockApiGet = vi.fn().mockImplementation(() => Promise.reject(new Error('ERROR')));
    vi.spyOn(api, 'post').mockImplementationOnce(mockApiGet);

    return store.dispatch(saveBulkUpdate(bulkUpdate)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should create an action to update a bulk update', () => {
    const bulkUpdateId = 1;
    const bulkUpdate = {};
    const expectedActions = [
      { type: UPDATE_BULK_UPDATE_REQUEST },
      { type: UPDATE_BULK_UPDATE_RECEIVE, payload: {} }
    ];
    const store = mockStore({});

    const mockApiGet = vi.fn().mockImplementation(() => Promise.resolve({ ok: true, json: () => ({}) }));
    vi.spyOn(api, 'patch').mockImplementationOnce(mockApiGet);

    return store.dispatch(updateBulkUpdate(bulkUpdateId, bulkUpdate)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should create an action to update a bulk update failure', () => {
    const bulkUpdateId = 1;
    const bulkUpdate = {};
    const expectedActions = [
      { type: UPDATE_BULK_UPDATE_REQUEST },
      { type: UPDATE_BULK_UPDATE_ERROR }
    ];
    const store = mockStore({});

    const mockApiGet = vi.fn().mockImplementation(() => Promise.reject(new Error('ERROR')));
    vi.spyOn(api, 'patch').mockImplementationOnce(mockApiGet);

    return store.dispatch(updateBulkUpdate(bulkUpdateId, bulkUpdate)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should create an action to clear selected bulk update', () => {
    const expectedAction = { type: CLEAR_SELECTED_BULK_UPDATE };
    expect(clearSelectedBulkUpdate()).toEqual(expectedAction);
  });
});
