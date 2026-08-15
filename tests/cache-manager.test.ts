import fs from 'fs'
import os from 'os'
import path from 'path'
import { CacheManager } from '../src/utils/cache-manager'

describe('CacheManager', () => {
  let tempRoot: string
  let cacheDir: string

  beforeEach(() => {
    tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ts-tonal-cache-'))
    cacheDir = path.join(tempRoot, 'cache')
  })

  afterEach(() => {
    jest.restoreAllMocks()
    jest.useRealTimers()
    fs.rmSync(tempRoot, { recursive: true, force: true })
  })

  it('expires entries after their TTL', async () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-01-01T00:00:00.000Z'))

    const cache = new CacheManager(cacheDir, 1000)
    await cache.set('short-lived', { value: 'fresh' })

    await expect(cache.get('short-lived')).resolves.toEqual({ value: 'fresh' })

    jest.advanceTimersByTime(1001)

    await expect(cache.get('short-lived')).resolves.toBeNull()
  })

  it('treats an invalid cachedAt timestamp as a cache miss', async () => {
    fs.mkdirSync(cacheDir)
    fs.writeFileSync(path.join(cacheDir, 'invalid-date.json'), JSON.stringify({
      cachedAt: 'not-a-date',
      ttl: 1000,
      data: { value: 'stale' },
    }))

    const cache = new CacheManager(cacheDir)

    await expect(cache.get('invalid-date')).resolves.toBeNull()
  })

  it('treats an entry without a TTL as a cache miss', async () => {
    fs.mkdirSync(cacheDir)
    fs.writeFileSync(path.join(cacheDir, 'missing-ttl.json'), JSON.stringify({
      cachedAt: new Date(Date.now() - 10 * 365 * 24 * 60 * 60 * 1000).toISOString(),
      data: { value: 'stale' },
    }))

    const cache = new CacheManager(cacheDir)

    await expect(cache.get('missing-ttl')).resolves.toBeNull()
  })

  it('atomically replaces the cache file through a temporary file', async () => {
    const cache = new CacheManager(cacheDir)
    const writeSpy = jest.spyOn(fs, 'writeFileSync')
    const renameSpy = jest.spyOn(fs, 'renameSync')
    const cachePath = path.join(cacheDir, 'movements.json')
    const tempPath = `${cachePath}.tmp`

    await cache.set('movements', [{ id: 'movement-1' }])

    expect(writeSpy).toHaveBeenCalledWith(tempPath, expect.any(String), 'utf-8')
    expect(renameSpy).toHaveBeenCalledWith(tempPath, cachePath)
    expect(fs.existsSync(cachePath)).toBe(true)
    expect(fs.existsSync(tempPath)).toBe(false)
  })

  it('clears JSON cache files and their temporary orphans', async () => {
    fs.mkdirSync(path.join(cacheDir, 'webpack'), { recursive: true })
    fs.writeFileSync(path.join(cacheDir, 'movements.json'), '{}')
    fs.writeFileSync(path.join(cacheDir, 'movements.json.tmp'), '{"partial')
    fs.writeFileSync(path.join(cacheDir, 'eslintcache'), 'foreign data')

    const cache = new CacheManager(cacheDir)

    await expect(cache.clear()).resolves.toBeUndefined()
    expect(fs.existsSync(path.join(cacheDir, 'movements.json'))).toBe(false)
    expect(fs.existsSync(path.join(cacheDir, 'movements.json.tmp'))).toBe(false)
    expect(fs.existsSync(path.join(cacheDir, 'eslintcache'))).toBe(true)
    expect(fs.existsSync(path.join(cacheDir, 'webpack'))).toBe(true)
  })

  it('does not create the cache directory until the first set', async () => {
    const cache = new CacheManager(cacheDir)

    expect(fs.existsSync(cacheDir)).toBe(false)
    await expect(cache.get('missing')).resolves.toBeNull()
    expect(fs.existsSync(cacheDir)).toBe(false)

    await cache.set('created', { value: true })

    expect(fs.existsSync(cacheDir)).toBe(true)
    await expect(cache.get('created')).resolves.toEqual({ value: true })
  })
})
