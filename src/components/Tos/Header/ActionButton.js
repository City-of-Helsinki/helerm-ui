import React, { PropTypes } from 'react';
import classname from 'classnames';

const ActionButton = ({ type, action, label, ...rest }) => (
  <button
    disabled={rest.disabled}
    className={classname('btn', `btn-${type}`, `${rest.className}`)}
    onClick={action}>
    {label}
  </button>
);

ActionButton.propTypes = {
  action: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  type: PropTypes.string
};

export default ActionButton;
