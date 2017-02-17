import React from 'react';
import { Route, IndexRoute } from 'react-router';
import CoreLayout from '../layouts/CoreLayout/CoreLayout';
import HomeContainer from './UI/containers/HomeContainer';
import ViewTOSContainer from './ViewTOS/containers/ViewTOSContainer';
import NotFound from './NotFound/NotFound';

export default () => (
  <div>
    <Route path='/' component={CoreLayout}>
      <IndexRoute component={HomeContainer} />
      <Route path='view-tos/:id' component={ViewTOSContainer} />
    </Route>
    <Route path='*' component={NotFound} />
  </div>
);
