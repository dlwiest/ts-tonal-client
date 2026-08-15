import { HttpClient } from '../src/http/http-client'
import { AuthManager } from '../src/auth/auth-manager'

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('HttpClient', () => {
  let httpClient: HttpClient
  let authManager: AuthManager

  beforeEach(() => {
    authManager = new AuthManager('test@example.com', 'password123')
    httpClient = new HttpClient(authManager)
    mockFetch.mockReset()
  })

  afterEach(() => {
    jest.restoreAllMocks()
    jest.useRealTimers()
  })

  describe('request', () => {
    it('should make authenticated request successfully', async () => {
      const mockToken = 'valid-token'
      const mockData = { message: 'success' }

      jest.spyOn(authManager, 'getValidToken').mockResolvedValue(mockToken)
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

    it('should retry a POST on 401 with a distinct refreshed token', async () => {
      const expiredToken = 'expired-token'
      const freshToken = 'fresh-token'
      const mockData = { message: 'success after retry' }
      const apiAuthorizationHeaders: string[] = []
      const authGrants: string[] = []
      let apiCallCount = 0

      mockFetch.mockImplementation(async (
        url: string | URL | Request,
        options?: RequestInit
      ) => {
        if (String(url) === 'https://tonal.auth0.com/oauth/token') {
          const body = JSON.parse(options?.body as string)
          authGrants.push(body.grant_type)

          const tokenResponse = body.grant_type === 'password'
            ? {
                access_token: 'initial-access-token',
                id_token: expiredToken,
                refresh_token: 'initial-refresh-token',
                scope: 'offline_access',
                token_type: 'Bearer',
                expires_in: 3600
              }
            : {
                access_token: 'refreshed-access-token',
                id_token: freshToken,
                refresh_token: 'refreshed-refresh-token',
                scope: 'offline_access',
                token_type: 'Bearer',
                expires_in: 3600
              }

          return {
            ok: true,
            json: jest.fn().mockResolvedValue(tokenResponse)
          }
        }

        const headers = options?.headers as Record<string, string>
        apiAuthorizationHeaders.push(headers.Authorization)
        apiCallCount += 1

        if (apiCallCount === 1) {
          return {
            ok: false,
            status: 401,
            text: jest.fn().mockResolvedValue(JSON.stringify({ error: 'Unauthorized' }))
          }
        }

        return {
          ok: true,
          json: jest.fn().mockResolvedValue(mockData)
        }
      })

      await authManager.authenticate()
      const result = await httpClient.request('/protected', {
        method: 'POST',
        body: JSON.stringify({ title: 'test workout' })
      })

      expect(result).toEqual(mockData)
      expect(apiAuthorizationHeaders).toEqual([
        `Bearer ${expiredToken}`,
        `Bearer ${freshToken}`
      ])
      expect(authGrants).toEqual(['password', 'refresh_token'])
      expect(apiCallCount).toBe(2)
    })

    it('should start the request timeout after token resolution', async () => {
      const timeoutSpy = jest.spyOn(global, 'setTimeout')
      const timeoutCallsAtTokenResolution: number[] = []
      const mockData = { message: 'success' }

      jest.spyOn(authManager, 'getValidToken').mockImplementation(async () => {
        await Promise.resolve()
        timeoutCallsAtTokenResolution.push(timeoutSpy.mock.calls.length)
        return 'valid-token'
      })
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockData)
      })

      await expect(httpClient.request('/slow-auth')).resolves.toEqual(mockData)

      expect(timeoutCallsAtTokenResolution).toEqual([0])
      expect(timeoutSpy).toHaveBeenCalledWith(expect.any(Function), 30000)
    })

    it.each(['POST', 'PUT', 'DELETE'])(
      'should not retry a failed %s request',
      async method => {
        jest.spyOn(authManager, 'getValidToken').mockResolvedValue('valid-token')
        const sleepSpy = jest.spyOn(
          httpClient as unknown as { sleep(ms: number): Promise<void> },
          'sleep'
        ).mockResolvedValue(undefined)
        mockFetch.mockResolvedValue({
          ok: false,
          status: 502,
          text: jest.fn().mockResolvedValue(JSON.stringify({ error: 'Bad Gateway' }))
        })

        await expect(httpClient.request('/workout', { method })).rejects.toMatchObject({
          message: 'Bad Gateway',
          statusCode: 502
        })

        expect(mockFetch).toHaveBeenCalledTimes(1)
        expect(sleepSpy).not.toHaveBeenCalled()
      }
    )

    it('should preserve a response parse error without retrying', async () => {
      const parseError = new SyntaxError('Unexpected token < in JSON')
      jest.spyOn(authManager, 'getValidToken').mockResolvedValue('valid-token')
      const sleepSpy = jest.spyOn(
        httpClient as unknown as { sleep(ms: number): Promise<void> },
        'sleep'
      ).mockResolvedValue(undefined)
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockRejectedValue(parseError)
      })

      await expect(httpClient.request('/non-json')).rejects.toMatchObject({
        message: parseError.message,
        originalError: parseError
      })
      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(sleepSpy).not.toHaveBeenCalled()
    })

    it('should preserve a network error without retrying', async () => {
      const networkError = new TypeError('fetch failed: ECONNRESET')
      jest.spyOn(authManager, 'getValidToken').mockResolvedValue('valid-token')
      const sleepSpy = jest.spyOn(
        httpClient as unknown as { sleep(ms: number): Promise<void> },
        'sleep'
      ).mockResolvedValue(undefined)
      mockFetch.mockRejectedValue(networkError)

      await expect(httpClient.request('/network-error')).rejects.toMatchObject({
        message: networkError.message,
        originalError: networkError
      })
      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(sleepSpy).not.toHaveBeenCalled()
    })
  })
})