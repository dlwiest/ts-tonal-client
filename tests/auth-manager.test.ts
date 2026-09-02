import { AuthManager } from '../src/auth/auth-manager'
import { TonalClientError } from '../src/types'

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

const jwtHeader = Buffer.from(JSON.stringify({ alg: 'none' })).toString('base64url')
const createIdTokenFromPayload = (payload: string): string =>
  `${jwtHeader}.${Buffer.from(payload).toString('base64url')}.signature`
const createIdToken = (claims: unknown): string =>
  createIdTokenFromPayload(JSON.stringify(claims))

const getRecordedExpiry = (manager: AuthManager): number => {
  // This is the observable state under test, but AuthManager intentionally keeps it private.
  const managerState = manager as unknown as { tokenExpiresAt: number }
  return managerState.tokenExpiresAt
}

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

  describe('token expiry', () => {
    const now = Date.parse('2026-09-01T12:00:00.000Z')

    beforeEach(() => {
      jest.setSystemTime(now)
    })

    it('should use the id_token exp when it expires before expires_in', async () => {
      const exp = now / 1000 + 10 * 60 * 60
      const idToken = createIdToken({ exp })

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          access_token: 'mock-access-token',
          id_token: idToken,
          refresh_token: 'mock-refresh-token',
          scope: 'offline_access',
          token_type: 'Bearer',
          expires_in: 86400
        })
      })

      await expect(authManager.authenticate()).resolves.toBe(idToken)

      expect(exp).toBeLessThan(now)
      expect(getRecordedExpiry(authManager)).toBe(exp * 1000)
      await expect(authManager.getValidToken()).resolves.toBe(idToken)
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('should use the refreshed id_token exp when it expires before expires_in', async () => {
      const initialIdToken = createIdToken({ exp: now / 1000 + 60 * 60 })
      const refreshedExp = now / 1000 + 10 * 60 * 60
      const refreshedIdToken = createIdToken({ exp: refreshedExp })

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({
            access_token: 'initial-access-token',
            id_token: initialIdToken,
            refresh_token: 'initial-refresh-token',
            scope: 'offline_access',
            token_type: 'Bearer',
            expires_in: 86400
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({
            access_token: 'refreshed-access-token',
            id_token: refreshedIdToken,
            scope: 'offline_access',
            token_type: 'Bearer',
            expires_in: 86400
          })
        })

      await authManager.authenticate()
      authManager.invalidateToken()

      await expect(authManager.getValidToken()).resolves.toBe(refreshedIdToken)
      expect(getRecordedExpiry(authManager)).toBe(refreshedExp * 1000)
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it.each([
      ['an empty token', ''],
      ['an undefined token', undefined],
      ['an opaque token', 'opaque-token'],
      ['an invalid base64url payload', 'header.***.signature'],
      ['a payload that is not JSON', createIdTokenFromPayload('{not-json')],
      ['a null payload', createIdToken(null)],
      ['an array payload', createIdToken([])],
      ['a numeric payload', createIdToken(42)],
      ['a payload without exp', createIdToken({ sub: 'user' })],
      ['a string exp', createIdToken({ exp: '123' })],
      ['a null exp', createIdToken({ exp: null })],
      ['a NaN exp', createIdTokenFromPayload('{"exp":NaN}')],
      ['an infinite exp', createIdTokenFromPayload('{"exp":1e400}')],
      ['a zero exp', createIdToken({ exp: 0 })],
      ['a negative exp', createIdToken({ exp: -1 })],
      ['an absurdly distant exp', createIdToken({ exp: Number.MAX_SAFE_INTEGER })]
    ])('should fall back to expires_in for %s', async (_description, idToken) => {
      const expiresIn = 3600
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          access_token: 'mock-access-token',
          id_token: idToken,
          refresh_token: 'mock-refresh-token',
          scope: 'offline_access',
          token_type: 'Bearer',
          expires_in: expiresIn
        })
      })

      await expect(authManager.authenticate()).resolves.toBe(idToken)
      expect(getRecordedExpiry(authManager)).toBe(now + expiresIn * 1000)
    })

    it('should use expires_in when it expires before the id_token exp', async () => {
      const expiresIn = 86400
      const idToken = createIdToken({ exp: now / 1000 + 48 * 60 * 60 })

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          access_token: 'mock-access-token',
          id_token: idToken,
          refresh_token: 'mock-refresh-token',
          scope: 'offline_access',
          token_type: 'Bearer',
          expires_in: expiresIn
        })
      })

      await authManager.authenticate()

      expect(getRecordedExpiry(authManager)).toBe(now + expiresIn * 1000)
    })

    it('should refresh after a 401 caller invalidates the current token', async () => {
      const initialIdToken = createIdToken({ exp: now / 1000 + 10 * 60 * 60 })
      const refreshedIdToken = createIdToken({ exp: now / 1000 + 20 * 60 * 60 })

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({
            access_token: 'initial-access-token',
            id_token: initialIdToken,
            refresh_token: 'initial-refresh-token',
            scope: 'offline_access',
            token_type: 'Bearer',
            expires_in: 86400
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({
            access_token: 'refreshed-access-token',
            id_token: refreshedIdToken,
            scope: 'offline_access',
            token_type: 'Bearer',
            expires_in: 86400
          })
        })

      await authManager.authenticate()
      authManager.invalidateToken()

      await expect(authManager.getValidToken()).resolves.toBe(refreshedIdToken)
      const refreshRequest = JSON.parse(mockFetch.mock.calls[1][1].body)
      expect(refreshRequest.grant_type).toBe('refresh_token')
      expect(refreshRequest.refresh_token).toBe('initial-refresh-token')
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