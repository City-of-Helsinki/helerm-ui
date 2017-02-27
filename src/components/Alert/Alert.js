import React from 'react';
import classNames from 'classnames';
import './Alert.scss';

export const Alert = ({ text, style, action, actionMessage, close }) => (
  <span className={classNames('alert alert-dismissible alert-position', style)}>
    { text }
    <a className='alert-link' onClick={action}> { actionMessage } </a>
    <button className='btn btn-default btn-xs alert-close-button' onClick={close}>
      <span className='fa fa-close'/>
    </button>
  </span>
);

Alert.propTypes = {
  action: React.PropTypes.func,
  actionMessage: React.PropTypes.string,
  close: React.PropTypes.func,
  style: React.PropTypes.string.isRequired,
  text: React.PropTypes.string.isRequired
};

export default Alert;
