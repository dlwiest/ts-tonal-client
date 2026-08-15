import { OAuthTokenResponse, TonalClientError } from '../types'

export class AuthManager {
  private username: string
  private password: string
  private idToken: string = ''
  private refreshToken: string = ''
  private tokenExpiresAt: number = 0
  private authPromise: Promise<string> | null = null
  private refreshPromise: Promise<void> | null = null
  private readonly authUrl = 'https://tonal.auth0.com/oauth/token'
  private readonly clientId = 'ERCyexW-xoVG_Yy3RDe-eV4xsOnRHP6L'
  private readonly authTimeout = 30000

  constructor(username: string, password: string) {
    this.username = username
    this.password = password
  }

  async authenticate(): Promise<string> {
    if (this.isTokenValid()) {
      return this.idToken
    }

    const activeAuth = this.authPromise ?? this.authenticateWithPassword()
    this.authPromise = activeAuth

    try {
      return await activeAuth
    } finally {
      if (this.authPromise === activeAuth) {
        this.authPromise = null
      }
    }
  }

  private async authenticateWithPassword(): Promise<string> {
    const response = await fetch(this.authUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: this.username,
        password: this.password,
        client_id: this.clientId,
        grant_type: 'password',
        scope: 'offline_access',
      }),
      signal: AbortSignal.timeout(this.authTimeout),
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { error: errorText }
      }
      throw new TonalClientError(
        errorData.error_description || errorData.error || 'Authentication failed',
        response.status,
        errorData
      )
    }

    const tokenData: OAuthTokenResponse = await response.json()
    this.idToken = tokenData.id_token
    this.refreshToken = tokenData.refresh_token ?? ''
    this.tokenExpiresAt = Date.now() + (tokenData.expires_in * 1000)

    return this.idToken
  }

  invalidateToken(): void {
    this.tokenExpiresAt = 0
  }

  async getValidToken(): Promise<string> {
    if (this.isTokenValid()) {
      return this.idToken
    }

    if (!this.refreshToken) {
      return this.authenticate()
    }

    const activeRefresh = this.refreshPromise ?? this.refreshTokens()
    this.refreshPromise = activeRefresh

    try {
      await activeRefresh
    } catch {
      return this.authenticate()
    } finally {
      if (this.refreshPromise === activeRefresh) {
        this.refreshPromise = null
      }
    }

    if (this.isTokenValid()) {
      return this.idToken
    }

    return this.authenticate()
  }

  private isTokenValid(): boolean {
    return !!this.idToken && Date.now() < this.tokenExpiresAt - 60000 // 1 minute buffer
  }

  private async refreshTokens(): Promise<void> {
    const response = await fetch(this.authUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: this.clientId,
        grant_type: 'refresh_token',
        refresh_token: this.refreshToken,
      }),
      signal: AbortSignal.timeout(this.authTimeout),
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { error: errorText }
      }
      throw new TonalClientError(
        errorData.error_description || errorData.error || 'Token refresh failed',
        response.status,
        errorData
      )
    }

    const tokenData: OAuthTokenResponse = await response.json()
    this.idToken = tokenData.id_token
    this.refreshToken = tokenData.refresh_token ?? this.refreshToken
    this.tokenExpiresAt = Date.now() + (tokenData.expires_in * 1000)
  }
}