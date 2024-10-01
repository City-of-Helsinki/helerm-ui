import React from 'react';
import { Route, Navigate } from 'react-router-dom';

import CoreLayout from './layouts/CoreLayout/CoreLayout';
import InfoLayout from './layouts/InfoLayout/InfoLayout';
import LoginCallbackContainer from './views/LoginCallback/LoginCallbackContainer';
import NotFound from './components/NotFound/NotFound';
import ErrorPage from './views/ErrorPage/ErrorPage';

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

const RoutesComponent = () => (
  <>
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
          <LoginCallbackContainer />
        </InfoLayout>
      }
      errorElement={<Navigate to='/error' />}
    />
    <Route
      exact
      path='/bulk'
      element={
        <InfoLayout>
          <BulkListViewContainer />
        </InfoLayout>
      }
      errorElement={<Navigate to='/error' />}
    />
    <Route
      exact
      path='/bulk/view/:id'
      element={
        <InfoLayout>
          <BulkViewContainer />
        </InfoLayout>
      }
      errorElement={<Navigate to='/error' />}
    />
    <Route
      exact
      path='/bulk/create'
      element={
        <InfoLayout>
          <BulkCreateViewContainer />
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
          <FacetedSearchContainer />
        </CoreLayout>
      }
      errorElement={<Navigate to='/error' />}
    />
    <Route
      exact
      path='/view-tos/:id/'
      element={
        <CoreLayout>
          <ViewTOSContainer />
        </CoreLayout>
      }
    />
    <Route
      exact
      path='/view-tos/:id/version/:version'
      element={
        <CoreLayout>
          <ViewTOSContainer />
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
          <ViewClassificationContainer />
        </CoreLayout>
      }
      errorElement={<Navigate to='/error' />}
    />
    <Route
      exact
      path='/view-classification/:id/version/:version'
      element={
        <CoreLayout>
          <ViewClassificationContainer />
        </CoreLayout>
      }
      errorElement={<Navigate to='/error' />}
    />
    <Route
      exact
      path='/classification-tree'
      element={
        <CoreLayout>
          <ClassificationTreeContainer />
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
  </>
);

export default RoutesComponent;
