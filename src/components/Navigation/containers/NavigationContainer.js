import { connect } from 'react-redux';

import { fetchNavigation } from '../modules/navigation';

import Navigation from '../components/Navigation';

const mapDispatchToProps = {
  fetchNavigation
};

const mapStateToProps = (state) => {
  return {
    isFetching: state.navigation.isFetching,
    items: state.navigation.items,
    is_open: state.navigation.is_open
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Navigation);
