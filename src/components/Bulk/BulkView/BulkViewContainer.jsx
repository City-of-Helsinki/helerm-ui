/* eslint-disable import/no-cycle */
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import { bindActionCreators } from '@reduxjs/toolkit';
import { get } from 'lodash';

import { fetchNavigation } from '../../Navigation/reducer';
import { displayMessage } from '../../../utils/helpers';
import {
  approveBulkUpdate,
  clearSelectedBulkUpdate,
  deleteBulkUpdate,
  fetchBulkUpdate,
  updateBulkUpdate,
} from '../reducer';
import BulkView from './BulkView';

const mapDispatchToProps = (dispatch) => ({
  approveBulkUpdate: bindActionCreators(approveBulkUpdate, dispatch),
  clearSelectedBulkUpdate: bindActionCreators(clearSelectedBulkUpdate, dispatch),
  deleteBulkUpdate: bindActionCreators(deleteBulkUpdate, dispatch),
  fetchBulkUpdate: bindActionCreators(fetchBulkUpdate, dispatch),
  fetchNavigation: bindActionCreators(fetchNavigation, dispatch),
  push: (path) => dispatch(push(path)),
  updateBulkUpdate: bindActionCreators(updateBulkUpdate, dispatch),
});

const mapStateToProps = (state) => ({
  actionTypes: state.ui.actionTypes,
  attributeTypes: state.ui.attributeTypes,
  displayMessage: (msg, opts) => displayMessage(msg, opts),
  getAttributeName: (key) => get(state.ui.attributeTypes, [key, 'name'], key),
  isFetchingNavigation: state.navigation.isFetching,
  isUpdating: state.bulk.isUpdating,
  itemsIncludeRelated: state.navigation.includeRelated,
  items: state.navigation.includeRelated ? state.navigation.items : [],
  phaseTypes: state.ui.phaseTypes,
  recordTypes: state.ui.recordTypes,
  selectedBulk: state.bulk.selectedBulk,
  templates: state.ui.templates,
  updates: state.bulk.updates,
});

export default connect(mapStateToProps, mapDispatchToProps)(BulkView);
