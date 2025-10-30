import { HttpClient } from '../http/http-client'
import { TonalUserInfo, TonalGoal, TonalTrainingEffectGoalsResponse, TonalTrainingType, TonalGoalMetric, TonalDeviceRegistration, TonalUserDevice, TonalUserPermissions, TonalUserSettings, TonalDailyMetrics, TonalCurrentStreak, TonalActivitySummary, TonalUserStatistics, TonalAchievementStats, TonalEarnedAchievement, TonalHomeCalendar, TonalMuscleReadiness, TonalProgram, TonalTargetScoresResponse, TonalMetricScoresResponse } from '../types'

export class UserService {
  constructor(private httpClient: HttpClient) { }

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

  async getActivitySummaries(userId: string): Promise<TonalActivitySummary[]> {
    return this.httpClient.request(`/users/${userId}/activity-summaries`)
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