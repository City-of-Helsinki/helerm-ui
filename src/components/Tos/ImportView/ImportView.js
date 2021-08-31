import React from 'react';
import PropTypes from 'prop-types';
import './ImportView.scss';
import _ from 'lodash';
import update from 'immutability-helper';

export class ImportView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      phasesOrder: this.props.phasesOrder,
      selectedElements: [],
      values: this.props[this.props.level + 's']
    };
  }

  UNSAFE_componentWillMount() {
    document.body.classList.add('noscroll');
  }

  componentWillUnmount() {
    document.body.classList.remove('noscroll');
  }

  getTargetName(specifier, type) {
    const hasType = type && type.length;
    const hasTypeSpecifier = specifier && specifier.length;
    const slash = hasType && hasTypeSpecifier ? ' / ' : '';

    return (type || '') + slash + (specifier || '');
  }

  generateImportableElements(level) {
    let elements;
    switch (level) {
      case 'phase':
        elements = this.generateLinks(
          this.props.phases,
          this.state.phasesOrder
        );
        break;
      case 'action':
        elements = this.generateActionItems();
        break;
      case 'record':
        elements = this.generateRecordItems();
        break;
      default:
        elements = null;
    }
    return elements;
  }

  generateActionItems() {
    const { phases, phasesOrder } = this.props;
    return phasesOrder.map((phase) => {
      const actionElements = this.generateLinks(
        this.props.actions,
        phases[phase].actions
      );
      return (
        <div key={phases[phase].id} className='col-xs-12'>
          <span className='import-row-title'>
            {this.getTargetName(
              phases[phase].attributes.TypeSpecifier,
              phases[phase].attributes.PhaseType
            )}
          </span>
          <div className='import-action-record-wrapper'>
            {actionElements}
          </div>
        </div>
      );
    });
  }

  generateRecordItems() {
    const { phases, phasesOrder, actions } = this.props;
    return phasesOrder.map((phase) => {
      const actionElements = [];
      if (_.keys(phases[phase].actions).length > 0) {
        phases[phase].actions.forEach((action) => {
          if (_.keys(actions[action].records).length > 0) {
            const recordElements = this.generateLinks(
              this.props.records,
              actions[action].records
            );
            actionElements.push(
              <div
                key={actions[action].id}
                className='import-action-record-wrapper'
              >
                <span className='import-row-title'>
                  {this.getTargetName(
                    actions[action].attributes.TypeSpecifier,
                    actions[action].attributes.ActionType
                  )}
                </span>
                <div className='import-action-record-wrapper'>
                  {recordElements}
                </div>
              </div>
            );
          }
        });
      }
      let phaseTitle;
      if (phases[phase].actions.length > 0) {
        phaseTitle = (
          <span className='import-row-title import-phase-title'>
            {this.getTargetName(
              phases[phase].attributes.TypeSpecifier,
              phases[phase].attributes.PhaseType
            )}
          </span>
        );
      }
      return (
        <div key={phases[phase].id} className='import-wrapper'>
          {phaseTitle}
          {actionElements}
        </div>
      );
    });
  }

  generateLinks(values, items) {
    let links = [];
    let itemsInArray = items;
    if (!items.length) {
      itemsInArray = Object.keys(items); // Because items mutates into object for unknown reason
    }
    Object.keys(itemsInArray).forEach((key) => {
      if (itemsInArray.hasOwnProperty(key)) {
        links.push(
          <div key={key} className='import-row-title'>
            <span
              key={key}
              className='import-row-link'
              onClick={(e) =>
                this.selectForImport(e, values[itemsInArray[key]].id)
              }
            >
              {this.getTargetName(
                values[itemsInArray[key]].attributes.TypeSpecifier,
                values[itemsInArray[key]].attributes[
                  `${_.capitalize(this.props.level)}Type`
                ]
              )}
            </span>
          </div>
        );
      }
    });
    return links;
  }

  selectForImport(e, element) {
    e.preventDefault();
    this.setState(
      update(this.state, {
        selectedElements: {
          $push: [element]
        }
      })
    );
  }

  removeFromImport(e, elementIndex) {
    e.preventDefault();
    this.setState(
      update(this.state, {
        selectedElements: {
          $splice: [[elementIndex, 1]]
        }
      })
    );
  }

  importItems() {
    const {
      level,
      parent,
      importItems,
      toggleImportView,
      showItems
    } = this.props;
    const newElements = this.state.selectedElements;
    newElements.forEach((element) => {
      importItems(element, level, parent);
    });
    if (typeof showItems === 'function') {
      showItems();
    }
    toggleImportView();
  }

  stop(e) {
    e.stopPropagation();
  }

  render() {
    const {
      level,
      toggleImportView,
      title,
      itemsToImportText,
      targetText
    } = this.props;
    const importableElements = this.generateImportableElements(level);

    return (
      <div className='row'>
        <h3>
          Tuo {title} {targetText}
        </h3>
        <h5 className='col-xs-6'>
          Valitse listalta tuotavat {itemsToImportText}
        </h5>
        <h5 className='col-xs-6'>Tuotavat {itemsToImportText}</h5>
        <div className='col-xs-12'>
          <div className='col-xs-6 importable-elements '>
            {importableElements}
          </div>
          <div className='col-xs-6 importable-elements '>
            {this.state.selectedElements.length > 0 && (
              <div>
                {this.state.selectedElements.map((element, index) => (
                  <span
                    key={index}
                    onClick={(e) => this.removeFromImport(e, index)}
                    className='col-xs-12 importable-element-link'
                  >
                    {this.state.values[element].attributes.TypeSpecifier ||
                      this.state.values[element].attributes[
                        `${_.capitalize(this.props.level)}Type`
                      ] ||
                      '-'}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className='col-xs-12 button-row'>
          <button
            onClick={() => this.importItems()}
            className='btn btn-primary pull-right'
          >
            Tuo
          </button>
          <button
            onClick={toggleImportView}
            className='btn btn-danger pull-right'
          >
            Peruuta
          </button>
        </div>
      </div>
    );
  }
}

ImportView.propTypes = {
  actions: PropTypes.object.isRequired,
  importItems: PropTypes.func.isRequired,
  itemsToImportText: PropTypes.string.isRequired,
  level: PropTypes.string.isRequired,
  parent: PropTypes.string,
  phases: PropTypes.object.isRequired,
  phasesOrder: PropTypes.array.isRequired,
  records: PropTypes.object.isRequired,
  showItems: PropTypes.func,
  targetText: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  toggleImportView: PropTypes.func.isRequired
};

export default ImportView;
