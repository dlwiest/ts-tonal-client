import fs from 'fs'
import path from 'path'

interface CacheEntry<T> {
  cachedAt: string
  ttl: number
  data: T
}

export class CacheManager {
  private cacheDir: string
  private defaultTTL: number

  constructor(cacheDir: string = '.cache', defaultTTL: number = 24 * 60 * 60 * 1000) {
    this.cacheDir = cacheDir
    this.defaultTTL = defaultTTL
    this.ensureCacheDir()
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

      if (age > entry.ttl) {
        // Cache expired
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
    const entry: CacheEntry<T> = {
      cachedAt: new Date().toISOString(),
      ttl: ttl || this.defaultTTL,
      data,
    }

    fs.writeFileSync(cachePath, JSON.stringify(entry, null, 2), 'utf-8')
  }

  async invalidate(key: string): Promise<void> {
    const cachePath = this.getCachePath(key)
    if (fs.existsSync(cachePath)) {
      fs.unlinkSync(cachePath)
    }
  }

  async clear(): Promise<void> {
    if (fs.existsSync(this.cacheDir)) {
      const files = fs.readdirSync(this.cacheDir)
      for (const file of files) {
        fs.unlinkSync(path.join(this.cacheDir, file))
      }
    }
  }
}
