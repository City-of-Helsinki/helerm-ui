import { useEffect, useCallback, useRef } from 'react';

const useKeyStrokeSupport = (submit, cancel) => {
  const elementRef = useRef(null);

  const handleKeyDown = useCallback(
    (e) => {
      switch (e.keyCode) {
        case 13:
          submit(e);
          break;
        case 27:
          cancel(e);
          break;
        default:
          break;
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
