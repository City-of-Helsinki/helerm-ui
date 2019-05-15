import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { bindActionCreators } from 'redux';
import { get } from 'lodash';

import { fetchNavigation } from '../../Navigation/reducer';
import { displayMessage } from '../../../utils/helpers';
import { approveBulkUpdate, clearSelectedBulkUpdate, deleteBulkUpdate, fetchBulkUpdate } from '../reducer';
import BulkView from './BulkView';

const mapDispatchToProps = dispatch => ({
  approveBulkUpdate: bindActionCreators(approveBulkUpdate, dispatch),
  clearSelectedBulkUpdate: bindActionCreators(clearSelectedBulkUpdate, dispatch),
  deleteBulkUpdate: bindActionCreators(deleteBulkUpdate, dispatch),
  fetchBulkUpdate: bindActionCreators(fetchBulkUpdate, dispatch),
  fetchNavigation: bindActionCreators(fetchNavigation, dispatch),
  push: path => dispatch(push(path))
});

const mapStateToProps = state => ({
  actionTypes: state.ui.actionTypes,
  attributeTypes: state.ui.attributeTypes,
  displayMessage: (msg, opts) => displayMessage(msg, opts),
  getAttributeName: key => get(state.ui.attributeTypes, [key, 'name'], key),
  isFetchingNavigation: state.navigation.isFetching,
  itemsIncludeRelated: state.navigation.includeRelated,
  items: state.navigation.items,
  phaseTypes: state.ui.phaseTypes,
  recordTypes: state.ui.recordTypes,
  selectedBulk: state.bulk.selectedBulk,
  templates: state.ui.templates,
  updates: state.bulk.updates
});

export default connect(mapStateToProps, mapDispatchToProps)(BulkView);
