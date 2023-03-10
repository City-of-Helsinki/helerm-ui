/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

const ActionButton = ({ type, action, label, style, ...rest }) => (
  <button
    type='button'
    disabled={rest.disabled}
    style={style}
    className={classnames('btn', `btn-${type}`, `${rest.className}`)}
    onClick={action}
  >
    {rest.icon && <i className={classnames('fa-solid', `${rest.icon}`)} />} {label}
  </button>
);

ActionButton.propTypes = {
  action: PropTypes.func.isRequired,
  icon: PropTypes.string,
  label: PropTypes.string.isRequired,
  style: PropTypes.object,
  type: PropTypes.string,
};

export default ActionButton;
