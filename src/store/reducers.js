import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';
import { default as ui } from './uiReducer';
import { default as selectedTOS } from '../routes/ViewTOS/tosReducer';
import { default as navigation } from '../components/Navigation/navigationReducer';

export const makeRootReducer = (asyncReducers) => {
  return combineReducers({
    navigation,
    routing,
    selectedTOS,
    ui,
    ...asyncReducers
  });
};

export const injectReducer = (store, { key, reducer }) => {
  store.asyncReducers[key] = reducer;
  store.replaceReducer(makeRootReducer(store.asyncReducers));
};

export default makeRootReducer;
