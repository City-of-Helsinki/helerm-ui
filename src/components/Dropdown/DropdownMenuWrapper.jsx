import React, { useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';

const DropdownMenuWrapper = (props) => {
  const { children, listenEvents, onClickOutside, ...divProps } = props;

  const wrapperRef = useRef(null);

  const handleClickOutside = useCallback(
    (event) => {
      const happenedOutside = wrapperRef.current && !wrapperRef.current.contains(event.target);

      if (happenedOutside) {
        onClickOutside(event);
      }
    },
    [onClickOutside],
  );

  useEffect(() => {
    listenEvents.forEach((name) => {
      document.addEventListener(name, handleClickOutside);
    });

    return () => {
      listenEvents.forEach((name) => {
        document.removeEventListener(name, handleClickOutside);
      });
    };
  }, [handleClickOutside, listenEvents]);

  return (
    <div ref={wrapperRef} {...divProps}>
      {children}
    </div>
  );
};

DropdownMenuWrapper.propTypes = {
  children: PropTypes.node,
  listenEvents: PropTypes.arrayOf(PropTypes.string),
  onClickOutside: PropTypes.func.isRequired,
};

DropdownMenuWrapper.defaultProps = {
  listenEvents: ['mouseup', 'touchend'],
};

export default DropdownMenuWrapper;
