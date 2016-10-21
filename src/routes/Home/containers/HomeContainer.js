import { connect } from 'react-redux';
import { getNavigationMenuItems } from '../modules/home';
import HomeView from '../components/HomeView';

const mapDispatchToProps = {
  getNavigationMenuItems
};

const mapStateToProps = (state) => {
  return {
    navigationMenuItems : state.home.navigationMenuItems
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeView);
