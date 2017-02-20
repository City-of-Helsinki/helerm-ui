import { combineReducers } from 'redux';
import locationReducer from './location';
import { default as user } from './userReducer';

export const makeRootReducer = (asyncReducers) => {
  return combineReducers({
    location: locationReducer,
    user,
    ...asyncReducers
  });
};

export const injectReducer = (store, { key, reducer }) => {
  store.asyncReducers[key] = reducer;
  store.replaceReducer(makeRootReducer(store.asyncReducers));
};

export default makeRootReducer;
