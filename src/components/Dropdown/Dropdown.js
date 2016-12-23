import React from 'react';
import './Dropdown.scss';

export class Dropdown extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      open: false
    };
  }
  handleClick (index) {
    this.setState({ open: false });
    this.props.children[index].action();
  }
  generateRows (dropdownItems) {
    return dropdownItems.map((item, index) => {
      return (
        <button
          key={index}
          className={'btn btn-sm dropdown-row ' + item.style}
          onClick={() => this.handleClick(index)}>
          <span className={'fa dropdown-icon ' + item.icon} />
          {item.text}
        </button>
      );
    });
  }
  render () {
    const { children, small, extraSmall } = this.props;
    const dropdownRows = this.generateRows(children);
    return (
      <span className='dropdown-wrapper' onBlur={() => setTimeout(() => this.setState({ open: false }), 180)}>
        <button
          className={
            'btn btn-primary ' +
            (small ? 'btn-sm' : '') +
            (extraSmall ? 'btn-xs' : '')
          }
          onClick={() => this.setState({ open: !this.state.open })}
          >
          <span className='fa fa-bars' />
        </button>
        { this.state.open &&
          <div className={'dropdown-items ' + (extraSmall ? 'items-xs' : '')}>
            {dropdownRows}
          </div>
        }
      </span>
    );
  }
};

Dropdown.propTypes = {
  children: React.PropTypes.array.isRequired,
  small: React.PropTypes.bool,
  extraSmall: React.PropTypes.bool
};

export default Dropdown;
