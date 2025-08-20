import {
  isApiTokensRemovedSignal,
  isApiTokensUpdatedSignal,
  useApiTokens,
  useOidcClient,
  useSignalListener,
} from 'hds-react';
import { useCallback, useMemo } from 'react';

import config from '../config';

const useAuth = () => {
  const { isAuthenticated, getUser, logout, login, getState } = useOidcClient();
  const { isRenewing, getStoredApiTokens } = useApiTokens();

  const [error, tokens] = getStoredApiTokens();

  // Memoize the token value to prevent unnecessary re-renders
  const apiToken = useMemo(() => {
    if (error || isRenewing()) {
      return undefined;
    }
    return tokens ? tokens[config.API_TOKEN_AUTH_AUDIENCE] : undefined;
  }, [error, isRenewing, tokens]);

  const signalListener = useCallback(
    (signal) => isApiTokensUpdatedSignal(signal) || isApiTokensRemovedSignal(signal),
    [],
  );

  const getApiToken = useCallback(() => {
    return apiToken;
  }, [apiToken]);

  useSignalListener(signalListener);

  const loggingOut = getState() === 'LOGGING_OUT';

  return {
    authenticated: isAuthenticated(),
    user: getUser(),
    getApiToken,
    login,
    logout,
    loggingOut,
  };
};

export default useAuth;
