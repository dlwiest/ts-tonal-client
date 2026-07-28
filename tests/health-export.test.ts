import {
  buildHealthExport,
  TonalActivitySummary,
  TonalHealthExportSource,
  TonalMovement,
  TonalMuscleReadiness,
  TonalUserStatistics,
  TonalWorkoutActivity,
} from '../src'

function activity(
  id: string,
  timestamp: string,
  overrides: Partial<TonalActivitySummary> = {}
): TonalActivitySummary {
  return {
    id,
    deletedAt: null,
    userId: 'private-user-id',
    name: `Workout ${id}`,
    workoutId: `workout-${id}`,
    isInProgram: false,
    isGuidedWorkout: true,
    isBaselineWorkout: false,
    timestamp,
    UTCTimestamp: timestamp,
    localTimestamp: timestamp,
    endTime: timestamp,
    timeZone: 'America/Chicago',
    targetArea: 'FULL BODY',
    duration: 1800,
    timeUnderTension: 300,
    repGoalPercentage: 100,
    totalReps: 100,
    totalVolume: 5000,
    totalWork: 50,
    level: 'INTERMEDIATE',
    programWeeks: 0,
    programWorkoutsPerWeek: 0,
    groupIds: [],
    workoutType: 'Custom',
    completed: true,
    deviceId: 'private-device-id',
    appVersion: '1.2.3',
    activityType: 'Internal',
    triggeredTimedWeightOff: false,
    ...overrides,
  }
}

const readiness: TonalMuscleReadiness = {
  Chest: 80,
  Shoulders: 75,
  Back: 70,
  Triceps: 85,
  Biceps: 90,
  Abs: 65,
  Obliques: 60,
  Quads: 95,
  Glutes: 88,
  Hamstrings: 82,
  Calves: 77,
}

const statistics: TonalUserStatistics = {
  volume: {
    total: 100000,
    maxVolumeInWorkout: 10000,
    maxVolumeInAWeek: 25000,
    avgVolumePerWorkout: 5000,
    avgVolumePerWeek: 15000,
  },
  workouts: {
    total: 20,
    maxWorkoutDuration: 3600,
    avgWorkoutDuration: 1800,
    totalDuration: 36000,
    totalTimeUnderTension: 6000,
    maxWorkoutsPerWeek: 5,
    avgWorkoutsPerWeek: 3,
    totalFreeliftWorkouts: 5,
    totalCustomWorkouts: 15,
  },
  movements: {
    total: 30,
    movementIds: ['movement-1'],
  },
  programs: {
    total: 1,
    totalProgramVolume: 50000,
    totalProgramWorkouts: 10,
    totalDuration: 18000,
    programSummaries: null,
  },
}

const detailedActivity: TonalWorkoutActivity = {
  id: 'newest',
  userId: 'private-user-id',
  workoutId: 'workout-newest',
  workoutType: 'Custom',
  timezone: 'America/Chicago',
  beginTime: '2026-01-03T12:00:00.000Z',
  endTime: '2026-01-03T12:40:00.000Z',
  totalDuration: 2400,
  activeDuration: 1800,
  restDuration: 600,
  totalMovements: 1,
  totalSets: 1,
  totalReps: 10,
  totalVolume: 1000,
  totalConcentricWork: 60,
  percentCompleted: 100,
  workoutSetActivity: [
    {
      id: 'set-1',
      movementId: 'movement-1',
      prescribedReps: 10,
      repetition: 1,
      repetitionTotal: 1,
      blockNumber: 1,
      spotter: true,
      eccentric: false,
      chains: false,
      flex: false,
      warmUp: false,
      beginTime: '2026-01-03T12:05:00.000Z',
      sideNumber: 0,
      avgWeight: 100,
      baseWeight: 95,
      minWeight: 90,
      maxWeight: 110,
      volume: 1000,
      totalOnMachineVolume: 2000,
      repCount: 10,
      repsInReserve: 2,
      oneRepMax: 133,
      romLengthIn: 24,
      duration: 45,
      maxConPower: 250,
    },
  ],
}

const movement: TonalMovement = {
  id: 'movement-1',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  name: 'Barbell Bench Press',
  shortName: 'Bench Press',
  muscleGroups: ['Chest', 'Triceps'],
  bodyRegion: 'UpperBody',
  bodyRegionDisplay: 'Upper Body',
  baseOfSupport: 'Bench',
  pushPull: 'Push',
  family: 'BenchPress',
  familyDisplay: 'Bench Press',
  inFreeLift: true,
  onMachine: true,
  countReps: true,
  isTwoSided: false,
  isBilateral: true,
  isAlternating: false,
  offMachineAccessory: 'Bench',
  descriptionHow: '',
  descriptionWhy: '',
  sortOrder: 1,
  imageAssetId: 'asset-1',
  skillLevel: 1,
  active: true,
  featureGroupIds: null,
  isGeneric: false,
}

describe('buildHealthExport', () => {
  const source: TonalHealthExportSource = {
    activities: [
      activity('oldest', '2026-01-01T12:00:00.000Z'),
      activity('newest', '2026-01-03T12:00:00.000Z', {
        duration: 2400,
        timeUnderTension: 400,
        totalReps: 120,
        totalVolume: 6000,
        totalWork: 60,
      }),
      activity('middle', '2026-01-02T12:00:00.000Z', {
        completed: false,
      }),
    ],
    muscleReadiness: readiness,
    lifetimeStatistics: statistics,
  }

  it('sorts activities and calculates aggregate totals', () => {
    const result = buildHealthExport(
      source,
      {},
      new Date('2026-01-04T00:00:00.000Z')
    )

    expect(result.schemaVersion).toBe(1)
    expect(result.exportedAt).toBe('2026-01-04T00:00:00.000Z')
    expect(result.period).toEqual({
      start: '2026-01-01T12:00:00.000Z',
      end: '2026-01-03T12:00:00.000Z',
    })
    expect(result.activities.map(item => item.activityId)).toEqual([
      'newest',
      'middle',
      'oldest',
    ])
    expect(result.summary).toEqual({
      workoutCount: 3,
      completedWorkoutCount: 2,
      totalDurationSeconds: 6000,
      totalTimeUnderTensionSeconds: 1000,
      totalReps: 320,
      totalVolumePounds: 16000,
      totalWorkKilojoules: 160,
    })
    expect(result.muscleReadiness).toEqual(readiness)
    expect(result.lifetimeStatistics).toEqual(statistics)
  })

  it('filters by date and limits the newest matching activities', () => {
    const result = buildHealthExport(source, {
      startDate: '2026-01-02T00:00:00.000Z',
      endDate: new Date('2026-01-03T23:59:59.999Z'),
      limit: 1,
    })

    expect(result.activities.map(item => item.activityId)).toEqual(['newest'])
    expect(result.period).toEqual({
      start: '2026-01-03T12:00:00.000Z',
      end: '2026-01-03T12:00:00.000Z',
    })
  })

  it('excludes external activities by default and can include them explicitly', () => {
    const sourceWithExternal: TonalHealthExportSource = {
      ...source,
      activities: [
        ...source.activities,
        activity('external', '2026-01-04T12:00:00.000Z', {
          activityType: 'External',
        }),
      ],
    }

    const tonalOnly = buildHealthExport(sourceWithExternal, { limit: 1 })
    expect(tonalOnly.activities).toHaveLength(1)
    expect(tonalOnly.activities[0]).toMatchObject({
      activityId: 'newest',
      source: 'tonal',
    })

    const includingExternal = buildHealthExport(sourceWithExternal, {
      includeExternalActivities: true,
      limit: 1,
    })
    expect(includingExternal.activities[0]).toMatchObject({
      activityId: 'external',
      source: 'external',
    })
  })

  it('treats a date-only endDate as inclusive of that entire day', () => {
    const result = buildHealthExport(source, {
      startDate: '2026-01-02',
      endDate: '2026-01-02',
    })

    expect(result.activities.map(item => item.activityId)).toEqual(['middle'])
  })

  it('does not expose user, device, or application identifiers', () => {
    const result = buildHealthExport(source)
    const serialized = JSON.stringify(result)

    expect(serialized).not.toContain('private-user-id')
    expect(serialized).not.toContain('private-device-id')
    expect(serialized).not.toContain('1.2.3')
  })

  it('adds movement names and performed set details when supplied', () => {
    const result = buildHealthExport({
      ...source,
      activityDetails: [detailedActivity],
      movements: [movement],
    })

    expect(result.activities[0]).toMatchObject({
      activityId: 'newest',
      totalSets: 1,
      activeDurationSeconds: 1800,
      restDurationSeconds: 600,
      percentCompleted: 100,
      sets: [
        {
          setActivityId: 'set-1',
          movementId: 'movement-1',
          movementName: 'Barbell Bench Press',
          muscleGroups: ['Chest', 'Triceps'],
          prescribedReps: 10,
          completedReps: 10,
          averageResistancePerCablePounds: 100,
          baseResistancePerCablePounds: 95,
          minimumResistancePerCablePounds: 90,
          maximumResistancePerCablePounds: 110,
          effectiveAverageResistancePounds: 200,
          totalVolumePounds: 2000,
          estimatedOneRepMaxPerCablePounds: 133,
          effectiveEstimatedOneRepMaxPounds: 266,
          rangeOfMotionInches: 24,
          durationSeconds: 45,
          repsInReserve: 2,
          maxConcentricPowerWatts: 250,
          spotter: true,
        },
      ],
    })
  })

  it.each([
    [{ startDate: 'not-a-date' }, 'startDate must be a valid'],
    [{ endDate: 'not-a-date' }, 'endDate must be a valid'],
    [{ limit: 0 }, 'limit must be a positive integer'],
    [{ limit: 1.5 }, 'limit must be a positive integer'],
    [
      { startDate: '2026-01-02', endDate: '2026-01-01' },
      'startDate must be before or equal to endDate',
    ],
  ])('rejects invalid options %#', (options, expectedMessage) => {
    expect(() => buildHealthExport(source, options)).toThrow(expectedMessage)
  })
})
