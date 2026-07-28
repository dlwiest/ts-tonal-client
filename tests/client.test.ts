import TonalClient, { TonalWorkoutActivity } from '../src'

function workoutActivity(id: string): TonalWorkoutActivity {
  return {
    id,
    userId: 'user-1',
    workoutId: `workout-${id}`,
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
    workoutSetActivity: [],
  }
}

describe('TonalClient health export activity details', () => {
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
