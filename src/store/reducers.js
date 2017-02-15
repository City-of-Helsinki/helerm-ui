import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import homeReducer from '../routes/Home/modules/home';
import tosReducer from '../routes/ViewTOS/modules/TOS';

export const makeRootReducer = (asyncReducers) => {
  return combineReducers({
    routing: routerReducer,
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
