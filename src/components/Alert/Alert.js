import React from 'react';
import './Alert.scss';

export const Alert = ({ message, style, action, actionMessage }) => (
  <span className={'alert alert-dismissible alert-position ' + style}>
    { message }
    <a className='alert-link' onClick={action}> { actionMessage } </a>
    <button className='btn btn-default btn-xs alert-close-button' onClick={close}>
      <span className='fa fa-close' />
    </button>
  </span>
);

Alert.propTypes = {
  message: React.PropTypes.string.isRequired,
  style: React.PropTypes.string.isRequired,
  action: React.PropTypes.func,
  actionMessage: React.PropTypes.string
};

export default Alert;
