import { connect } from 'react-redux';
import { getNavigationMenuItems, fetchTOS, togglePhaseVisibility, setPhasesVisibility } from '../modules/home';
import HomeView from '../components/HomeView';

const mapDispatchToProps = {
  getNavigationMenuItems,
  fetchTOS,
  togglePhaseVisibility,
  setPhasesVisibility
};

const mapStateToProps = (state) => {
  return {
    navigationMenuItems : state.home.navigationMenuItems,
    selectedTOSData : state.home.selectedTOSData.data,
    isFetching : state.home.selectedTOSData.isFetching
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeView);
