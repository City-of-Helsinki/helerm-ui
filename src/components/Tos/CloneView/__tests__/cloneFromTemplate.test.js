import api from '../../../../utils/api';
import { createTestStore } from '../../../../utils/renderWithProviders';
import { cloneFromTemplateThunk } from '../../../../store/reducers/tos-toolkit/cloneView';
import templateMock from '../../../../utils/__mocks__/api/function.json';

describe('cloneFromTemplateThunk', () => {
  it('should dispatch pending and fulfilled actions on successful API response', async () => {
    const endpoint = '/api/templates';
    const id = 123;

    const mockApiGet = vi.fn().mockImplementation(() => Promise.resolve({ ok: true, json: () => templateMock }));
    vi.spyOn(api, 'get').mockImplementationOnce(mockApiGet);

    const store = createTestStore({});
    await store.dispatch(cloneFromTemplateThunk({ endpoint, id, token: 'mock-token' }));

    const actions = store.getActions();

    expect(actions[0].type).toBe('selectedTOS/cloneFromTemplate/pending');

    const lastAction = actions[actions.length - 1];
    expect(lastAction.type).toBe('selectedTOS/cloneFromTemplate/fulfilled');
    expect(lastAction.payload).toEqual(templateMock);
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

    const store = createTestStore({});
    await store.dispatch(cloneFromTemplateThunk({ endpoint, id, token: 'mock-token' }));

    const actions = store.getActions();

    expect(actions[0].type).toBe('selectedTOS/cloneFromTemplate/pending');

    const lastAction = actions[actions.length - 1];
    expect(lastAction.type).toBe('selectedTOS/cloneFromTemplate/rejected');
    expect(lastAction.payload).toBe('Not Found');
  });
});
