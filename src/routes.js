import React from 'react';
import { IndexRoute, Route } from 'react-router';
import CoreLayout from './layouts/CoreLayout/CoreLayout';
import InfoLayout from './layouts/InfoLayout/InfoLayout';
import ViewTOSContainer from './components/Tos/ViewTos/ViewTosContainer';
import ViewClassificationContainer from './components/Classification/ViewClassification/ViewClassificationContainer';
import ViewInfo from './components/Info/ViewInfo';
import PrintTOS from 'components/Tos/Print/PrintView';
import NotFound from './components/NotFound/NotFound';

export default () => (
  <div>
    <Route path='/'>
      <IndexRoute component={CoreLayout} />
      <Route path='view-tos/' component={CoreLayout}>
        <Route path=':id(/version/:version)'>
          <IndexRoute component={ViewTOSContainer} />
          <Route path='print' component={PrintTOS} />
        </Route>
      </Route>
      <Route path='view-classification/' component={CoreLayout}>
        <Route path=':id' component={ViewClassificationContainer} />
      </Route>
      <Route path='info' component={InfoLayout}>
        <IndexRoute component={ViewInfo} />
      </Route>
    </Route>
    <Route path='*' component={NotFound} />
  </div>
);
