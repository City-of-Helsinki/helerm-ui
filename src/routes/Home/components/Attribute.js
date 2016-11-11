import React from 'react';
import './Attribute.scss';

export class Attribute extends React.Component {
  constructor (props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.submit = this.submit.bind(this);
    this.state = {
      attribute: '',
      mode: this.props.mode
    };
  }
  componentWillMount () {
    this.setState({ attribute: this.props.attribute });
  }
  componentWillReceiveProps (nextProps) {
    if (nextProps.mode) {
      this.setState({ mode: nextProps.mode });
    }
  }
  onChange (event) {
    this.setState({ attribute: event.target.value });
  }
  changeState (newState) {
    if (this.props.documentState === 'edit') {
      this.setState({ mode: newState });
    }
  }
  submit (event) {
    event.preventDefault();
    this.changeState('view');
  }
  generateInput (attribute, currentAttribute) {
    if (attribute.values.length) {
      const options = attribute.values.map((option, index) => {
        return <option key={index} value={option.value}>{option.value}</option>;
      });
      return (
        <select
          className='form-control'
          value={this.state.attribute}
          onChange={this.onChange}
          onBlur={() => this.setState({ mode: 'view' })}
          autoFocus>
          <option value={null}>[ Tyhjä ]</option>
          { options }
        </select>
      );
    } else if (attribute.values.length === 0) {
      return (
        <input
          className='form-control'
          value={this.state.attribute}
          onChange={this.onChange}
          onBlur={this.submit}
          autoFocus
        />
      );
    } else {
      return null;
    }
  }
  render () {
    const { attribute, attributeIndex, showAttributes } = this.props;
    let attributeValue;
    if (this.state.mode === 'view') {
      attributeValue = <div>{this.state.attribute}</div>;
    }
    if (this.state.mode === 'edit') {
      attributeValue = this.generateInput(this.props.attributes[attributeIndex], attribute);
    }
    return (
      <a
        onClick={() => this.changeState('edit')}
        className={'list-group-item col-xs-12 col-md-6 col-lg-4 ' + (showAttributes ? 'visible' : 'hidden')}>
        <span className='table-key'>
          {this.props.attributes[attributeIndex].name}
          { this.state.mode === 'edit' && this.props.attributes[attributeIndex].required &&
            <span className='fa fa-asterisk required-asterisk' />
          }
        </span>
        { attributeValue }
      </a>
    );
  }
}

Attribute.propTypes = {
  attribute: React.PropTypes.string.isRequired,
  attributeIndex: React.PropTypes.string.isRequired,
  attributes: React.PropTypes.object.isRequired,
  documentState: React.PropTypes.string.isRequired,
  showAttributes: React.PropTypes.bool.isRequired,
  mode: React.PropTypes.string.isRequired
};

export default Attribute;
