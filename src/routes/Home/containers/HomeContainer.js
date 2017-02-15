import { connect } from 'react-redux';
import {
  fetchNavigation,
  setNavigationVisibility,
  fetchTOS,
  setPhaseVisibility,
  setPhasesVisibility,
  setDocumentState,
  fetchRecordTypes,
  fetchAttributeTypes,
  addAction,
  addRecord,
  addPhase,
  changeOrder,
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
  fetchAttributeTypes,
  addAction,
  addRecord,
  addPhase,
  changeOrder,
  importItems,
  closeMessage
};

const mapStateToProps = (state) => {
  console.log('🍍 navigation', state.home.navigation);
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
