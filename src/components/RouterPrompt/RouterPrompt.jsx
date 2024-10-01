import { Button, Dialog } from 'hds-react';
import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useBlocker, useLocation } from 'react-router-dom';

const RouterPrompt = ({ when, onOK, onCancel }) => {
  const [shouldBlock, setShouldBlock] = useState(when);
  const [showPrompt, setShowPrompt] = useState(false);

  const { pathname } = useLocation();

  const { location, proceed, reset } = useBlocker(
    ({ currentLocation, nextLocation }) => shouldBlock && currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    if (shouldBlock && location?.pathname && pathname !== location?.pathname) {
      setShowPrompt(true);
    }
  }, [pathname, location, shouldBlock]);

  useEffect(() => {
    if (when) {
      setShouldBlock(true);
    } else {
      setShouldBlock(false);
    }

    return () => {
      setShouldBlock(false);
    };
  }, [location, when]);

  const handleOK = useCallback(async () => {
    if (onOK) {
      const canRoute = await Promise.resolve(onOK());

      if (canRoute) {
        setShouldBlock(false);

        proceed();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onOK]);

  const handleCancel = useCallback(async () => {
    if (onCancel) {
      const canRoute = await Promise.resolve(onCancel());

      if (canRoute) {
        setShouldBlock(false);

        reset();
      }
    }
    setShowPrompt(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onCancel]);

  if (!showPrompt) {
    return null;
  }

  const titleId = 'navigation-prompt-title';
  const descriptionId = 'navigation-prompt-description';

  return (
    <Dialog
      close={handleCancel}
      isOpen={showPrompt}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      closeButtonLabelText='Sulje'
    >
      <Dialog.Header id={titleId} title='Muutoksia ei ole tallennettu' />
      <Dialog.Content>Muutoksia ei ole tallennettu, haluatko silti jatkaa?</Dialog.Content>
      <Dialog.ActionButtons>
        <Button onClick={handleOK}>Jatka</Button>
        <Button onClick={handleCancel} variant='secondary'>
          Peruuta
        </Button>
      </Dialog.ActionButtons>
    </Dialog>
  );
};

RouterPrompt.propTypes = {
  when: PropTypes.bool.isRequired,
  onOK: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default RouterPrompt;
