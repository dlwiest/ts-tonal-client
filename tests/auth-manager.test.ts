import { AuthManager } from '../src/auth/auth-manager'
import { TonalClientError } from '../src/types'

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('AuthManager', () => {
  let authManager: AuthManager

  beforeEach(() => {
    authManager = new AuthManager('test@example.com', 'password123')
    mockFetch.mockReset()
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
      expect(mockFetch).toHaveBeenCalledWith(
        'https://tonal.auth0.com/oauth/token',
        expect.objectContaining({
          signal: expect.any(AbortSignal)
        })
      )
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
      expect(mockFetch.mock.calls[1][1]).toEqual(
        expect.objectContaining({
          signal: expect.any(AbortSignal)
        })
      )
    })

    it('should re-authenticate after a non-rotating refresh token is rejected', async () => {
      const initialResponse = {
        access_token: 'initial-access-token',
        id_token: 'initial-id-token',
        refresh_token: 'initial-refresh-token',
        scope: 'offline_access',
        token_type: 'Bearer',
        expires_in: 3600
      }
      const refreshWithoutRotation = {
        access_token: 'refreshed-access-token',
        id_token: 'refreshed-id-token',
        scope: 'offline_access',
        token_type: 'Bearer',
        expires_in: 3600
      }
      const reauthenticatedResponse = {
        access_token: 'reauthenticated-access-token',
        id_token: 'reauthenticated-id-token',
        refresh_token: 'reauthenticated-refresh-token',
        scope: 'offline_access',
        token_type: 'Bearer',
        expires_in: 3600
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(initialResponse)
      })
      await authManager.authenticate()

      jest.advanceTimersByTime(3661 * 1000)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(refreshWithoutRotation)
      })
      await expect(authManager.getValidToken()).resolves.toBe('refreshed-id-token')

      jest.advanceTimersByTime(3661 * 1000)
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 403,
          text: jest.fn().mockResolvedValue(JSON.stringify({
            error_description: 'Unknown or invalid refresh token.'
          }))
        })
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(reauthenticatedResponse)
        })

      await expect(authManager.getValidToken()).resolves.toBe('reauthenticated-id-token')

      const requestBodies = mockFetch.mock.calls.map(([, options]) =>
        JSON.parse((options as RequestInit).body as string)
      )
      expect(requestBodies.map(body => body.grant_type)).toEqual([
        'password',
        'refresh_token',
        'refresh_token',
        'password'
      ])
      expect(requestBodies[2].refresh_token).toBe('initial-refresh-token')
    })

    it('should single-flight failed password re-authentication for concurrent refresh callers', async () => {
      const initialResponse = {
        access_token: 'initial-access-token',
        id_token: 'initial-id-token',
        refresh_token: 'initial-refresh-token',
        scope: 'offline_access',
        token_type: 'Bearer',
        expires_in: 3600
      }
      const refreshFailure = {
        ok: false,
        status: 403,
        text: jest.fn().mockResolvedValue(JSON.stringify({
          error_description: 'Unknown or invalid refresh token.'
        }))
      }
      const passwordFailure = {
        ok: false,
        status: 401,
        text: jest.fn().mockResolvedValue(JSON.stringify({
          error_description: 'Wrong email or password.'
        }))
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(initialResponse)
      })
      await authManager.authenticate()
      jest.advanceTimersByTime(3661 * 1000)
      mockFetch.mockClear()

      mockFetch
        .mockImplementationOnce(async () => {
          await Promise.resolve()
          return refreshFailure
        })
        .mockResolvedValue(passwordFailure)

      const resultsPromise = Promise.allSettled([
        authManager.getValidToken(),
        authManager.getValidToken(),
        authManager.getValidToken()
      ])
      await jest.advanceTimersByTimeAsync(100)

      const results = await resultsPromise
      const grantTypes = mockFetch.mock.calls.map(([, options]) => {
        const body = JSON.parse((options as RequestInit).body as string)
        return body.grant_type
      })
      expect(grantTypes).toEqual(['refresh_token', 'password'])
      expect(grantTypes.filter(grantType => grantType === 'refresh_token')).toHaveLength(1)
      expect(grantTypes.filter(grantType => grantType === 'password')).toHaveLength(1)

      const errors = results.map(result => {
        expect(result.status).toBe('rejected')
        if (result.status === 'fulfilled') {
          throw new Error('Expected token request to reject')
        }
        return result.reason
      })

      for (const error of errors) {
        expect(error).toBe(errors[0])
        expect(error).toBeInstanceOf(TonalClientError)
        expect(error.message).toBe('Wrong email or password.')
        expect(error.statusCode).toBe(401)
      }
    })

    it('should authenticate when no token is available', async () => {
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

      await expect(authManager.getValidToken()).resolves.toBe('mock-id-token')
      expect(JSON.parse(mockFetch.mock.calls[0][1].body).grant_type).toBe('password')
    })
  })
})