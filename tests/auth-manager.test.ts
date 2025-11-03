import { AuthManager } from '../src/auth/auth-manager'
import { TonalClientError } from '../src/types'

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('AuthManager', () => {
  let authManager: AuthManager

  beforeEach(() => {
    authManager = new AuthManager('test@example.com', 'password123')
    mockFetch.mockClear()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('constructor', () => {
    it('should create an instance with username and password', () => {
      expect(authManager).toBeInstanceOf(AuthManager)
    })
  })

  describe('authenticate', () => {
    it('should authenticate successfully and return id_token', async () => {
      const mockResponse = {
        access_token: 'mock-access-token',
        id_token: 'mock-id-token',
        refresh_token: 'mock-refresh-token',
        scope: 'offline_access',
        token_type: 'Bearer',
        expires_in: 3600
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      })

      const token = await authManager.authenticate()

      expect(token).toBe('mock-id-token')
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })
  })

  describe('getValidToken', () => {
    it('should return valid token when authenticated and not expired', async () => {
      // First authenticate
      const mockResponse = {
        access_token: 'mock-access-token',
        id_token: 'mock-id-token',
        refresh_token: 'mock-refresh-token',
        scope: 'offline_access',
        token_type: 'Bearer',
        expires_in: 3600
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      })

      await authManager.authenticate()

      // Then get valid token
      const token = await authManager.getValidToken()
      expect(token).toBe('mock-id-token')
      expect(mockFetch).toHaveBeenCalledTimes(1) // No additional calls
    })

    it('should refresh token when expired', async () => {
      // First authenticate
      const initialResponse = {
        access_token: 'initial-access-token',
        id_token: 'initial-id-token',
        refresh_token: 'initial-refresh-token',
        scope: 'offline_access',
        token_type: 'Bearer',
        expires_in: 3600
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(initialResponse)
      })

      await authManager.authenticate()

      // Fast forward past token expiry
      jest.advanceTimersByTime(3661 * 1000) // 3600s + 61s (past 60s buffer)

      // Mock refresh response
      const refreshResponse = {
        access_token: 'new-access-token',
        id_token: 'new-id-token',
        refresh_token: 'new-refresh-token',
        scope: 'offline_access',
        token_type: 'Bearer',
        expires_in: 3600
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(refreshResponse)
      })

      // This should trigger refresh
      const token = await authManager.getValidToken()
      
      expect(token).toBe('new-id-token')
      expect(mockFetch).toHaveBeenCalledTimes(2) // Initial auth + refresh
    })

    it('should throw error when no token available and not authenticated', async () => {
      await expect(authManager.getValidToken()).rejects.toThrow(TonalClientError)
      await expect(authManager.getValidToken()).rejects.toThrow('Token expired and refresh failed')
    })
  })
})