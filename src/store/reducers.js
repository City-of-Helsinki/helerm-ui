import { combineReducers } from 'redux';
import locationReducer from './location';
import homeReducer from '../routes/Home/modules/home';
import tosReducer from '../routes/ViewTOS/modules/TOS';
import navigationReducer from '../routes/Navigation/modules/navigation';

export const makeRootReducer = (asyncReducers) => {
  return combineReducers({
    location: locationReducer,
    home: homeReducer,
    tos: tosReducer,
    navigation: navigationReducer,
    ...asyncReducers
  });
};

export const injectReducer = (store, { key, reducer }) => {
  store.asyncReducers[key] = reducer;
  store.replaceReducer(makeRootReducer(store.asyncReducers));
};

export default makeRootReducer;
