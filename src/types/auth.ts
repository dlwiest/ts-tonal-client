export interface TonalApiError {
  error: string
  error_description?: string
  statusCode?: number
}

export class TonalClientError extends Error {
  public readonly statusCode?: number
  public readonly originalError?: unknown

  constructor(message: string, statusCode?: number, originalError?: unknown) {
    super(message)
    this.name = 'TonalClientError'
    this.statusCode = statusCode
    this.originalError = originalError
  }
}

export interface OAuthTokenResponse {
  access_token: string
  id_token: string
  refresh_token: string
  scope: string
  token_type: string
  expires_in: number
}