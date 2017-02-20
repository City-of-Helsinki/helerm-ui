import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import { fetchNavigation, setNavigationVisibility } from '../navigationReducer';

import { itemById } from '../../../utils/helpers';

import Navigation from '../components/Navigation';

const mapDispatchToProps = (dispatch) => {
  return {
    fetchNavigation: bindActionCreators(fetchNavigation, dispatch),
    push: (path) => dispatch(push(path)),
    setNavigationVisibility: bindActionCreators(setNavigationVisibility, dispatch)
  };
};

const mapStateToProps = (state) => {
  const { items } = state.navigation;
  const { selectedTOS } = state;
  const tos = selectedTOS.tos.id ? itemById(items, selectedTOS.tos.id) : null;

  return {
    TOSPath: tos ? tos.path : [],
    is_open: state.navigation.is_open,
    isFetching: state.navigation.isFetching,
    items,
    selectedTOS
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Navigation);
