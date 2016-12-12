import React from 'react';
import './ImportView.scss';
import _ from 'lodash';
import update from 'immutability-helper';

export class ImportView extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      possibleElements: this.props.values,
      selectedElements: []
    };
  }
  generateImportableElements (elements) {
    let importableElements = [];
    for (const key in elements) {
      if (elements.hasOwnProperty(key)) {
        importableElements.push(
          <div className='col-xs-12'>
            <a key={key} href='' onClick={(e) => this.selectForImport(e, elements[key].id)}>{elements[key].name}</a>
          </div>
        );
      }
    }
    return importableElements;
  }
  selectForImport (e, element) {
    e.preventDefault();
    let newPossibleElements = Object.assign({}, this.state.possibleElements);
    newPossibleElements = _.omit(newPossibleElements, element);
    this.setState(update(this.state, {
      selectedElements: {
        $push: [element]
      },
      possibleElements: {
        $set: newPossibleElements
      }
    }));
  }
  removeFromImport (e, elementIndex) {
    e.preventDefault();
    const { values } = this.props;
    const element = this.state.selectedElements[elementIndex];
    let newPossibleElements = Object.assign({}, this.state.possibleElements);
    newPossibleElements[element] = values[element];
    this.setState(update(this.state, {
      selectedElements: {
        $splice: [[elementIndex, 1]]
      },
      possibleElements: {
        $set: newPossibleElements
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
    const { toggleImportView, values, title, itemsToImportText, targetText } = this.props;
    const importableElements = this.generateImportableElements(this.state.possibleElements);
    return (
      <div className='popup-outer-background' onClick={toggleImportView}>
        <div className='popup-inner-background' onClick={(e) => this.stop(e)}>
          <h3>Tuo {title} {targetText}</h3>
          <div className='col-xs-12 importable-elements'>
            <h5>Valitse listalta tuotavat {itemsToImportText}</h5>
            {importableElements}
          </div>
          <div className='col-xs-12'>
            { this.state.selectedElements.length > 0 &&
              <div>
                <h5>Tuotavat {itemsToImportText}</h5>
                {this.state.selectedElements.map((element, index) => (
                  <a
                    key={index}
                    href=''
                    onClick={(e) => this.removeFromImport(e, index)}
                    className='col-xs-12'>
                    {values[element].name}
                  </a>
                ))}
              </div>
            }
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
      </div>
    );
  }
}

ImportView.propTypes = {
  values: React.PropTypes.object.isRequired,
  level: React.PropTypes.string.isRequired,
  parent: React.PropTypes.string.isRequired,
  title: React.PropTypes.string.isRequired,
  itemsToImportText: React.PropTypes.string.isRequired,
  targetText: React.PropTypes.string.isRequired,
  toggleImportView: React.PropTypes.func.isRequired,
  importItems: React.PropTypes.func.isRequired,
  showItems: React.PropTypes.func.isRequired
};

export default ImportView;
