import {
  chmod,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  stat,
  symlink,
  writeFile,
} from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { writeCompactHealthExport } from '../examples/export-health-data'
import {
  optionalMetric,
  sanitizeCompleteExport,
  writeChatGptBundle,
} from '../examples/export-complete-health-data'
import type { RetrievalError } from '../examples/export-complete-health-data'

const temporaryDirectories: string[] = []

async function temporaryDirectory(): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), 'tonal-export-test-'))
  temporaryDirectories.push(directory)
  return directory
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map(directory =>
      rm(directory, { recursive: true, force: true })
    )
  )
})

describe('private export files', () => {
  it('atomically replaces a permissive compact export with owner-only permissions', async () => {
    const directory = await temporaryDirectory()
    const outputPath = join(directory, 'tonal-health-export.json')
    await writeFile(outputPath, 'old private data', { mode: 0o666 })
    await chmod(outputPath, 0o666)

    await writeCompactHealthExport(outputPath, { activities: [{ id: 'new' }] })

    expect(JSON.parse(await readFile(outputPath, 'utf8'))).toEqual({
      activities: [{ id: 'new' }],
    })
    expect((await stat(outputPath)).mode & 0o777).toBe(0o600)
  })

  it('rejects a compact-export symlink without changing its target', async () => {
    const directory = await temporaryDirectory()
    const targetPath = join(directory, 'target.json')
    const outputPath = join(directory, 'tonal-health-export.json')
    await writeFile(targetPath, 'must remain private')
    await symlink(targetPath, outputPath)

    await expect(
      writeCompactHealthExport(outputPath, { replacement: true })
    ).rejects.toThrow('Refusing to replace symbolic link')
    expect(await readFile(targetPath, 'utf8')).toBe('must remain private')
  })

  it('recreates a complete bundle so stale workout segments cannot survive', async () => {
    const directory = await temporaryDirectory()
    const bundlePath = join(directory, 'tonal-chatgpt-export')

    await writeChatGptBundle(
      bundlePath,
      { exportType: 'complete' },
      new Map([
        ['2024', [{ id: 'old' }]],
        ['2025', [{ id: 'current' }]],
      ]),
      { resistance: 'pounds' }
    )
    await writeChatGptBundle(
      bundlePath,
      { exportType: 'complete' },
      new Map([['2025', [{ id: 'shorter-history' }]]]),
      { resistance: 'pounds' }
    )

    expect((await readdir(bundlePath)).sort()).toEqual([
      'overview-and-metrics.json',
      'workouts-2025.json',
    ])
    expect(
      JSON.parse(await readFile(join(bundlePath, 'overview-and-metrics.json'), 'utf8'))
        .workoutFiles
    ).toEqual(['workouts-2025.json'])
    expect(
      JSON.parse(await readFile(join(bundlePath, 'workouts-2025.json'), 'utf8')).workouts
    ).toEqual([{ id: 'shorter-history' }])
    expect((await stat(bundlePath)).mode & 0o777).toBe(0o700)
    expect((await stat(join(bundlePath, 'workouts-2025.json'))).mode & 0o777).toBe(
      0o600
    )
  })

  it('rejects a complete-bundle destination symlink', async () => {
    const directory = await temporaryDirectory()
    const targetDirectory = join(directory, 'unrelated')
    const bundlePath = join(directory, 'tonal-chatgpt-export')
    await mkdir(targetDirectory)
    await writeFile(join(targetDirectory, 'keep.txt'), 'keep')
    await symlink(targetDirectory, bundlePath)

    await expect(
      writeChatGptBundle(bundlePath, {}, new Map(), {})
    ).rejects.toThrow('Refusing to replace symbolic link')
    expect(await readFile(join(targetDirectory, 'keep.txt'), 'utf8')).toBe('keep')
  })

  it('rejects pre-existing managed symlinks instead of following or removing them', async () => {
    const directory = await temporaryDirectory()
    const targetPath = join(directory, 'target.json')
    const bundlePath = join(directory, 'tonal-chatgpt-export')
    await writeFile(targetPath, 'keep target')
    await mkdir(bundlePath, { mode: 0o700 })
    await symlink(targetPath, join(bundlePath, 'overview-and-metrics.json'))

    await expect(
      writeChatGptBundle(bundlePath, {}, new Map(), {})
    ).rejects.toThrow('Refusing to replace managed symbolic link')
    expect(await readFile(targetPath, 'utf8')).toBe('keep target')
  })

  it('does not replace a bundle containing an unrelated directory', async () => {
    const directory = await temporaryDirectory()
    const bundlePath = join(directory, 'tonal-chatgpt-export')
    const unrelatedPath = join(bundlePath, 'personal-files')
    await mkdir(unrelatedPath, { recursive: true })
    await writeFile(join(unrelatedPath, 'keep.txt'), 'keep')

    await expect(
      writeChatGptBundle(bundlePath, {}, new Map(), {})
    ).rejects.toThrow('Refusing to remove unmanaged export entry')
    expect(await readFile(join(unrelatedPath, 'keep.txt'), 'utf8')).toBe('keep')
  })

  it('refuses to treat an arbitrary directory as the managed bundle', async () => {
    const directory = await temporaryDirectory()
    const unrelatedPath = join(directory, 'other-export')
    await mkdir(unrelatedPath)
    await writeFile(join(unrelatedPath, 'overview-and-metrics.json'), 'keep')

    await expect(
      writeChatGptBundle(unrelatedPath, {}, new Map(), {})
    ).rejects.toThrow('not named tonal-chatgpt-export')
    expect(
      await readFile(join(unrelatedPath, 'overview-and-metrics.json'), 'utf8')
    ).toBe('keep')
  })

})

describe('optional complete-export metrics', () => {
  it('records only fixed categories when a provider error contains private text', async () => {
    const errors: RetrievalError[] = []

    const result = await optionalMetric(
      'dailyMetrics',
      async () => {
        throw new Error(
          'request for private@example.com user-123 failed at /Users/private/.env'
        )
      },
      errors
    )

    expect(result).toBeUndefined()
    expect(errors).toEqual([
      {
        metric: 'dailyMetrics',
        category: 'provider-error',
        status: 'unavailable',
      },
    ])
    expect(JSON.stringify(errors)).not.toContain('private@example.com')
    expect(sanitizeCompleteExport({ retrievalErrors: errors })).toEqual({
      retrievalErrors: [
        {
          metric: 'dailyMetrics',
          category: 'provider-error',
          status: 'unavailable',
        },
      ],
    })
    expect(JSON.stringify(errors)).not.toContain('/Users/private')
  })
})
