import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';
import { default as user } from '../components/Login/reducer';
import { default as ui } from './uiReducer';
import { default as selectedTOS } from '../components/Tos/reducer';
import { default as navigation } from '../components/Navigation/reducer';

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
