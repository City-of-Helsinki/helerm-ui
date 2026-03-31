import { useEffect, useCallback } from 'react';

const useKeyStrokeSupport = (submit, cancel) => {
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
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};

export default useKeyStrokeSupport;
