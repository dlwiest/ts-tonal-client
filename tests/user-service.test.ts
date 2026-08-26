import { TonalClient } from '../src/client'
import { HttpClient } from '../src/http/http-client'
import { UserService } from '../src/services/user-service'
import {
  TonalClientError,
  TonalStrengthScore,
  TonalStrengthScoreHistoryEntry,
} from '../src/types'

const overallStrengthScore: TonalStrengthScore = {
  id: 'score-overall',
  createdAt: '2026-02-24T12:00:00.000Z',
  updatedAt: '0001-01-01T00:00:00Z',
  userId: 'user-1',
  workoutActivityId: '00000000-0000-0000-0000-000000000000',
  strengthBodyRegion: 'Overall',
  bodyRegionDisplay: '',
  score: 1292,
  current: true,
}

const historyEntry = (id: number): TonalStrengthScoreHistoryEntry => ({
  id: `score-${id}`,
  userId: 'user-1',
  workoutActivityId: `activity-${id}`,
  upper: 1693,
  lower: 821,
  core: 1363,
  overall: 1292,
  activityTime: '2026-02-24T12:00:00.000Z',
})

function createClient(request: jest.Mock): TonalClient {
  const client = Object.create(TonalClient.prototype) as TonalClient
  Object.assign(client, {
    userService: new UserService({ request } as unknown as HttpClient),
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

  it('returns an empty strength score history array as-is', async () => {
    const response: TonalStrengthScoreHistoryEntry[] = []
    request.mockResolvedValue(response)

    const result = await service.getStrengthScoreHistory('user-1', 100)

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

describe('TonalClient strength scores', () => {
  afterEach(() => {
    jest.useRealTimers()
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
        createdAt: '2023-04-27T15:46:21.205+0000',
      })
      .mockResolvedValueOnce([])
    const client = createClient(request)

    await expect(client.getStrengthScoreHistory()).resolves.toEqual([])

    expect(request).toHaveBeenNthCalledWith(1, '/users/userinfo')
    expect(request).toHaveBeenNthCalledWith(
      2,
      '/users/user-1/strength-scores/history?limit=1218'
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
