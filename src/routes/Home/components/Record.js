import React from 'react';
import './Record.scss';
import Attribute from './Attribute';

export class Record extends React.Component {
  constructor (props) {
    super(props);
    this.toggleAttributeVisibility = this.toggleAttributeVisibility.bind(this);
    this.state = {
      showAttributes: false,
      mode: 'view'
    };
  }
  setMode (value) {
    this.setState({ mode: value });
  }
  editRecord () {
    this.setMode('edit');
    this.setState({ showAttributes: true });
  }
  saveRecord () {
    this.setMode('view');
  }
  cancelRecordEdit () {
    this.setMode('view');
  }
  toggleAttributeVisibility () {
    const currentVisibility = this.state.showAttributes;
    const newVisibility = !currentVisibility;
    this.setState({ showAttributes: newVisibility });
  }
  generateDropdown (recordTypes, activeRecord) {
    const options = [];
    for (const key in recordTypes) {
      if (recordTypes.hasOwnProperty(key)) {
        options.push(<option key={key} value={recordTypes[key]}>{recordTypes[key]}</option>);
      }
    }
    return (
      <select className='col-xs-6' defaultValue={activeRecord}>
        {options}
      </select>
    );
  }
  generateAttributes (attributes) {
    const attributeElements = [];
    for (const key in attributes) {
      if (attributes.hasOwnProperty(key)) {
        attributeElements.push(
          <Attribute
            key={key}
            attributeIndex={key}
            attribute={attributes[key]}
            documentState={this.props.documentState}
            attributes={this.props.attributes}
            mode={this.state.mode}
          />);
      }
    };
    return attributeElements;
  }

  render () {
    const { record } = this.props;
    const attributes = this.generateAttributes(record.attributes);
    if (this.state.mode === 'view') {
      return (
        <div className='record row'>
          <div className='col-xs-12'>
            <button className='button pull-right' onClick={this.toggleAttributeVisibility}>
              <span
                className={'fa black-icon ' + (this.state.showAttributes ? 'fa-minus' : 'fa-plus')}
                aria-hidden='true'
              />
            </button>
            <button className='button pull-right' onClick={() => this.editRecord()}>
              <span className='fa fa-edit' />
            </button>
          </div>
          <div className='col-xs-12 col-md-6 col-lg-4 record-entry'>
            <div className='col-xs-6 table-key'>Asiakirjatyypin tarkenne</div>
            <div className='col-xs-6'>{record.name}</div>
          </div>
          <div className='col-xs-12 col-md-6 col-lg-4 record-entry'>
            <div className='col-xs-6 table-key'>Tyyppi</div>
            <div className='col-xs-6'>{this.props.recordTypes[record.type]}</div>
          </div>
          { this.state.showAttributes && attributes }
        </div>
      );
    }
    if (this.state.mode === 'edit') {
      const recordTypeDropdown = this.generateDropdown(this.props.recordTypes, this.props.recordTypes[record.type]);
      return (
        <div className='record row'>
          <div className='col-xs-12 col-md-6 col-lg-4 record-entry'>
            <div className='col-xs-6 table-key'>Asiakirjatyypin tarkenne</div>
            <input className='col-xs-6' defaultValue={record.name} />
          </div>
          <div className='col-xs-12 col-md-6 col-lg-4 record-entry'>
            <div className='col-xs-6 table-key'>Tyyppi</div>
            { recordTypeDropdown }
          </div>
          { this.state.showAttributes && attributes }
          <div className='col-xs-12'>
            <button className='btn btn-primary pull-right' onClick={() => this.saveRecord()}>Tallenna</button>
            <button className='btn btn-default pull-right' onClick={() => this.cancelRecordEdit()}>Peruuta</button>
          </div>
        </div>
      );
    }
  }
}

Record.propTypes = {
  record: React.PropTypes.object.isRequired,
  attributes: React.PropTypes.object.isRequired,
  recordTypes: React.PropTypes.object.isRequired,
  documentState: React.PropTypes.string.isRequired
};

export default Record;
