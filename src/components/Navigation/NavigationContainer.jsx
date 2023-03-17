import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { push } from 'connected-react-router';
import { isEmpty } from 'lodash';

import { fetchNavigation, setNavigationVisibility } from './reducer';
import { itemById } from '../../utils/helpers';
import Navigation from './Navigation';

const mapDispatchToProps = (dispatch) => ({
  fetchNavigation: bindActionCreators(fetchNavigation, dispatch),
  push: (path) => dispatch(push(path)),
  setNavigationVisibility: bindActionCreators(setNavigationVisibility, dispatch),
});

const getTOS = (selectedTOS, items, classification) => {
  if (selectedTOS.classification) {
    return itemById(items, selectedTOS.classification.id);
  }

  if (classification.id) {
    return itemById(items, classification.id);
  }

  return null;
};

const getTOSPath = (ownProps, tos) => {
  if (ownProps.tosPath) {
    return ownProps.tosPath;
  }

  if (tos) {
    return tos.path;
  }

  return [];
};

const mapStateToProps = (state, ownProps) => {
  const { items, timestamp } = state.navigation;
  const { attributeTypes } = state.ui;
  const { selectedTOS, classification } = state;

  const tos = getTOS(selectedTOS, items, classification);
  const tosPath = getTOSPath(ownProps, tos);

  return {
    attributeTypes,
    tosPath,
    is_open: state.navigation.is_open,
    isFetching: state.navigation.isFetching,
    isUser: !isEmpty(state.user.data),
    items, // TODO: Unhack this when Navigation doesn't mutate state
    itemsTimestamp: timestamp,
    selectedTOS,
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Navigation));
