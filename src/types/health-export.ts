import {
  TonalActivitySummary,
  TonalMuscleReadiness,
  TonalUserStatistics,
} from './users'
import { TonalMovement } from './movements'
import { TonalWorkoutActivity } from './workouts'

export interface TonalHealthExportOptions {
  /** Include activities on or after this ISO-8601 date or timestamp. */
  startDate?: string | Date
  /** Include activities on or before this ISO-8601 date or timestamp. */
  endDate?: string | Date
  /** Maximum number of activities to include, newest first. */
  limit?: number
  /** Include current muscle readiness. Defaults to true. */
  includeMuscleReadiness?: boolean
  /** Include aggregate lifetime statistics. Defaults to true. */
  includeLifetimeStatistics?: boolean
  /**
   * Include activities imported into Tonal from another service.
   * Defaults to false so the export contains Tonal workouts without duplicating
   * data that may already be present in Apple Health or another health source.
   */
  includeExternalActivities?: boolean
  /**
   * Fetch performed set, rep, and weight details for exported activities.
   * Defaults to false. Details are fetched from paginated workout activity data.
   */
  includeSetDetails?: boolean
}

export interface TonalHealthExportSet {
  setActivityId: string
  movementId: string
  movementName?: string
  muscleGroups?: string[]
  accessory?: string
  bilateral?: boolean
  twoSided?: boolean
  beginTime: string
  endTime?: string
  durationSeconds?: number
  prescribedReps?: number
  prescribedDurationSeconds?: number
  completedReps?: number
  repsInReserve?: number
  repetition: number
  repetitionTotal: number
  sideNumber: number
  movementSide?: string
  averageResistancePerCablePounds?: number
  baseResistancePerCablePounds?: number
  minimumResistancePerCablePounds?: number
  maximumResistancePerCablePounds?: number
  effectiveAverageResistancePounds?: number
  totalVolumePounds?: number
  estimatedOneRepMaxPerCablePounds?: number
  effectiveEstimatedOneRepMaxPounds?: number
  rangeOfMotionInches?: number
  resistanceLevel?: number
  suggestedResistanceLevel?: number
  maxConcentricPowerWatts?: number
  warmUp: boolean
  spotter: boolean
  eccentric: boolean
  chains: boolean
  flex: boolean
}

export interface TonalHealthExportActivity {
  activityId: string
  workoutId: string
  source: 'tonal' | 'external'
  name: string
  timestamp: string
  localTimestamp: string
  timeZone: string
  targetArea: string
  workoutType: string
  level: string
  durationSeconds: number
  timeUnderTensionSeconds: number
  totalReps: number
  totalVolumePounds: number
  totalWorkKilojoules: number
  completed: boolean
  guided: boolean
  inProgram: boolean
  baselineWorkout: boolean
  totalSets?: number
  activeDurationSeconds?: number
  restDurationSeconds?: number
  percentCompleted?: number
  sets?: TonalHealthExportSet[]
}

export interface TonalHealthExportSummary {
  workoutCount: number
  completedWorkoutCount: number
  totalDurationSeconds: number
  totalTimeUnderTensionSeconds: number
  totalReps: number
  totalVolumePounds: number
  totalWorkKilojoules: number
}

export interface TonalHealthExport {
  schemaVersion: 1
  exportedAt: string
  period: {
    start: string | null
    end: string | null
  }
  summary: TonalHealthExportSummary
  activities: TonalHealthExportActivity[]
  muscleReadiness?: TonalMuscleReadiness
  lifetimeStatistics?: TonalUserStatistics
}

export interface TonalHealthExportSource {
  activities: TonalActivitySummary[]
  muscleReadiness?: TonalMuscleReadiness
  lifetimeStatistics?: TonalUserStatistics
  activityDetails?: TonalWorkoutActivity[]
  movements?: TonalMovement[]
}
