import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';

const Sticky = ({
  children,
  topOffset = 0,
  bottomOffset = 0,
  stickyClassName = '',
  className = '',
  stickyStyle = {},
  hideOnBoundaryHit = false,
  boundaryElement = null,
  positionRecheckInterval = 0,
  disabled = false,
}) => {
  const [isSticky, setIsSticky] = useState(false);
  const [holderStyles, setHolderStyles] = useState({});
  const [wrapperStyles, setWrapperStyles] = useState({});

  const holderRef = useRef(null);
  const wrapperRef = useRef(null);
  const originalPositionRef = useRef(null);
  const boundaryElementRef = useRef(null);
  const intervalIdRef = useRef(null);

  const checkPosition = useCallback(() => {
    if (disabled || !holderRef.current || !wrapperRef.current) {
      return;
    }

    const holder = holderRef.current;
    const wrapper = wrapperRef.current;
    const holderRect = holder.getBoundingClientRect();
    const wrapperRect = wrapper.getBoundingClientRect();

    // Store original position on first check
    if (!originalPositionRef.current) {
      originalPositionRef.current = {
        top: holderRect.top + window.scrollY,
        left: holderRect.left + window.scrollX,
        width: holderRect.width,
        height: wrapperRect.height,
      };
    }

    const {
      top: originalTop,
      left: originalLeft,
      width: originalWidth,
      height: originalHeight,
    } = originalPositionRef.current;
    const scrollTop = window.scrollY;
    const shouldBeSticky = scrollTop + topOffset > originalTop;

    // Check boundary element constraints
    let withinBoundary = true;
    if (boundaryElement && boundaryElementRef.current) {
      const boundaryRect = boundaryElementRef.current.getBoundingClientRect();
      const boundaryTop = boundaryRect.top + window.scrollY;
      const boundaryBottom = boundaryTop + boundaryRect.height;

      if (hideOnBoundaryHit) {
        withinBoundary =
          scrollTop + topOffset >= boundaryTop &&
          scrollTop + topOffset + originalHeight + bottomOffset <= boundaryBottom;
      }
    }

    const newIsSticky = shouldBeSticky && withinBoundary && !disabled;

    if (newIsSticky !== isSticky) {
      setIsSticky(newIsSticky);

      if (newIsSticky) {
        // Apply sticky styles
        const newWrapperStyles = {
          position: 'fixed',
          top: `${topOffset}px`,
          left: `${originalLeft}px`,
          width: `${originalWidth}px`,
          zIndex: 1000,
          ...stickyStyle,
        };

        const newHolderStyles = {
          height: `${originalHeight}px`,
        };

        setWrapperStyles(newWrapperStyles);
        setHolderStyles(newHolderStyles);
      } else {
        // Remove sticky styles
        setWrapperStyles({});
        setHolderStyles({});
      }
    }
  }, [disabled, topOffset, bottomOffset, hideOnBoundaryHit, stickyStyle, isSticky, boundaryElement]);

  const updateBoundaryElement = useCallback(() => {
    if (boundaryElement && typeof boundaryElement === 'string') {
      boundaryElementRef.current = document.querySelector(boundaryElement);
    } else if (boundaryElement?.nodeType) {
      boundaryElementRef.current = boundaryElement;
    } else {
      boundaryElementRef.current = null;
    }
  }, [boundaryElement]);

  useEffect(() => {
    updateBoundaryElement();

    // Initial position check
    checkPosition();

    // Set up event listeners
    const handleScroll = () => checkPosition();
    const handleResize = () => {
      // Only reset original position if not currently sticky
      if (!isSticky) {
        originalPositionRef.current = null;
      }
      setTimeout(checkPosition, 0);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    // Set up interval if specified
    if (positionRecheckInterval > 0) {
      intervalIdRef.current = setInterval(checkPosition, positionRecheckInterval);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);

      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, [checkPosition, positionRecheckInterval, updateBoundaryElement, isSticky]);

  // Update boundary element when it changes
  useEffect(() => {
    updateBoundaryElement();
  }, [updateBoundaryElement]);

  const holderClassName = [className, isSticky ? stickyClassName : ''].filter(Boolean).join(' ');

  return (
    <div ref={holderRef} style={holderStyles} className={holderClassName}>
      <div ref={wrapperRef} style={wrapperStyles}>
        {children}
      </div>
    </div>
  );
};

Sticky.propTypes = {
  children: PropTypes.node.isRequired,
  topOffset: PropTypes.number,
  bottomOffset: PropTypes.number,
  stickyClassName: PropTypes.string,
  className: PropTypes.string,
  stickyStyle: PropTypes.object,
  hideOnBoundaryHit: PropTypes.bool,
  boundaryElement: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  positionRecheckInterval: PropTypes.number,
  disabled: PropTypes.bool,
};

export default Sticky;
