import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';
import { default as user } from './userReducer';
import { default as ui } from './uiReducer';
import { default as selectedTOS } from '../components/Tos/ViewTOS/tosReducer';
import { default as navigation } from '../components/Navigation/navigationReducer';

export const makeRootReducer = () => {
  return combineReducers({
    navigation,
    routing,
    selectedTOS,
    user,
    ui
  });
};

export default makeRootReducer;
