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

export interface TonalDeviceRegistration {
  userId: string
  tonalDeviceId: string
  deviceId: string
  deviceModel: string
  osVersion: string
  appVersion: string
  platform: string
  loggedIn: boolean
}

export interface TonalUserPermissions {
  userId: string
  memberDate: 'Public' | 'Private'
  gender: 'Public' | 'Private'
  age: 'Public' | 'Private'
  streak: 'Public' | 'Private'
  workoutCalendar: 'Public' | 'Private'
  strengthScore: 'Public' | 'Private'
  achievements: 'Public' | 'Private'
  leaderboard: 'Public' | 'Private'
  volume: 'Public' | 'Private'
  workouts: 'Public' | 'Private'
  movements: 'Public' | 'Private'
  programs: 'Public' | 'Private'
  activity: 'Public' | 'Private'
  publicProfile: 'Public' | 'Private'
  location: 'Public' | 'Private'
  fullName: 'Public' | 'Private'
}

export interface TonalUserSettings {
  userId: string
  
  // Audio Settings
  overallVolume: number
  musicVolume: number
  coachVolume: number
  soundEffectsVolume: number
  coachingCuesVolume: number
  bluetoothOverallVolume: number
  bluetoothMusicVolume: number
  bluetoothCoachVolume: number
  bluetoothSoundEffectsVolume: number
  
  // Music/Audio Service
  feedFmStation: string
  feedFmAutoPlay: boolean
  feedFmClientId: string
  preferredMusicService: string
  
  // Display Settings
  timeZone: string
  screenBrightness: number
  closedCaptions: boolean
  coachingCuesVoiceType: number
  
  // Workout Settings
  workoutGraph: string
  workoutDemo: boolean
  demoPlayerSize: string
  dataInGuidedWorkouts: boolean
  
  // Recovery and Weight Settings
  defaultRecoveryWeightTooltipCount: number
  activeRecoveryRecoveryWeightTooltipCount: number
  timedWeightOffDisabledByDefault: boolean
  timedWeightOffDelayBeforeRampMs: number
  
  // Account Settings
  hasRequestedAccountDeletion: boolean
  
  // Smart View Settings
  isSmartViewEnabled: boolean
  smartViewMode: string
  
  // Feature Onboarding Flags (Leaderboard)
  hasSeenLeaderboardIntroTile: boolean
  
  // Feature Onboarding Flags (Year in Review)
  hasSeenYearInReviewBanner: boolean
  hasSeenYearInReviewPromo: boolean
  
  // Feature Onboarding Flags (Workouts)
  hasSeenWarmUpSetsModal: boolean
  hasSeenWorkoutRemindersPopUp: boolean
  hasSeenScheduleWorkoutToolTip: boolean
  
  // Feature Onboarding Flags (Profile/Social)
  hasSeenPublicProfilePopUp: boolean
  hasSharedPublicProfile: boolean
  hasHiddenReferralPromo2022: boolean
  
  // Feature Onboarding Flags (Tonal 101)
  hasClosedTonal101Ad: boolean
  
  // Feature Onboarding Flags (Vision/Camera)
  hasConnectedVisionCamera: boolean
  hasSeenTonalVisionPromo: boolean
  hasSeenARCoreDisclaimer: boolean
  
  // Feature Onboarding Flags (Editorial Content)
  hasSeenEditorialContentsPromo: boolean
  hasOpenedEditorialContentsPromo: boolean
  
  // Feature Onboarding Flags (Movement Features)
  hasSeenCustomMovementDescriptions: boolean
  hasSeenMovementInfoAndGraphsFtue: boolean
  hasSeenFreeLiftMovementInfoFtue: boolean
  hasSeenMovementReplacementModal: boolean
  hasSeenRomPowerGraphModal: boolean
  hasSeenCustomMovementReplacementModal: boolean
  
  // Feature Onboarding Flags (Accessories)
  hasSeenAnkleStrapsPromo: boolean
  hasHiddenAnkleStraps: boolean
  hasSeenPilatesLoopsPromo: boolean
  hasHiddenPilatesLoops: boolean
  hasSeenPilatesLoopsPreOrderPromo: boolean
  hasHiddenPreOrderPilatesLoops: boolean
  
  // Feature Onboarding Flags (Filters)
  hasSeenExclusionFiltersTooltip: boolean
  hasSeenExclusionFiltersTrainerTooltip: boolean
  
  // Feature Onboarding Flags (Smart View)
  hasSeenSmartViewInfoVid: boolean
  hasHiddenSmartViewDiscoveryTooltip: boolean
  hasSeenSmartViewMovementsTabToolTip: boolean
  hasSeenSmartViewClipsToolTip: boolean
  
  // Feature Onboarding Flags (Third Party Integration)
  hasSeenLinkTonalOrderDialog: boolean
  hasSeenThirdPartyMetricsPromo: boolean
  hasDismissedUpdatePreferencesBanner: boolean
  hasDismissedThirdPartyMuscleReadinessTile: boolean
  hasSeenUpdatedAppleHealthScreen: boolean
  
  // Feature Onboarding Flags (Training/Goals)
  hasDismissedTrainingEffectGoalsBanner: boolean
  hasSeenTrainingEffectGoalsPromo: boolean
  hasSeenTrainingMetricsPromo: boolean
  
  // Feature Onboarding Flags (Body Measurements)
  hasSeenBodygramInstructions: boolean
  
  // Feature Onboarding Flags (Chatbot)
  hasSeenChatbotAnnouncementModal: boolean
  hasDismissedChatbotTooltip: boolean
  
  // Feature Onboarding Flags (Drop Sets)
  hasSeenDropSetsPromo: boolean
  hasHiddenDropSetsPromoBanner: boolean
  
  // Feature Onboarding Flags (Scorecard)
  hasSeenScorecardPromo: boolean
  hasHiddenScorecardPopover: boolean
  hasHiddenProgramScorecardPopover: boolean
  
  // Feature Onboarding Flags (Aero)
  hasHiddenAeroPromoBanner: boolean
  
  // Feature Onboarding Flags (Post Workout)
  hasSeenPostWorkoutSelfiePromo: boolean
  hasSeenCoachingCuesPopup: boolean
  hasSeenCoachingCuesVolumeTooltip: boolean
  
  // Feature Onboarding Flags (UI Elements)
  hasSeenCounterPopover: boolean
  
  // Feature Onboarding Flags (Daily Lifts)
  hasSeenDailyLiftPromo: boolean
  
  // Feature Onboarding Flags (Programs)
  joinProgramPromptEnabled: boolean
  
  // Feature Onboarding Flags (Legal)
  hasSeenTosUpdate: boolean
  
  // Feature Onboarding Flags (Sharing)
  hasSeenShareCustomWorkoutToolTip: boolean
  hasSeenCustomTabSharingToolTip: boolean
  hasSeenCustomWorkoutsSharingPromo: boolean
}

export interface TonalDailyMetrics {
  date: string // YYYY-MM-DD format
  totalVolume: number // Total weight lifted in pounds
  totalWorkouts: number // Number of workouts completed
  totalDuration: number // Total workout time in seconds
  totalExternalActivities: number // Non-Tonal activities tracked
  totalWork: number // Energy expenditure in kilojoules
  totalTimeUnderTension: number // Total muscle tension time in seconds
}

export interface TonalCurrentStreak {
  userId: string
  currentStreak: number // Current workout streak count
  currentStreakStartDate: string // When current streak began
  lastUpdatedWeek: string // Last week streak was updated
  maxStreak: number // Personal best streak count
  maxStreakStartDate: string // When personal best streak started
  updatedByActivityId: string // Workout ID that last updated the streak
}

export interface TonalActivitySummary {
  id: string // Unique activity/session ID
  deletedAt: string | null
  userId: string
  name: string // Workout name (e.g., "6x PPL - Mon", "Free Lift")
  workoutId: string // Template workout ID
  isInProgram: boolean // Whether part of a structured program
  isGuidedWorkout: boolean // Guided vs free lift
  isBaselineWorkout: boolean // Whether this was a baseline/assessment workout
  timestamp: string // Start time (UTC)
  UTCTimestamp: string // Start time (UTC, same as timestamp)
  localTimestamp: string // Start time in user's timezone
  endTime: string // End time (UTC)
  timeZone: string // User's timezone during workout
  assetID?: string // Asset ID for guided workouts
  targetArea: string // Target muscle groups ("UPPER BODY", "LOWER BODY", etc.)
  duration: number // Workout duration in seconds
  timeUnderTension: number // Total time under tension in seconds
  repGoalPercentage: number | null // Goal achievement percentage
  totalReps: number // Total repetitions completed
  totalVolume: number // Total weight lifted in pounds
  totalWork: number // Energy expenditure in kilojoules
  level: string // Difficulty level
  programWeeks: number // Number of weeks in program (0 if not in program)
  programWorkoutsPerWeek: number // Workouts per week in program (0 if not in program)
  groupIds: string[] // Group/category IDs
  workoutType: string // Type classification ("Custom", etc.)
  completed: boolean // Whether workout was completed
  deviceId: string // Physical Tonal device ID
  appVersion: string // App version used during workout
  activityType: string // Activity classification ("Internal", etc.)
  triggeredTimedWeightOff: boolean // Whether timed weight-off was triggered
}

export interface TonalUserStatistics {
  volume: {
    total: number // Total weight lifted across all workouts (lbs)
    maxVolumeInWorkout: number // Highest volume in a single workout (lbs)
    maxVolumeInAWeek: number // Highest volume in a single week (lbs)
    avgVolumePerWorkout: number // Average volume per workout (lbs)
    avgVolumePerWeek: number // Average volume per week (lbs)
  }
  workouts: {
    total: number // Total number of workouts completed
    maxWorkoutDuration: number // Longest workout duration (seconds)
    avgWorkoutDuration: number // Average workout duration (seconds)
    totalDuration: number // Total time spent working out (seconds)
    totalTimeUnderTension: number // Total time under tension across all workouts (seconds)
    maxWorkoutsPerWeek: number // Most workouts completed in a single week
    avgWorkoutsPerWeek: number // Average workouts per week
    totalFreeliftWorkouts: number // Number of free lift (non-guided) workouts
    totalCustomWorkouts: number // Number of custom/guided workouts
  }
  movements: {
    total: number // Total number of unique movements performed
    movementIds: string[] // Array of all movement IDs performed
  }
  programs: {
    total: number // Total number of programs completed or participated in
    totalProgramVolume: number // Total volume lifted in program workouts (lbs)
    totalProgramWorkouts: number // Total workouts completed within programs
    totalDuration: number // Total duration of program workouts (seconds)
    programSummaries: unknown | null // Program-specific summaries (structure TBD)
  }
}

export interface TonalAchievementMilestone {
  id: string // Unique milestone ID
  name: string // Achievement name (e.g., "500 Workouts", "5 Million lbs")
  description: string // Full achievement description
  shortDescription: string // Brief description for display
  achievementCategoryId: string // Category this achievement belongs to
  achievementCategory: unknown | null // Category details (structure TBD)
  assetId: string // Asset ID for achievement graphics/content
  value: number // Milestone value (500 workouts, 5000000 lbs, etc.)
  iconAssetId: string // Icon asset ID for achievement badge
  active: boolean // Whether this achievement is currently active/available
  needsTemplate: boolean // Whether achievement requires a template
}

export interface TonalAchievementStats {
  totalAchievements: number // Total number of achievements earned
  nextMilestones: TonalAchievementMilestone[] // Upcoming milestones to work toward
}

export interface TonalAchievementCategory {
  id: string // Category ID
  name: string // Category name (e.g., "Badges", "Volume Milestone")
  type: string // Category type ("Badge", "Milestone")
}

export interface TonalAchievementDefinition {
  id: string // Achievement template ID
  name: string // Achievement name
  description: string // Full description
  shortDescription: string // Brief description
  achievementCategoryId: string // Category this achievement belongs to
  achievementCategory: TonalAchievementCategory // Category details
  assetId: string // Asset ID for achievement graphics
  value: number | null // Achievement value (workout count, volume, etc.) or null for badges
  iconAssetId: string // Icon asset ID
  active: boolean // Whether achievement is active
  needsTemplate: boolean // Whether achievement needs a template
}

export interface TonalEarnedAchievement {
  id: string // Unique earned achievement instance ID
  achievementId: string // References the achievement definition
  userId: string // User who earned the achievement
  createdAt: string // When the achievement was earned (UTC)
  name: string // Achievement name (duplicated from definition)
  description: string // Achievement description (duplicated from definition)
  shortDescription: string // Short description (duplicated from definition)
  assetId: string // Asset ID for graphics (duplicated from definition)
  workoutActivityId?: string // Workout that triggered the achievement (if applicable)
  iconAssetId: string // Icon asset ID (duplicated from definition)
  achievement: TonalAchievementDefinition // Full achievement definition
  localTimestamp: string // When achievement was earned in user's timezone
}

export interface TonalMuscleUtilization {
  muscleGroup: string // Muscle group name (e.g., "Back", "Biceps", "Chest")
  value: number // Utilization percentage (0-100)
}

export interface TonalWorkoutSummaryData {
  workoutActivityId: string // Activity ID for the completed workout
  duration: number // Workout duration in seconds
  volume: number // Total weight lifted in pounds
  work: number // Energy expenditure in kilojoules
  muscleUtilization: TonalMuscleUtilization[] // Muscle group utilization breakdown
}

export interface TonalCompatibilityStatus {
  status: string // Compatibility status ("supported", etc.)
  lockedReason: string | null // Reason if workout is locked/unavailable
}

export interface TonalCalendarTile {
  type: string // Tile type ("CUSTOM_WORKOUT_SUMMARY", "DAILY_LIFT_WORKOUT", "WORKOUT")
  assetId: string // Asset ID for workout graphics/content
  title: string // Workout title/name
  duration: number // Workout duration in seconds
  completed?: boolean // Whether workout was completed (for summaries)
  workoutId: string // Workout template ID
  targetArea: string // Target muscle groups ("UPPER BODY", "LOWER BODY", "FULL BODY", "CORE")
  level?: string // Difficulty level ("BEGINNER", "INTERMEDIATE", "ADVANCED")
  trainingTypeIds?: string[] // Training type classification IDs
  coachId?: string // Coach/trainer ID
  accessories?: string[] // Required equipment/accessories
  compatibilityStatus?: TonalCompatibilityStatus // Device compatibility info
  workoutSummaryData?: TonalWorkoutSummaryData // Summary data for completed workouts
}

export interface TonalDailySchedule {
  date: string // Date in YYYY-MM-DD format
  recommendationType?: string // Recommendation category ("GOAL", "QUICK", "TRENDING", "NEWEST", "FEATURED", "STRENGTH")
  tiles: TonalCalendarTile[] // Workouts/activities for this date
}

export interface TonalHomeCalendar {
  dailySchedules: TonalDailySchedule[] // Calendar data by date
}

export interface TonalGoal {
  id: string
  name: string
  description: string
  active: boolean
  filterItemId: string // TODO: investigate what filterItemId is used for
}

export interface TonalTrainingEffectGoal {
  id: string
  name: string
  description: string
  active: boolean
  filterItemId: string
}

export interface TonalTrainingEffectGoalRelation {
  id: string // Primary goal ID
  secondary: string[] // Secondary related goal IDs
  tertiary: string[] // Tertiary related goal IDs
}

export interface TonalTrainingEffectGoalsResponse {
  goals: TonalTrainingEffectGoal[]
  relations: TonalTrainingEffectGoalRelation[]
}

export interface TonalTrainingType {
  id: string
  name: string
  description: string
  assetId: string
  infoVidId: string
  filterItemId: string
}

export interface TonalGoalMetric {
  id: string
  name: string
  goalId: string // References TonalTrainingEffectGoal.id
  description: string
}

export interface TonalUserGoal {
  id: string
  userID: string
  goalID: string
  tier: number // Priority tier: 1=highest priority, 2=medium, 3=lowest
}

export interface TonalMuscleReadiness {
  Chest: number // Readiness percentage (0-100)
  Shoulders: number // Readiness percentage (0-100)
  Back: number // Readiness percentage (0-100)
  Triceps: number // Readiness percentage (0-100)
  Biceps: number // Readiness percentage (0-100)
  Abs: number // Readiness percentage (0-100)
  Obliques: number // Readiness percentage (0-100)
  Quads: number // Readiness percentage (0-100)
  Glutes: number // Readiness percentage (0-100)
  Hamstrings: number // Readiness percentage (0-100)
  Calves: number // Readiness percentage (0-100)
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