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
} from './types'

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