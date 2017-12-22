import React, { PropTypes } from 'react';
import classnames from 'classnames';

const ClassificationButton = ({ type, action, label, style, ...rest }) => (
  <button
    disabled={rest.disabled}
    style={style}
    className={classnames('btn', `btn-${type}`, `${rest.className}`)}
    onClick={action}>
    {rest.icon && <i className={classnames('fa', `${rest.icon}`)}/>} {label}
  </button>
);

ClassificationButton.propTypes = {
  action: PropTypes.func.isRequired,
  icon: PropTypes.string,
  label: PropTypes.string.isRequired,
  style: PropTypes.object,
  type: PropTypes.string
};

export default ClassificationButton;
