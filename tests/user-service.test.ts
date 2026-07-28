import { HttpClient } from '../src/http/http-client'
import { UserService } from '../src/services/user-service'

describe('UserService workout activities', () => {
  const request = jest.fn()
  const service = new UserService({ request } as unknown as HttpClient)

  beforeEach(() => {
    request.mockReset()
  })

  it('requests a paginated page of detailed workout activities', async () => {
    request.mockResolvedValue([])

    await service.getWorkoutActivities('user-1', 100, 50)

    expect(request).toHaveBeenCalledWith('/users/user-1/workout-activities', {
      method: 'GET',
      headers: {
        'pg-offset': '100',
        'pg-limit': '50',
      },
    })
  })

  it('requests a single workout activity and encodes its ID', async () => {
    request.mockResolvedValue({})

    await service.getWorkoutActivityById('user-1', 'activity/id')

    expect(request).toHaveBeenCalledWith(
      '/users/user-1/workout-activities/activity%2Fid'
    )
  })

  it.each([
    [-1, 50, 'Offset must be a non-negative integer'],
    [1.5, 50, 'Offset must be a non-negative integer'],
    [0, 0, 'Limit must be an integer between 1 and 100'],
    [0, 101, 'Limit must be an integer between 1 and 100'],
  ])('rejects invalid pagination', async (offset, limit, message) => {
    await expect(service.getWorkoutActivities('user-1', offset, limit)).rejects.toThrow(message)
    expect(request).not.toHaveBeenCalled()
  })

  it('rejects an empty activity ID', async () => {
    await expect(service.getWorkoutActivityById('user-1', '  ')).rejects.toThrow(
      'Workout activity ID is required'
    )
    expect(request).not.toHaveBeenCalled()
  })
})
