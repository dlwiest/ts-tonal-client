import { OAuthTokenResponse, TonalMovement, TonalSharedWorkout, TonalWorkout, TonalUserInfo, TonalGoal, TonalWorkoutEstimateSet, TonalWorkoutEstimateResponse, TonalWorkoutCreateRequest, TonalWorkoutUpdateRequest, TonalClientError } from './types'

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

  private async makeRequest<T>(url: string, options: RequestInit = {}, expectsBody: boolean = true): Promise<T> {
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

      if (expectsBody) {
        return await response.json()
      } else {
        return undefined as T
      }
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

  private async makeRequestWithRetry<T>(url: string, options: RequestInit = {}, expectsBody: boolean = true): Promise<T> {
    let lastError: TonalClientError

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await this.makeRequest<T>(url, options, expectsBody)
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

  // Get user's workouts with optional pagination
  public async getUserWorkouts(offset: number = 0, limit: number = 50): Promise<TonalWorkout[]> {
    await this.ensureValidToken()

    return this.makeRequestWithRetry<TonalWorkout[]>(`${this.baseUrl}/user-workouts`, {
      headers: {
        Authorization: `Bearer ${this.idToken}`,
        'pg-offset': offset.toString(),
        'pg-limit': limit.toString(),
      },
    })
  }

  // Estimate workout duration based on sets
  public async estimateWorkoutDuration(sets: TonalWorkoutEstimateSet[]): Promise<TonalWorkoutEstimateResponse> {
    if (!sets || sets.length === 0) {
      throw new TonalClientError('At least one set is required for estimation')
    }

    await this.ensureValidToken()

    return this.makeRequestWithRetry<TonalWorkoutEstimateResponse>(`${this.baseUrl}/user-workouts/estimate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.idToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sets),
    })
  }

  // Create a new workout
  public async createWorkout(workoutData: TonalWorkoutCreateRequest): Promise<TonalWorkout> {
    if (!workoutData.title || workoutData.title.trim().length === 0) {
      throw new TonalClientError('Workout title is required')
    }
    
    if (!workoutData.sets || workoutData.sets.length === 0) {
      throw new TonalClientError('At least one set is required to create a workout')
    }

    await this.ensureValidToken()

    const requestBody = {
      title: workoutData.title.trim(),
      sets: workoutData.sets,
      createdSource: workoutData.createdSource || 'WorkoutBuilder',
      shortDescription: workoutData.shortDescription || '',
      description: workoutData.description || '',
    }

    return this.makeRequestWithRetry<TonalWorkout>(`${this.baseUrl}/user-workouts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.idToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })
  }

  async updateWorkout(workoutData: TonalWorkoutUpdateRequest): Promise<TonalWorkout> {
    if (!workoutData.id) {
      throw new TonalClientError('Workout ID is required for updates')
    }
    if (!workoutData.title?.trim()) {
      throw new TonalClientError('Workout title is required')
    }
    if (!workoutData.sets?.length) {
      throw new TonalClientError('At least one set is required')
    }

    const requestBody = {
      id: workoutData.id,
      title: workoutData.title,
      description: workoutData.description || '',
      coachId: workoutData.coachId || '00000000-0000-0000-0000-000000000000',
      sets: workoutData.sets,
      level: workoutData.level || '',
      assetId: workoutData.assetId,
      createdSource: workoutData.createdSource || 'WorkoutBuilder'
    }

    return this.makeRequestWithRetry<TonalWorkout>(`${this.baseUrl}/user-workouts/${workoutData.id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${this.idToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })
  }

  async deleteWorkout(workoutId: string): Promise<void> {
    if (!workoutId?.trim()) {
      throw new TonalClientError('Workout ID is required')
    }

    await this.makeRequestWithRetry(`${this.baseUrl}/user-workouts/${workoutId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${this.idToken}`,
        'Content-Type': 'application/json',
      },
    }, false)
  }
}
