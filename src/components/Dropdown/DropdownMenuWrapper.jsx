import React, { useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';

const DropdownMenuWrapper = ({ children, listenEvents = ['mouseup', 'touchend'], onClickOutside, ...divProps }) => {
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

export default DropdownMenuWrapper;
