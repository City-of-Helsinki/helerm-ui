import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { push } from 'react-router-redux';
import { displayMessage } from '../../../utils/helpers';
import { isEmpty } from 'lodash';

import { login } from '../../Login/reducer';

import { setNavigationVisibility } from '../../Navigation/reducer';

import {
  changeStatus,
  clearTOS,
  editMetaData,
  editValidDates,
  fetchTOS,
  resetTOS,
  saveDraft,
  setDocumentState,
  setMetadataVisibility,
  setTosVisibility
} from '../reducer';

import {
  addAction,
  editAction,
  editActionAttribute,
  removeAction,
  setActionVisibility
} from '../Action/reducer';

import {
  addPhase,
  editPhase,
  editPhaseAttribute,
  removePhase,
  setPhaseAttributesVisibility,
  setPhasesVisibility,
  setPhaseVisibility
} from '../Phase/reducer';

import {
  addRecord,
  editRecord,
  editRecordAttribute,
  removeRecord,
  setRecordVisibility
} from '../Record/reducer';

import { importItems } from '../ImportView/reducer';
import { cloneFromTemplate } from '../CloneView/reducer';
import { changeOrder } from '../Reorder/reducer';
import { setValidationVisibility } from '../ValidationBar/reducer';

import ViewTOS from './ViewTos';

const mapDispatchToProps = dispatch => ({
  addAction: bindActionCreators(addAction, dispatch),
  addPhase: bindActionCreators(addPhase, dispatch),
  addRecord: bindActionCreators(addRecord, dispatch),
  changeOrder: bindActionCreators(changeOrder, dispatch),
  changeStatus: bindActionCreators(changeStatus, dispatch),
  clearTOS: bindActionCreators(clearTOS, dispatch),
  cloneFromTemplate: bindActionCreators(cloneFromTemplate, dispatch),
  displayMessage: (msg, opts) => displayMessage(msg, opts),
  editMetaData: bindActionCreators(editMetaData, dispatch),
  editPhase: bindActionCreators(editPhase, dispatch),
  editPhaseAttribute: bindActionCreators(editPhaseAttribute, dispatch),
  editAction: bindActionCreators(editAction, dispatch),
  editActionAttribute: bindActionCreators(editActionAttribute, dispatch),
  editRecord: bindActionCreators(editRecord, dispatch),
  editRecordAttribute: bindActionCreators(editRecordAttribute, dispatch),
  editValidDates: bindActionCreators(editValidDates, dispatch),
  fetchTOS: bindActionCreators(fetchTOS, dispatch),
  importItems: bindActionCreators(importItems, dispatch),
  login: bindActionCreators(login, dispatch),
  push: path => dispatch(push(path)),
  removeAction: bindActionCreators(removeAction, dispatch),
  removePhase: bindActionCreators(removePhase, dispatch),
  removeRecord: bindActionCreators(removeRecord, dispatch),
  resetTOS: bindActionCreators(resetTOS, dispatch),
  saveDraft: bindActionCreators(saveDraft, dispatch),
  setDocumentState: bindActionCreators(setDocumentState, dispatch),
  setActionVisibility: bindActionCreators(setActionVisibility, dispatch),
  setNavigationVisibility: bindActionCreators(
    setNavigationVisibility,
    dispatch
  ),
  setMetadataVisibility: bindActionCreators(setMetadataVisibility, dispatch),
  setPhaseAttributesVisibility: bindActionCreators(setPhaseAttributesVisibility, dispatch),
  setPhasesVisibility: bindActionCreators(setPhasesVisibility, dispatch),
  setPhaseVisibility: bindActionCreators(setPhaseVisibility, dispatch),
  setRecordVisibility: bindActionCreators(setRecordVisibility, dispatch),
  setTosVisibility: bindActionCreators(setTosVisibility, dispatch),
  setValidationVisibility: bindActionCreators(setValidationVisibility, dispatch)
});

const mapStateToProps = state => ({
  actionTypes: state.ui.actionTypes,
  attributeTypes: state.ui.attributeTypes,
  isFetching: state.ui.isFetching || state.selectedTOS.isFetching,
  isUser: !isEmpty(state.user.data),
  items: state.navigation.items,
  phaseTypes: state.ui.phaseTypes,
  recordTypes: state.ui.recordTypes,
  selectedTOS: state.selectedTOS,
  templates: state.ui.templates
});

export default connect(mapStateToProps, mapDispatchToProps)(ViewTOS);
