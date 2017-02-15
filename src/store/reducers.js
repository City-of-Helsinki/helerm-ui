import { combineReducers } from 'redux';
import locationReducer from './location';
import homeReducer from '../routes/Home/modules/home';
import tosReducer from '../routes/ViewTOS/modules/TOS';

export const makeRootReducer = (asyncReducers) => {
  return combineReducers({
    location: locationReducer,
    home: homeReducer,
    tos: tosReducer,
    ...asyncReducers
  });
};

export const injectReducer = (store, { key, reducer }) => {
  store.asyncReducers[key] = reducer;
  store.replaceReducer(makeRootReducer(store.asyncReducers));
};

export default makeRootReducer;
