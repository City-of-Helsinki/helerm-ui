import { useEffect, useRef, useState } from 'react';

const useOutsideClick = (showInitially = false) => {
  const ref = useRef(null);
  const [show, setShow] = useState(showInitially);

  useEffect(() => {
    const handleClickOutside = (event) => {
      event.stopPropagation();

      if (ref.current && !ref.current.contains(event.target)) {
        setShow(false);
      }
    };

    document.addEventListener('mouseup', handleClickOutside);
    document.addEventListener('touchend', handleClickOutside);

    return () => {
      document.removeEventListener('mouseup', handleClickOutside);
      document.removeEventListener('touchend', handleClickOutside);
    };
  }, []);

  return { show, setShow, ref };
};

export default useOutsideClick;
