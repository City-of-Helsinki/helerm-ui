import { connect } from 'react-redux';
import { getNavigationMenuItems } from '../modules/navigation';
import Navigation from '../components/Navigation';

const mapDispatchToProps = {
  getNavigationMenuItems
};

const mapStateToProps = (state) => {
  return {
    navigationMenuItems : state.navigation.navigationMenuItems
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(Navigation);
