export interface OAuthTokenResponse {
    access_token: string;
    id_token: string;
    refresh_token: string;
    scope: string;
    token_type: string;
    expires_in: number;
}

type MuscleGroup =
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
    | 'Forearms';

export interface TonalMovement {
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

export interface TonalWorkout {
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
    omitempty: null | any;
}

export interface TonalSharedWorkout {
    id: string;
    sharerUserId: string;
    parentWorkoutId: string;
    workoutSnapshotId: string;
    workoutSnapshotHash: string;
    deepLinkUrl: string;
    workoutSnapshot: TonalWorkout;
}
