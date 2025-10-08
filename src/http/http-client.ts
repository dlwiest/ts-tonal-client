import { TonalClientError } from '../types'
import { AuthManager } from '../auth/auth-manager'

export class HttpClient {
  private readonly baseUrl = 'https://api.tonal.com/v6'
  private readonly requestTimeout = 30000
  private readonly maxRetries = 3

  constructor(private authManager: AuthManager) { }

  async request<T>(endpoint: string, options: RequestInit = {}, expectsBody: boolean = true): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    return this.makeRequestWithRetry<T>(url, options, expectsBody)
  }

  private async makeRequest<T>(url: string, options: RequestInit = {}, expectsBody: boolean = true): Promise<T> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout)

    try {
      const token = this.authManager.getValidToken()
      const response = await fetch(url, {
        ...options,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
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

        if (attempt === this.maxRetries || (lastError.statusCode && lastError.statusCode < 500)) {
          throw lastError
        }

        const delay = Math.pow(2, attempt - 1) * 1000
        await this.sleep(delay)
      }
    }

    throw lastError!
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}