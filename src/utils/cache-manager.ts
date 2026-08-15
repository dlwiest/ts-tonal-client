import fs from 'fs'
import os from 'os'
import path from 'path'

interface CacheEntry<T> {
  cachedAt: string
  ttl: number
  data: T
}

export class CacheManager {
  private cacheDir: string
  private defaultTTL: number

  constructor(
    cacheDir: string = process.env.XDG_CACHE_HOME
      ? path.join(process.env.XDG_CACHE_HOME, 'ts-tonal-client')
      : path.join(os.homedir(), '.cache', 'ts-tonal-client'),
    defaultTTL: number = 24 * 60 * 60 * 1000
  ) {
    this.cacheDir = cacheDir
    this.defaultTTL = defaultTTL
  }

  private ensureCacheDir(): void {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true })
    }
  }

  private getCachePath(key: string): string {
    return path.join(this.cacheDir, `${key}.json`)
  }

  async get<T>(key: string): Promise<T | null> {
    const cachePath = this.getCachePath(key)

    if (!fs.existsSync(cachePath)) {
      return null
    }

    try {
      const content = fs.readFileSync(cachePath, 'utf-8')
      const entry: CacheEntry<T> = JSON.parse(content)

      const cachedAt = new Date(entry.cachedAt).getTime()
      const now = Date.now()
      const age = now - cachedAt

      if (!Number.isFinite(cachedAt) || typeof entry.ttl !== 'number' || age > entry.ttl) {
        return null
      }

      return entry.data
    } catch (error) {
      // If there's an error reading/parsing cache, treat as cache miss
      return null
    }
  }

  async set<T>(key: string, data: T, ttl?: number): Promise<void> {
    const cachePath = this.getCachePath(key)
    this.ensureCacheDir()
    const entry: CacheEntry<T> = {
      cachedAt: new Date().toISOString(),
      ttl: ttl || this.defaultTTL,
      data,
    }

    const tempPath = `${cachePath}.tmp`
    fs.writeFileSync(tempPath, JSON.stringify(entry, null, 2), 'utf-8')
    fs.renameSync(tempPath, cachePath)
  }

  async invalidate(key: string): Promise<void> {
    const cachePath = this.getCachePath(key)
    if (fs.existsSync(cachePath)) {
      fs.unlinkSync(cachePath)
    }
  }

  async clear(): Promise<void> {
    if (fs.existsSync(this.cacheDir)) {
      const files = fs.readdirSync(this.cacheDir).filter(
        file => file.endsWith('.json') || file.endsWith('.json.tmp')
      )
      for (const file of files) {
        fs.unlinkSync(path.join(this.cacheDir, file))
      }
    }
  }
}
