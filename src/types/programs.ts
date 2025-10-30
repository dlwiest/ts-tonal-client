import { TonalWorkout } from './workouts'

export interface TonalProgramWorkout {
  id: string // Program workout mapping ID
  programId: string // Parent program ID
  workoutId: string // Reference to actual workout
  level: string // Difficulty level ("ADVANCED", etc.)
  workoutNumber: number // Sequential workout number in program
  workoutTitle: string // Workout title (e.g., "D1A", "D2B")
  programWeek: number // Which week of the program (1-4)
  programDay: number // Which day of the week (1-7)
  duration: number // Workout duration in seconds
}

export interface TonalProgramTrainingEffectGoal {
  goalID: string // Training effect goal ID
  score: number // Goal achievement score (0.0-1.0)
  goalMet: boolean // Whether the goal was achieved
}

export interface TonalProgram {
  id: string // Program ID
  createdAt: string // When program was created
  name: string // Program name
  description: string // Detailed program description
  productionCode: string // Internal production identifier
  workoutsPerWeek: number // Number of workouts per week
  cadence: boolean[] // 7-element array showing which days are workout days [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
  weeks: number // Program duration in weeks
  publishState: string // Publication status ("published", etc.)
  publishedAt: string // When program was published
  level: string // Difficulty level ("ADVANCED", etc.)
  workouts: TonalWorkout[] // All workouts in the program with full details
  assetId: string // Program asset/image ID
  goalIds: string[] // Associated goal IDs
  groupIds: string[] // Program category/group IDs
  coachId: string // Primary coach ID
  coachIds: string[] // All coach IDs involved
  trainingTypeIds: string[] // Training type classification IDs
  isAdjustable: boolean // Whether program can be modified
  programWorkoutIds: string[] // All workout IDs in program order
  programWorkouts: TonalProgramWorkout[] // Program-specific workout mappings
  nonComparableWorkouts: boolean // Whether workouts can be compared
  mobileFriendly: boolean // Mobile device compatibility
  supportedDevices: string[] // Compatible Tonal device types
  featureGroupIds: string[] | null // Feature group classifications
  excludeFromCoachHighlights: boolean // Whether excluded from coach highlights
  trainingEffectGoals: TonalProgramTrainingEffectGoal[] // Training effect goal achievements
}