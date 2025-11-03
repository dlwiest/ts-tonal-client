import { OAuthTokenResponse, TonalClientError } from '../types'

export class AuthManager {
  private username: string
  private password: string
  private idToken: string = ''
  private refreshToken: string = ''
  private tokenExpiresAt: number = 0
  private isRefreshing: boolean = false
  private readonly authUrl = 'https://tonal.auth0.com/oauth/token'
  private readonly clientId = 'ERCyexW-xoVG_Yy3RDe-eV4xsOnRHP6L'

  constructor(username: string, password: string) {
    this.username = username
    this.password = password
  }

  async authenticate(): Promise<string> {
    if (this.isTokenValid()) {
      return this.idToken
    }

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
    this.refreshToken = tokenData.refresh_token
    this.tokenExpiresAt = Date.now() + (tokenData.expires_in * 1000)

    return this.idToken
  }

  async getValidToken(): Promise<string> {
    if (this.isTokenValid()) {
      return this.idToken
    }

    if (this.refreshToken) {
      if (!this.isRefreshing) {
        await this.refreshTokens()
      } else {
        // Wait for ongoing refresh to complete
        while (this.isRefreshing) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }
      
      if (this.isTokenValid()) {
        return this.idToken
      }
    }

    throw new TonalClientError('Token expired and refresh failed. Call authenticate() first.')
  }

  private isTokenValid(): boolean {
    return !!this.idToken && Date.now() < this.tokenExpiresAt - 60000 // 1 minute buffer
  }

  private async refreshTokens(): Promise<void> {
    if (this.isRefreshing) {
      return // Prevent concurrent refresh attempts
    }

    this.isRefreshing = true

    try {
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
      this.refreshToken = tokenData.refresh_token
      this.tokenExpiresAt = Date.now() + (tokenData.expires_in * 1000)
    } finally {
      this.isRefreshing = false
    }
  }
}