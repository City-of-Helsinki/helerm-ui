import { combineReducers } from '@reduxjs/toolkit';
import { reducer as toastr } from 'react-redux-toastr';

import bulk from './reducers/bulk';
import classification from './reducers/classification';
import navigation from './reducers/navigation';
import router from './reducers/router';
import search from './reducers/search';
import selectedTOS from './reducers/tos-toolkit';
import ui from './reducers/ui';
import user from './reducers/user';
import validation from './reducers/validation';

const makeRootReducer = () =>
  combineReducers({
    navigation,
    validation,
    router,
    selectedTOS,
    classification,
    toastr,
    user,
    ui,
    bulk,
    search,
  });

export default makeRootReducer;
