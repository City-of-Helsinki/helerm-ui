import * as mockLogin from 'hds-react';
import * as mockFetch from 'isomorphic-fetch';

import { getApiUrl, callApi, Unauthorized } from '../api';

vi.mock('../api.js', async (originalImport) => originalImport());
vi.mock('isomorphic-fetch');

describe('api.js', () => {

  describe('getApiUrl', () => {
    it('should get api url', () => {
      const expectedUrl = 'https://api.test.com/v1/users/?page=1&limit=10';

      const apiUrl = getApiUrl('users', { page: 1, limit: 10 });

      expect(apiUrl).toBe(expectedUrl);
    });
  })

  describe('callApi', () => {
    const mockToken = 'mockToken';
    const mockEndpoint = 'users';
    const mockParams = { page: 1, limit: 10 };
    const mockOptions = { method: 'GET' };
    const mockUrl = 'https://api.test.com/v1/users/?page=1&limit=10';

    beforeEach(() => {
      vi.spyOn(mockFetch, 'default').mockResolvedValue({
        status: 200,
        json: vi.fn().mockResolvedValue({}),
      });

      vi.spyOn(mockLogin, 'getApiTokenFromStorage').mockReturnValue(mockToken);
    });

    afterEach(() => {
      mockFetch.default.mockRestore();
      mockLogin.getApiTokenFromStorage.mockRestore();
    });

    it('should call fetch with the correct url and options', async () => {
      await callApi(mockEndpoint, mockParams, mockOptions);

      expect(mockFetch.default).toHaveBeenCalledWith(mockUrl, {
        method: 'GET',
        credentials: 'include',
        headers: expect.any(Headers),
        mode: 'cors'
      });
    });

    it('should throw Unauthorized error if response status is 401', async () => {
      vi.spyOn(mockFetch, 'default').mockResolvedValueOnce({
        status: 401,
      });

      await expect(callApi(mockEndpoint, mockParams, mockOptions)).rejects.toThrowError(Unauthorized);
    });

    it('should return the response if status 200', async () => {
      const mockResponse = { data: 'mockData' };

      vi.spyOn(mockFetch, 'default').mockResolvedValueOnce({
        status: 200,
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      const response = await callApi(mockEndpoint, mockParams, mockOptions);

      const responseData = await response.json();

      expect(responseData).toEqual(mockResponse);
    });
  })
});
