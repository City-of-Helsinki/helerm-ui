import { renderHook, act, waitFor } from '@testing-library/react';
import * as mockLogin from 'hds-react';

import useUpdateApiTokens from '../hooks/useUpdateApiTokens';

const mockUseApiTokensClientTracking = vi.spyOn(mockLogin, 'useApiTokensClientTracking');

describe('useUpdateApiTokens', () => {
  beforeEach(() => {
    mockUseApiTokensClientTracking.mockReset();
  });

  it('should update api tokens', async () => {
    mockUseApiTokensClientTracking.mockImplementation(() => [{ payload: {} }]);

    const { result, rerender } = renderHook(() => useUpdateApiTokens());

    expect(result.current.apiTokensUpdated).toBe(false);

    mockUseApiTokensClientTracking.mockImplementation(() => [{ payload: { data: { key: 'value' } } }]);

    rerender();

    act(() => {
      result.current.updateApiTokens();
    });

    await waitFor(() => {
      expect(result.current.apiTokensUpdated).toBe(true);
    });
  });
});
