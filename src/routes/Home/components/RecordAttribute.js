import React from 'react';
import './Attribute.scss';

export class RecordAttribute extends React.Component {
  constructor (props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.state = {
      attribute: ''
    };
  }
  componentWillMount () {
    this.setState({ attribute: this.props.recordName });
  }
  onChange (event) {
    this.setState({ attribute: event.target.value });
  }
  generateInput (name, type) {
    if (type === '') {
      return <input className='col-xs-6 form-control edit-record__input'
        value={this.state.attribute} onChange={this.onChange} />;
    } else {
      return this.generateDropdown(this.props.recordTypes, type);
    }
  }
  generateDropdown (recordTypes, activeRecord) {
    const options = [];
    for (const key in recordTypes) {
      if (recordTypes.hasOwnProperty(key)) {
        options.push(<option key={key} value={recordTypes[key]}>{recordTypes[key]}</option>);
      }
    }
    return (
      <select className='col-xs-6 form-control edit-record__select'
        value={this.state.attribute} onChange={this.onChange}>
        <option value={null}>[ Tyhjä ]</option>
        {options}
      </select>
    );
  }
  render () {
    const { recordName, recordKey, recordType } = this.props;
    if (this.props.mode === 'view') {
      return (
        <div className='record-entry col-xs-12 col-md-6 col-lg-4'>
          <div className='table-key'>
            {recordKey}
          </div>
          <div className=''>
            {this.state.attribute}
          </div>
        </div>
      );
    }
    if (this.props.mode === 'edit') {
      const inputField = this.generateInput(recordName, recordType);
      return (
        <div className='col-xs-12 col-md-6 col-lg-4 record-entry'>
          <div className='table-key'>{recordKey}</div>
          { inputField }
        </div>
      );
    }
  }
}

RecordAttribute.propTypes = {
  recordName: React.PropTypes.string.isRequired,
  recordType: React.PropTypes.string.isRequired,
  recordKey: React.PropTypes.string.isRequired,
  recordTypes: React.PropTypes.object.isRequired,
  documentState: React.PropTypes.string.isRequired,
  mode: React.PropTypes.string.isRequired
};

export default RecordAttribute;
