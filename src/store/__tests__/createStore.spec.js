import { createBrowserHistory as mockHistory } from 'history';
import createStore from '../createStore';

describe('(Store) createStore', () => {
  let store, history;

  beforeEach(() => {
    history = mockHistory()
    store = createStore(history);
  });

  it('should have an empty asyncReducers object', () => {
    expect(store.asyncReducers).toBeInstanceOf(Object);
    expect(store.asyncReducers).toEqual({});
  });
});
