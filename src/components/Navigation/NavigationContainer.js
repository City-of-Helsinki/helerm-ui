import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

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
  const { items } = state.navigation;
  const { selectedTOS, classification } = state;
  const tos = selectedTOS.classification ? itemById(items, selectedTOS.classification) : classification.id ? itemById(items, classification.id) : null;
  const tosPath = ownProps.tosPath ? ownProps.tosPath : tos ? tos.path : [];

  return {
    tosPath,
    is_open: state.navigation.is_open,
    isFetching: state.navigation.isFetching,
    items,
    selectedTOS
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Navigation);
