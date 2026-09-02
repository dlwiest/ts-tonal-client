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
  TonalStrengthScore,
  TonalStrengthScoreHistoryEntry,
  TonalStrengthScoreHistoryLookback,
  TonalWorkoutActivity,
  TonalFormattedWorkoutSummary,
  TonalClientError,
} from './types'
import { buildHealthExport } from './utils/health-export'

const MAX_WORKOUT_ACTIVITY_PAGES = 1000

export class TonalClient {
  private authManager: AuthManager
  private httpClient: HttpClient
  private workoutService: WorkoutService
  private movementService: MovementService
  private userService: UserService
  private userInfo?: TonalUserInfo
  private userInfoPromise?: Promise<TonalUserInfo>

  private constructor(username: string, password: string, cacheDir?: string) {
    this.authManager = new AuthManager(username, password)
    this.httpClient = new HttpClient(this.authManager)
    this.workoutService = new WorkoutService(this.httpClient)
    this.movementService = new MovementService(this.httpClient, cacheDir)
    this.userService = new UserService(this.httpClient, cacheDir)
  }

  static async create(credentials: { username: string; password: string; cacheDir?: string }): Promise<TonalClient> {
    const client = new TonalClient(credentials.username, credentials.password, credentials.cacheDir)
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
    if (this.userInfo) {
      return this.userInfo
    }

    let request = this.userInfoPromise
    if (!request) {
      request = this.userService.getUserInfo()
      this.userInfoPromise = request
    }

    try {
      const userInfo = await request
      if (this.userInfoPromise === request) {
        this.userInfo = userInfo
        this.userInfoPromise = undefined
      }
      return userInfo
    } catch (error) {
      if (this.userInfoPromise === request) {
        this.userInfoPromise = undefined
      }
      throw error
    }
  }

  invalidateUserInfo(): void {
    this.userInfo = undefined
    this.userInfoPromise = undefined
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

  async getCurrentStrengthScores(): Promise<TonalStrengthScore[]> {
    const userInfo = await this.getUserInfo()
    return this.userService.getCurrentStrengthScores(userInfo.id)
  }

  async getStrengthScoreHistory(
    days: TonalStrengthScoreHistoryLookback = 'all'
  ): Promise<TonalStrengthScoreHistoryEntry[]> {
    if (days !== 'all' && (!Number.isSafeInteger(days) || days <= 0)) {
      throw new TonalClientError('Strength score history days must be a positive safe integer')
    }

    const userInfo = await this.getUserInfo()
    let lookbackDays: number

    if (days === 'all') {
      const createdAt = userInfo.createdAt
      const createdAtMs = typeof createdAt === 'string' ? Date.parse(createdAt) : Number.NaN
      const now = Date.now()

      if (!Number.isFinite(createdAtMs) || createdAtMs > now) {
        throw new TonalClientError(
          'Cannot derive all strength score history from user createdAt; pass explicit days'
        )
      }

      // +2 covers the account-creation calendar day and the server's midnight-boundary
      // ambiguity; over-fetching before account creation is harmless. The Math.max floor is
      // belt-and-braces only -- the future-createdAt rejection above already guarantees a
      // non-negative difference, so this expression is always >= 2.
      lookbackDays = Math.max(1, Math.ceil((now - createdAtMs) / 86_400_000) + 2)
    } else {
      lookbackDays = days
    }

    return this.userService.getStrengthScoreHistory(userInfo.id, lookbackDays)
  }

  async getWorkoutActivityById(
    activityId: string,
    useCache: boolean = true
  ): Promise<TonalWorkoutActivity> {
    const userInfo = await this.getUserInfo()
    return this.userService.getWorkoutActivityById(userInfo.id, activityId, useCache)
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

  /** Get every completed Tonal workout activity using paginated requests. */
  async getAllWorkoutActivities(pageSize: number = 100): Promise<TonalWorkoutActivity[]> {
    if (!Number.isInteger(pageSize) || pageSize <= 0 || pageSize > 100) {
      throw new TonalClientError('Page size must be an integer between 1 and 100')
    }

    const activities: TonalWorkoutActivity[] = []
    await this.paginateWorkoutActivities(pageSize, page => {
      activities.push(...page)
      return false
    })
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

    const tonalActivityIds = initialExport.activities
      .filter(activity => activity.source === 'tonal')
      .map(activity => activity.activityId)
    if (tonalActivityIds.length === 0) {
      return initialExport
    }

    const [activityDetails, movements] = await Promise.all([
      this.getWorkoutActivityDetails(tonalActivityIds),
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

  private async paginateWorkoutActivities(
    pageSize: number,
    visitActivities: (activities: TonalWorkoutActivity[]) => boolean
  ): Promise<void> {
    const userInfo = await this.getUserInfo()
    const seenIds = new Set<string>()

    for (let pageNumber = 0, offset = 0; ; pageNumber += 1) {
      const page = await this.userService.getWorkoutActivities(
        userInfo.id,
        offset,
        pageSize
      )
      const newActivities = page.filter(activity => {
        if (seenIds.has(activity.id)) {
          return false
        }
        seenIds.add(activity.id)
        return true
      })

      if (visitActivities(newActivities) || page.length < pageSize) {
        return
      }
      if (newActivities.length === 0) {
        throw new TonalClientError(
          `Workout activity pagination did not advance at offset ${offset}`
        )
      }
      if (pageNumber + 1 >= MAX_WORKOUT_ACTIVITY_PAGES) {
        throw new TonalClientError(
          `Workout activity pagination exceeded the ${MAX_WORKOUT_ACTIVITY_PAGES}-page safety limit`
        )
      }

      const nextOffset = offset + pageSize
      if (!Number.isSafeInteger(nextOffset) || nextOffset <= offset) {
        throw new TonalClientError(
          `Workout activity pagination could not advance beyond offset ${offset}`
        )
      }
      offset = nextOffset
    }
  }

  private async getWorkoutActivityDetails(
    activityIds: string[]
  ): Promise<TonalWorkoutActivity[]> {
    const requestedIds = new Set(activityIds)
    const details: TonalWorkoutActivity[] = []

    await this.paginateWorkoutActivities(100, activities => {
      for (const activity of activities) {
        if (requestedIds.delete(activity.id)) {
          details.push(activity)
        }
      }
      return requestedIds.size === 0
    })

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
