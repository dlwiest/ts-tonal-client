import { HttpClient } from '../http/http-client'
import {
  TonalWorkout,
  TonalSharedWorkout,
  TonalWorkoutEstimateSet,
  TonalWorkoutEstimateResponse,
  TonalWorkoutCreateRequest,
  TonalWorkoutUpdateRequest,
  TonalClientError,
  TonalUserInfo
} from '../types'

export class WorkoutService {
  constructor(private httpClient: HttpClient) { }

  async getUserWorkouts(offset: number = 0, limit: number = 50): Promise<TonalWorkout[]> {
    return this.httpClient.request('/user-workouts', {
      method: 'GET',
      headers: {
        'x-paginate-offset': offset.toString(),
        'x-paginate-limit': limit.toString(),
      },
    })
  }

  async getDailyLifts(userInfo: TonalUserInfo, timeZone?: string): Promise<TonalWorkout[]> {
    const device = userInfo.recentMobileDevice
    const userAgent = device.platform === 'ios' 
      ? `Tonal/3004226 CFNetwork/3860.100.1 Darwin/${device.osVersion}`
      : `Tonal/${device.appVersion}`

    // Use provided timezone, or auto-detect from system, or fall back to UTC
    let detectedTimeZone = timeZone
    if (!detectedTimeZone) {
      try {
        detectedTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
      } catch {
        detectedTimeZone = 'UTC'
      }
    }

    return this.httpClient.request(`/user-workouts?types=DailyLift`, {
      method: 'GET',
      headers: {
        'Time-Zone': detectedTimeZone,
        'AppVersion': device.appVersion,
        'DeviceId': device.tonalDeviceId,
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9',
        'User-Agent': userAgent,
      },
    })
  }

  async getWorkoutById(workoutId: string): Promise<TonalWorkout> {
    if (!workoutId?.trim()) {
      throw new TonalClientError('Workout ID is required')
    }
    return this.httpClient.request(`/workouts/${workoutId}`)
  }

  async getWorkoutByShareUrl(shareUrl: string): Promise<TonalSharedWorkout> {
    if (!shareUrl?.trim()) {
      throw new TonalClientError('Share URL is required')
    }

    const urlPattern = /https:\/\/share\.tonal\.com\/workout\/([a-f0-9-]+)/
    const match = shareUrl.match(urlPattern)

    if (!match) {
      throw new TonalClientError('Invalid share URL format. Expected: https://share.tonal.com/workout/{id}')
    }

    const shareId = match[1]
    return this.httpClient.request(`/user-workouts/sharing-records/${encodeURIComponent(shareId)}`)
  }

  async estimateWorkoutDuration(sets: TonalWorkoutEstimateSet[]): Promise<TonalWorkoutEstimateResponse> {
    if (!sets?.length) {
      throw new TonalClientError('At least one set is required for estimation')
    }

    return this.httpClient.request('/user-workouts/estimate', {
      method: 'POST',
      body: JSON.stringify({ sets }),
    })
  }

  async createWorkout(workoutData: TonalWorkoutCreateRequest): Promise<TonalWorkout> {
    if (!workoutData.title?.trim()) {
      throw new TonalClientError('Workout title is required')
    }
    if (!workoutData.sets?.length) {
      throw new TonalClientError('At least one set is required')
    }

    const requestBody = {
      title: workoutData.title,
      sets: workoutData.sets,
      createdSource: workoutData.createdSource || 'WorkoutBuilder',
      shortDescription: workoutData.shortDescription || '',
      description: workoutData.description || '',
    }

    return this.httpClient.request('/user-workouts', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    })
  }

  async updateWorkout(workoutData: TonalWorkoutUpdateRequest): Promise<TonalWorkout> {
    if (!workoutData.id) {
      throw new TonalClientError('Workout ID is required for updates')
    }
    if (!workoutData.title?.trim()) {
      throw new TonalClientError('Workout title is required')
    }
    if (!workoutData.sets?.length) {
      throw new TonalClientError('At least one set is required')
    }

    const requestBody = {
      id: workoutData.id,
      title: workoutData.title,
      description: workoutData.description || '',
      coachId: workoutData.coachId || '00000000-0000-0000-0000-000000000000',
      sets: workoutData.sets,
      level: workoutData.level || '',
      assetId: workoutData.assetId,
      createdSource: workoutData.createdSource || 'WorkoutBuilder'
    }

    return this.httpClient.request(`/user-workouts/${workoutData.id}`, {
      method: 'PUT',
      body: JSON.stringify(requestBody),
    })
  }

  async deleteWorkout(workoutId: string): Promise<void> {
    if (!workoutId?.trim()) {
      throw new TonalClientError('Workout ID is required')
    }

    await this.httpClient.request(`/user-workouts/${workoutId}`, {
      method: 'DELETE',
    }, false)
  }
}