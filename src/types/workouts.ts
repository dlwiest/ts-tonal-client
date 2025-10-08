import { MuscleGroup } from './common'

export type WorkoutPublishState = 'published' | 'archived' | string

export interface WorkoutSet {
  id: string
  workoutId: string
  blockStart: boolean
  movementId: string
  prescribedReps: number
  repetition: number
  repetitionTotal: number
  blockNumber: number
  burnout: boolean
  spotter: boolean
  eccentric: boolean
  chains: boolean
  skipSetup: boolean
  skipDemo: boolean
  finalSet: boolean
  calibration: boolean
  practice: boolean
  flex: boolean
  progressive: boolean
  weightPercentage: number
  warmUp: boolean
  durationBasedRepGoal: number
  setGroup: number
  round: number
  description: string
  dropSet: boolean
  omitempty?: unknown
}

export interface TonalWorkout {
  id: string
  createdAt: string
  title: string
  shortDescription: string
  description: string
  productionCode: string
  assetId: string
  coachId: string
  sets: WorkoutSet[]
  duration: number
  publishState: WorkoutPublishState
  programId: string | null
  level: string
  groupIds: string[]
  targetArea: string
  tags: string[] | null
  bodyRegions: MuscleGroup[]
  goalIds: string[] | null
  trainingEffectGoals: string[]
  disableModification: boolean
  publishedAt: string
  localPublishedAt: string
  type: string
  userId: string
  style: string
  trainingType: string
  trainingTypeIds: string[] | null
  mobileFriendly: boolean
  live: boolean
  recoveryWeight: boolean
  supportedDevices: string[] | null
  featureGroupIds: string[] | null
  movementIds: string[]
  accessories?: string[] // Required accessories for the workout (e.g. "Bench", "Handles")
  muscleGroupsForExclusion: MuscleGroup[] | null
  playbackType: string
  isImported: boolean
  createdSource?: unknown | null // TODO: investigate how workouts are created/imported
}

export interface TonalSharedWorkout {
  id: string
  sharerUserId: string
  parentWorkoutId: string
  workoutSnapshotId: string
  workoutSnapshotHash: string
  deepLinkUrl: string
  workoutSnapshot: TonalWorkout
}

export interface TonalWorkoutEstimateSet {
  blockStart: boolean
  movementId: string
  prescribedReps?: number // For rep-based exercises
  prescribedDuration?: number // For time-based exercises (in seconds)
  dropSet: boolean
  repetition: number
  repetitionTotal: number
  blockNumber: number
  burnout: boolean
  spotter: boolean
  eccentric: boolean
  chains: boolean
  flex: boolean
  warmUp: boolean
  weightPercentage: number
  setGroup: number
  round: number
  description: string
}

export interface TonalWorkoutEstimateResponse {
  duration: number // Estimated duration in seconds
}

export interface TonalWorkoutCreateRequest {
  title: string
  sets: TonalWorkoutEstimateSet[] // Same structure as estimate sets
  createdSource?: 'WorkoutBuilder' | 'FreeLift' | 'SharedWorkout' | 'DailyLift' | 'TonalWorkout' | 'WorkoutGenerator' | 'ActivityFeed'
  shortDescription?: string
  description?: string
}

export interface TonalWorkoutUpdateRequest {
  id: string
  title: string
  description?: string
  coachId: string
  sets: TonalWorkoutEstimateSet[]
  level?: string
  assetId: string
  createdSource?: 'WorkoutBuilder' | 'FreeLift' | 'SharedWorkout' | 'DailyLift' | 'TonalWorkout' | 'WorkoutGenerator' | 'ActivityFeed'
}