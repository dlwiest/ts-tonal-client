import { HttpClient } from '../http/http-client'
import { TonalMovement } from '../types'
import { CacheManager } from '../utils/cache-manager'

export class MovementService {
  private cacheManager: CacheManager

  constructor(private httpClient: HttpClient, cacheDir?: string) {
    this.cacheManager = new CacheManager(cacheDir)
  }

  async getMovements(useCache: boolean = true): Promise<TonalMovement[]> {
    if (useCache) {
      const cached = await this.cacheManager.get<TonalMovement[]>('movements')
      if (cached) {
        return cached
      }
    }

    const movements = await this.httpClient.request<TonalMovement[]>('/movements')
    try {
      await this.cacheManager.set('movements', movements)
    } catch {
      // Cache writes are best-effort and must not hide a successful API response.
    }
    return movements
  }

  async invalidateMovementsCache(): Promise<void> {
    await this.cacheManager.invalidate('movements')
  }
}