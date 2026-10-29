import { MuscleGroup } from './common'
import { TonalProgramTrainingEffectGoal } from './programs'

/**
 * One guided workout from Tonal's published library index (`GET /workouts`).
 *
 * Index entries are summaries, not full workouts: they carry no `sets`, so call
 * `getWorkoutById` for a workout's programming. Optionality and nullability below are
 * observed across the full live index (3,184 entries), not documented by Tonal.
 */
export interface TonalWorkoutLibraryEntry {
  id: string
  createdAt: string
  title: string
  shortDescription: string
  description: string
  productionCode: string
  assetId: string
  coachId: string
  duration: number // Seconds
  publishState: string
  programId: string | null // Null in the index even for workouts that belong to a program
  level: string // "BEGINNER", "INTERMEDIATE", "ADVANCED" or "ALL"
  groupIds: string[] | null
  targetArea?: string // "FULL BODY", "UPPER BODY", "LOWER BODY", "CORE"; absent on some entries
  tags: string[] | null
  bodyRegions: MuscleGroup[] | null
  goalIds: string[] | null
  trainingEffectGoals: string[] | null
  disableModification: boolean
  publishedAt: string
  localPublishedAt: string
  type: string
  style: string
  trainingType: string
  trainingTypeIds: string[]
  primaryTrainingTypeName: string
  mobileFriendly: boolean
  live: boolean
  recoveryWeight: boolean
  supportedDevices: string[] // "Classic", "T3", "Elite"
  featureGroupIds: string[] | null
  movementIds: string[] | null
  accessories: string[] | null // Required accessories, e.g. "Bench", "Handles"
  muscleGroupsForExclusion: MuscleGroup[] | null
  playbackType: string
  isImported: boolean
  createdSource: unknown | null
  programWeek?: number
  programDay?: number
  workoutNumber?: number
  previewMediaId?: string
  previewMediaUrl?: string
  thumbnailMediaId?: string
  thumbnailMediaUrl?: string
}

/**
 * One program from Tonal's published library index (`GET /programs`).
 *
 * Index entries are summaries: `workouts` is always empty and `programWorkouts` is
 * absent, so call `getProgramById` for a program's schedule. Optionality and nullability
 * below are observed across the full live index (347 entries), not documented by Tonal.
 */
export interface TonalProgramLibraryEntry {
  id: string
  createdAt: string
  name: string
  description: string
  productionCode: string
  workoutsPerWeek: number
  cadence: boolean[] // 7 entries, Monday first
  weeks: number
  publishState: string
  publishedAt: string
  level: string // "BEGINNER", "INTERMEDIATE", "ADVANCED" or "ALL"
  workouts: [] // Always empty in the index
  assetId: string
  goalIds: string[]
  groupIds: string[] | null
  coachId: string
  coachIds: string[]
  trainingTypeIds: string[]
  isAdjustable: boolean
  nonComparableWorkouts: boolean
  mobileFriendly: boolean
  supportedDevices: string[]
  featureGroupIds: string[] | null
  excludeFromCoachHighlights: boolean
  trainingEffectGoals: TonalProgramTrainingEffectGoal[]
  accessories: string[]
  achievementId?: string
  focusArea?: string
  previewMediaId?: string
  previewMediaUrl?: string
  thumbnailMediaId?: string
  thumbnailMediaUrl?: string
}
