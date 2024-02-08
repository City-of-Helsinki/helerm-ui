import { connect } from 'react-redux';
import { bindActionCreators } from '@reduxjs/toolkit';
import { get } from 'lodash';

import { fetchNavigation } from '../../../components/Navigation/reducer';
import { displayMessage } from '../../../utils/helpers';
import { saveBulkUpdate } from '../reducer';
import BulkCreateView from './BulkCreateView';

const mapDispatchToProps = (dispatch) => ({
  fetchNavigation: bindActionCreators(fetchNavigation, dispatch),
  saveBulkUpdate: bindActionCreators(saveBulkUpdate, dispatch),
});

const mapStateToProps = (state) => ({
  actionTypes: state.ui.actionTypes,
  attributeTypes: state.ui.attributeTypes,
  displayMessage: (msg, opts) => displayMessage(msg, opts),
  getAttributeName: (key) => get(state.ui.attributeTypes, [key, 'name'], key),
  isFetching: state.navigation.isFetching,
  items: state.navigation.items,
  phaseTypes: state.ui.phaseTypes,
  recordTypes: state.ui.recordTypes,
  templates: state.ui.templates,
});

export default connect(mapStateToProps, mapDispatchToProps)(BulkCreateView);
