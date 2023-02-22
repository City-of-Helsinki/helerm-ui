import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { reducer as toastr } from 'react-redux-toastr';

import user from '../components/Login/reducer';
import ui from './uiReducer';
import selectedTOS from '../components/Tos/reducer';
import navigation from '../components/Navigation/reducer';
import validation from '../components/Tos/ValidationBar/reducer';
import classification from '../components/Classification/reducer';
import bulk from '../components/Bulk/reducer';
import search from '../components/FacetedSearch/reducer';

const makeRootReducer = (history) => combineReducers({
  navigation,
  validation,
  router: connectRouter(history),
  selectedTOS,
  classification,
  toastr,
  user,
  ui,
  bulk,
  search
});

export default makeRootReducer;
