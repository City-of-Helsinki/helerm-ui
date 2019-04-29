import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';
import { reducer as toastr } from 'react-redux-toastr';

import { default as user } from '../components/Login/reducer';
import { default as ui } from './uiReducer';
import { default as selectedTOS } from '../components/Tos/reducer';
import { default as navigation } from '../components/Navigation/reducer';
import { default as validation } from '../components/Tos/ValidationBar/reducer';
import { default as classification } from '../components/Classification/reducer';
import { default as bulk } from '../components/Bulk/reducer';

export const makeRootReducer = () => {
  return combineReducers({
    navigation,
    validation,
    routing,
    selectedTOS,
    classification,
    toastr,
    user,
    ui,
    bulk
  });
};

export default makeRootReducer;
