interface TonalApiError {
    error: string;
    error_description?: string;
    statusCode?: number;
}
declare class TonalClientError extends Error {
    readonly statusCode?: number;
    readonly originalError?: unknown;
    constructor(message: string, statusCode?: number, originalError?: unknown);
}
interface OAuthTokenResponse {
    access_token: string;
    id_token: string;
    refresh_token: string;
    scope: string;
    token_type: string;
    expires_in: number;
}

type MuscleGroup = 'Obliques' | 'Abs' | 'Shoulders' | 'Glutes' | 'Back' | 'Biceps' | 'Quads' | 'Triceps' | 'Chest' | 'Hamstrings' | 'Calves' | 'Forearms';

interface TonalMovement {
    id: string;
    createdAt: string;
    updatedAt: string;
    name: string;
    shortName: string;
    muscleGroups: MuscleGroup[];
    bodyRegion: string;
    bodyRegionDisplay: string;
    baseOfSupport: string;
    pushPull: string;
    family: string;
    familyDisplay: string;
    inFreeLift: boolean;
    onMachine: boolean;
    countReps: boolean;
    isTwoSided: boolean;
    isBilateral: boolean;
    isAlternating: boolean;
    offMachineAccessory: string;
    descriptionHow: string;
    descriptionWhy: string;
    sortOrder: number;
    imageAssetId: string;
    skillLevel: number;
    active: boolean;
    featureGroupIds: null | string[];
    isGeneric: boolean;
}

type WorkoutPublishState = 'published' | 'archived' | string;
interface WorkoutSet {
    id: string;
    workoutId: string;
    blockStart: boolean;
    movementId: string;
    prescribedReps: number;
    repetition: number;
    repetitionTotal: number;
    blockNumber: number;
    burnout: boolean;
    spotter: boolean;
    eccentric: boolean;
    chains: boolean;
    skipSetup: boolean;
    skipDemo: boolean;
    finalSet: boolean;
    calibration: boolean;
    practice: boolean;
    flex: boolean;
    progressive: boolean;
    weightPercentage: number;
    warmUp: boolean;
    durationBasedRepGoal: number;
    setGroup: number;
    round: number;
    description: string;
    dropSet: boolean;
    omitempty?: unknown;
}
interface TonalWorkout {
    id: string;
    createdAt: string;
    title: string;
    shortDescription: string;
    description: string;
    productionCode: string;
    assetId: string;
    coachId: string;
    sets: WorkoutSet[];
    duration: number;
    publishState: WorkoutPublishState;
    programId: string | null;
    level: string;
    groupIds: string[];
    targetArea: string;
    tags: string[] | null;
    bodyRegions: MuscleGroup[];
    goalIds: string[] | null;
    trainingEffectGoals: string[];
    disableModification: boolean;
    publishedAt: string;
    localPublishedAt: string;
    type: string;
    userId: string;
    style: string;
    trainingType: string;
    trainingTypeIds: string[] | null;
    mobileFriendly: boolean;
    live: boolean;
    recoveryWeight: boolean;
    supportedDevices: string[] | null;
    featureGroupIds: string[] | null;
    movementIds: string[];
    accessories?: string[];
    muscleGroupsForExclusion: MuscleGroup[] | null;
    playbackType: string;
    isImported: boolean;
    createdSource?: unknown | null;
}
interface TonalSharedWorkout {
    id: string;
    sharerUserId: string;
    parentWorkoutId: string;
    workoutSnapshotId: string;
    workoutSnapshotHash: string;
    deepLinkUrl: string;
    workoutSnapshot: TonalWorkout;
}
interface TonalWorkoutEstimateSet {
    blockStart: boolean;
    movementId: string;
    prescribedReps?: number;
    prescribedDuration?: number;
    dropSet: boolean;
    repetition: number;
    repetitionTotal: number;
    blockNumber: number;
    burnout: boolean;
    spotter: boolean;
    eccentric: boolean;
    chains: boolean;
    flex: boolean;
    warmUp: boolean;
    weightPercentage: number;
    setGroup: number;
    round: number;
    description: string;
}
interface TonalWorkoutEstimateResponse {
    duration: number;
}
interface TonalWorkoutCreateRequest {
    title: string;
    sets: TonalWorkoutEstimateSet[];
    createdSource?: 'WorkoutBuilder' | 'FreeLift' | 'SharedWorkout' | 'DailyLift' | 'TonalWorkout' | 'WorkoutGenerator' | 'ActivityFeed';
    shortDescription?: string;
    description?: string;
}
interface TonalWorkoutUpdateRequest {
    id: string;
    title: string;
    description?: string;
    coachId: string;
    sets: TonalWorkoutEstimateSet[];
    level?: string;
    assetId: string;
    createdSource?: 'WorkoutBuilder' | 'FreeLift' | 'SharedWorkout' | 'DailyLift' | 'TonalWorkout' | 'WorkoutGenerator' | 'ActivityFeed';
}

interface TonalProgramWorkout {
    id: string;
    programId: string;
    workoutId: string;
    level: string;
    workoutNumber: number;
    workoutTitle: string;
    programWeek: number;
    programDay: number;
    duration: number;
}
interface TonalProgramTrainingEffectGoal {
    goalID: string;
    score: number;
    goalMet: boolean;
}
interface TonalProgram {
    id: string;
    createdAt: string;
    name: string;
    description: string;
    productionCode: string;
    workoutsPerWeek: number;
    cadence: boolean[];
    weeks: number;
    publishState: string;
    publishedAt: string;
    level: string;
    workouts: TonalWorkout[];
    assetId: string;
    goalIds: string[];
    groupIds: string[];
    coachId: string;
    coachIds: string[];
    trainingTypeIds: string[];
    isAdjustable: boolean;
    programWorkoutIds: string[];
    programWorkouts: TonalProgramWorkout[];
    nonComparableWorkouts: boolean;
    mobileFriendly: boolean;
    supportedDevices: string[];
    featureGroupIds: string[] | null;
    excludeFromCoachHighlights: boolean;
    trainingEffectGoals: TonalProgramTrainingEffectGoal[];
}

interface TonalUserDevice {
    deviceId: string;
    tonalDeviceId: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
    loggedIn: boolean;
    postWorkoutNotifs: boolean;
    reminderNotifs: boolean;
    productUpdateNotifs: boolean;
    socialNotifs: boolean;
    blogNotifs: boolean;
    chatbotNotifs: boolean;
    deviceModel: string;
    osVersion: string;
    appVersion: string;
    platform: string;
}
interface TonalDeviceRegistration {
    userId: string;
    tonalDeviceId: string;
    deviceId: string;
    deviceModel: string;
    osVersion: string;
    appVersion: string;
    platform: string;
    loggedIn: boolean;
}
interface TonalUserPermissions {
    userId: string;
    memberDate: 'Public' | 'Private';
    gender: 'Public' | 'Private';
    age: 'Public' | 'Private';
    streak: 'Public' | 'Private';
    workoutCalendar: 'Public' | 'Private';
    strengthScore: 'Public' | 'Private';
    achievements: 'Public' | 'Private';
    leaderboard: 'Public' | 'Private';
    volume: 'Public' | 'Private';
    workouts: 'Public' | 'Private';
    movements: 'Public' | 'Private';
    programs: 'Public' | 'Private';
    activity: 'Public' | 'Private';
    publicProfile: 'Public' | 'Private';
    location: 'Public' | 'Private';
    fullName: 'Public' | 'Private';
}
interface TonalUserSettings {
    userId: string;
    overallVolume: number;
    musicVolume: number;
    coachVolume: number;
    soundEffectsVolume: number;
    coachingCuesVolume: number;
    bluetoothOverallVolume: number;
    bluetoothMusicVolume: number;
    bluetoothCoachVolume: number;
    bluetoothSoundEffectsVolume: number;
    feedFmStation: string;
    feedFmAutoPlay: boolean;
    feedFmClientId: string;
    preferredMusicService: string;
    timeZone: string;
    screenBrightness: number;
    closedCaptions: boolean;
    coachingCuesVoiceType: number;
    workoutGraph: string;
    workoutDemo: boolean;
    demoPlayerSize: string;
    dataInGuidedWorkouts: boolean;
    defaultRecoveryWeightTooltipCount: number;
    activeRecoveryRecoveryWeightTooltipCount: number;
    timedWeightOffDisabledByDefault: boolean;
    timedWeightOffDelayBeforeRampMs: number;
    hasRequestedAccountDeletion: boolean;
    isSmartViewEnabled: boolean;
    smartViewMode: string;
    hasSeenLeaderboardIntroTile: boolean;
    hasSeenYearInReviewBanner: boolean;
    hasSeenYearInReviewPromo: boolean;
    hasSeenWarmUpSetsModal: boolean;
    hasSeenWorkoutRemindersPopUp: boolean;
    hasSeenScheduleWorkoutToolTip: boolean;
    hasSeenPublicProfilePopUp: boolean;
    hasSharedPublicProfile: boolean;
    hasHiddenReferralPromo2022: boolean;
    hasClosedTonal101Ad: boolean;
    hasConnectedVisionCamera: boolean;
    hasSeenTonalVisionPromo: boolean;
    hasSeenARCoreDisclaimer: boolean;
    hasSeenEditorialContentsPromo: boolean;
    hasOpenedEditorialContentsPromo: boolean;
    hasSeenCustomMovementDescriptions: boolean;
    hasSeenMovementInfoAndGraphsFtue: boolean;
    hasSeenFreeLiftMovementInfoFtue: boolean;
    hasSeenMovementReplacementModal: boolean;
    hasSeenRomPowerGraphModal: boolean;
    hasSeenCustomMovementReplacementModal: boolean;
    hasSeenAnkleStrapsPromo: boolean;
    hasHiddenAnkleStraps: boolean;
    hasSeenPilatesLoopsPromo: boolean;
    hasHiddenPilatesLoops: boolean;
    hasSeenPilatesLoopsPreOrderPromo: boolean;
    hasHiddenPreOrderPilatesLoops: boolean;
    hasSeenExclusionFiltersTooltip: boolean;
    hasSeenExclusionFiltersTrainerTooltip: boolean;
    hasSeenSmartViewInfoVid: boolean;
    hasHiddenSmartViewDiscoveryTooltip: boolean;
    hasSeenSmartViewMovementsTabToolTip: boolean;
    hasSeenSmartViewClipsToolTip: boolean;
    hasSeenLinkTonalOrderDialog: boolean;
    hasSeenThirdPartyMetricsPromo: boolean;
    hasDismissedUpdatePreferencesBanner: boolean;
    hasDismissedThirdPartyMuscleReadinessTile: boolean;
    hasSeenUpdatedAppleHealthScreen: boolean;
    hasDismissedTrainingEffectGoalsBanner: boolean;
    hasSeenTrainingEffectGoalsPromo: boolean;
    hasSeenTrainingMetricsPromo: boolean;
    hasSeenBodygramInstructions: boolean;
    hasSeenChatbotAnnouncementModal: boolean;
    hasDismissedChatbotTooltip: boolean;
    hasSeenDropSetsPromo: boolean;
    hasHiddenDropSetsPromoBanner: boolean;
    hasSeenScorecardPromo: boolean;
    hasHiddenScorecardPopover: boolean;
    hasHiddenProgramScorecardPopover: boolean;
    hasHiddenAeroPromoBanner: boolean;
    hasSeenPostWorkoutSelfiePromo: boolean;
    hasSeenCoachingCuesPopup: boolean;
    hasSeenCoachingCuesVolumeTooltip: boolean;
    hasSeenCounterPopover: boolean;
    hasSeenDailyLiftPromo: boolean;
    joinProgramPromptEnabled: boolean;
    hasSeenTosUpdate: boolean;
    hasSeenShareCustomWorkoutToolTip: boolean;
    hasSeenCustomTabSharingToolTip: boolean;
    hasSeenCustomWorkoutsSharingPromo: boolean;
}
interface TonalDailyMetrics {
    date: string;
    totalVolume: number;
    totalWorkouts: number;
    totalDuration: number;
    totalExternalActivities: number;
    totalWork: number;
    totalTimeUnderTension: number;
}
interface TonalCurrentStreak {
    userId: string;
    currentStreak: number;
    currentStreakStartDate: string;
    lastUpdatedWeek: string;
    maxStreak: number;
    maxStreakStartDate: string;
    updatedByActivityId: string;
}
interface TonalActivitySummary {
    id: string;
    deletedAt: string | null;
    userId: string;
    name: string;
    workoutId: string;
    isInProgram: boolean;
    isGuidedWorkout: boolean;
    isBaselineWorkout: boolean;
    timestamp: string;
    UTCTimestamp: string;
    localTimestamp: string;
    endTime: string;
    timeZone: string;
    assetID?: string;
    targetArea: string;
    duration: number;
    timeUnderTension: number;
    repGoalPercentage: number | null;
    totalReps: number;
    totalVolume: number;
    totalWork: number;
    level: string;
    programWeeks: number;
    programWorkoutsPerWeek: number;
    groupIds: string[];
    workoutType: string;
    completed: boolean;
    deviceId: string;
    appVersion: string;
    activityType: string;
    triggeredTimedWeightOff: boolean;
}
interface TonalUserStatistics {
    volume: {
        total: number;
        maxVolumeInWorkout: number;
        maxVolumeInAWeek: number;
        avgVolumePerWorkout: number;
        avgVolumePerWeek: number;
    };
    workouts: {
        total: number;
        maxWorkoutDuration: number;
        avgWorkoutDuration: number;
        totalDuration: number;
        totalTimeUnderTension: number;
        maxWorkoutsPerWeek: number;
        avgWorkoutsPerWeek: number;
        totalFreeliftWorkouts: number;
        totalCustomWorkouts: number;
    };
    movements: {
        total: number;
        movementIds: string[];
    };
    programs: {
        total: number;
        totalProgramVolume: number;
        totalProgramWorkouts: number;
        totalDuration: number;
        programSummaries: unknown | null;
    };
}
interface TonalAchievementMilestone {
    id: string;
    name: string;
    description: string;
    shortDescription: string;
    achievementCategoryId: string;
    achievementCategory: unknown | null;
    assetId: string;
    value: number;
    iconAssetId: string;
    active: boolean;
    needsTemplate: boolean;
}
interface TonalAchievementStats {
    totalAchievements: number;
    nextMilestones: TonalAchievementMilestone[];
}
interface TonalAchievementCategory {
    id: string;
    name: string;
    type: string;
}
interface TonalAchievementDefinition {
    id: string;
    name: string;
    description: string;
    shortDescription: string;
    achievementCategoryId: string;
    achievementCategory: TonalAchievementCategory;
    assetId: string;
    value: number | null;
    iconAssetId: string;
    active: boolean;
    needsTemplate: boolean;
}
interface TonalEarnedAchievement {
    id: string;
    achievementId: string;
    userId: string;
    createdAt: string;
    name: string;
    description: string;
    shortDescription: string;
    assetId: string;
    workoutActivityId?: string;
    iconAssetId: string;
    achievement: TonalAchievementDefinition;
    localTimestamp: string;
}
interface TonalMuscleUtilization {
    muscleGroup: string;
    value: number;
}
interface TonalWorkoutSummaryData {
    workoutActivityId: string;
    duration: number;
    volume: number;
    work: number;
    muscleUtilization: TonalMuscleUtilization[];
}
interface TonalCompatibilityStatus {
    status: string;
    lockedReason: string | null;
}
interface TonalCalendarTile {
    type: string;
    assetId: string;
    title: string;
    duration: number;
    completed?: boolean;
    workoutId: string;
    targetArea: string;
    level?: string;
    trainingTypeIds?: string[];
    coachId?: string;
    accessories?: string[];
    compatibilityStatus?: TonalCompatibilityStatus;
    workoutSummaryData?: TonalWorkoutSummaryData;
}
interface TonalDailySchedule {
    date: string;
    recommendationType?: string;
    tiles: TonalCalendarTile[];
}
interface TonalHomeCalendar {
    dailySchedules: TonalDailySchedule[];
}
interface TonalGoal {
    id: string;
    name: string;
    description: string;
    active: boolean;
    filterItemId: string;
}
interface TonalTrainingEffectGoal {
    id: string;
    name: string;
    description: string;
    active: boolean;
    filterItemId: string;
}
interface TonalTrainingEffectGoalRelation {
    id: string;
    secondary: string[];
    tertiary: string[];
}
interface TonalTrainingEffectGoalsResponse {
    goals: TonalTrainingEffectGoal[];
    relations: TonalTrainingEffectGoalRelation[];
}
interface TonalTrainingType {
    id: string;
    name: string;
    description: string;
    assetId: string;
    infoVidId: string;
    filterItemId: string;
}
interface TonalGoalMetric {
    id: string;
    name: string;
    goalId: string;
    description: string;
}
interface TonalUserGoal {
    id: string;
    userID: string;
    goalID: string;
    tier: number;
}
interface TonalMuscleReadiness {
    Chest: number;
    Shoulders: number;
    Back: number;
    Triceps: number;
    Biceps: number;
    Abs: number;
    Obliques: number;
    Quads: number;
    Glutes: number;
    Hamstrings: number;
    Calves: number;
}
interface TonalTargetScore {
    userId: string;
    weekNumber: number;
    metricId: string;
    target: number;
    lowRange: number;
    highRange: number;
}
interface TonalTargetScoresResponse {
    [metricId: string]: TonalTargetScore[];
}
interface TonalMetricScore {
    userId: string;
    weekNumber: number;
    metricId: string;
    score: number;
}
interface TonalMetricScoresResponse {
    [metricId: string]: TonalMetricScore[];
}
interface TonalUserInfo {
    id: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    email: string;
    firstName: string;
    lastName: string;
    gender: 'MALE' | 'FEMALE' | string;
    heightInches: number;
    weightPounds: number;
    auth0Id: string;
    dateOfBirth: string;
    isGuestAccount: boolean;
    isDemoAccount: boolean;
    watchedSafetyVideo: boolean;
    recentMobileDevice: TonalUserDevice;
    emailVerified: boolean;
    username: string;
    workoutsPerWeek: number;
    tonalStatus: 'purchased' | string;
    social: unknown | null;
    profileAssetID: string | null;
    mobileWorkoutsEnabled: boolean;
    accountType: 'PublicUser' | string;
    location: string;
    sharingCustomWorkoutsDisabled: boolean;
    level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | string;
    goalId: string;
    goals: TonalUserGoal[];
    workoutDurationMin: number;
    workoutDurationMax: number;
    updatedPreferencesAt: string;
    primaryDeviceType: 'Classic' | string;
}

declare class TonalClient {
    private authManager;
    private httpClient;
    private workoutService;
    private movementService;
    private userService;
    private constructor();
    static create(credentials: {
        username: string;
        password: string;
    }): Promise<TonalClient>;
    getMovements(): Promise<TonalMovement[]>;
    getUserInfo(): Promise<TonalUserInfo>;
    getGoals(): Promise<TonalGoal[]>;
    getTrainingEffectGoals(): Promise<TonalTrainingEffectGoalsResponse>;
    getTrainingTypes(): Promise<TonalTrainingType[]>;
    getGoalMetrics(): Promise<TonalGoalMetric[]>;
    getUserSettings(): Promise<TonalUserSettings>;
    getDailyMetrics(days?: number): Promise<TonalDailyMetrics[]>;
    getCurrentStreak(): Promise<TonalCurrentStreak>;
    getActivitySummaries(): Promise<TonalActivitySummary[]>;
    getUserStatistics(): Promise<TonalUserStatistics>;
    getAchievementStats(): Promise<TonalAchievementStats>;
    getAchievements(): Promise<TonalEarnedAchievement[]>;
    getHomeCalendar(): Promise<TonalHomeCalendar>;
    getMuscleReadiness(): Promise<TonalMuscleReadiness>;
    getProgramById(programId: string): Promise<TonalProgram>;
    getTargetScores(): Promise<TonalTargetScoresResponse>;
    getMetricScores(startWeek?: number): Promise<TonalMetricScoresResponse>;
    getUserWorkouts(offset?: number, limit?: number): Promise<TonalWorkout[]>;
    getDailyLifts(timeZone?: string): Promise<TonalWorkout[]>;
    getWorkoutById(workoutId: string): Promise<TonalWorkout>;
    getWorkoutByShareUrl(shareUrl: string): Promise<TonalSharedWorkout>;
    estimateWorkoutDuration(sets: TonalWorkoutEstimateSet[]): Promise<TonalWorkoutEstimateResponse>;
    createWorkout(workoutData: TonalWorkoutCreateRequest): Promise<TonalWorkout>;
    updateWorkout(workoutData: TonalWorkoutUpdateRequest): Promise<TonalWorkout>;
    deleteWorkout(workoutId: string): Promise<void>;
}

export { MuscleGroup, OAuthTokenResponse, TonalAchievementCategory, TonalAchievementDefinition, TonalAchievementMilestone, TonalAchievementStats, TonalActivitySummary, TonalApiError, TonalCalendarTile, TonalClient, TonalClientError, TonalCompatibilityStatus, TonalCurrentStreak, TonalDailyMetrics, TonalDailySchedule, TonalDeviceRegistration, TonalEarnedAchievement, TonalGoal, TonalGoalMetric, TonalHomeCalendar, TonalMetricScore, TonalMetricScoresResponse, TonalMovement, TonalMuscleReadiness, TonalMuscleUtilization, TonalProgram, TonalProgramTrainingEffectGoal, TonalProgramWorkout, TonalSharedWorkout, TonalTargetScore, TonalTargetScoresResponse, TonalTrainingEffectGoal, TonalTrainingEffectGoalRelation, TonalTrainingEffectGoalsResponse, TonalTrainingType, TonalUserDevice, TonalUserGoal, TonalUserInfo, TonalUserPermissions, TonalUserSettings, TonalUserStatistics, TonalWorkout, TonalWorkoutCreateRequest, TonalWorkoutEstimateResponse, TonalWorkoutEstimateSet, TonalWorkoutSummaryData, TonalWorkoutUpdateRequest, WorkoutPublishState, WorkoutSet, TonalClient as default };
