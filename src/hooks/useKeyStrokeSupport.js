import { useEffect, useCallback, useRef } from 'react';

const useKeyStrokeSupport = (submit, cancel) => {
  const elementRef = useRef(null);

  const handleKeyDown = useCallback(
    (e) => {
      // Support both modern e.key and legacy e.keyCode
      const isEnter = e.key === 'Enter' || e.keyCode === 13;
      const isEscape = e.key === 'Escape' || e.keyCode === 27;

      if (isEnter) {
        submit(e);
      } else if (isEscape) {
        cancel(e);
      }
    },
    [submit, cancel],
  );

  useEffect(() => {
    const element = elementRef.current;

    if (!element) return;

    element.addEventListener('keydown', handleKeyDown);

    // eslint-disable-next-line consistent-return
    return () => {
      element.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return elementRef;
};

export default useKeyStrokeSupport;
