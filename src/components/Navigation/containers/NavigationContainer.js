import { connect } from 'react-redux';

import { fetchNavigation, setNavigationVisibility } from '../modules/navigation';

import Navigation from '../components/Navigation';

const mapDispatchToProps = {
  fetchNavigation,
  setNavigationVisibility
};

const mapStateToProps = (state) => {
  return {
    is_open: state.navigation.is_open,
    isFetching: state.navigation.isFetching,
    items: state.navigation.items,
    selectedTOS: state.selectedTOS.tos
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Navigation);
