import { HttpClient } from '../src/http/http-client'
import { WorkoutService } from '../src/services/workout-service'
import { TonalWorkoutEstimateSet } from '../src/types'

const workoutSet: TonalWorkoutEstimateSet = {
  blockStart: true,
  movementId: 'movement-1',
  prescribedDuration: 45,
  dropSet: false,
  repetition: 1,
  repetitionTotal: 1,
  blockNumber: 1,
  burnout: false,
  spotter: false,
  eccentric: false,
  chains: false,
  flex: false,
  warmUp: false,
  weightPercentage: 75,
  setGroup: 1,
  round: 1,
  description: 'Timed hold',
}

describe('WorkoutService', () => {
  let request: jest.Mock
  let service: WorkoutService

  beforeEach(() => {
    request = jest.fn().mockResolvedValue({ id: 'workout-1' })
    service = new WorkoutService({ request } as unknown as HttpClient)
  })

  it('sends the raw sets array when estimating workout duration', async () => {
    await service.estimateWorkoutDuration([workoutSet])

    expect(request).toHaveBeenCalledWith('/user-workouts/estimate', {
      method: 'POST',
      body: JSON.stringify([workoutSet]),
    })
  })

  it('sends the exact create workout body', async () => {
    await service.createWorkout({
      title: 'Timed workout',
      sets: [workoutSet],
      createdSource: 'FreeLift',
      shortDescription: 'A short summary',
      description: 'A full description',
    })

    expect(request).toHaveBeenCalledWith('/user-workouts', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Timed workout',
        sets: [workoutSet],
        createdSource: 'FreeLift',
        shortDescription: 'A short summary',
        description: 'A full description',
      }),
    })
  })

  it('sends the exact update workout body, including shortDescription', async () => {
    await service.updateWorkout({
      id: 'workout-1',
      title: 'Updated timed workout',
      shortDescription: 'Preserve this summary',
      description: 'Updated full description',
      coachId: 'coach-1',
      sets: [workoutSet],
      level: 'INTERMEDIATE',
      assetId: 'asset-1',
      createdSource: 'SharedWorkout',
    })

    expect(request).toHaveBeenCalledWith('/user-workouts/workout-1', {
      method: 'PUT',
      body: JSON.stringify({
        id: 'workout-1',
        title: 'Updated timed workout',
        shortDescription: 'Preserve this summary',
        description: 'Updated full description',
        coachId: 'coach-1',
        sets: [workoutSet],
        level: 'INTERMEDIATE',
        assetId: 'asset-1',
        createdSource: 'SharedWorkout',
      }),
    })
  })

  it.each([
    { scenario: 'omitted', shortDescription: undefined, expectedPresent: false },
    { scenario: 'an explicit empty string', shortDescription: '', expectedPresent: true },
    { scenario: 'a real value', shortDescription: 'Preserve this summary', expectedPresent: true },
  ])('serializes shortDescription when it is $scenario', async ({
    shortDescription,
    expectedPresent
  }) => {
    await service.updateWorkout({
      id: 'workout-1',
      title: 'Updated timed workout',
      shortDescription,
      description: 'Updated full description',
      coachId: 'coach-1',
      sets: [workoutSet],
      assetId: 'asset-1',
    })

    const options = request.mock.calls[0][1] as RequestInit
    const body = JSON.parse(options.body as string)

    expect(Object.prototype.hasOwnProperty.call(body, 'shortDescription')).toBe(expectedPresent)
    if (expectedPresent) {
      expect(body.shortDescription).toBe(shortDescription)
    }
  })

  it('trims surrounding whitespace from share URLs', async () => {
    await service.getWorkoutByShareUrl(' \thttps://share.tonal.com/workout/abc-123\n')

    expect(request).toHaveBeenCalledWith('/user-workouts/sharing-records/abc-123')
  })

  it('accepts a tracking query string on a share URL', async () => {
    await service.getWorkoutByShareUrl('https://share.tonal.com/workout/abc-123?utm_source=clipboard')

    expect(request).toHaveBeenCalledWith('/user-workouts/sharing-records/abc-123')
  })

  it('rejects an evil prefix before an otherwise valid share URL', async () => {
    await expect(
      service.getWorkoutByShareUrl('http://evil.com/https://share.tonal.com/workout/abc-123')
    ).rejects.toThrow('Invalid share URL format')
    expect(request).not.toHaveBeenCalled()
  })
})
