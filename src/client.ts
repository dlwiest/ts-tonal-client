import { OAuthTokenResponse, TonalMovement, TonalSharedWorkout, TonalWorkout } from './types'

export class TonalClient {
  private username: string
  private password: string
  private idToken: string
  private tokenExpiresAt: number

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

  // Request a new ID token from Auth0
  private async refreshToken() {
    const data = {
      username: this.username,
      password: this.password,
      client_id: 'ERCyexW-xoVG_Yy3RDe-eV4xsOnRHP6L',
      grant_type: 'password',
      scope: 'offline_access',
    }

    try {
      const response = await fetch('https://tonal.auth0.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.status === 403) {
        throw new Error('Invalid username or password')
      }

      const json = (await response.json()) as OAuthTokenResponse

      this.idToken = json.id_token
      this.tokenExpiresAt = Date.now() + json.expires_in * 1000
    } catch (e) {
      console.error(e)
      throw new Error('Failed to retrieve access token')
    }
  }

  // Get all movements available on Tonal
  public async getMovements() {
    try {
      if (this.tokenExpiresAt < Date.now()) {
        await this.refreshToken()
      }

      const response = await fetch('https://api.tonal.com/v6/movements', {
        headers: {
          Authorization: `Bearer ${this.idToken}`,
        },
      })

      return (await response.json()) as TonalMovement[]
    } catch (e) {
      console.error(e)
      throw new Error('Failed to retrieve movements')
    }
  }

  // Get a workout by its ID
  public async getWorkoutById(id: string) {
    try {
      if (this.tokenExpiresAt < Date.now()) {
        await this.refreshToken()
      }

      const response = await fetch(`https://api.tonal.com/v6/workouts/${id}`, {
        headers: {
          Authorization: `Bearer ${this.idToken}`,
        },
      })

      const json = (await response.json()) as TonalWorkout
      return json
    } catch (e) {
      console.error(e)
      throw new Error('Failed to retrieve workout')
    }
  }

  // Get a workout by its share URL
  public async getWorkoutByShareUrl(shareUrl: string) {
    if (!shareUrl) {
      throw new Error('Share URL is required')
    }

    const shareId = shareUrl.split('/').pop()

    try {
      if (this.tokenExpiresAt < Date.now()) {
        await this.refreshToken()
      }

      const response = await fetch(`https://api.tonal.com/v6/user-workouts/sharing-records/${shareId}`, {
        headers: {
          Authorization: `Bearer ${this.idToken}`,
        },
      })

      const json = (await response.json()) as TonalSharedWorkout
      return json
    } catch (e) {
      console.error(e)
      throw new Error('Failed to retrieve workout')
    }
  }
}
