import { connect } from 'react-redux';
import { bindActionCreators } from '@reduxjs/toolkit';
import { push } from 'connected-react-router';

import BulkListView from './BulkListView';
import { fetchBulkUpdates } from './reducer';

const mapDispatchToProps = (dispatch) => ({
  fetchBulkUpdates: bindActionCreators(fetchBulkUpdates, dispatch),
  push: (path) => dispatch(push(path)),
});

const mapStateToProps = (state) => ({
  actionTypes: state.ui.actionTypes,
  attributeTypes: state.ui.attributeTypes,
  bulkUpdates: state.bulk.bulkUpdates,
  isFetching: state.bulk.isFetching,
  isFetchingNavigation: state.navigation.isFetching,
  items: state.navigation.items,
  phaseTypes: state.ui.phaseTypes,
  recordTypes: state.ui.recordTypes,
  templates: state.ui.templates,
});

export default connect(mapStateToProps, mapDispatchToProps)(BulkListView);
