import React from 'react';
import { Switch, Route } from 'react-router-dom';

import CoreLayout from './layouts/CoreLayout/CoreLayout';
import InfoLayout from './layouts/InfoLayout/InfoLayout';
import LoginCallbackContainer from './views/LoginCallback/LoginCallbackContainer';
import NotFound from './components/NotFound/NotFound';

const ViewInfo = React.lazy(() => import('./views/ViewInfo/ViewInfo'));
const BulkListViewContainer = React.lazy(() => import('./views/Bulk/BulkListViewContainer'));
const BulkViewContainer = React.lazy(() => import('./views/Bulk/BulkView/BulkViewContainer'));
const BulkCreateViewContainer = React.lazy(() => import('./views/Bulk/BulkCreateView/BulkCreateViewContainer'));
const FacetedSearchContainer = React.lazy(() => import('./views/FacetedSearch/FacetedSearchContainer'));
const ViewTOSContainer = React.lazy(() => import('./views/Tos/ViewTos/ViewTosContainer'));
const PrintTOS = React.lazy(() => import('./views/Tos/Print/PrintView'));
const ViewClassificationContainer = React.lazy(() => import('./views/ViewClassification/ViewClassificationContainer'));
const ClassificationTreeContainer = React.lazy(() => import('./views/ClassificationTree/ClassificationTreeContainer'));

const CookieManagement = React.lazy(() => import('./views/CookieManagement/CookieManagement'));

const Routes = () => (
  <Switch>
    <Route exact path='/info'>
      <InfoLayout>
        <ViewInfo />
      </InfoLayout>
    </Route>
    <Route exact path='/callback'>
      <InfoLayout>
        <LoginCallbackContainer />
      </InfoLayout>
    </Route>
    <Route exact path='/bulk'>
      <InfoLayout>
        <BulkListViewContainer />
      </InfoLayout>
    </Route>
    <Route exact path='/bulk/view/:id'>
      <InfoLayout>
        <BulkViewContainer />
      </InfoLayout>
    </Route>
    <Route exact path='/bulk/create'>
      <InfoLayout>
        <BulkCreateViewContainer />
      </InfoLayout>
    </Route>
    <Route exact path={['/', '/filter']}>
      <CoreLayout>
        <ViewInfo />
      </CoreLayout>
    </Route>
    <Route exact path='/search'>
      <CoreLayout>
        <FacetedSearchContainer />
      </CoreLayout>
    </Route>
    <Route exact path={['/view-tos/:id/', '/view-tos/:id/version/:version']}>
      <CoreLayout>
        <ViewTOSContainer />
      </CoreLayout>
    </Route>
    <Route exact path={['/view-tos/:id/print', '/view-tos/:id/version/:version/print']}>
      <CoreLayout>
        <PrintTOS />
      </CoreLayout>
    </Route>
    <Route exact path={['/view-classification/:id', '/view-classification/:id/version/:version']}>
      <CoreLayout>
        <ViewClassificationContainer />
      </CoreLayout>
    </Route>
    <Route exact path='/classification-tree'>
      <CoreLayout>
        <ClassificationTreeContainer />
      </CoreLayout>
    </Route>
    <Route exact path='/cookies'>
      <InfoLayout>
        <CookieManagement />
      </InfoLayout>
    </Route>
    <Route path='*' component={NotFound} />
  </Switch>
);

export default Routes;
