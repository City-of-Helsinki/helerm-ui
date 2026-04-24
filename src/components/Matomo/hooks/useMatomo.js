import { use, useCallback } from 'react';

import MatomoContext from '../matomo-context';

function useMatomo() {
  const instance = use(MatomoContext);

  const trackPageView = useCallback((params) => instance?.trackPageView(params), [instance]);

  return { trackPageView };
}

export default useMatomo;
