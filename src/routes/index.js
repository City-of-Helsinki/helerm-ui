import React from 'react';
import { Route, IndexRoute } from 'react-router';
import CoreLayout from '../layouts/CoreLayout/CoreLayout';
import Home from './Home/containers/HomeContainer';
import ViewTOS from './ViewTOS/components/ViewTOS';

export default () => (
  <Route path='/' component={CoreLayout}>
    <IndexRoute component={Home} />
    <Route path='view-tos/:id' component={ViewTOS} />
  </Route>
);
