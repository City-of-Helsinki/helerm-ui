import { combineReducers } from '@reduxjs/toolkit';
import { reducer as toastr } from 'react-redux-toastr';

import user from './reducers/user';
import ui from './reducers/ui';
import selectedTOS from './reducers/tos-toolkit';
import navigation from './reducers/navigation';
import validation from './reducers/validation';
import classification from './reducers/classification';
import bulk from './reducers/bulk';
import search from './reducers/search';
import router from './reducers/router';

const makeRootReducer = () => combineReducers({
  navigation,
  validation,
  router,
  selectedTOS,
  classification,
  toastr,
  user,
  ui,
  bulk,
  search
});

export default makeRootReducer;
