import { Button, Dialog } from 'hds-react';
import React, { useCallback, useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useBlocker } from 'react-router-dom';

const RouterPrompt = ({ when, onOK, onCancel }) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const blockerRef = useRef(null);

  const blocker = useBlocker(({ currentLocation, nextLocation }) => {
    if (when && currentLocation.pathname !== nextLocation.pathname) {
      blockerRef.current = { currentLocation, nextLocation };

      setShowPrompt(true);
      return true;
    }

    return false;
  });

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (when) {
        event.preventDefault();
        event.returnValue = 'Muutoksia ei ole tallennettu, haluatko silti jatkaa?';
        return event.returnValue;
      }
      return undefined;
    };

    if (when) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [when]);

  const handleOK = useCallback(async () => {
    setShowPrompt(false);
    if (onOK) {
      const canRoute = await Promise.resolve(onOK());
      if (canRoute && blocker.state === 'blocked') {
        blocker.proceed();
      }
    } else if (blocker.state === 'blocked') {
      blocker.proceed();
    }
  }, [onOK, blocker]);

  const handleCancel = useCallback(async () => {
    setShowPrompt(false);
    if (onCancel) {
      const canRoute = await Promise.resolve(onCancel());
      if (canRoute && blocker.state === 'blocked') {
        blocker.proceed();
      } else if (blocker.state === 'blocked') {
        blocker.reset();
      }
    } else if (blocker.state === 'blocked') {
      blocker.reset();
    }
  }, [onCancel, blocker]);

  const handleDialogClose = useCallback(() => {
    handleCancel();
  }, [handleCancel]);

  if (!showPrompt) {
    return null;
  }

  const titleId = 'navigation-prompt-title';
  const descriptionId = 'navigation-prompt-description';

  return (
    <Dialog
      close={handleDialogClose}
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
