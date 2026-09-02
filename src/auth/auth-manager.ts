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
    const expiresInDeadline = Date.now() + tokenData.expires_in * 1000
    this.tokenExpiresAt = this.getTokenExpiresAt(tokenData.id_token, expiresInDeadline)

    return this.idToken
  }

  // `expiresInDeadline` may be NaN: OAuthTokenResponse declares `expires_in` as required,
  // but that same interface declared `refresh_token` required until Auth0 was observed
  // omitting it, so the field is not trustworthy. A NaN deadline must never reach
  // `tokenExpiresAt` -- `isTokenValid()` compares against it and would return false
  // forever, refreshing on every single call.
  private getTokenExpiresAt(idToken: string | undefined, expiresInDeadline: number): number {
    const expiresInUsable = Number.isFinite(expiresInDeadline)
    // Neither source usable: a short finite window beats NaN, which would spin the
    // refresh grant on every request and invite Auth0 rate limiting.
    const noInfoFallback = expiresInUsable ? expiresInDeadline : Date.now() + 10 * 60 * 1000
    try {
      if (!idToken) {
        return noInfoFallback
      }

      const segments = idToken.split('.')
      if (segments.length !== 3) {
        return noInfoFallback
      }

      const payloadSegment = segments[1]
      if (!/^[A-Za-z0-9_-]+$/.test(payloadSegment)) {
        return noInfoFallback
      }

      const payloadBuffer = Buffer.from(payloadSegment, 'base64url')
      if (payloadBuffer.toString('base64url') !== payloadSegment) {
        return noInfoFallback
      }

      const payload: unknown = JSON.parse(payloadBuffer.toString('utf8'))
      if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
        return noInfoFallback
      }

      const exp = 'exp' in payload ? payload.exp : undefined
      if (typeof exp !== 'number' || !Number.isFinite(exp) || exp <= 0) {
        return noInfoFallback
      }

      const expDeadline = exp * 1000
      // ID tokens are hour-lived; ten years rejects nonsensical dates without affecting real tokens.
      const latestReasonableExpiry = Date.now() + 10 * 365 * 24 * 60 * 60 * 1000
      if (!Number.isFinite(expDeadline) || expDeadline > latestReasonableExpiry) {
        return noInfoFallback
      }

      // Auth0's expires_in (measured at 24h) describes the access token, while
      // we send the ID token (measured at 10h), so its own exp must cap the deadline.
      // When expires_in is unusable the exp claim stands alone rather than being
      // discarded by Math.min(valid, NaN) === NaN.
      return expiresInUsable ? Math.min(expDeadline, expiresInDeadline) : expDeadline
    } catch {
      return noInfoFallback
    }
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
    const expiresInDeadline = Date.now() + tokenData.expires_in * 1000
    this.tokenExpiresAt = this.getTokenExpiresAt(tokenData.id_token, expiresInDeadline)
  }
}