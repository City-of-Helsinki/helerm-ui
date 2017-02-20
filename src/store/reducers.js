import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import uiReducer from './uiReducer';
import tosReducer from '../routes/ViewTOS/tosReducer';
import navigationReducer from '../components/Navigation/navigationReducer';

export const makeRootReducer = (asyncReducers) => {
  return combineReducers({
    navigation: navigationReducer,
    routing: routerReducer,
    selectedTOS: tosReducer,
    ui: uiReducer,
    ...asyncReducers
  });
};

export const injectReducer = (store, { key, reducer }) => {
  store.asyncReducers[key] = reducer;
  store.replaceReducer(makeRootReducer(store.asyncReducers));
};

export default makeRootReducer;
