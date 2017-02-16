import { connect } from 'react-redux';

import {
  fetchTOS,
  setPhaseVisibility,
  setPhasesVisibility,
  setDocumentState,
  addAction,
  addRecord,
  addPhase,
  changeOrder,
  importItems
} from '../modules/tos';

import ViewTOS from '../components/ViewTOS';

const mapDispatchToProps = {
  fetchTOS,
  setPhaseVisibility,
  setPhasesVisibility,
  setDocumentState,
  addAction,
  addRecord,
  addPhase,
  changeOrder,
  importItems
};

const mapStateToProps = (state) => {
  return {
    attributeTypes: state.home.attributeTypes,
    recordTypes: state.home.recordTypes,
    selectedTOS: state.selectedTOS.tos,
    phases: state.selectedTOS.phases,
    actions: state.selectedTOS.actions,
    records: state.selectedTOS.records,
    selectedTOSPath: state.selectedTOS.path,
    documentState: state.selectedTOS.documentState,
    isFetching: state.selectedTOS.isFetching
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ViewTOS);
