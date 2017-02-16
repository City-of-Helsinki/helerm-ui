import React from 'react';
import './ImportView.scss';
import _ from 'lodash';
import update from 'immutability-helper';

export class ImportView extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      phasesOrder: this.props.phasesOrder,
      selectedElements: [],
      values: this.props[this.props.level + 's']
    };
  }

  generateImportableElements (level) {
    let elements;
    switch (level) {
      case 'phase':
        elements = this.generateLinks(this.props.phases, this.state.phasesOrder);
        break;
      case 'action':
        elements = this.generateActionItems();
        break;
      case 'record':
        elements = this.generateRecordItems();
        break;
      default:
        null;
    }
    return elements;
  }

  generateActionItems () {
    const { phases, phasesOrder } = this.props;
    return phasesOrder.map(phase => {
      const actionElements = this.generateLinks(this.props.actions, phases[phase].actions);
      return (
        <div key={phases[phase].id} className='col-xs-12'>
          <span>{phases[phase].name}</span>
          { actionElements }
        </div>
      );
    });
  }

  generateRecordItems () {
    const { phases, phasesOrder, actions } = this.props;
    return phasesOrder.map(phase => {
      let actionElements;
      if (_.keys(phases[phase].actions).length > 0) {
        actionElements = phases[phase].actions.map(action => {
          if (_.keys(actions[action].records).length > 0) {
            const recordElements = this.generateLinks(this.props.records, actions[action].records);
            return (
              <div key={actions[action].id} className='import-action-record-wrapper'>
                <span className='import-row-title import-action-title'>{actions[action].name}</span>
                { recordElements }
              </div>
            );
          }
        });
      }
      let phaseTitle;
      if (phases[phase].actions.length > 0) {
        phaseTitle = <span className='import-row-title import-phase-title'>{phases[phase].name}</span>;
      }
      return (
        <div key={phases[phase].id} className='import-wrapper'>
          { phaseTitle }
          { actionElements }
        </div>
      );
    });
  }

  generateLinks (values, items) {
    let links = [];
    for (const key in items) {
      if (items.hasOwnProperty(key)) {
        links.push(
          <div key={key} className='col-xs-12'>
            <a
              key={key}
              href=''
              onClick={(e) => this.selectForImport(e, values[items[key]].id)}>{values[items[key]].name}
            </a>
          </div>
        );
      }
    }
    return links;
  }

  selectForImport (e, element) {
    e.preventDefault();
    this.setState(update(this.state, {
      selectedElements: {
        $push: [element]
      }
    }));
  }

  removeFromImport (e, elementIndex) {
    e.preventDefault();
    this.setState(update(this.state, {
      selectedElements: {
        $splice: [[elementIndex, 1]]
      }
    }));
  }

  importItems () {
    const { level, parent, importItems, toggleImportView, showItems } = this.props;
    const newElements = this.state.selectedElements;
    newElements.map(element => {
      importItems(element, level, parent);
    });
    if (typeof showItems === 'function') {
      showItems();
    }
    toggleImportView();
  }

  stop (e) {
    e.stopPropagation();
  }

  render () {
    const { level, toggleImportView, title, itemsToImportText, targetText } = this.props;
    const importableElements = this.generateImportableElements(level);
    return (
      <div className='row'>
        <h3>Tuo {title} {targetText}</h3>
        <h5 className='col-xs-6'>Valitse listalta tuotavat {itemsToImportText}</h5>
        <h5 className='col-xs-6'>Tuotavat {itemsToImportText}</h5>
        <div className='col-xs-12'>
          <div className='col-xs-6 importable-elements '>
            {importableElements}
          </div>
          <div className='col-xs-6 importable-elements '>
            { this.state.selectedElements.length > 0 &&
            <div>
              {this.state.selectedElements.map((element, index) => (
                <a
                  key={index}
                  href=''
                  onClick={(e) => this.removeFromImport(e, index)}
                  className='col-xs-12'>
                  {this.state.values[element].name}
                </a>
              ))}
            </div>
            }
          </div>
        </div>
        <div className='col-xs-12 button-row'>
          <button
            onClick={() => this.importItems()}
            className='btn btn-primary pull-right'>
            Tuo
          </button>
          <button onClick={toggleImportView} className='btn btn-danger pull-right'>Peruuta</button>
        </div>
      </div>
    );
  }
}

ImportView.propTypes = {
  actions: React.PropTypes.object.isRequired,
  importItems: React.PropTypes.func.isRequired,
  itemsToImportText: React.PropTypes.string.isRequired,
  level: React.PropTypes.string.isRequired,
  parent: React.PropTypes.string,
  phases: React.PropTypes.object.isRequired,
  phasesOrder: React.PropTypes.array.isRequired,
  records: React.PropTypes.object.isRequired,
  showItems: React.PropTypes.func,
  targetText: React.PropTypes.string.isRequired,
  title: React.PropTypes.string.isRequired,
  toggleImportView: React.PropTypes.func.isRequired
};

export default ImportView;
