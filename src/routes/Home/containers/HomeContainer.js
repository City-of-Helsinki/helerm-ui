import { connect } from 'react-redux';
import { getNavigationMenuItems, fetchTOS } from '../modules/home';
import HomeView from '../components/HomeView';

const mapDispatchToProps = {
  getNavigationMenuItems,
  fetchTOS
};

const mapStateToProps = (state) => {
  return {
    navigationMenuItems : state.home.navigationMenuItems,
    selectedTOSData : state.home.selectedTOSData.data
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeView);
