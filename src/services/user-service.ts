import { createHash } from 'crypto'
import { HttpClient } from '../http/http-client'
import { TonalUserInfo, TonalGoal, TonalTrainingEffectGoalsResponse, TonalTrainingType, TonalGoalMetric, TonalDeviceRegistration, TonalUserDevice, TonalUserPermissions, TonalUserSettings, TonalDailyMetrics, TonalCurrentStreak, TonalActivitySummary, TonalUserStatistics, TonalAchievementStats, TonalEarnedAchievement, TonalHomeCalendar, TonalMuscleReadiness, TonalProgram, TonalTargetScoresResponse, TonalMetricScoresResponse, TonalWorkoutActivity, TonalClientError } from '../types'

export class UserService {
  private cacheManager: CacheManager

  constructor(private httpClient: HttpClient, cacheDir?: string) {
    this.cacheManager = new CacheManager(cacheDir)
  }

  async getUserInfo(): Promise<TonalUserInfo> {
    return this.httpClient.request('/users/userinfo')
  }

  async getGoals(): Promise<TonalGoal[]> {
    return this.httpClient.request('/goals')
  }

  async getTrainingEffectGoals(): Promise<TonalTrainingEffectGoalsResponse> {
    return this.httpClient.request('/training-effect-goals')
  }

  async getTrainingTypes(): Promise<TonalTrainingType[]> {
    return this.httpClient.request('/training-types')
  }

  async getGoalMetrics(): Promise<TonalGoalMetric[]> {
    return this.httpClient.request('/goal-metrics')
  }

  /**
   * Register or update a personal device for the user.
   * 
   * NOTE: This endpoint has side effects and should be used with caution.
   * It registers the device with Tonal's system and may affect notification
   * settings and device management. For reverse-engineered clients, this
   * could be considered unauthorized device registration.
   * 
   * @internal This method is primarily for API completeness and documentation
   */
  async registerPersonalDevice(userId: string, deviceInfo: TonalDeviceRegistration): Promise<TonalUserDevice> {
    return this.httpClient.request(`/users/${userId}/personal-devices`, {
      method: 'POST',
      body: JSON.stringify(deviceInfo),
    })
  }

  /**
   * Get user privacy permissions/settings.
   * 
   * Returns what information this user has made public vs private.
   * Useful for understanding social features and respecting privacy preferences.
   * 
   * @internal This method is for understanding user privacy settings
   */
  async getUserPermissions(userId: string): Promise<TonalUserPermissions> {
    return this.httpClient.request(`/users/${userId}/permissions`)
  }

  /**
   * Get comprehensive user settings and preferences.
   * 
   * Returns audio/visual settings, feature flags, onboarding states, and user preferences.
   * Provides insight into Tonal's full feature ecosystem and user customization options.
   * 
   * @internal This method is for understanding user preferences and feature usage
   */
  async getUserSettings(userId: string): Promise<TonalUserSettings> {
    return this.httpClient.request(`/users/${userId}/user-settings`)
  }

  async getDailyMetrics(userId: string, days: number = 60): Promise<TonalDailyMetrics[]> {
    return this.httpClient.request(`/users/${userId}/metrics/daily?days=${days}`)
  }

  async getCurrentStreak(userId: string): Promise<TonalCurrentStreak> {
    return this.httpClient.request(`/users/${userId}/streaks/current`)
  }

  async getCurrentStrengthScores(userId: string): Promise<TonalStrengthScore[]> {
    return this.httpClient.request(`/users/${userId}/strength-scores/current`)
  }

  async getStrengthScoreHistory(userId: string, days: number): Promise<TonalStrengthScoreHistoryEntry[]> {
    if (!Number.isSafeInteger(days) || days <= 0) {
      throw new TonalClientError('Strength score history days must be a positive safe integer')
    }

    // Tonal's "limit" query parameter is a calendar-day window; small values return an empty array.
    return this.httpClient.request(`/users/${userId}/strength-scores/history?limit=${days}`)
  }

  async getWorkoutActivityById(
    userId: string,
    activityId: string,
    useCache: boolean = true
  ): Promise<TonalWorkoutActivity> {
    const canonicalActivityId = activityId.trim()
    if (!canonicalActivityId) {
      throw new TonalClientError('Workout activity id must not be empty')
    }

    const cacheKey = `workout-activity-v1-${createHash('sha256')
      .update(`${userId}\0${canonicalActivityId}`)
      .digest('hex')}`

    if (useCache) {
      try {
        const cached = await this.cacheManager.get<TonalWorkoutActivity>(cacheKey)
        if (cached !== null) {
          return cached
        }
      } catch {
        // Cache reads are best-effort and must not prevent a fresh request.
      }
    }

    const activity = await this.httpClient.request<TonalWorkoutActivity>(
      `/users/${userId}/workout-activities/${encodeURIComponent(canonicalActivityId)}`
    )

    if (activity.completed === true) {
      try {
        await this.cacheManager.setPermanent(cacheKey, activity)
      } catch {
        // Cache writes are best-effort and must not hide a successful API response.
      }
    }

    return activity
  }

  async getActivitySummaries(userId: string): Promise<TonalActivitySummary[]> {
    return this.httpClient.request(`/users/${userId}/activity-summaries`)
  }

  async getWorkoutActivities(
    userId: string,
    offset: number = 0,
    limit: number = 100
  ): Promise<TonalWorkoutActivity[]> {
    if (!Number.isInteger(offset) || offset < 0) {
      throw new TonalClientError('Offset must be a non-negative integer')
    }
    if (!Number.isInteger(limit) || limit <= 0 || limit > 100) {
      throw new TonalClientError('Limit must be an integer between 1 and 100')
    }

    return this.httpClient.request(`/users/${userId}/workout-activities`, {
      method: 'GET',
      headers: {
        'pg-offset': offset.toString(),
        'pg-limit': limit.toString(),
      },
    })
  }

  async getWorkoutActivityById(
    userId: string,
    activityId: string
  ): Promise<TonalWorkoutActivity> {
    if (!activityId?.trim()) {
      throw new TonalClientError('Workout activity ID is required')
    }

    return this.httpClient.request(
      `/users/${userId}/workout-activities/${encodeURIComponent(activityId)}`
    )
  }

  async getUserStatistics(userId: string): Promise<TonalUserStatistics> {
    return this.httpClient.request(`/users/${userId}/statistics`)
  }

  async getAchievementStats(userId: string): Promise<TonalAchievementStats> {
    return this.httpClient.request(`/users/${userId}/achievement-stats`)
  }

  async getAchievements(userId: string): Promise<TonalEarnedAchievement[]> {
    return this.httpClient.request(`/users/${userId}/achievements`)
  }

  async getHomeCalendar(userId: string): Promise<TonalHomeCalendar> {
    return this.httpClient.request(`/users/${userId}/calendar/home`)
  }

  async getMuscleReadiness(userId: string): Promise<TonalMuscleReadiness> {
    return this.httpClient.request(`/users/${userId}/muscle-readiness/current`)
  }

  async getProgramById(programId: string): Promise<TonalProgram> {
    return this.httpClient.request(`/programs/${programId}`)
  }

  async getTargetScores(userId: string): Promise<TonalTargetScoresResponse> {
    return this.httpClient.request(`/users/${userId}/target-scores`)
  }

  async getMetricScores(userId: string, startWeek?: number): Promise<TonalMetricScoresResponse> {
    const url = startWeek 
      ? `/users/${userId}/metric-scores?startWeek=${startWeek}`
      : `/users/${userId}/metric-scores`
    return this.httpClient.request(url)
  }

  // TODO: Future endpoint to consider implementing
  // GET /users/{userId}/selfie-uploads
  // Returns user's post-workout selfies. Currently returns empty array for most users.
  // Would need actual selfie data to define proper interface (image URLs, timestamps, associated workouts, etc.)
  // Part of Tonal's social features ecosystem alongside leaderboards and public profiles.
  // Priority: Low - interesting for social features but not core fitness functionality.
}
