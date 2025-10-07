import { OAuthTokenResponse, TonalMovement, TonalSharedWorkout, TonalWorkout, TonalUserInfo, TonalGoal, TonalClientError } from './types'

export class TonalClient {
  private username: string
  private password: string
  private idToken: string
  private tokenExpiresAt: number
  private readonly baseUrl = 'https://api.tonal.com/v6'
  private readonly authUrl = 'https://tonal.auth0.com/oauth/token'
  private readonly clientId = 'ERCyexW-xoVG_Yy3RDe-eV4xsOnRHP6L'
  private readonly requestTimeout = 30000
  private readonly maxRetries = 3

  private constructor({ username, password }: { username: string; password: string }) {
    this.username = username
    this.password = password
    this.idToken = ''
    this.tokenExpiresAt = 0
  }

  // TonalClient factory
  static async create({ username, password }: { username: string; password: string }) {
    const client = new TonalClient({ username, password })
    await client.refreshToken()

    return client
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private async makeRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { error: errorText }
        }
        throw new TonalClientError(
          errorData.error_description || errorData.error || `HTTP ${response.status}`,
          response.status,
          errorData
        )
      }

      return await response.json()
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof TonalClientError) {
        throw error
      }
      if (error instanceof Error && error.name === 'AbortError') {
        throw new TonalClientError('Request timeout', undefined, error)
      }
      throw new TonalClientError('Request failed', undefined, error)
    }
  }

  private async makeRequestWithRetry<T>(url: string, options: RequestInit = {}): Promise<T> {
    let lastError: TonalClientError

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await this.makeRequest<T>(url, options)
      } catch (error) {
        lastError = error instanceof TonalClientError ? error : new TonalClientError('Unknown error', undefined, error)
        
        // Don't retry client errors (4xx) or on the last attempt
        if (attempt === this.maxRetries || (lastError.statusCode && lastError.statusCode < 500)) {
          throw lastError
        }

        // Exponential backoff: 1s, 2s, 4s (capped at 10s)
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000)
        await this.sleep(delay)
      }
    }

    throw lastError!
  }

  // Request a new ID token from Auth0
  private async refreshToken(): Promise<void> {
    const data = {
      username: this.username,
      password: this.password,
      client_id: this.clientId,
      grant_type: 'password',
      scope: 'offline_access',
    }

    try {
      const response = await this.makeRequest<OAuthTokenResponse>(this.authUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      this.idToken = response.id_token
      this.tokenExpiresAt = Date.now() + response.expires_in * 1000
    } catch (error) {
      if (error instanceof TonalClientError && error.statusCode === 403) {
        throw new TonalClientError('Invalid username or password', 403, error.originalError)
      }
      throw new TonalClientError('Failed to retrieve access token', undefined, error)
    }
  }

  private async ensureValidToken(): Promise<void> {
    // Refresh token if it expires within the next minute
    if (this.tokenExpiresAt < Date.now() + 60000) {
      await this.refreshToken()
    }
  }

  // Get all movements available on Tonal
  public async getMovements(): Promise<TonalMovement[]> {
    await this.ensureValidToken()

    return this.makeRequestWithRetry<TonalMovement[]>(`${this.baseUrl}/movements`, {
      headers: {
        Authorization: `Bearer ${this.idToken}`,
      },
    })
  }

  // Get a workout by its ID
  public async getWorkoutById(id: string): Promise<TonalWorkout> {
    if (!id || typeof id !== 'string') {
      throw new TonalClientError('Workout ID is required and must be a string')
    }

    await this.ensureValidToken()

    return this.makeRequestWithRetry<TonalWorkout>(`${this.baseUrl}/workouts/${encodeURIComponent(id)}`, {
      headers: {
        Authorization: `Bearer ${this.idToken}`,
      },
    })
  }

  // Get a workout by its share URL
  public async getWorkoutByShareUrl(shareUrl: string): Promise<TonalSharedWorkout> {
    if (!shareUrl || typeof shareUrl !== 'string') {
      throw new TonalClientError('Share URL is required and must be a string')
    }

    const shareId = shareUrl.split('/').pop()
    if (!shareId) {
      throw new TonalClientError('Invalid share URL format')
    }

    await this.ensureValidToken()

    return this.makeRequestWithRetry<TonalSharedWorkout>(`${this.baseUrl}/user-workouts/sharing-records/${encodeURIComponent(shareId)}`, {
      headers: {
        Authorization: `Bearer ${this.idToken}`,
      },
    })
  }

  // Get current user information
  public async getUserInfo(): Promise<TonalUserInfo> {
    await this.ensureValidToken()

    return this.makeRequestWithRetry<TonalUserInfo>(`${this.baseUrl}/users/userinfo`, {
      headers: {
        Authorization: `Bearer ${this.idToken}`,
      },
    })
  }

  // Get all available goals
  public async getGoals(): Promise<TonalGoal[]> {
    await this.ensureValidToken()

    return this.makeRequestWithRetry<TonalGoal[]>(`${this.baseUrl}/goals`, {
      headers: {
        Authorization: `Bearer ${this.idToken}`,
      },
    })
  }
}
