import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import Sticky from 'react-sticky-el';
import classnames from 'classnames';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { HEADER_HEIGHT } from '../../../constants';
import Phase from '../../../components/Tos/Phase/Phase';
import TosHeader from '../../../components/Tos/Header/TosHeader';
import ClassificationHeader from '../../../components/Tos/Header/ClassificationHeader';
import ValidationBarContainer from '../../../components/Tos/ValidationBar/ValidationBarContainer';
import VersionData from '../../../components/Tos/Version/VersionData';
import VersionSelector from '../../../components/VersionSelector/VersionSelector';
import RouterPrompt from '../../../components/RouterPrompt/RouterPrompt';
import withRouter from '../../../components/hoc/withRouter';

const ViewTOS = (props) => {
  // State
  const [state, setState] = useState({
    complementingMetaData: false,
    editingMetaData: false,
    isDirty: false,
    scrollTop: HEADER_HEIGHT,
    showCancelEditView: false,
    showCloneView: false,
    showImportView: false,
    showReorderView: false,
    topOffset: 0,
  });

  // Refs
  const phases = useRef({});
  const metadata = useRef(null);
  const header = useRef(null);

  // Extract props we need in effects
  const {
    clearClassification,
    clearTOS,
    fetchTOS,
    params,
    setValidationVisibility,
  } = props;

  // Handlers
  const handleScroll = useCallback(
    (event) => {
      const element = event.srcElement.scrollingElement || event.srcElement.documentElement || {};
      const scrollTop = HEADER_HEIGHT - Math.min(HEADER_HEIGHT, element.scrollTop || 0);
      if (scrollTop >= 0 && scrollTop !== state.scrollTop) {
        setState((prev) => ({ ...prev, scrollTop }));
      }
    },
    [state.scrollTop],
  );

  const updateTopOffsetForSticky = useCallback(() => {
    const menuEl = document.getElementById('navigation-menu');
    const menuHeight = menuEl ? menuEl.getBoundingClientRect().height : 0;
    setState((prev) => ({ ...prev, topOffset: menuHeight }));
  }, []);

  // Effects
  useEffect(() => {
    const { id, version } = params;
    const requestParams = version ? { version } : {};

    fetchTOS(id, requestParams);
    updateTopOffsetForSticky();
    window.addEventListener('resize', updateTopOffsetForSticky);
    document.addEventListener('scroll', handleScroll);

    return () => {
      clearTOS();
      clearClassification();
      setValidationVisibility(false);
      document.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateTopOffsetForSticky);
    };
  }, [
    clearClassification,
    clearTOS,
    fetchTOS,
    params,
    setValidationVisibility,
    handleScroll,
    updateTopOffsetForSticky,
  ]);

  // Main render logic
  const { selectedTOS } = props;
  if (!props.isFetching && selectedTOS.id) {
    const headerHeight = header.current ? header.current.clientHeight : 0;
    const phasesOrder = Object.keys(selectedTOS.phases);

    const phaseElements = Object.keys(selectedTOS.phases).map((key) => {
      if (Object.hasOwn(selectedTOS.phases, key)) {
        return (
          <Phase
            key={key}
            phaseIndex={selectedTOS.phases[key].id}
            phase={selectedTOS.phases[key]}
            phasesOrder={phasesOrder}
            setActionVisibility={props.setActionVisibility}
            setPhaseAttributesVisibility={props.setPhaseAttributesVisibility}
            setPhaseVisibility={props.setPhaseVisibility}
            setRecordVisibility={props.setRecordVisibility}
            actions={selectedTOS.actions}
            actionTypes={props.actionTypes}
            phases={selectedTOS.phases}
            phaseTypes={props.phaseTypes}
            records={selectedTOS.records}
            recordTypes={props.recordTypes}
            documentState={selectedTOS.documentState}
            attributeTypes={props.attributeTypes}
            addAction={props.addAction}
            addRecord={props.addRecord}
            editAction={props.editAction}
            editActionAttribute={props.editActionAttribute}
            editPhase={props.editPhase}
            editPhaseAttribute={props.editPhaseAttribute}
            editRecord={props.editRecord}
            editRecordAttribute={props.editRecordAttribute}
            removeAction={props.removeAction}
            removePhase={props.removePhase}
            removeRecord={props.removeRecord}
            displayMessage={props.displayMessage}
            changeOrder={props.changeOrder}
            importItems={props.importItems}
            ref={(element) => {
              phases.current[key] = element;
            }}
          />
        );
      }
      return null;
    }).filter(Boolean);

    return (
      <DndProvider backend={HTML5Backend} context={window}>
        <div key={`${props.params.id}.${props.params.version}`}>
          <RouterPrompt when={state.isDirty} onOK={() => true} onCancel={() => false} />
          <div className='col-xs-12 single-tos-container'>
            <div id='single-tos-header-container' ref={header}>
              <Sticky
                topOffset={-1 * state.topOffset}
                stickyStyle={{
                  position: 'fixed',
                  top: state.topOffset,
                  left: 0,
                }}
                stickyClassName='single-tos-header-sticky'
              >
                <div className='single-tos-header-wrapper'>
                  <TosHeader
                    cancelEdit={() => setState({ showCancelEditView: true })}
                    classification={props.classification}
                    classificationId={selectedTOS.classification.id}
                    documentState={selectedTOS.documentState}
                    fetchTos={props.fetchTOS}
                    functionId={selectedTOS.function_id}
                    isValidationBarVisible={props.showValidationBar}
                    name={selectedTOS.name}
                    state={selectedTOS.state}
                    setTosVisibility={props.setTosVisibility}
                    setValidationVisibility={props.setValidationVisibility}
                    tosId={selectedTOS.id}
                    versions={selectedTOS.version_history}
                  />
                </div>
              </Sticky>
            </div>
            <div className='single-tos-wrapper'>
              <div className={classnames([props.showValidationBar ? 'col-xs-9 validation-bar-open' : 'col-xs-12'])}>
                <div className='single-tos-content'>
                  <ClassificationHeader
                    classification={props.classification}
                    isOpen={selectedTOS.is_classification_open}
                    setVisibility={props.setClassificationVisibility}
                  />
                  <VersionSelector
                    versionId={selectedTOS.id}
                    currentVersion={selectedTOS.version}
                    versions={selectedTOS.version_history}
                    onChange={(item) => props.navigate(`/view-tos/${selectedTOS.id}/version/${item.value}`)}
                    label='Käsittelyprosessin versio:'
                  />
                  <VersionData
                    attributeTypes={props.attributeTypes}
                    displayMessage={props.displayMessage}
                    editValidDates={props.editValidDates}
                    selectedTOS={selectedTOS}
                    setVersionVisibility={props.setVersionVisibility}
                  />
                  <div className='row tos-metadata-header' ref={metadata}>
                    <div className='col-xs-6'>
                      <h4>Käsittelyprosessin tiedot</h4>
                    </div>
                  </div>
                  {phaseElements}
                </div>
              </div>
              {props.showValidationBar && (
                <div className='col-xs-3 validation-bar-container'>
                  <ValidationBarContainer
                    top={headerHeight + state.scrollTop}
                    scrollToMetadata={() => {
                      if (metadata.current) {
                        window.scrollTo(0, metadata.current.offsetTop + HEADER_HEIGHT);
                      }
                    }}
                    scrollToType={(type, id) => {
                      if (type === 'phase' && phases.current[id]) {
                        phases.current[id].scrollToPhase();
                      }
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </DndProvider>
    );
  }

  return null;
};

ViewTOS.propTypes = {
  actionTypes: PropTypes.object.isRequired,
  addAction: PropTypes.func.isRequired,
  addRecord: PropTypes.func.isRequired,
  attributeTypes: PropTypes.object.isRequired,
  changeOrder: PropTypes.func.isRequired,
  classification: PropTypes.object,
  clearClassification: PropTypes.func.isRequired,
  clearTOS: PropTypes.func.isRequired,
  displayMessage: PropTypes.func.isRequired,
  editAction: PropTypes.func.isRequired,
  editActionAttribute: PropTypes.func.isRequired,
  editPhase: PropTypes.func.isRequired,
  editPhaseAttribute: PropTypes.func.isRequired,
  editRecord: PropTypes.func.isRequired,
  editRecordAttribute: PropTypes.func.isRequired,
  editValidDates: PropTypes.func.isRequired,
  fetchTOS: PropTypes.func.isRequired,
  importItems: PropTypes.func.isRequired,
  isFetching: PropTypes.bool.isRequired,
  navigate: PropTypes.func.isRequired,
  params: PropTypes.object.isRequired,
  phaseTypes: PropTypes.object.isRequired,
  recordTypes: PropTypes.object.isRequired,
  removeAction: PropTypes.func.isRequired,
  removePhase: PropTypes.func.isRequired,
  removeRecord: PropTypes.func.isRequired,
  selectedTOS: PropTypes.object.isRequired,
  setActionVisibility: PropTypes.func.isRequired,
  setClassificationVisibility: PropTypes.func.isRequired,
  setNavigationVisibility: PropTypes.func.isRequired,
  setPhaseAttributesVisibility: PropTypes.func.isRequired,
  setPhaseVisibility: PropTypes.func.isRequired,
  setRecordVisibility: PropTypes.func.isRequired,
  setTosVisibility: PropTypes.func.isRequired,
  setValidationVisibility: PropTypes.func.isRequired,
  setVersionVisibility: PropTypes.func.isRequired,
  showValidationBar: PropTypes.bool.isRequired,
};

export default withRouter(ViewTOS);
