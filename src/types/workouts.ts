import { MuscleGroup } from './common'

export type WorkoutPublishState = 'published' | 'archived' | string

export interface WorkoutSet {
  id: string
  workoutId: string
  blockStart: boolean
  movementId: string
  prescribedReps?: number
  prescribedDuration?: number
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
  sets: WorkoutSet[] | null
  duration: number
  publishState: WorkoutPublishState
  programId: string | null
  level: string
  groupIds: string[]
  targetArea: string
  tags: string[] | null
  bodyRegions: MuscleGroup[] | null
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
  movementIds: string[] | null
  accessories?: string[] // Required accessories for the workout (e.g. "Bench", "Handles")
  muscleGroupsForExclusion: MuscleGroup[] | null
  playbackType: string
  isImported: boolean
  createdSource?: unknown | null // TODO: investigate how workouts are created/imported
}

/**
 * A performed set returned as part of a completed workout activity.
 *
 * The history and single-activity endpoints expose different subsets. Fields
 * beyond movementId are therefore optional, and values that Tonal may return
 * as null remain nullable.
 */
export interface TonalWorkoutSetActivity {
  id?: string
  userId?: string
  workoutId?: string
  workoutActivityID?: string
  movementId: string
  prescribedReps?: number | null
  prescribedDuration?: number
  repetition?: number | null
  repetitionTotal?: number | null
  blockNumber?: number | null
  blockStart?: boolean | null
  burnout?: boolean
  calibration?: boolean
  chains?: boolean
  dropSet?: boolean
  eccentric?: boolean
  finalSet?: boolean
  flex?: boolean
  practice?: boolean
  progressive?: boolean
  skipDemo?: boolean
  skipSetup?: boolean
  spotter?: boolean | null
  warmUp?: boolean
  beginTime?: string
  endTime?: string
  beginTimeMCB?: number
  endTimeMCB?: number
  duration?: number
  durationBasedRepGoal?: number
  sideNumber?: number | null
  movementSide?: string
  setGroup?: number
  setId?: string | null
  round?: number
  sortOrder?: number
  weightPercentage?: number | null
  avgWeight?: number
  baseWeight?: number | null
  minWeight?: number
  maxWeight?: number
  suggestedWeight?: number
  suggestedWeightChange?: number
  eccentricWeight?: number | null
  eccentricWeightFrac?: number
  chainsWeight?: number | null
  chainsWeightFrac?: number
  romWeight?: number
  romWeightFrac?: number
  romWeightMode?: number
  offMachineModifiedWeight?: number
  maxSpottedWeight?: number
  weightControlMode?: number | null
  volume?: number
  totalVolume?: number
  totalOnMachineVolume?: number
  userWeightPounds?: number
  repCount?: number
  cvRepCount?: number
  repsInReserve?: number
  reps?: unknown[] | null
  dualMotorReps?: unknown[] | null
  oneRepMax?: number
  avgRom?: number
  rom?: number
  romLengthIn?: number
  meanMaxPos?: number
  avgVelocity?: number
  isoModeSpeed?: number
  concentricWork?: number
  totalConcentricWork?: number
  totalConDuration?: number
  maxConPower?: number
  velAtMaxConPower?: number
  weightAtMaxConPower?: number
  inconsistencyScore?: number
  strugglingScore?: number
  durationInconsistencyScore?: number
  durationStrugglingScore?: number
  maxVelInconsistencyScore?: number
  maxVelStrugglingScore?: number
  romInconsistencyScore?: number
  romStrugglingScore?: number
  inchesUpdated?: boolean
  powerUpdated?: boolean
  prs?: unknown[]
  spotterMode?: string
  triggeredFeedback?: unknown | null
}

/**
 * Detailed completed workout data returned by
 * GET /users/{userId}/workout-activities/{activityId}.
 */
export interface TonalWorkoutActivity {
  id: string
  userId: string
  workoutId: string
  subscriptionId?: string
  workoutType?: string | null
  beginTime: string
  endTime?: string | null
  totalDuration: number
  activeDuration?: number | null
  restDuration?: number | null
  totalMovements?: number | null
  totalSets: number
  totalReps: number
  totalVolume: number
  totalConcentricWork?: number | null
  percentCompleted?: number | null
  completed?: boolean | null
  recoveryWeight?: boolean
  hasAppleWatch?: boolean
  isFirstWorkoutOfDay?: boolean
  isSmartViewActivated?: boolean
  workoutSetActivity: TonalWorkoutSetActivity[]
  contentCard?: unknown
  deletedAt?: string | null
  partnerActivityId?: string | null
  programEnrollmentId?: string
  programId?: string
  deviceId?: string | null
  timezone?: string | null
  appVersion?: string | null
  mcbServiceVersion?: string
}

/**
 * A set within a formatted workout movement summary.
 *
 * The API's set field names are known, but their individual presence and value
 * types have not been measured. Keep the payload open rather than claiming
 * unsupported required fields.
 */
export type TonalFormattedWorkoutSet = Record<string, unknown>

/**
 * Per-movement breakdown returned in a formatted workout summary.
 */
export interface TonalFormattedWorkoutMovementSet {
  assetId: string
  avgWeight: number
  bilateralMovementMetrics?: Record<string, unknown>
  blockNumber: number
  countReps: boolean
  description: string
  genericMovement: boolean
  isInactiveMovement?: boolean
  movementId: string
  movementMetricsDiff?: Record<string, unknown>
  movementMetricsSide1?: Record<string, unknown>
  movementMetricsSide2?: Record<string, unknown>
  movementName: string
  offMachine: boolean
  reps: number
  setGroup: number
  sets: TonalFormattedWorkoutSet[]
  timeTensionIndex: number
  totalOnMachineVolume: number
  totalVolume: number
  totalWork: number
}

/**
 * Workout summary returned by
 * GET /users/{userId}/workout-summaries/{activityId}.
 *
 * Optionality here is derived from OBSERVATION, not from a published contract:
 * Tonal's API is private and undocumented, so "required" below means "present in
 * every record we have ever measured", not "guaranteed by the vendor".
 *
 * Basis (measured 2026-09-02): all 422 activities on a single account, spanning
 * 2023-05 to 2026-02, plus a targeted re-check of the 16 most abnormal sessions
 * in that set - including four with percentCompleted === 0. Every field marked
 * required was present and non-null in all of them; every optional field was
 * absent from at least one. Guided and free-lift workouts are both covered.
 * Note that `completed === false` never appears: the activity-list endpoints do
 * not return in-progress workouts, so no in-progress record was observable.
 *
 * Consequence for callers: treat a required field as a strong invariant, not a
 * safety guarantee. If a counterexample ever appears - another account, a
 * deleted workout, or an id obtained outside the activity-list endpoints -
 * widen the field here rather than patching around it at the call site.
 */
export interface TonalFormattedWorkoutSummary {
  UTCTimestamp: string
  activityType: string
  appVersion: string
  assetID?: string
  calories: unknown[]
  coachName?: string
  completed: boolean
  deletedAt: string | null
  deviceId: string
  duration: number
  endTime: string
  goalIds?: unknown[]
  groupIds: string[]
  id: string
  isBaselineWorkout: boolean
  isGuidedWorkout: boolean
  isInProgram: boolean
  lastWorkoutSummary?: Record<string, unknown>
  level: string
  localTimestamp: string
  movementAdvancedMetrics: unknown[]
  movementSets: TonalFormattedWorkoutMovementSet[]
  name: string
  primaryTrainingTypeName?: string
  programDay?: number
  programEnrollmentId?: string
  programId?: string
  programName?: string
  programWeek?: number
  programWeeks: number
  programWorkoutId?: string
  programWorkoutsPerWeek: number
  /**
   * Numeric in all 422 observed formatted summaries (0 nulls); all 50 observed
   * TonalActivitySummary values were null.
   */
  repGoalPercentage: number
  targetArea: string
  tileChips?: unknown[]
  timeUnderTension: number
  timeZone: string
  timestamp: string
  totalReps: number
  totalVolume: number
  totalWork: number
  trainingTypeIds?: unknown[]
  triggeredTimedWeightOff: boolean
  userAchievements?: unknown[]
  userId: string
  workoutId: string
  workoutNumber?: number
  workoutType: string
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
  shortDescription?: string
  description?: string
  coachId: string
  sets: TonalWorkoutEstimateSet[]
  level?: string
  assetId: string
  createdSource?: 'WorkoutBuilder' | 'FreeLift' | 'SharedWorkout' | 'DailyLift' | 'TonalWorkout' | 'WorkoutGenerator' | 'ActivityFeed'
}
