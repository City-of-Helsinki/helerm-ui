import React from 'react';
import { Route, Navigate } from 'react-router-dom';

import CoreLayout from './layouts/CoreLayout/CoreLayout';
import InfoLayout from './layouts/InfoLayout/InfoLayout';
import LoginCallback from './views/LoginCallback/LoginCallback';
import NotFound from './components/NotFound/NotFound';
import ErrorPage from './views/ErrorPage/ErrorPage';
import RouterSyncLayout from './components/RouterSyncLayout/RouterSyncLayout';

const ViewInfo = React.lazy(() => import('./views/ViewInfo/ViewInfo'));
const BulkListView = React.lazy(() => import('./views/Bulk/BulkListView'));
const BulkView = React.lazy(() => import('./views/Bulk/BulkView/BulkView'));
const BulkCreateView = React.lazy(() => import('./views/Bulk/BulkCreateView/BulkCreateView'));
const FacetedSearch = React.lazy(() => import('./views/FacetedSearch/FacetedSearch'));
const ViewTOS = React.lazy(() => import('./views/Tos/ViewTos/ViewTos'));
const PrintTOS = React.lazy(() => import('./views/Tos/Print/PrintView'));
const ViewClassification = React.lazy(() => import('./views/ViewClassification/ViewClassification'));
const ClassificationTree = React.lazy(() => import('./views/ClassificationTree/ClassificationTree'));
const CookieManagement = React.lazy(() => import('./views/CookieManagement/CookieManagement'));

const RoutesComponent = () => (
  <Route element={<RouterSyncLayout />}>
    <Route
      exact
      path='/info'
      element={
        <InfoLayout>
          <ViewInfo />
        </InfoLayout>
      }
      errorElement={<Navigate to='/error' />}
    />
    <Route
      exact
      path='/callback'
      element={
        <InfoLayout>
          <LoginCallback />
        </InfoLayout>
      }
      errorElement={<Navigate to='/error' />}
    />
    <Route
      exact
      path='/bulk'
      element={
        <InfoLayout>
          <BulkListView />
        </InfoLayout>
      }
      errorElement={<Navigate to='/error' />}
    />
    <Route
      exact
      path='/bulk/view/:id'
      element={
        <InfoLayout>
          <BulkView />
        </InfoLayout>
      }
      errorElement={<Navigate to='/error' />}
    />
    <Route
      exact
      path='/bulk/create'
      element={
        <InfoLayout>
          <BulkCreateView />
        </InfoLayout>
      }
      errorElement={<Navigate to='/error' />}
    />
    <Route
      exact
      path='/'
      element={
        <CoreLayout>
          <ViewInfo />
        </CoreLayout>
      }
      errorElement={<Navigate to='/error' />}
    />
    <Route
      exact
      path='/filter'
      element={
        <CoreLayout>
          <ViewInfo />
        </CoreLayout>
      }
      errorElement={<Navigate to='/error' />}
    />
    <Route
      exact
      path='/search'
      element={
        <CoreLayout>
          <FacetedSearch />
        </CoreLayout>
      }
      errorElement={<Navigate to='/error' />}
    />
    <Route
      exact
      path='/view-tos/:id/'
      element={
        <CoreLayout>
          <ViewTOS />
        </CoreLayout>
      }
    />
    <Route
      exact
      path='/view-tos/:id/version/:version'
      element={
        <CoreLayout>
          <ViewTOS />
        </CoreLayout>
      }
      errorElement={<Navigate to='/error' />}
    />
    <Route
      exact
      path='/view-tos/:id/print'
      element={
        <CoreLayout>
          <PrintTOS />
        </CoreLayout>
      }
      errorElement={<Navigate to='/error' />}
    />
    <Route
      exact
      path='/view-tos/:id/version/:version/print'
      element={
        <CoreLayout>
          <PrintTOS />
        </CoreLayout>
      }
      errorElement={<Navigate to='/error' />}
    />
    <Route
      exact
      path='/view-classification/:id'
      element={
        <CoreLayout>
          <ViewClassification />
        </CoreLayout>
      }
      errorElement={<Navigate to='/error' />}
    />
    <Route
      exact
      path='/view-classification/:id/version/:version'
      element={
        <CoreLayout>
          <ViewClassification />
        </CoreLayout>
      }
      errorElement={<Navigate to='/error' />}
    />
    <Route
      exact
      path='/classification-tree'
      element={
        <CoreLayout>
          <ClassificationTree />
        </CoreLayout>
      }
      errorElement={<Navigate to='/error' />}
    />
    <Route
      exact
      path='/cookies'
      element={
        <InfoLayout>
          <CookieManagement />
        </InfoLayout>
      }
      errorElement={<Navigate to='/error' />}
    />
    <Route exact path='/error' element={<ErrorPage />} />
    <Route path='*' element={<NotFound />} />
  </Route>
);

export default RoutesComponent;
