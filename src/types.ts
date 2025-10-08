export interface TonalApiError {
  error: string
  error_description?: string
  statusCode?: number
}

export class TonalClientError extends Error {
  public readonly statusCode?: number
  public readonly originalError?: unknown

  constructor(message: string, statusCode?: number, originalError?: unknown) {
    super(message)
    this.name = 'TonalClientError'
    this.statusCode = statusCode
    this.originalError = originalError
  }
}

export interface OAuthTokenResponse {
  access_token: string
  id_token: string
  refresh_token: string
  scope: string
  token_type: string
  expires_in: number
}

export type MuscleGroup =
  | 'Obliques'
  | 'Abs'
  | 'Shoulders'
  | 'Glutes'
  | 'Back'
  | 'Biceps'
  | 'Quads'
  | 'Triceps'
  | 'Chest'
  | 'Hamstrings'
  | 'Calves'
  | 'Forearms'

export interface TonalMovement {
  id: string
  createdAt: string
  updatedAt: string
  name: string
  shortName: string
  muscleGroups: MuscleGroup[]
  bodyRegion: string
  bodyRegionDisplay: string
  baseOfSupport: string
  pushPull: string
  family: string
  familyDisplay: string
  inFreeLift: boolean
  onMachine: boolean
  countReps: boolean
  isTwoSided: boolean
  isBilateral: boolean
  isAlternating: boolean
  offMachineAccessory: string
  descriptionHow: string
  descriptionWhy: string
  sortOrder: number
  imageAssetId: string
  skillLevel: number
  active: boolean
  featureGroupIds: null | string[]
  isGeneric: boolean
}

export type WorkoutPublishState = 'published' | 'archived' | string

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

interface WorkoutSet {
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

export interface TonalSharedWorkout {
  id: string
  sharerUserId: string
  parentWorkoutId: string
  workoutSnapshotId: string
  workoutSnapshotHash: string
  deepLinkUrl: string
  workoutSnapshot: TonalWorkout
}

export interface TonalUserDevice {
  deviceId: string
  tonalDeviceId: string
  userId: string
  createdAt: string
  updatedAt: string
  loggedIn: boolean
  postWorkoutNotifs: boolean
  reminderNotifs: boolean
  productUpdateNotifs: boolean
  socialNotifs: boolean
  blogNotifs: boolean
  chatbotNotifs: boolean
  deviceModel: string
  osVersion: string
  appVersion: string
  platform: string
}

export interface TonalGoal {
  id: string
  name: string
  description: string
  active: boolean
  filterItemId: string // TODO: investigate what filterItemId is used for
}

export interface TonalUserGoal {
  id: string
  userID: string
  goalID: string
  tier: number // Priority tier: 1=highest priority, 2=medium, 3=lowest
}

export interface TonalUserInfo {
  id: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  email: string
  firstName: string
  lastName: string
  gender: 'MALE' | 'FEMALE' | string // TODO: investigate all possible gender values
  heightInches: number
  weightPounds: number
  auth0Id: string
  dateOfBirth: string // TODO: investigate format (ISO date observed)
  isGuestAccount: boolean
  isDemoAccount: boolean
  watchedSafetyVideo: boolean
  recentMobileDevice: TonalUserDevice
  emailVerified: boolean
  username: string
  workoutsPerWeek: number
  tonalStatus: 'purchased' | string // TODO: investigate other possible statuses
  social: unknown | null // TODO: investigate social object structure
  profileAssetID: string | null
  mobileWorkoutsEnabled: boolean
  accountType: 'PublicUser' | string // TODO: investigate other account types
  location: string
  sharingCustomWorkoutsDisabled: boolean
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | string // TODO: verify all level values
  goalId: string // Primary goal ID (matches one of the goals array entries)
  goals: TonalUserGoal[]
  workoutDurationMin: number // TODO: investigate units (seconds observed)
  workoutDurationMax: number // TODO: investigate units (seconds observed)
  updatedPreferencesAt: string
  primaryDeviceType: 'Classic' | string // TODO: investigate other device types (Smart Gym, etc.)
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
