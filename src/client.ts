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
  TonalWorkoutEstimateSet,
  TonalWorkoutEstimateResponse,
  TonalWorkoutCreateRequest,
  TonalWorkoutUpdateRequest,
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
  async getMovements(): Promise<TonalMovement[]> {
    return this.movementService.getMovements()
  }

  // User operations
  async getUserInfo(): Promise<TonalUserInfo> {
    return this.userService.getUserInfo()
  }

  async getGoals(): Promise<TonalGoal[]> {
    return this.userService.getGoals()
  }

  // Workout operations
  async getUserWorkouts(offset: number = 0, limit: number = 50): Promise<TonalWorkout[]> {
    return this.workoutService.getUserWorkouts(offset, limit)
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