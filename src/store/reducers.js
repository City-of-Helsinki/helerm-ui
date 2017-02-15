import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import homeReducer from '../routes/Home/modules/home';
import tosReducer from '../routes/ViewTOS/modules/tos';
import navigationReducer from '../routes/Navigation/modules/navigation';

export const makeRootReducer = (asyncReducers) => {
  return combineReducers({
    routing: routerReducer,
    home: homeReducer,
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
