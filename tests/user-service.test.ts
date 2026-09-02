import { createHash } from 'crypto'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { TonalClient } from '../src/client'
import { HttpClient } from '../src/http/http-client'
import { UserService } from '../src/services/user-service'
import {
  TonalClientError,
  TonalStrengthScore,
  TonalStrengthScoreHistoryEntry,
  TonalWorkoutActivity,
} from '../src/types'

const overallStrengthScore: TonalStrengthScore = {
  id: 'score-overall',
  createdAt: '2024-03-01T12:00:00.000Z',
  updatedAt: '0001-01-01T00:00:00Z',
  userId: 'user-1',
  workoutActivityId: '00000000-0000-0000-0000-000000000000',
  strengthBodyRegion: 'Overall',
  bodyRegionDisplay: '',
  score: 900,
  current: true,
}

const historyEntry = (id: number): TonalStrengthScoreHistoryEntry => ({
  id: `score-${id}`,
  userId: 'user-1',
  workoutActivityId: `activity-${id}`,
  upper: 1000,
  lower: 800,
  core: 900,
  overall: 900,
  activityTime: '2024-03-01T12:00:00.000Z',
})

const sparseActivity: TonalWorkoutActivity = {
  id: 'activity-1',
  userId: 'user-1',
  workoutId: 'workout-1',
  beginTime: '2024-03-01T12:00:00.000Z',
  totalDuration: 600,
  totalSets: 1,
  totalReps: 10,
  totalVolume: 350,
  workoutSetActivity: [
    {
      movementId: 'movement-1',
      baseWeight: 35,
    },
  ],
}

const sparseCompletedActivity: TonalWorkoutActivity = {
  ...sparseActivity,
  completed: true,
}

function createClient(request: jest.Mock, cacheDir?: string): TonalClient {
  const client = Object.create(TonalClient.prototype) as TonalClient
  Object.assign(client, {
    userService: new UserService({ request } as unknown as HttpClient, cacheDir),
  })
  return client
}

describe('UserService strength scores', () => {
  let request: jest.Mock
  let service: UserService

  beforeEach(() => {
    request = jest.fn()
    service = new UserService({ request } as unknown as HttpClient)
  })

  it('requests current strength scores and accepts a sparse Overall row', async () => {
    request.mockResolvedValue([overallStrengthScore])

    await expect(service.getCurrentStrengthScores('user-1')).resolves.toEqual([
      overallStrengthScore,
    ])
    expect(request).toHaveBeenCalledWith('/users/user-1/strength-scores/current')
  })

  it('uses days as the unchanged limit query value without truncating rows', async () => {
    const response = Array.from({ length: 5 }, (_, index) => historyEntry(index + 1))
    request.mockResolvedValue(response)

    const result = await service.getStrengthScoreHistory('user-1', 2)

    expect(request).toHaveBeenCalledWith(
      '/users/user-1/strength-scores/history?limit=2'
    )
    expect(result).toBe(response)
    expect(result).toHaveLength(5)
  })

  it('returns an empty array for a window shorter than the gap since the last activity', async () => {
    // Real behavior: `limit` is a day window, so a small value on a dormant account returns
    // [] rather than an error. Measured live: limit=100 -> 0 rows, limit=200 -> 9 rows.
    // The URL assertion is what makes this a real guard; an identity check alone would pass
    // even if the endpoint were wrong or the response were sliced.
    const response: TonalStrengthScoreHistoryEntry[] = []
    request.mockResolvedValue(response)

    const result = await service.getStrengthScoreHistory('user-1', 100)

    expect(request).toHaveBeenCalledWith(
      '/users/user-1/strength-scores/history?limit=100'
    )
    expect(result).toBe(response)
  })

  it.each([0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])(
    'rejects invalid history days %p at the transport boundary',
    async (days) => {
      await expect(service.getStrengthScoreHistory('user-1', days)).rejects.toThrow(
        TonalClientError
      )
      expect(request).not.toHaveBeenCalled()
    }
  )
})

describe('UserService workout activity detail', () => {
  let tempRoot: string
  let cacheDir: string
  let request: jest.Mock
  let service: UserService

  beforeEach(() => {
    tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ts-tonal-activity-'))
    cacheDir = path.join(tempRoot, 'cache')
    request = jest.fn()
    service = new UserService({ request } as unknown as HttpClient, cacheDir)
  })

  afterEach(() => {
    fs.rmSync(tempRoot, { recursive: true, force: true })
  })

  it('requests the encoded canonical activity id as one path segment', async () => {
    request.mockResolvedValue(sparseCompletedActivity)

    await expect(
      service.getWorkoutActivityById('user-1', ' activity/one ')
    ).resolves.toBe(sparseCompletedActivity)
    expect(request).toHaveBeenCalledWith(
      '/users/user-1/workout-activities/activity%2Fone'
    )
  })

  it.each(['', '   ', '\t\n'])(
    'rejects an empty activity id %p before requesting',
    async (activityId) => {
      await expect(
        service.getWorkoutActivityById('user-1', activityId)
      ).rejects.toThrow(TonalClientError)
      expect(request).not.toHaveBeenCalled()
      expect(fs.existsSync(cacheDir)).toBe(false)
    }
  )

  it('caches a completed activity permanently and serves the second call from cache', async () => {
    const response = { ...sparseCompletedActivity, id: 'activity-complete' }
    request.mockResolvedValue(response)

    await expect(
      service.getWorkoutActivityById('user-1', 'activity-complete')
    ).resolves.toBe(response)
    await expect(
      service.getWorkoutActivityById('user-1', 'activity-complete')
    ).resolves.toEqual(response)

    expect(request).toHaveBeenCalledTimes(1)
  })

  it('does not cache an incomplete activity', async () => {
    const response: TonalWorkoutActivity = {
      ...sparseActivity,
      id: 'activity-incomplete',
      completed: false,
    }
    request.mockResolvedValue(response)

    await service.getWorkoutActivityById('user-1', 'activity-incomplete')
    await service.getWorkoutActivityById('user-1', 'activity-incomplete')

    expect(request).toHaveBeenCalledTimes(2)
    expect(fs.existsSync(cacheDir)).toBe(false)
  })

  it('does not cache an activity when completed is absent', async () => {
    const response: TonalWorkoutActivity = {
      ...sparseActivity,
      id: 'activity-without-completed',
    }
    request.mockResolvedValue(response)

    await service.getWorkoutActivityById('user-1', 'activity-without-completed')
    await service.getWorkoutActivityById('user-1', 'activity-without-completed')

    expect(request).toHaveBeenCalledTimes(2)
    expect(fs.existsSync(cacheDir)).toBe(false)
  })

  it('bypasses and replaces a completed cache entry when useCache is false', async () => {
    const initial = {
      ...sparseCompletedActivity,
      id: 'activity-refresh',
      totalVolume: 350,
    }
    const refreshed = {
      ...initial,
      totalVolume: 425,
    }
    request.mockResolvedValueOnce(initial).mockResolvedValueOnce(refreshed)

    await service.getWorkoutActivityById('user-1', 'activity-refresh')
    await expect(
      service.getWorkoutActivityById('user-1', 'activity-refresh', false)
    ).resolves.toBe(refreshed)
    await expect(
      service.getWorkoutActivityById('user-1', 'activity-refresh')
    ).resolves.toEqual(refreshed)

    expect(request).toHaveBeenCalledTimes(2)
  })

  it('falls through a corrupt cache entry to a successful request', async () => {
    const activityId = 'corrupt/activity'
    const cacheKey = `workout-activity-v1-${createHash('sha256')
      .update(`user-1\0${activityId}`)
      .digest('hex')}`
    fs.mkdirSync(cacheDir)
    fs.writeFileSync(path.join(cacheDir, `${cacheKey}.json`), '{not json')
    request.mockResolvedValue(sparseCompletedActivity)

    await expect(
      service.getWorkoutActivityById('user-1', activityId)
    ).resolves.toBe(sparseCompletedActivity)
    expect(request).toHaveBeenCalledWith(
      '/users/user-1/workout-activities/corrupt%2Factivity'
    )
  })
})

describe('TonalClient strength scores', () => {
  afterEach(() => {
    jest.useRealTimers()
  })

  it('resolves user info once and delegates current scores with the resolved id', async () => {
    const response = [overallStrengthScore]
    const request = jest
      .fn()
      .mockResolvedValueOnce({ id: 'user-1' })
      .mockResolvedValueOnce(response)
    const client = createClient(request)

    const result = await client.getCurrentStrengthScores()

    expect(request).toHaveBeenNthCalledWith(1, '/users/userinfo')
    expect(request).toHaveBeenNthCalledWith(2, '/users/user-1/strength-scores/current')
    expect(request).toHaveBeenCalledTimes(2)
    expect(result).toBe(response)
  })

  it('passes explicit days unchanged and does not truncate history rows', async () => {
    const response = Array.from({ length: 5 }, (_, index) => historyEntry(index + 1))
    const request = jest
      .fn()
      .mockResolvedValueOnce({ id: 'user-1' })
      .mockResolvedValueOnce(response)
    const client = createClient(request)

    const result = await client.getStrengthScoreHistory(2)

    expect(request).toHaveBeenNthCalledWith(
      2,
      '/users/user-1/strength-scores/history?limit=2'
    )
    expect(result).toBe(response)
    expect(result).toHaveLength(5)
  })

  it("derives the 'all' day window from createdAt and sends the exact URL", async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-08-25T12:00:00.000Z'))
    const request = jest
      .fn()
      .mockResolvedValueOnce({
        id: 'user-1',
        createdAt: '2024-01-01T00:00:00.000+0000',
      })
      .mockResolvedValueOnce([])
    const client = createClient(request)

    await expect(client.getStrengthScoreHistory()).resolves.toEqual([])

    expect(request).toHaveBeenNthCalledWith(1, '/users/userinfo')
    expect(request).toHaveBeenNthCalledWith(
      2,
      '/users/user-1/strength-scores/history?limit=970'
    )
  })

  it.each([
    { scenario: 'unparseable', createdAt: 'not-a-date' },
    { scenario: 'future', createdAt: '2026-08-26T12:00:00.000Z' },
    { scenario: 'missing', createdAt: undefined },
  ])('rejects $scenario createdAt instead of using a fallback', async ({ createdAt }) => {
    jest.useFakeTimers().setSystemTime(new Date('2026-08-25T12:00:00.000Z'))
    const userInfo = createdAt === undefined
      ? { id: 'user-1' }
      : { id: 'user-1', createdAt }
    const request = jest.fn().mockResolvedValue(userInfo)
    const client = createClient(request)

    await expect(client.getStrengthScoreHistory()).rejects.toThrow(
      'pass explicit days'
    )
    expect(request).toHaveBeenCalledTimes(1)
  })

  it.each([0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])(
    'rejects invalid public history days %p',
    async (days) => {
      const request = jest.fn()
      const client = createClient(request)

      await expect(client.getStrengthScoreHistory(days)).rejects.toThrow(
        TonalClientError
      )
      expect(request).not.toHaveBeenCalled()
    }
  )
})

describe('TonalClient workout activity detail', () => {
  it('resolves the user id and delegates activity retrieval with the cache choice', async () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ts-tonal-client-activity-'))
    const request = jest
      .fn()
      .mockResolvedValueOnce({ id: 'user-1' })
      .mockResolvedValueOnce(sparseActivity)
    const client = createClient(request, path.join(tempRoot, 'cache'))

    try {
      await expect(
        client.getWorkoutActivityById('activity/one', false)
      ).resolves.toBe(sparseActivity)
      expect(request).toHaveBeenNthCalledWith(1, '/users/userinfo')
      expect(request).toHaveBeenNthCalledWith(
        2,
        '/users/user-1/workout-activities/activity%2Fone'
      )
      expect(request).toHaveBeenCalledTimes(2)
    } finally {
      fs.rmSync(tempRoot, { recursive: true, force: true })
    }
  })
})
