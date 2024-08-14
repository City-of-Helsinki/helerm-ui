import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { cloneFromTemplate, REQUEST_TOS, RECEIVE_TEMPLATE, TOS_ERROR } from '../reducer';
import api from '../../../../utils/api'

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('cloneFromTemplate', () => {
  it('should dispatch REQUEST_TOS and RECEIVE_TEMPLATE actions on successful API response', () => {
    const template = {
      count: 1,
      next: null,
      previous: null,
      results: [
        {
          id: "123",
          attributes: {},
          phases: ["123", "456"],
          created_at: "2018-02-09T13:10:13.843467+02:00",
          modified_at: "2018-02-09T13:10:13.971611+02:00",
          name: "Test"
        }
      ]
    }
      ;
    const endpoint = '/api/templates';
    const id = 123;

    const mockApiGet = vi.fn().mockImplementation(() => Promise.resolve({ ok: true, json: () => template }));

    vi.spyOn(api, 'get').mockImplementationOnce(mockApiGet);

    const expectedActions = [
      { type: REQUEST_TOS },
      { type: RECEIVE_TEMPLATE, payload: template },
    ];
    const store = mockStore({});


    return store.dispatch(cloneFromTemplate(endpoint, id)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should dispatch REQUEST_TOS and TOS_ERROR actions on failed API response', () => {
    const endpoint = '/api/templates';
    const id = 123;

    const mockApiGet = vi.fn().mockImplementation(() => Promise.resolve({ status: 404 }));

    vi.spyOn(api, 'get').mockImplementationOnce(mockApiGet);

    const expectedActions = [
      { type: REQUEST_TOS },
      { type: TOS_ERROR },
    ];
    const store = mockStore({});

    return store.dispatch(cloneFromTemplate(endpoint, id)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});
