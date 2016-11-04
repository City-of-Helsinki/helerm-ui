import { connect } from 'react-redux';
import {
  fetchNavigation,
  setNavigationVisibility,
  fetchTOS,
  setPhaseVisibility,
  setPhasesVisibility,
  setRecordVisibility,
  setDocumentState,
  fetchRecordTypes,
  fetchAttributes,
  addAction,
  addRecord
} from '../modules/home';
import HomeView from '../components/HomeView';

const mapDispatchToProps = {
  fetchNavigation,
  setNavigationVisibility,
  fetchTOS,
  setPhaseVisibility,
  setRecordVisibility,
  setPhasesVisibility,
  setDocumentState,
  fetchRecordTypes,
  fetchAttributes,
  addAction,
  addRecord
};

const mapStateToProps = (state) => {
  return {
    navigation: state.home.navigation,
    recordTypes: state.home.recordTypes,
    selectedTOS: state.home.selectedTOS.data,
    selectedTOSPath: state.home.selectedTOS.path,
    isFetching: state.home.isFetching,
    documentState: state.home.selectedTOS.documentState,
    attributes: state.home.attributes
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeView);
