import createStore from '../createStore';

describe('(Store) createStore', () => {
  let store;

  beforeEach(() => {
    store = createStore();
  });

  it('should have an empty asyncReducers object', () => {
    expect(store.asyncReducers).toBeInstanceOf(Object);
    expect(store.asyncReducers).toEqual({});
  });
});
