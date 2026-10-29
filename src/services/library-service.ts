import { HttpClient } from '../http/http-client'
import { TonalClientError, TonalProgramLibraryEntry, TonalWorkoutLibraryEntry } from '../types'
import { CacheManager } from '../utils/cache-manager'

const WORKOUT_LIBRARY_CACHE_KEY = 'library-workouts'
const PROGRAM_LIBRARY_CACHE_KEY = 'library-programs'

/**
 * Tonal's published guided-workout and program indexes. The workout index is several
 * megabytes, so both are cached on disk like movements (24 hours by default). The indexes
 * carry no user-specific fields, so one cache serves every account.
 */
export class LibraryService {
  private cacheManager: CacheManager

  constructor(private httpClient: HttpClient, cacheDir?: string) {
    this.cacheManager = new CacheManager(cacheDir)
  }

  async getWorkoutLibrary(useCache: boolean = true): Promise<TonalWorkoutLibraryEntry[]> {
    return this.getIndex<TonalWorkoutLibraryEntry>(WORKOUT_LIBRARY_CACHE_KEY, '/workouts', useCache)
  }

  async getProgramLibrary(useCache: boolean = true): Promise<TonalProgramLibraryEntry[]> {
    return this.getIndex<TonalProgramLibraryEntry>(PROGRAM_LIBRARY_CACHE_KEY, '/programs', useCache)
  }

  async invalidateLibraryCache(): Promise<void> {
    await this.cacheManager.invalidate(WORKOUT_LIBRARY_CACHE_KEY)
    await this.cacheManager.invalidate(PROGRAM_LIBRARY_CACHE_KEY)
  }

  private async getIndex<T>(cacheKey: string, endpoint: string, useCache: boolean): Promise<T[]> {
    if (useCache) {
      const cached = await this.cacheManager.get<T[]>(cacheKey)
      if (cached) {
        return cached
      }
    }

    const index = await this.httpClient.request<unknown>(endpoint)
    // Never cache a malformed response: it would be served for the whole cache lifetime.
    if (!Array.isArray(index)) {
      throw new TonalClientError(`Expected the library index from ${endpoint} to be an array`)
    }
    try {
      await this.cacheManager.set(cacheKey, index)
    } catch {
      // Cache writes are best-effort and must not hide a successful API response.
    }
    return index as T[]
  }
}
