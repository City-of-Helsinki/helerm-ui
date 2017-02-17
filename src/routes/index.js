import React from 'react';
import { Route, IndexRoute } from 'react-router';
import CoreLayout from '../layouts/CoreLayout/CoreLayout';
import HomeContainer from './UI/containers/HomeContainer';
import ViewTOSContainer from './ViewTOS/containers/ViewTOSContainer';

export default () => (
  <Route path='/' component={CoreLayout}>
    <IndexRoute component={HomeContainer} />
    <Route path='view-tos/:id' component={ViewTOSContainer} />
  </Route>
);
