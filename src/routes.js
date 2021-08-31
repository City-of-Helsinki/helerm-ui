import React from 'react';
import { Switch, Route } from 'react-router-dom';
import CoreLayout from './layouts/CoreLayout/CoreLayout';
import InfoLayout from './layouts/InfoLayout/InfoLayout';
import BulkListViewContainer from './components/Bulk/BulkListViewContainer';
import BulkCreateViewContainer from './components/Bulk/BulkCreateView/BulkCreateViewContainer';
import BulkViewContainer from './components/Bulk/BulkView/BulkViewContainer';
import FacetedSearchContainer from './components/FacetedSearch/FacetedSearchContainer';
import ViewTOSContainer from './components/Tos/ViewTos/ViewTosContainer';
import ViewClassificationContainer from './components/Classification/ViewClassification/ViewClassificationContainer';
import ClassificationTreeContainer from './components/ClassificationTree/ClassificationTreeContainer';
import ViewInfo from './components/Info/ViewInfo';
import PrintTOS from './components/Tos/Print/PrintView';
import NotFound from './components/NotFound/NotFound';
import LoginCallbackContainer from './components/LoginCallback/LoginCallbackContainer'
import RenewCallbackContainer from './components/RenewCallback/RenewCallbackContainer'

const Routes = () => {
  return (
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
      <Route exact path='/renew'>
        <RenewCallbackContainer />
      </Route>
      <Route exact path='/bulk'>
        <InfoLayout />
        <BulkListViewContainer />
      </Route>
      <Route exact path='/bulk/view/:id'>
        <InfoLayout />
        <BulkViewContainer />
      </Route>
      <Route exact path='/bulk/create'>
        <InfoLayout />
        <BulkCreateViewContainer />
      </Route>
      <Route exact path={['/', '/filter']}>
        <CoreLayout>
          <ViewInfo />
        </CoreLayout>
      </Route>
      <Route exact path='/search'>
        <CoreLayout />
        <FacetedSearchContainer />
      </Route>
      <Route exact path={['/view-tos/:id/', '/view-tos/:id/version/:version']}>
        <CoreLayout />
        <ViewTOSContainer />
      </Route>
      <Route
        exact
        path={['/view-tos/:id/print', '/view-tos/:id/version/:version/print']}
      >
        <CoreLayout />
        <PrintTOS />
      </Route>
      <Route
        exact
        path={[
          '/view-classification/:id',
          '/view-classification/:id/version/:version'
        ]}
      >
        <CoreLayout />
        <ViewClassificationContainer />
      </Route>
      <Route exact path='/classification-tree'>
        <CoreLayout />
        <ClassificationTreeContainer />
      </Route>
      <Route path='*' component={NotFound} />
    </Switch>
  );
};

export default Routes;
