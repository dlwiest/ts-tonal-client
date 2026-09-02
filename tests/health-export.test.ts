import {
  buildHealthExport,
  TonalActivitySummary,
  TonalHealthExportSource,
  TonalMovement,
  TonalMuscleReadiness,
  TonalUserStatistics,
  TonalWorkoutActivity,
} from '../src'
import { sanitizeCompleteExport } from '../examples/export-complete-health-data'

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
  subscriptionId: 'private-subscription-id',
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
  completed: true,
  recoveryWeight: false,
  hasAppleWatch: false,
  isFirstWorkoutOfDay: false,
  isSmartViewActivated: false,
  mcbServiceVersion: '1.0.0',
  workoutSetActivity: [
    {
      id: 'set-1',
      userId: 'private-user-id',
      workoutId: 'workout-newest',
      workoutActivityID: 'newest',
      movementId: 'movement-1',
      prescribedReps: 10,
      repetition: 1,
      repetitionTotal: 1,
      blockNumber: 1,
      blockStart: true,
      burnout: false,
      calibration: false,
      chains: false,
      dropSet: false,
      eccentric: false,
      finalSet: true,
      flex: false,
      practice: false,
      progressive: false,
      skipDemo: false,
      skipSetup: false,
      spotter: true,
      warmUp: false,
      beginTime: '2026-01-03T12:05:00.000Z',
      endTime: '2026-01-03T12:05:45.000Z',
      beginTimeMCB: 1000,
      endTimeMCB: 1045,
      duration: 45,
      durationBasedRepGoal: 0,
      sideNumber: 0,
      movementSide: 'Bilateral',
      setGroup: 1,
      setId: 'workout-set-1',
      round: 1,
      weightPercentage: 100,
      avgWeight: 100,
      baseWeight: 95,
      minWeight: 90,
      maxWeight: 110,
      suggestedWeight: 100,
      suggestedWeightChange: 0,
      eccentricWeight: 0,
      eccentricWeightFrac: 0,
      chainsWeight: 0,
      chainsWeightFrac: 0,
      romWeight: 0,
      romWeightFrac: 0,
      romWeightMode: 0,
      offMachineModifiedWeight: 0,
      maxSpottedWeight: 0,
      volume: 1000,
      totalVolume: 2000,
      totalOnMachineVolume: 2000,
      userWeightPounds: 180,
      repCount: 10,
      cvRepCount: 10,
      repsInReserve: 2,
      oneRepMax: 133,
      avgRom: 24,
      rom: 240,
      romLengthIn: 24,
      meanMaxPos: 24,
      avgVelocity: 1,
      isoModeSpeed: 0,
      concentricWork: 60,
      totalConcentricWork: 60,
      totalConDuration: 20,
      maxConPower: 250,
      velAtMaxConPower: 1,
      weightAtMaxConPower: 100,
      inconsistencyScore: 0,
      strugglingScore: 0,
      durationInconsistencyScore: 0,
      durationStrugglingScore: 0,
      maxVelInconsistencyScore: 0,
      maxVelStrugglingScore: 0,
      romInconsistencyScore: 0,
      romStrugglingScore: 0,
      inchesUpdated: true,
      powerUpdated: true,
      spotterMode: 'Off',
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

  it('filters date-only ranges by the workout local calendar day', () => {
    const lateEvening = activity('late-evening', '2026-01-03T05:30:00.000Z', {
      localTimestamp: '2026-01-02T23:30:00.000-06:00',
      timeZone: 'America/Chicago',
    })

    const localDay = buildHealthExport(
      { activities: [lateEvening] },
      { startDate: '2026-01-02', endDate: '2026-01-02' }
    )
    const adjacentUtcDay = buildHealthExport(
      { activities: [lateEvening] },
      { startDate: '2026-01-03', endDate: '2026-01-03' }
    )

    expect(localDay.activities.map(item => item.activityId)).toEqual([
      'late-evening',
    ])
    expect(adjacentUtcDay.activities).toEqual([])
  })

  it('evaluates mixed local-day and timestamp bounds per activity', () => {
    const earlyLocalDay = activity('early-local-day', '2026-01-01T22:30:00.000Z', {
      localTimestamp: '2026-01-02T00:30:00.000+02:00',
      timeZone: 'Europe/Athens',
    })

    const result = buildHealthExport(
      { activities: [earlyLocalDay] },
      {
        startDate: '2026-01-02',
        endDate: '2026-01-01T23:00:00.000Z',
      }
    )

    expect(result.activities.map(item => item.activityId)).toEqual([
      'early-local-day',
    ])
  })

  it('does not expose user, device, or application identifiers', () => {
    const result = buildHealthExport(source)
    const serialized = JSON.stringify(result)

    expect(serialized).not.toContain('private-user-id')
    expect(serialized).not.toContain('private-device-id')
    expect(serialized).not.toContain('1.2.3')
  })

  it('allowlists complete-export associations without leaking profile data or weight', () => {
    const sanitized = sanitizeCompleteExport({
      workouts: [
        {
          activity: {
            id: 'activity-1',
            totalReps: 10,
            email: 'private@example.com',
            firstName: 'Private',
            lastName: 'Person',
            gender: 'PRIVATE',
            heightInches: 70,
            weightPounds: 180,
            auth0Id: 'auth0|private',
          },
          sets: [
            {
              workoutActivityID: 'activity-1',
              userWeightPounds: 180,
            },
          ],
        },
      ],
      currentMetrics: {
        currentStrengthScores: {
          workoutActivityId: 'activity-1',
          current: true,
          userId: 'private-user-id',
        },
      },
      referenceData: {
        goals: [{ id: 'goal-1' }],
        goalMetrics: [{ id: 'metric-1', goalId: 'goal-1' }],
      },
      userInfo: {
        id: 'private-user-id',
        email: 'private@example.com',
      },
    })

    expect(sanitized).toEqual({
      workouts: [
        {
          activity: {
            id: 'activity-1',
            totalReps: 10,
          },
          sets: [{ workoutActivityID: 'activity-1' }],
        },
      ],
      currentMetrics: {
        currentStrengthScores: {
          workoutActivityId: 'activity-1',
          current: true,
        },
      },
      referenceData: {
        goals: [{ id: 'goal-1' }],
        goalMetrics: [{ id: 'metric-1', goalId: 'goal-1' }],
      },
    })
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
          totalVolumePounds: 2000,
          estimatedOneRepMaxPerCablePounds: 133,
          derivedEstimates: {
            averageResistancePounds: 200,
            oneRepMaxPounds: 266,
          },
          rangeOfMotionInches: 24,
          durationSeconds: 45,
          repsInReserve: 2,
          maxConcentricPowerWatts: 250,
          spotter: true,
        },
      ],
    })

    expect(result.activities[0].sets?.[0]).not.toHaveProperty(
      'effectiveAverageResistancePounds'
    )
    expect(result.activities[0].sets?.[0]).not.toHaveProperty(
      'effectiveEstimatedOneRepMaxPounds'
    )
  })

  it.each([
    [{ startDate: 'not-a-date' }, 'startDate must be a valid'],
    [{ startDate: '2026-02-30' }, 'startDate must be a valid'],
    [{ endDate: '2025-02-29' }, 'endDate must be a valid'],
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
