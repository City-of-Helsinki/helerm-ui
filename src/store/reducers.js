import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import uiReducer from './uiReducer';
import tosReducer from '../routes/ViewTOS/tosReducer';
import navigationReducer from '../components/Navigation/navigationReducer';

export const makeRootReducer = (asyncReducers) => {
  return combineReducers({
    routing: routerReducer,
    ui: uiReducer,
    selectedTOS: tosReducer,
    navigation: navigationReducer,
    ...asyncReducers
  });
};

export const injectReducer = (store, { key, reducer }) => {
  store.asyncReducers[key] = reducer;
  store.replaceReducer(makeRootReducer(store.asyncReducers));
};

export default makeRootReducer;
