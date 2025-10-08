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
    publishState: string;
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
    muscleGroupsForExclusion: MuscleGroup[] | null;
    playbackType: string;
    isImported: boolean;
}
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
interface TonalSharedWorkout {
    id: string;
    sharerUserId: string;
    parentWorkoutId: string;
    workoutSnapshotId: string;
    workoutSnapshotHash: string;
    deepLinkUrl: string;
    workoutSnapshot: TonalWorkout;
}

declare class TonalClient {
    private username;
    private password;
    private idToken;
    private tokenExpiresAt;
    private readonly baseUrl;
    private readonly authUrl;
    private readonly clientId;
    private readonly requestTimeout;
    private readonly maxRetries;
    private constructor();
    static create({ username, password }: {
        username: string;
        password: string;
    }): Promise<TonalClient>;
    private sleep;
    private makeRequest;
    private makeRequestWithRetry;
    private refreshToken;
    private ensureValidToken;
    getMovements(): Promise<TonalMovement[]>;
    getWorkoutById(id: string): Promise<TonalWorkout>;
    getWorkoutByShareUrl(shareUrl: string): Promise<TonalSharedWorkout>;
}

export { MuscleGroup, OAuthTokenResponse, TonalApiError, TonalClientError, TonalMovement, TonalSharedWorkout, TonalWorkout, TonalClient as default };
