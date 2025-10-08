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
interface TonalGoal {
    id: string;
    name: string;
    description: string;
    active: boolean;
    filterItemId: string;
}
interface TonalUserGoal {
    id: string;
    userID: string;
    goalID: string;
    tier: number;
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
    getUserWorkouts(offset?: number, limit?: number): Promise<TonalWorkout[]>;
    getWorkoutById(workoutId: string): Promise<TonalWorkout>;
    getWorkoutByShareUrl(shareUrl: string): Promise<TonalSharedWorkout>;
    estimateWorkoutDuration(sets: TonalWorkoutEstimateSet[]): Promise<TonalWorkoutEstimateResponse>;
    createWorkout(workoutData: TonalWorkoutCreateRequest): Promise<TonalWorkout>;
    updateWorkout(workoutData: TonalWorkoutUpdateRequest): Promise<TonalWorkout>;
    deleteWorkout(workoutId: string): Promise<void>;
}

export { MuscleGroup, OAuthTokenResponse, TonalApiError, TonalClient, TonalClientError, TonalGoal, TonalMovement, TonalSharedWorkout, TonalUserDevice, TonalUserGoal, TonalUserInfo, TonalWorkout, TonalWorkoutCreateRequest, TonalWorkoutEstimateResponse, TonalWorkoutEstimateSet, TonalWorkoutUpdateRequest, WorkoutPublishState, WorkoutSet, TonalClient as default };
