import { connect } from 'react-redux';
import {
  fetchNavigation,
  setNavigationVisibility,
  fetchTOS,
  togglePhaseVisibility,
  setPhasesVisibility,
  setDocumentState,
  fetchRecordTypes
} from '../modules/home';
import HomeView from '../components/HomeView';

const mapDispatchToProps = {
  fetchNavigation,
  setNavigationVisibility,
  fetchTOS,
  togglePhaseVisibility,
  setPhasesVisibility,
  setDocumentState,
  fetchRecordTypes
};

const mapStateToProps = (state) => {
  return {
    navigation: state.home.navigation,
    recordTypes: state.home.recordTypes,
    selectedTOS: state.home.selectedTOS.data,
    selectedTOSPath: state.home.selectedTOS.path,
    isFetching: state.home.selectedTOS.isFetching,
    documentState: state.home.selectedTOS.documentState
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeView);
