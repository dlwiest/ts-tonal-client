import TonalClient, { TonalWorkoutActivity } from '../src'

function workoutActivity(id: string): TonalWorkoutActivity {
  return {
    id,
    userId: 'user-1',
    workoutId: `workout-${id}`,
    subscriptionId: 'subscription-1',
    workoutType: 'Custom',
    timezone: 'America/Chicago',
    beginTime: '2026-01-01T00:00:00.000Z',
    endTime: '2026-01-01T00:30:00.000Z',
    totalDuration: 1800,
    activeDuration: 1200,
    restDuration: 600,
    totalMovements: 1,
    totalSets: 1,
    totalReps: 10,
    totalVolume: 1000,
    totalConcentricWork: 50,
    percentCompleted: 100,
    completed: true,
    recoveryWeight: false,
    hasAppleWatch: false,
    isFirstWorkoutOfDay: false,
    isSmartViewActivated: false,
    mcbServiceVersion: '1.0.0',
    workoutSetActivity: [],
  }
}

describe('TonalClient health export activity details', () => {
  it('retrieves complete workout history using pagination', async () => {
    const firstPage = Array.from({ length: 100 }, (_, index) =>
      workoutActivity(`activity-${index}`)
    )
    const secondPage = [workoutActivity('activity-100')]
    const getWorkoutActivities = jest
      .fn()
      .mockResolvedValueOnce(firstPage)
      .mockResolvedValueOnce(secondPage)
    const client = Object.create(TonalClient.prototype) as TonalClient

    Object.assign(client as object, {
      userService: { getWorkoutActivities },
      getUserInfo: jest.fn().mockResolvedValue({ id: 'user-1' }),
    })

    const activities = await client.getAllWorkoutActivities()

    expect(activities).toHaveLength(101)
    expect(getWorkoutActivities).toHaveBeenNthCalledWith(
      1,
      'user-1',
      0,
      100
    )
    expect(getWorkoutActivities).toHaveBeenNthCalledWith(
      2,
      'user-1',
      100,
      100
    )
  })

  it('stops with a clear error at the workout activity page cap', async () => {
    const getWorkoutActivities = jest.fn(
      async (_userId: string, offset: number, limit: number) => {
        if (offset >= 1000) {
          throw new Error('test runaway pagination')
        }
        return Array.from({ length: limit }, (_, index) =>
          workoutActivity(`activity-${offset + index}`)
        )
      }
    )
    const client = Object.create(TonalClient.prototype) as TonalClient

    Object.assign(client as object, {
      userService: { getWorkoutActivities },
      getUserInfo: jest.fn().mockResolvedValue({ id: 'user-1' }),
    })

    await expect(client.getAllWorkoutActivities(1)).rejects.toThrow(
      'exceeded the 1000-page safety limit'
    )
    expect(getWorkoutActivities).toHaveBeenCalledTimes(1000)
  })

  it('rejects a full page that does not advance workout activity results', async () => {
    const page = [workoutActivity('activity-1')]
    const getWorkoutActivities = jest
      .fn()
      .mockResolvedValueOnce(page)
      .mockResolvedValueOnce(page)
      .mockRejectedValue(new Error('test runaway pagination'))
    const client = Object.create(TonalClient.prototype) as TonalClient

    Object.assign(client as object, {
      userService: { getWorkoutActivities },
      getUserInfo: jest.fn().mockResolvedValue({ id: 'user-1' }),
    })

    await expect(client.getAllWorkoutActivities(1)).rejects.toThrow(
      'did not advance at offset 1'
    )
    expect(getWorkoutActivities).toHaveBeenCalledTimes(2)
  })

  it('finds requested details in paginated workout activity data', async () => {
    const firstPage = Array.from({ length: 100 }, (_, index) =>
      workoutActivity(`activity-${index}`)
    )
    const secondPage = [
      workoutActivity('activity-100'),
      workoutActivity('activity-101'),
    ]
    const getWorkoutActivities = jest
      .fn()
      .mockResolvedValueOnce(firstPage)
      .mockResolvedValueOnce(secondPage)
    const client = Object.create(TonalClient.prototype) as TonalClient

    Object.assign(client as object, {
      userService: { getWorkoutActivities },
      getUserInfo: jest.fn().mockResolvedValue({ id: 'user-1' }),
    })

    const details = await (
      client as unknown as {
        getWorkoutActivityDetails(ids: string[]): Promise<TonalWorkoutActivity[]>
      }
    ).getWorkoutActivityDetails([
      'activity-99',
      'activity-101',
      'external-activity-without-tonal-details',
    ])

    expect(details.map(detail => detail.id)).toEqual([
      'activity-99',
      'activity-101',
    ])
    expect(getWorkoutActivities).toHaveBeenNthCalledWith(
      1,
      'user-1',
      0,
      100
    )
    expect(getWorkoutActivities).toHaveBeenNthCalledWith(
      2,
      'user-1',
      100,
      100
    )
  })
})
