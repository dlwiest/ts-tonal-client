import { OAuthTokenResponse, TonalClientError } from '../types'

export class AuthManager {
  private username: string
  private password: string
  private idToken: string = ''
  private tokenExpiresAt: number = 0
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
    this.tokenExpiresAt = Date.now() + (tokenData.expires_in * 1000)

    return this.idToken
  }

  getValidToken(): string {
    if (!this.isTokenValid()) {
      throw new TonalClientError('Token expired. Call authenticate() first.')
    }
    return this.idToken
  }

  private isTokenValid(): boolean {
    return !!this.idToken && Date.now() < this.tokenExpiresAt - 60000 // 1 minute buffer
  }
}