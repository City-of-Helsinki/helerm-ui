import React from 'react';
import './TOSMetadata.scss';

export class TOSMetadata extends React.Component {
  constructor (props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.generateInput = this.generateInput.bind(this);
    this.state = {
      name: this.props.name,
      mode: this.props.mode
    };
  }
  componentWillReceiveProps (nextProps) {
    this.setState({ mode: nextProps.mode });
  }
  onChange (event) {
    this.setState({ name: event.target.value });
  }
  generateInput (input) {
    if (input.values.length) {
      const options = input.values.map((option, index) => {
        return <option key={index} value={option.value}>{option.value}</option>;
      });
      return (
        <select className='col-xs-6 metadata-input' value={this.state.name} onChange={this.onChange}>
          { options }
        </select>
      );
    } else if (input.values.length === 0) {
      return (
        <input
          className='col-xs-6 metadata-input'
          value={this.state.name}
          onChange={this.onChange}
        />
      );
    } else {
      return null;
    }
  }
  render () {
    const { name, type, typeIndex, editable } = this.props;
    if (editable === false) {
      return (
        <div className='metadata-row'>{type}: {this.state.name}</div>
      );
    }
    if (this.state.mode === 'view') {
      return (
        <div className='metadata-row'>{type}: {this.state.name}</div>
      );
    } else if (this.state.mode === 'edit') {
      const metadataInput = this.generateInput(this.props.attributes[typeIndex], name);
      return (
        <div className='metadata-input-wrapper metadata-row'>
          <label className='metadata-input-label'>{type}: </label>
          { metadataInput }
        </div>
      );
    } else {
      return null;
    }
  }
}

TOSMetadata.propTypes = {
  typeIndex: React.PropTypes.string,
  attributes: React.PropTypes.object,
  type: React.PropTypes.string.isRequired,
  name: React.PropTypes.string.isRequired,
  mode: React.PropTypes.string.isRequired,
  editable: React.PropTypes.bool.isRequired
};

export default TOSMetadata;
