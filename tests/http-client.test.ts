import { HttpClient } from '../src/http/http-client'
import { AuthManager } from '../src/auth/auth-manager'

// Mock AuthManager
jest.mock('../src/auth/auth-manager')
const MockAuthManager = AuthManager as jest.MockedClass<typeof AuthManager>

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('HttpClient', () => {
  let httpClient: HttpClient
  let mockAuthManager: jest.Mocked<AuthManager>

  beforeEach(() => {
    mockAuthManager = new MockAuthManager('test', 'test') as jest.Mocked<AuthManager>
    httpClient = new HttpClient(mockAuthManager)
    mockFetch.mockClear()
  })

  describe('request', () => {
    it('should make authenticated request successfully', async () => {
      const mockToken = 'valid-token'
      const mockData = { message: 'success' }

      mockAuthManager.getValidToken.mockResolvedValue(mockToken)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockData)
      })

      const result = await httpClient.request('/test')

      expect(result).toEqual(mockData)
      expect(mockFetch).toHaveBeenCalledWith('https://api.tonal.com/v6/test', {
        headers: {
          Authorization: `Bearer ${mockToken}`,
          'Content-Type': 'application/json',
        },
        signal: expect.any(AbortSignal),
      })
    })

    it('should retry on 401 error with token refresh', async () => {
      const expiredToken = 'expired-token'
      const freshToken = 'fresh-token'
      const mockData = { message: 'success after retry' }

      // First call returns expired token
      mockAuthManager.getValidToken.mockResolvedValueOnce(expiredToken)
      
      // First request fails with 401
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: jest.fn().mockResolvedValue(JSON.stringify({ error: 'Unauthorized' }))
      })

      // Second call returns fresh token (after refresh)
      mockAuthManager.getValidToken.mockResolvedValueOnce(freshToken)
      
      // Retry succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockData)
      })

      const result = await httpClient.request('/protected')

      expect(result).toEqual(mockData)
      expect(mockAuthManager.getValidToken).toHaveBeenCalledTimes(3) // Initial + retry attempt + retry
      expect(mockFetch).toHaveBeenCalledTimes(2) // Failed request + successful retry
    })
  })
})