import { connect } from 'react-redux';

import {
  fetchNavigation,
  setNavigationVisibility
} from '../../Navigation/modules/navigation';

import {
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
  return {
    navigation: state.navigation,
    recordTypes: state.home.recordTypes,
    selectedTOS: state.tos,
    phases: state.tos.phases,
    actions: state.tos.actions,
    records: state.tos.records,
    selectedTOSPath: state.tos.path,
    isFetching: state.home.isFetching,
    documentState: state.tos.documentState,
    isFetching: state.home.isFetching || state.navigation.isFetching,
    attributeTypes: state.home.attributeTypes,
    message: state.home.message
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeView);
