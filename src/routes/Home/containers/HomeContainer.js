import { connect } from 'react-redux';
import {
  fetchNavigation,
  setNavigationVisibility,
  fetchTOS,
  setPhaseVisibility,
  setPhasesVisibility,
  setDocumentState,
  fetchRecordTypes,
  fetchAttributes,
  fetchValidationRules,
  addAction,
  addRecord,
  addPhase,
  commitOrderChanges,
  importItems,
  closeMessage
} from '../modules/home';
import HomeView from '../components/HomeView';

const mapDispatchToProps = {
  fetchNavigation,
  setNavigationVisibility,
  fetchTOS,
  setPhaseVisibility,
  setPhasesVisibility,
  setDocumentState,
  fetchRecordTypes,
  fetchAttributes,
  fetchValidationRules,
  addAction,
  addRecord,
  addPhase,
  commitOrderChanges,
  importItems,
  closeMessage
};

const mapStateToProps = (state) => {
  return {
    navigation: state.home.navigation,
    recordTypes: state.home.recordTypes,
    selectedTOS: state.home.selectedTOS.tos,
    phases: state.home.selectedTOS.phases,
    actions: state.home.selectedTOS.actions,
    records: state.home.selectedTOS.records,
    selectedTOSPath: state.home.selectedTOS.path,
    isFetching: state.home.isFetching,
    documentState: state.home.selectedTOS.documentState,
    attributeTypes: state.home.attributeTypes,
    message: state.home.message
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeView);
