import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import {
  fetchTOS,
  saveDraft,
  changeStatus,
} from '../reducer';
import api from '../../../utils/api';
import validTOS from '../../../utils/mocks/validTOS.json';
import classification from '../../../utils/mocks/classification.json';
import { WAITING_FOR_APPROVAL } from '../../../constants';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('TOS Reducer', () => {
  it('should fetch TOS', () => {
    const expectedActions = [{
      type: 'requestTosAction',
    },
    {
      type: 'receiveTosAction',
      payload: {
        entities: {
          tos: {
            [validTOS.id]: {
              ...validTOS
            }
          },
        },
        receivedAt: expect.any(Number),
        result: validTOS.id
      },
    }];

    const mockApiGet = vi.fn().mockImplementation(() => Promise.resolve({ ok: true, json: () => validTOS }));
    vi.spyOn(api, 'get').mockImplementationOnce(mockApiGet);

    const store = mockStore({});

    return store.dispatch(fetchTOS(validTOS.id)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    })
  });

  it('should handle fetch TOS error', () => {
    const expectedActions = [
      {
        type: 'requestTosAction',
      },
      {
        type: 'tosErrorAction',
      },
    ]

    const mockApiGet = vi.fn().mockImplementation(() => Promise.reject(new Error('ERROR')));
    vi.spyOn(api, 'get').mockImplementationOnce(mockApiGet);

    const store = mockStore({});

    return store.dispatch(fetchTOS(validTOS.id)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    })
  });

  it('should save draft', () => {
    const expectedActions = [{
      type: 'requestTosAction',
    },
    {
      type: 'receiveTosAction',
      payload: {
        entities: {
          tos: {
            [validTOS.id]: {
              ...validTOS
            }
          },
        },
        receivedAt: expect.any(Number),
        result: validTOS.id
      },
    }];

    const mockApiPut = vi.fn().mockImplementation(() => Promise.resolve({ ok: true, json: () => validTOS }));
    vi.spyOn(api, 'put').mockImplementationOnce(mockApiPut);

    const store = mockStore({
      selectedTOS: validTOS
    });

    return store.dispatch(saveDraft()).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    })
  });

  it('should handle save draft error', () => {
    const expectedActions = [
      {
        type: 'requestTosAction',
      },
      {
        type: 'tosErrorAction',

      }
    ];

    const mockApiPut = vi.fn().mockImplementation(() => Promise.reject(new Error('Error')));
    vi.spyOn(api, 'put').mockImplementationOnce(mockApiPut);

    const store = mockStore({
      selectedTOS: validTOS
    });

    return store.dispatch(saveDraft()).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    })
  });

  it('should change status', () => {
    const expectedActions = [
      {
        type: 'requestTosAction',
      },
      {
        type: 'requestNavigationAction',
        payload: {
          includeRelated: false
        }
      },
      {
        type: 'receiveTosAction',
        payload: {
          entities: {
            tos: {
              [validTOS.id]: {
                ...validTOS
              }
            },
          },
          receivedAt: expect.any(Number),
          result: validTOS.id
        },
      },
      {
        type: 'receiveNavigationAction',
        payload: {
          includeRelated: false,
          items: undefined,
          page: 1
        }
      },
      {
        type: 'parsedNavigationAction',
        payload: {
          items: []
        }
      },
    ];

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

    return store.dispatch(changeStatus(WAITING_FOR_APPROVAL)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    })
  });

  it('should handle change status error', () => {
    const expectedActions = [
      {
        type: 'requestTosAction',
      },
      {
        type: 'requestNavigationAction',
        payload: {
          includeRelated: false
        }
      },
      {
        type: 'tosErrorAction',
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

    return store.dispatch(changeStatus(WAITING_FOR_APPROVAL)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    })
  });
});
