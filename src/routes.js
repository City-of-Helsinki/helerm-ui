import React from 'react';
import { IndexRoute, Route } from 'react-router';
import CoreLayout from './layouts/CoreLayout/CoreLayout';
import InfoLayout from './layouts/InfoLayout/InfoLayout';
// import IndexPage from './components/Index';
import BulkListViewContainer from './components/Bulk/BulkListViewContainer';
import BulkCreateViewContainer from './components/Bulk/BulkCreateView/BulkCreateViewContainer';
import BulkViewContainer from './components/Bulk/BulkView/BulkViewContainer';
import FacetedSearchContainer from './components/FacetedSearch/FacetedSearchContainer';
import ViewTOSContainer from './components/Tos/ViewTos/ViewTosContainer';
import ViewClassificationContainer from './components/Classification/ViewClassification/ViewClassificationContainer';
import ClassificationTreeContainer from './components/ClassificationTree/ClassificationTreeContainer';
import ViewInfo from './components/Info/ViewInfo';
import PrintTOS from 'components/Tos/Print/PrintView';
import NotFound from './components/NotFound/NotFound';

export default () => (
  <div>
    <Route path='/' component={CoreLayout}>
      <IndexRoute component={ViewInfo} />
      <Route path='search' component={FacetedSearchContainer} />
      <Route path='filter' component={ViewInfo} />
      <Route path='view-tos/'>
        <Route path=':id(/version/:version)'>
          <IndexRoute component={ViewTOSContainer} />
          <Route path='print' component={PrintTOS} />
        </Route>
      </Route>
      <Route path='view-classification/'>
        <Route path=':id' component={ViewClassificationContainer} />
      </Route>
      <Route path='classification-tree' component={ClassificationTreeContainer} />
    </Route>
    <Route path='/info' component={InfoLayout}>
      <IndexRoute component={ViewInfo} />
    </Route>
    <Route path='/bulk' component={InfoLayout}>
      <IndexRoute component={BulkListViewContainer} />
      <Route path='view/:id'>
        <IndexRoute component={BulkViewContainer} />
      </Route>
      <Route path='create' component={BulkCreateViewContainer} />
    </Route>
    <Route path='*' component={NotFound} />
  </div>
);
