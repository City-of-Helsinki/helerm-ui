import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { push } from 'react-router-redux';
import { isEmpty } from 'lodash';

import { fetchNavigation, setNavigationVisibility } from './reducer';

import { itemById } from '../../utils/helpers';

import Navigation from './Navigation';

const mapDispatchToProps = (dispatch) => {
  return {
    fetchNavigation: bindActionCreators(fetchNavigation, dispatch),
    push: (path) => dispatch(push(path)),
    setNavigationVisibility: bindActionCreators(setNavigationVisibility, dispatch)
  };
};

const mapStateToProps = (state, ownProps) => {
  const { items, timestamp } = state.navigation;
  const { attributeTypes } = state.ui;
  const { selectedTOS, classification } = state;
  const tos = selectedTOS.classification ? itemById(items, selectedTOS.classification) : classification.id ? itemById(items, classification.id) : null;
  const tosPath = ownProps.tosPath ? ownProps.tosPath : tos ? tos.path : [];

  return {
    attributeTypes,
    tosPath,
    is_open: state.navigation.is_open,
    isFetching: state.navigation.isFetching,
    isUser: !isEmpty(state.user.data),
    items, // TODO: Unhack this when Navigation doesn't mutate state
    itemsTimestamp: timestamp,
    selectedTOS
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Navigation));
