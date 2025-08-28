import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import api from '../../../../utils/api';
import { cloneFromTemplateThunk } from '../../../../store/reducers/tos-toolkit/cloneView';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('cloneFromTemplateThunk', () => {
  it('should dispatch pending and fulfilled actions on successful API response', async () => {
    const template = {
      count: 1,
      next: null,
      previous: null,
      results: [
        {
          id: '123',
          attributes: {},
          phases: ['123', '456'],
          created_at: '2018-02-09T13:10:13.843467+02:00',
          modified_at: '2018-02-09T13:10:13.971611+02:00',
          name: 'Test',
        },
      ],
    };

    const endpoint = '/api/templates';
    const id = 123;

    const mockApiGet = vi.fn().mockImplementation(() => Promise.resolve({ ok: true, json: () => template }));
    vi.spyOn(api, 'get').mockImplementationOnce(mockApiGet);

    const store = mockStore({});
    await store.dispatch(cloneFromTemplateThunk({ endpoint, id, token: 'mock-token' }));

    const actions = store.getActions();

    expect(actions[0].type).toBe('selectedTOS/cloneFromTemplate/pending');

    const lastAction = actions[actions.length - 1];
    expect(lastAction.type).toBe('selectedTOS/cloneFromTemplate/fulfilled');
    expect(lastAction.payload).toEqual(template);
  });

  it('should dispatch pending and rejected actions on failed API response', async () => {
    const endpoint = '/api/templates';
    const id = 123;

    const mockApiGet = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: false,
        statusText: 'Not Found',
      }),
    );
    vi.spyOn(api, 'get').mockImplementationOnce(mockApiGet);

    const store = mockStore({});
    await store.dispatch(cloneFromTemplateThunk({ endpoint, id, token: 'mock-token' }));

    const actions = store.getActions();

    expect(actions[0].type).toBe('selectedTOS/cloneFromTemplate/pending');

    const lastAction = actions[actions.length - 1];
    expect(lastAction.type).toBe('selectedTOS/cloneFromTemplate/rejected');
    expect(lastAction.payload).toBe('Not Found');
  });
});
