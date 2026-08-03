import { AuthManager } from './auth/auth-manager'
import { HttpClient } from './http/http-client'
import { WorkoutService } from './services/workout-service'
import { MovementService } from './services/movement-service'
import { UserService } from './services/user-service'

import {
  TonalMovement,
  TonalSharedWorkout,
  TonalWorkout,
  TonalUserInfo,
  TonalGoal,
  TonalTrainingEffectGoalsResponse,
  TonalTrainingType,
  TonalGoalMetric,
  TonalUserSettings,
  TonalDailyMetrics,
  TonalCurrentStreak,
  TonalActivitySummary,
  TonalUserStatistics,
  TonalAchievementStats,
  TonalEarnedAchievement,
  TonalHomeCalendar,
  TonalWorkoutEstimateSet,
  TonalWorkoutEstimateResponse,
  TonalWorkoutCreateRequest,
  TonalWorkoutUpdateRequest,
  TonalMuscleReadiness,
  TonalProgram,
  TonalTargetScoresResponse,
  TonalMetricScoresResponse,
  TonalHealthExport,
  TonalHealthExportOptions,
  TonalWorkoutActivity,
  TonalFormattedWorkoutSummary,
  TonalCurrentStrengthScore,
  TonalStrengthScoreHistory,
} from './types'
import { buildHealthExport } from './utils/health-export'

export class TonalClient {
  private authManager: AuthManager
  private httpClient: HttpClient
  private workoutService: WorkoutService
  private movementService: MovementService
  private userService: UserService

  private constructor(username: string, password: string) {
    this.authManager = new AuthManager(username, password)
    this.httpClient = new HttpClient(this.authManager)
    this.workoutService = new WorkoutService(this.httpClient)
    this.movementService = new MovementService(this.httpClient)
    this.userService = new UserService(this.httpClient)
  }

  static async create(credentials: { username: string; password: string }): Promise<TonalClient> {
    const client = new TonalClient(credentials.username, credentials.password)
    await client.authManager.authenticate()
    return client
  }

  // Movement operations
  async getMovements(useCache: boolean = true): Promise<TonalMovement[]> {
    return this.movementService.getMovements(useCache)
  }

  async invalidateMovementsCache(): Promise<void> {
    return this.movementService.invalidateMovementsCache()
  }

  // User operations
  async getUserInfo(): Promise<TonalUserInfo> {
    return this.userService.getUserInfo()
  }

  async getGoals(): Promise<TonalGoal[]> {
    return this.userService.getGoals()
  }

  async getTrainingEffectGoals(): Promise<TonalTrainingEffectGoalsResponse> {
    return this.userService.getTrainingEffectGoals()
  }

  async getTrainingTypes(): Promise<TonalTrainingType[]> {
    return this.userService.getTrainingTypes()
  }

  async getGoalMetrics(): Promise<TonalGoalMetric[]> {
    return this.userService.getGoalMetrics()
  }

  async getUserSettings(): Promise<TonalUserSettings> {
    const userInfo = await this.getUserInfo()
    return this.userService.getUserSettings(userInfo.id)
  }

  async getDailyMetrics(days: number = 60): Promise<TonalDailyMetrics[]> {
    const userInfo = await this.getUserInfo()
    return this.userService.getDailyMetrics(userInfo.id, days)
  }

  async getCurrentStreak(): Promise<TonalCurrentStreak> {
    const userInfo = await this.getUserInfo()
    return this.userService.getCurrentStreak(userInfo.id)
  }

  async getActivitySummaries(): Promise<TonalActivitySummary[]> {
    const userInfo = await this.getUserInfo()
    return this.userService.getActivitySummaries(userInfo.id)
  }

  /**
   * Get a page of completed workout activities including performed set data.
   */
  async getWorkoutActivities(
    offset: number = 0,
    limit: number = 100
  ): Promise<TonalWorkoutActivity[]> {
    const userInfo = await this.getUserInfo()
    return this.userService.getWorkoutActivities(userInfo.id, offset, limit)
  }

  /**
   * Get one completed workout with performed set, rep, and weight details.
   */
  async getWorkoutActivityById(activityId: string): Promise<TonalWorkoutActivity> {
    const userInfo = await this.getUserInfo()
    return this.userService.getWorkoutActivityById(userInfo.id, activityId)
  }

  /** Get every completed Tonal workout activity using paginated requests. */
  async getAllWorkoutActivities(pageSize: number = 100): Promise<TonalWorkoutActivity[]> {
    if (!Number.isInteger(pageSize) || pageSize <= 0 || pageSize > 100) {
      throw new Error('Page size must be an integer between 1 and 100')
    }

    const userInfo = await this.getUserInfo()
    const activities: TonalWorkoutActivity[] = []
    const seenIds = new Set<string>()

    for (let offset = 0; ; offset += pageSize) {
      const page = await this.userService.getWorkoutActivities(
        userInfo.id,
        offset,
        pageSize
      )

      for (const activity of page) {
        if (!seenIds.has(activity.id)) {
          seenIds.add(activity.id)
          activities.push(activity)
        }
      }

      if (page.length < pageSize) {
        break
      }
    }

    return activities
  }

  async getFormattedWorkoutSummary(
    activityId: string
  ): Promise<TonalFormattedWorkoutSummary> {
    const userInfo = await this.getUserInfo()
    return this.userService.getFormattedWorkoutSummary(userInfo.id, activityId)
  }

  async getFormattedWorkoutSummaries(
    activityIds: string[],
    batchSize: number = 5
  ): Promise<TonalFormattedWorkoutSummary[]> {
    if (!Number.isInteger(batchSize) || batchSize <= 0) {
      throw new Error('Batch size must be a positive integer')
    }

    const userInfo = await this.getUserInfo()
    const summaries: TonalFormattedWorkoutSummary[] = []

    for (let index = 0; index < activityIds.length; index += batchSize) {
      summaries.push(
        ...(await Promise.all(
          activityIds.slice(index, index + batchSize).map(activityId =>
            this.userService.getFormattedWorkoutSummary(userInfo.id, activityId)
          )
        ))
      )
    }

    return summaries
  }

  async getCurrentStrengthScores(): Promise<TonalCurrentStrengthScore[]> {
    const userInfo = await this.getUserInfo()
    return this.userService.getCurrentStrengthScores(userInfo.id)
  }

  async getStrengthScoreHistory(
    limit: number = 1000
  ): Promise<TonalStrengthScoreHistory[]> {
    const userInfo = await this.getUserInfo()
    return this.userService.getStrengthScoreHistory(userInfo.id, limit)
  }

  async getUserStatistics(): Promise<TonalUserStatistics> {
    const userInfo = await this.getUserInfo()
    return this.userService.getUserStatistics(userInfo.id)
  }

  async getAchievementStats(): Promise<TonalAchievementStats> {
    const userInfo = await this.getUserInfo()
    return this.userService.getAchievementStats(userInfo.id)
  }

  async getAchievements(): Promise<TonalEarnedAchievement[]> {
    const userInfo = await this.getUserInfo()
    return this.userService.getAchievements(userInfo.id)
  }

  async getHomeCalendar(): Promise<TonalHomeCalendar> {
    const userInfo = await this.getUserInfo()
    return this.userService.getHomeCalendar(userInfo.id)
  }

  async getMuscleReadiness(): Promise<TonalMuscleReadiness> {
    const userInfo = await this.getUserInfo()
    return this.userService.getMuscleReadiness(userInfo.id)
  }

  async getProgramById(programId: string): Promise<TonalProgram> {
    return this.userService.getProgramById(programId)
  }

  async getTargetScores(): Promise<TonalTargetScoresResponse> {
    const userInfo = await this.getUserInfo()
    return this.userService.getTargetScores(userInfo.id)
  }

  async getMetricScores(startWeek?: number): Promise<TonalMetricScoresResponse> {
    const userInfo = await this.getUserInfo()
    return this.userService.getMetricScores(userInfo.id, startWeek)
  }

  /**
   * Create a compact export intended for health analysis and data portability.
   *
   * The export excludes profile, device, and authentication details. Activities
   * can be filtered by date and limited, and optional readiness and lifetime
   * statistics can be omitted when a smaller data set is preferred.
   */
  async getHealthExport(options: TonalHealthExportOptions = {}): Promise<TonalHealthExport> {
    const includeMuscleReadiness = options.includeMuscleReadiness ?? true
    const includeLifetimeStatistics = options.includeLifetimeStatistics ?? true

    const [activities, muscleReadiness, lifetimeStatistics] = await Promise.all([
      this.getActivitySummaries(),
      includeMuscleReadiness ? this.getMuscleReadiness() : Promise.resolve(undefined),
      includeLifetimeStatistics ? this.getUserStatistics() : Promise.resolve(undefined),
    ])

    const exportedAt = new Date()
    const initialExport = buildHealthExport(
      {
        activities,
        muscleReadiness,
        lifetimeStatistics,
      },
      options,
      exportedAt
    )

    if (!options.includeSetDetails || initialExport.activities.length === 0) {
      return initialExport
    }

    const [activityDetails, movements] = await Promise.all([
      this.getWorkoutActivityDetails(
        initialExport.activities.map(activity => activity.activityId)
      ),
      this.getMovements(),
    ])

    return buildHealthExport(
      {
        activities,
        muscleReadiness,
        lifetimeStatistics,
        activityDetails,
        movements,
      },
      options,
      exportedAt
    )
  }

  private async getWorkoutActivityDetails(
    activityIds: string[]
  ): Promise<TonalWorkoutActivity[]> {
    const pageSize = 100
    const requestedIds = new Set(activityIds)
    const details: TonalWorkoutActivity[] = []
    const userInfo = await this.getUserInfo()

    for (let offset = 0; requestedIds.size > 0; offset += pageSize) {
      const page = await this.userService.getWorkoutActivities(
        userInfo.id,
        offset,
        pageSize
      )

      for (const activity of page) {
        if (requestedIds.delete(activity.id)) {
          details.push(activity)
        }
      }

      if (page.length < pageSize) {
        break
      }
    }

    return details
  }

  // Workout operations
  async getUserWorkouts(offset: number = 0, limit: number = 50): Promise<TonalWorkout[]> {
    return this.workoutService.getUserWorkouts(offset, limit)
  }

  async getDailyLifts(timeZone?: string): Promise<TonalWorkout[]> {
    // Get user info to populate device-specific headers
    const userInfo = await this.getUserInfo()
    return this.workoutService.getDailyLifts(userInfo, timeZone)
  }

  async getWorkoutById(workoutId: string): Promise<TonalWorkout> {
    return this.workoutService.getWorkoutById(workoutId)
  }

  async getWorkoutByShareUrl(shareUrl: string): Promise<TonalSharedWorkout> {
    return this.workoutService.getWorkoutByShareUrl(shareUrl)
  }

  async estimateWorkoutDuration(sets: TonalWorkoutEstimateSet[]): Promise<TonalWorkoutEstimateResponse> {
    return this.workoutService.estimateWorkoutDuration(sets)
  }

  async createWorkout(workoutData: TonalWorkoutCreateRequest): Promise<TonalWorkout> {
    return this.workoutService.createWorkout(workoutData)
  }

  async updateWorkout(workoutData: TonalWorkoutUpdateRequest): Promise<TonalWorkout> {
    return this.workoutService.updateWorkout(workoutData)
  }

  async deleteWorkout(workoutId: string): Promise<void> {
    return this.workoutService.deleteWorkout(workoutId)
  }
}
