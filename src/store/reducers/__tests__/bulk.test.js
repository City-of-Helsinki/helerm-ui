import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import {
  fetchBulkUpdatesThunk,
  fetchBulkUpdateThunk,
  approveBulkUpdateThunk,
  deleteBulkUpdateThunk,
  saveBulkUpdateThunk,
  updateBulkUpdateThunk,
  clearSelectedBulkUpdate,
} from '../bulk';
import api from '../../../utils/api';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('Bulk reducer', () => {
  it('should create an action to fetch bulk updates', async () => {
    const expectedActions = [
      {
        type: 'bulk/fetchBulkUpdates/pending',
        payload: undefined,
        meta: expect.anything(),
      },
      {
        type: 'bulk/fetchBulkUpdates/fulfilled',
        payload: [],
        meta: expect.anything(),
      },
    ];
    const store = mockStore({});

    const mockApiGet = vi.fn().mockImplementation(() => Promise.resolve({ json: () => ({ results: [] }) }));
    vi.spyOn(api, 'get').mockImplementationOnce(mockApiGet);

    return store.dispatch(fetchBulkUpdatesThunk({ includeApproved: false, token: 'mock-token' })).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should create an action to fetch bulk updates failure', async () => {
    const expectedActions = [
      {
        type: 'bulk/fetchBulkUpdates/pending',
        payload: undefined,
        meta: expect.anything(),
      },
      {
        type: 'bulk/fetchBulkUpdates/rejected',
        payload: 'ERROR',
        error: {
          message: 'Rejected',
        },
        meta: expect.anything(),
      },
    ];
    const store = mockStore({});

    const mockApiGet = vi.fn().mockImplementation(() => Promise.reject(new Error('ERROR')));
    vi.spyOn(api, 'get').mockImplementationOnce(mockApiGet);

    return store.dispatch(fetchBulkUpdatesThunk({ includeApproved: false, token: 'mock-token' })).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should create an action to fetch a bulk update', () => {
    const bulkUpdateId = 1;
    const expectedActions = [
      {
        type: 'bulk/fetchBulkUpdate/pending',
        payload: undefined,
        meta: expect.anything(),
      },
      {
        type: 'bulk/fetchBulkUpdate/fulfilled',
        payload: {},
        meta: expect.anything(),
      },
    ];
    const store = mockStore({});

    const mockApiGet = vi.fn().mockImplementation(() => Promise.resolve({ json: () => ({}) }));
    vi.spyOn(api, 'get').mockImplementationOnce(mockApiGet);

    return store.dispatch(fetchBulkUpdateThunk({ id: bulkUpdateId, token: 'mock-token' })).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should create an action to approve a bulk update', () => {
    const bulkUpdateId = 1;
    const expectedActions = [
      {
        type: 'bulk/approveBulkUpdate/pending',
        payload: undefined,
        meta: expect.anything(),
      },
      {
        type: 'bulk/approveBulkUpdate/fulfilled',
        payload: true,
        meta: expect.anything(),
      },
    ];
    const store = mockStore({});

    const mockApiPost = vi.fn().mockImplementation(() => Promise.resolve({ ok: true, json: () => ({}) }));
    vi.spyOn(api, 'post').mockImplementationOnce(mockApiPost);

    return store.dispatch(approveBulkUpdateThunk(bulkUpdateId)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should create an action to approve a bulk update failure', () => {
    const bulkUpdateId = 1;
    const expectedActions = [
      {
        type: 'bulk/approveBulkUpdate/pending',
        payload: undefined,
        meta: expect.anything(),
      },
      {
        type: 'bulk/approveBulkUpdate/rejected',
        payload: 'ERROR',
        error: {
          message: 'Rejected',
        },
        meta: expect.anything(),
      },
    ];
    const store = mockStore({});

    const mockApiPost = vi.fn().mockImplementation(() => Promise.reject(new Error('ERROR')));
    vi.spyOn(api, 'post').mockImplementationOnce(mockApiPost);

    return store.dispatch(approveBulkUpdateThunk(bulkUpdateId)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should create an action to delete a bulk update', () => {
    const bulkUpdateId = 1;
    const expectedActions = [
      {
        type: 'bulk/deleteBulkUpdate/pending',
        payload: undefined,
        meta: expect.anything(),
      },
      {
        type: 'bulk/deleteBulkUpdate/fulfilled',
        payload: true,
        meta: expect.anything(),
      },
    ];
    const store = mockStore({});

    const mockApiDel = vi.fn().mockImplementation(() => Promise.resolve({ ok: true, json: () => ({}) }));
    vi.spyOn(api, 'del').mockImplementationOnce(mockApiDel);

    return store.dispatch(deleteBulkUpdateThunk(bulkUpdateId)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should create an action to delete a bulk update failure', () => {
    const bulkUpdateId = 1;
    const expectedActions = [
      {
        type: 'bulk/deleteBulkUpdate/pending',
        payload: undefined,
        meta: expect.anything(),
      },
      {
        type: 'bulk/deleteBulkUpdate/rejected',
        payload: 'ERROR',
        error: {
          message: 'Rejected',
        },
        meta: expect.anything(),
      },
    ];
    const store = mockStore({});

    const mockApiDel = vi.fn().mockImplementation(() => Promise.reject(new Error('ERROR')));
    vi.spyOn(api, 'del').mockImplementationOnce(mockApiDel);

    return store.dispatch(deleteBulkUpdateThunk(bulkUpdateId)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should create an action to save a bulk update', () => {
    const bulkUpdate = {};
    const expectedActions = [
      {
        type: 'bulk/saveBulkUpdate/pending',
        payload: undefined,
        meta: expect.anything(),
      },
      {
        type: 'bulk/saveBulkUpdate/fulfilled',
        payload: {},
        meta: expect.anything(),
      },
    ];
    const store = mockStore({});

    const mockApiPost = vi.fn().mockImplementation(() => Promise.resolve({ ok: true, json: () => ({}) }));
    vi.spyOn(api, 'post').mockImplementationOnce(mockApiPost);

    return store.dispatch(saveBulkUpdateThunk(bulkUpdate)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should create an action to save a bulk update error', () => {
    const bulkUpdate = {};
    const expectedActions = [
      {
        type: 'bulk/saveBulkUpdate/pending',
        payload: undefined,
        meta: expect.anything(),
      },
      {
        type: 'bulk/saveBulkUpdate/rejected',
        payload: 'ERROR',
        error: {
          message: 'Rejected',
        },
        meta: expect.anything(),
      },
    ];
    const store = mockStore({});

    const mockApiPost = vi.fn().mockImplementation(() => Promise.reject(new Error('ERROR')));
    vi.spyOn(api, 'post').mockImplementationOnce(mockApiPost);

    return store.dispatch(saveBulkUpdateThunk(bulkUpdate)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should create an action to update a bulk update', () => {
    const bulkUpdateId = 1;
    const bulkUpdate = {};
    const expectedActions = [
      {
        type: 'bulk/updateBulkUpdate/pending',
        payload: undefined,
        meta: expect.anything(),
      },
      {
        type: 'bulk/updateBulkUpdate/fulfilled',
        payload: {},
        meta: expect.anything(),
      },
    ];
    const store = mockStore({});

    const mockApiPatch = vi.fn().mockImplementation(() => Promise.resolve({ ok: true, json: () => ({}) }));
    vi.spyOn(api, 'patch').mockImplementationOnce(mockApiPatch);

    return store.dispatch(updateBulkUpdateThunk({ id: bulkUpdateId, bulkUpdate })).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should create an action to update a bulk update failure', () => {
    const bulkUpdateId = 1;
    const bulkUpdate = {};
    const expectedActions = [
      {
        type: 'bulk/updateBulkUpdate/pending',
        payload: undefined,
        meta: expect.anything(),
      },
      {
        type: 'bulk/updateBulkUpdate/rejected',
        payload: 'ERROR',
        error: {
          message: 'Rejected',
        },
        meta: expect.anything(),
      },
    ];
    const store = mockStore({});

    const mockApiPatch = vi.fn().mockImplementation(() => Promise.reject(new Error('ERROR')));
    vi.spyOn(api, 'patch').mockImplementationOnce(mockApiPatch);

    return store.dispatch(updateBulkUpdateThunk({ id: bulkUpdateId, bulkUpdate })).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should create an action to clear selected bulk update', () => {
    expect(clearSelectedBulkUpdate()).toEqual({
      payload: undefined,
      type: 'bulk/clearSelectedBulkUpdate',
    });
  });
});
