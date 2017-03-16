import React from 'react';
import { Route } from 'react-router';
import CoreLayout from './layouts/CoreLayout/CoreLayout';
import ViewTOSContainer from './components/Tos/ViewTOS/ViewTOSContainer';
import NotFound from './components/NotFound/NotFound';

export default () => (
  <div>
    <Route path='/' component={CoreLayout}>
      <Route path='view-tos/:id' component={ViewTOSContainer} />
    </Route>
    <Route path='*' component={NotFound} />
  </div>
);
