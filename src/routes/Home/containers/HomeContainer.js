import { connect } from 'react-redux';
import {
  fetchNavigation,
  fetchTOS,
  togglePhaseVisibility,
  setPhasesVisibility,
  setDocumentState,
  fetchRecordTypes
} from '../modules/home';
import HomeView from '../components/HomeView';

const mapDispatchToProps = {
  fetchNavigation,
  fetchTOS,
  togglePhaseVisibility,
  setPhasesVisibility,
  setDocumentState,
  fetchRecordTypes
};

const mapStateToProps = (state) => {
  return {
    navigationMenuItems: state.home.navigationMenuItems,
    recordTypes: state.home.recordTypes,
    selectedTOS: state.home.selectedTOS.data,
    isFetching: state.home.selectedTOS.isFetching,
    documentState: state.home.selectedTOS.documentState
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeView);
