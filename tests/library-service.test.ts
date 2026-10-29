import fs from 'fs'
import os from 'os'
import path from 'path'
import { HttpClient } from '../src/http/http-client'
import { LibraryService } from '../src/services/library-service'
import { TonalClientError, TonalProgramLibraryEntry, TonalWorkoutLibraryEntry } from '../src/types'

// Typed fixtures double as type-honesty guards under `npm run typecheck`: this workout omits
// targetArea and carries the nulls observed in the live index, and the program has the
// always-empty workouts array. Making any of those stricter must fail to compile.
const WORKOUT: TonalWorkoutLibraryEntry = {
  id: 'workout-1',
  createdAt: '2026-01-01T00:00:00Z',
  title: 'Upper Body Burn',
  shortDescription: '',
  description: '',
  productionCode: 'P1',
  assetId: 'asset-1',
  coachId: 'coach-1',
  duration: 1800,
  publishState: 'published',
  programId: null,
  level: 'INTERMEDIATE',
  groupIds: null,
  tags: null,
  bodyRegions: null,
  goalIds: null,
  trainingEffectGoals: null,
  disableModification: false,
  publishedAt: '2026-01-01T00:00:00Z',
  localPublishedAt: '2026-01-01T00:00:00Z',
  type: 'Linear',
  style: '',
  trainingType: '',
  trainingTypeIds: [],
  primaryTrainingTypeName: 'Strength',
  mobileFriendly: false,
  live: false,
  recoveryWeight: false,
  supportedDevices: ['Classic'],
  featureGroupIds: null,
  movementIds: null,
  accessories: null,
  muscleGroupsForExclusion: null,
  playbackType: '',
  isImported: false,
  createdSource: null,
}

const PROGRAM: TonalProgramLibraryEntry = {
  id: 'program-1',
  createdAt: '2026-01-01T00:00:00Z',
  name: 'Six Week Strength',
  description: '',
  productionCode: 'P2',
  workoutsPerWeek: 4,
  cadence: [true, false, true, false, true, false, true],
  weeks: 6,
  publishState: 'published',
  publishedAt: '2026-01-01T00:00:00Z',
  level: 'BEGINNER',
  workouts: [],
  assetId: 'asset-2',
  goalIds: [],
  groupIds: null,
  coachId: 'coach-1',
  coachIds: ['coach-1'],
  trainingTypeIds: [],
  isAdjustable: false,
  nonComparableWorkouts: false,
  mobileFriendly: true,
  supportedDevices: ['Classic', 'T3'],
  featureGroupIds: null,
  excludeFromCoachHighlights: false,
  trainingEffectGoals: [],
  accessories: [],
}

describe('LibraryService', () => {
  let tempRoot: string
  let cacheDir: string
  let request: jest.Mock
  let service: LibraryService

  beforeEach(() => {
    tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ts-tonal-library-'))
    cacheDir = path.join(tempRoot, 'cache')
    request = jest.fn(async (endpoint: string) => (endpoint === '/workouts' ? [WORKOUT] : [PROGRAM]))
    service = new LibraryService({ request } as unknown as HttpClient, cacheDir)
  })

  afterEach(() => {
    fs.rmSync(tempRoot, { recursive: true, force: true })
  })

  it('fetches each index once and serves repeat calls from the disk cache', async () => {
    await expect(service.getWorkoutLibrary()).resolves.toEqual([WORKOUT])
    await expect(service.getProgramLibrary()).resolves.toEqual([PROGRAM])

    // A fresh service over the same directory proves the cache is on disk, not in memory.
    const reopened = new LibraryService({ request } as unknown as HttpClient, cacheDir)
    await expect(reopened.getWorkoutLibrary()).resolves.toEqual([WORKOUT])
    await expect(reopened.getProgramLibrary()).resolves.toEqual([PROGRAM])

    expect(request.mock.calls).toEqual([['/workouts'], ['/programs']])
  })

  it('keeps the two indexes in separate cache entries', async () => {
    await service.getWorkoutLibrary()
    await service.getProgramLibrary()

    await expect(service.getWorkoutLibrary()).resolves.toEqual([WORKOUT])
    await expect(service.getProgramLibrary()).resolves.toEqual([PROGRAM])
  })

  it('bypasses and refreshes the cache when useCache is false', async () => {
    await service.getWorkoutLibrary()
    const renamed = { ...WORKOUT, title: 'Renamed' }
    request.mockResolvedValueOnce([renamed])

    await expect(service.getWorkoutLibrary(false)).resolves.toEqual([renamed])
    await expect(service.getWorkoutLibrary()).resolves.toEqual([renamed])
    expect(request).toHaveBeenCalledTimes(2)
  })

  it('invalidateLibraryCache clears both indexes', async () => {
    await service.getWorkoutLibrary()
    await service.getProgramLibrary()

    await service.invalidateLibraryCache()
    await service.getWorkoutLibrary()
    await service.getProgramLibrary()

    expect(request).toHaveBeenCalledTimes(4)
  })

  it('rejects a non-array response without caching it', async () => {
    request.mockResolvedValueOnce({ error: 'unexpected' })

    await expect(service.getWorkoutLibrary()).rejects.toThrow(TonalClientError)
    await expect(service.getWorkoutLibrary()).resolves.toEqual([WORKOUT])
    expect(request).toHaveBeenCalledTimes(2)
  })

  it('still returns the index when the cache cannot be written', async () => {
    fs.mkdirSync(tempRoot, { recursive: true })
    fs.writeFileSync(cacheDir, 'not a directory')

    await expect(service.getWorkoutLibrary()).resolves.toEqual([WORKOUT])
  })
})
