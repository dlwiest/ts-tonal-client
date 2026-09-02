#!/usr/bin/env tsx

import dotenv from 'dotenv'
import { basename, join } from 'node:path'
import { replacePrivateDirectory, writePrivateFile } from './private-export-files'
import TonalClient from '../src/index'
import type {
  TonalFormattedWorkoutSummary,
  TonalMovement,
  TonalWorkoutActivity,
  TonalWorkoutSetActivity,
} from '../src/index'

const ALLOWED_EXPORT_KEYS: Readonly<Record<string, true>> = {
  schemaVersion: true,
  exportType: true,
  exportedAt: true,
  privacyNotice: true,
  coverage: true,
  start: true,
  end: true,
  workoutCount: true,
  detailedSetCount: true,
  movementCount: true,
  requestedDailyMetricDays: true,
  unitsAndInterpretation: true,
  duration: true,
  resistance: true,
  volume: true,
  averageResistance: true,
  rangeOfMotion: true,
  strengthScores: true,
  readiness: true,
  aggregateWorkoutTotals: true,
  totalDurationSeconds: true,
  activeDurationSeconds: true,
  restDurationSeconds: true,
  totalSets: true,
  totalReps: true,
  totalVolumePounds: true,
  totalConcentricWork: true,
  workouts: true,
  activity: true,
  formattedSummary: true,
  sets: true,
  movement: true,
  derivedEstimates: true,
  id: true,
  workoutId: true,
  workoutType: true,
  timezone: true,
  beginTime: true,
  endTime: true,
  totalDuration: true,
  activeDuration: true,
  restDuration: true,
  totalMovements: true,
  totalVolume: true,
  percentCompleted: true,
  completed: true,
  recoveryWeight: true,
  hasAppleWatch: true,
  isFirstWorkoutOfDay: true,
  isSmartViewActivated: true,
  programId: true,
  deletedAt: true,
  name: true,
  isInProgram: true,
  isGuidedWorkout: true,
  isBaselineWorkout: true,
  timestamp: true,
  UTCTimestamp: true,
  localTimestamp: true,
  timeZone: true,
  assetID: true,
  targetArea: true,
  movementId: true,
  workoutActivityID: true,
  workoutActivityId: true,
  prescribedReps: true,
  prescribedDuration: true,
  repetition: true,
  repetitionTotal: true,
  blockNumber: true,
  blockStart: true,
  burnout: true,
  calibration: true,
  chains: true,
  dropSet: true,
  eccentric: true,
  finalSet: true,
  flex: true,
  practice: true,
  progressive: true,
  skipDemo: true,
  skipSetup: true,
  spotter: true,
  warmUp: true,
  beginTimeMCB: true,
  endTimeMCB: true,
  durationBasedRepGoal: true,
  sideNumber: true,
  movementSide: true,
  setGroup: true,
  setId: true,
  round: true,
  sortOrder: true,
  weightPercentage: true,
  avgWeight: true,
  baseWeight: true,
  minWeight: true,
  maxWeight: true,
  suggestedWeight: true,
  suggestedWeightChange: true,
  eccentricWeight: true,
  eccentricWeightFrac: true,
  chainsWeight: true,
  chainsWeightFrac: true,
  romWeight: true,
  romWeightFrac: true,
  romWeightMode: true,
  offMachineModifiedWeight: true,
  maxSpottedWeight: true,
  weightControlMode: true,
  totalOnMachineVolume: true,
  repCount: true,
  cvRepCount: true,
  repsInReserve: true,
  oneRepMax: true,
  avgRom: true,
  rom: true,
  romLengthIn: true,
  meanMaxPos: true,
  avgVelocity: true,
  isoModeSpeed: true,
  concentricWork: true,
  totalConDuration: true,
  maxConPower: true,
  velAtMaxConPower: true,
  weightAtMaxConPower: true,
  baseOfSupport: true,
  pushPull: true,
  familyDisplay: true,
  inFreeLift: true,
  countReps: true,
  isTwoSided: true,
  isBilateral: true,
  isAlternating: true,
  offMachineAccessory: true,
  descriptionHow: true,
  descriptionWhy: true,
  imageAssetId: true,
  skillLevel: true,
  featureGroupIds: true,
  isGeneric: true,
  onMachineInfo: true,
  resistanceType: true,
  spotterDisabled: true,
  eccentricDisabled: true,
  chainsDisabled: true,
  burnoutDisabled: true,
  inconsistencyScore: true,
  strugglingScore: true,
  durationInconsistencyScore: true,
  durationStrugglingScore: true,
  maxVelInconsistencyScore: true,
  maxVelStrugglingScore: true,
  romInconsistencyScore: true,
  romStrugglingScore: true,
  inchesUpdated: true,
  powerUpdated: true,
  spotterMode: true,
  shortName: true,
  muscleGroups: true,
  bodyRegion: true,
  family: true,
  accessory: true,
  bilateral: true,
  twoSided: true,
  alternating: true,
  onMachine: true,
  averageResistancePerCablePounds: true,
  averageResistancePounds: true,
  estimatedOneRepMaxPerCablePounds: true,
  oneRepMaxPounds: true,
  rangeOfMotionInches: true,
  longitudinalMetrics: true,
  dailyMetrics: true,
  strengthScoreHistory: true,
  targetScores: true,
  metricScores: true,
  date: true,
  totalWorkouts: true,
  totalExternalActivities: true,
  totalWork: true,
  totalTimeUnderTension: true,
  upper: true,
  lower: true,
  core: true,
  overall: true,
  activityTime: true,
  weekNumber: true,
  metricId: true,
  target: true,
  lowRange: true,
  highRange: true,
  score: true,
  current: true,
  currentMetrics: true,
  muscleReadiness: true,
  currentStrengthScores: true,
  currentStreak: true,
  homeCalendar: true,
  Chest: true,
  Shoulders: true,
  Back: true,
  Triceps: true,
  Biceps: true,
  Abs: true,
  Obliques: true,
  Quads: true,
  Glutes: true,
  Hamstrings: true,
  Calves: true,
  createdAt: true,
  updatedAt: true,
  strengthBodyRegion: true,
  bodyRegionDisplay: true,
  familyActivity: true,
  strengthFamily: true,
  currentStreakStartDate: true,
  lastUpdatedWeek: true,
  maxStreak: true,
  maxStreakStartDate: true,
  dailySchedules: true,
  recommendationType: true,
  tiles: true,
  type: true,
  assetId: true,
  title: true,
  level: true,
  trainingTypeIds: true,
  coachId: true,
  accessories: true,
  compatibilityStatus: true,
  status: true,
  lockedReason: true,
  workoutSummaryData: true,
  work: true,
  muscleUtilization: true,
  muscleGroup: true,
  value: true,
  lifetimeAndAchievements: true,
  lifetimeStatistics: true,
  achievementStats: true,
  achievements: true,
  maxVolumeInWorkout: true,
  maxVolumeInAWeek: true,
  avgVolumePerWorkout: true,
  avgVolumePerWeek: true,
  maxWorkoutDuration: true,
  avgWorkoutDuration: true,
  maxWorkoutsPerWeek: true,
  total: true,
  avgWorkoutsPerWeek: true,
  totalFreeliftWorkouts: true,
  totalCustomWorkouts: true,
  movements: true,
  movementIds: true,
  programs: true,
  totalProgramVolume: true,
  totalProgramWorkouts: true,
  totalAchievements: true,
  nextMilestones: true,
  description: true,
  shortDescription: true,
  achievementCategoryId: true,
  iconAssetId: true,
  active: true,
  needsTemplate: true,
  achievementId: true,
  achievement: true,
  referenceData: true,
  goals: true,
  goalMetrics: true,
  trainingTypes: true,
  trainingEffectGoals: true,
  relations: true,
  filterItemId: true,
  goalId: true,
  infoVidId: true,
  secondary: true,
  tertiary: true,
  metric: true,
  category: true,
  retrievalErrors: true,
  uploadInstructions: true,
  workoutFiles: true,
  year: true,
}

export function sanitizeCompleteExport(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sanitizeCompleteExport)
  }
  if (value === null || typeof value !== 'object') {
    return value
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => ALLOWED_EXPORT_KEYS[key] === true)
      .map(([key, nestedValue]) => [key, sanitizeCompleteExport(nestedValue)])
  )
}

function sanitizedRecord(value: object): Record<string, unknown> {
  return sanitizeCompleteExport(value) as Record<string, unknown>
}

function derivedSetEstimates(set: TonalWorkoutSetActivity) {
  const totalVolumePounds = set.totalOnMachineVolume ?? set.volume
  const averageResistancePounds =
    set.repCount !== undefined &&
    set.repCount > 0 &&
    totalVolumePounds !== undefined &&
    totalVolumePounds > 0
      ? totalVolumePounds / set.repCount
      : undefined
  const oneRepMaxPounds =
    set.oneRepMax !== undefined &&
    set.avgWeight !== undefined &&
    set.avgWeight > 0 &&
    averageResistancePounds !== undefined
      ? set.oneRepMax * (averageResistancePounds / set.avgWeight)
      : undefined

  return {
    averageResistancePounds,
    oneRepMaxPounds,
  }
}

function movementReference(movement?: TonalMovement) {
  if (movement === undefined) {
    return undefined
  }

  return {
    name: movement.name,
    shortName: movement.shortName,
    muscleGroups: movement.muscleGroups,
    bodyRegion: movement.bodyRegionDisplay,
    family: movement.familyDisplay,
    accessory: movement.onMachineInfo?.accessory,
    bilateral: movement.isBilateral,
    twoSided: movement.isTwoSided,
    alternating: movement.isAlternating,
    onMachine: movement.onMachine,
  }
}

function mapWorkout(
  activity: TonalWorkoutActivity,
  formattedSummary: TonalFormattedWorkoutSummary | undefined,
  movements: Map<string, TonalMovement>
) {
  const { workoutSetActivity = [], ...activityMetrics } = activity

  return {
    activity: sanitizedRecord(activityMetrics),
    formattedSummary: formattedSummary === undefined
      ? undefined
      : sanitizeCompleteExport(formattedSummary),
    sets: workoutSetActivity.map(set => ({
      ...sanitizedRecord(set),
      movement: movementReference(movements.get(set.movementId)),
      derivedEstimates: derivedSetEstimates(set),
    })),
  }
}

export type RetrievalMetric =
  | 'formattedWorkoutSummary'
  | 'dailyMetrics'
  | 'lifetimeStatistics'
  | 'muscleReadiness'
  | 'currentStreak'
  | 'currentStrengthScores'
  | 'strengthScoreHistory'
  | 'targetScores'
  | 'metricScores'
  | 'achievementStats'
  | 'achievements'
  | 'homeCalendar'
  | 'goals'
  | 'goalMetrics'
  | 'trainingTypes'
  | 'trainingEffectGoals'

export interface RetrievalError {
  metric: RetrievalMetric
  category: 'provider-error'
  status: 'unavailable'
}

export async function optionalMetric<T>(
  metric: RetrievalMetric,
  getValue: () => Promise<T>,
  errors: RetrievalError[]
): Promise<T | undefined> {
  try {
    return await getValue()
  } catch {
    errors.push({
      metric,
      category: 'provider-error',
      status: 'unavailable',
    })
    return undefined
  }
}

export async function writeChatGptBundle(
  uploadDirectory: string,
  overview: Record<string, unknown>,
  workoutsByYear: ReadonlyMap<string, unknown[]>,
  unitsAndInterpretation: unknown
): Promise<string[]> {
  if (basename(uploadDirectory) !== 'tonal-chatgpt-export') {
    throw new Error('Refusing to replace a directory not named tonal-chatgpt-export')
  }
  for (const year of workoutsByYear.keys()) {
    if (!/^(?:\d{4}|unknown-year)$/.test(year)) {
      throw new Error(`Refusing unsafe workout segment year: ${year}`)
    }
  }

  const workoutFiles = [...workoutsByYear.keys()]
    .sort()
    .map(year => `workouts-${year}.json`)

  await replacePrivateDirectory(
    uploadDirectory,
    async temporaryDirectory => {
      await Promise.all([
        writePrivateFile(
          join(temporaryDirectory, 'overview-and-metrics.json'),
          `${JSON.stringify({
            ...overview,
            uploadInstructions:
              'Upload this file together with every file listed in workoutFiles. Treat activity.id as the workout key and movementId as the movement-catalog key.',
            workoutFiles,
          })}\n`
        ),
        ...[...workoutsByYear.entries()].map(([year, workouts]) =>
          writePrivateFile(
            join(temporaryDirectory, `workouts-${year}.json`),
            `${JSON.stringify({
              schemaVersion: 2,
              exportType: 'tonal-workout-history-segment',
              year,
              unitsAndInterpretation,
              workouts,
            })}\n`
          )
        ),
      ])
    },
    {
      isManagedEntry: name =>
        name === 'overview-and-metrics.json' ||
        /^workouts-(?:\d{4}|unknown-year)\.json$/.test(name),
    }
  )

  return workoutFiles
}

async function main() {
  dotenv.config()
  const username = process.env.TONAL_USERNAME
  const password = process.env.TONAL_PASSWORD

  if (!username || !password) {
    throw new Error('TONAL_USERNAME and TONAL_PASSWORD must be configured')
  }

  const client = await TonalClient.create({ username, password })
  const workoutActivities = await client.getAllWorkoutActivities()
  const sortedActivities = [...workoutActivities].sort(
    (left, right) => Date.parse(left.beginTime) - Date.parse(right.beginTime)
  )
  const activityIds = sortedActivities.map(activity => activity.id)
  const retrievalErrors: RetrievalError[] = []
  const formattedSummaries: TonalFormattedWorkoutSummary[] = []

  for (let index = 0; index < activityIds.length; index += 5) {
    const batch = await Promise.all(
      activityIds.slice(index, index + 5).map(activityId =>
        optionalMetric(
          'formattedWorkoutSummary',
          () => client.getFormattedWorkoutSummary(activityId),
          retrievalErrors
        )
      )
    )
    for (const summary of batch) {
      if (summary !== undefined) {
        formattedSummaries.push(summary)
      }
    }
  }

  const formattedById = new Map(
    formattedSummaries.map(summary => [summary.id, summary])
  )
  const movements = await client.getMovements(false)
  const movementById = new Map(movements.map(movement => [movement.id, movement]))
  const usedMovementIds = new Set(
    sortedActivities.flatMap(activity =>
      (activity.workoutSetActivity ?? []).map(set => set.movementId)
    )
  )
  const usedMovements = movements.filter(movement => usedMovementIds.has(movement.id))

  const earliestTimestamp = sortedActivities.length > 0
    ? Date.parse(sortedActivities[0].beginTime)
    : Date.now()
  const dailyMetricDays = Math.max(
    1,
    Math.ceil((Date.now() - earliestTimestamp) / (24 * 60 * 60 * 1000)) + 1
  )

  const [
    dailyMetrics,
    lifetimeStatistics,
    muscleReadiness,
    currentStreak,
    currentStrengthScores,
    strengthScoreHistory,
    targetScores,
    metricScores,
    achievementStats,
    achievements,
    homeCalendar,
    goals,
    goalMetrics,
    trainingTypes,
    trainingEffectGoals,
  ] = await Promise.all([
    optionalMetric('dailyMetrics', () => client.getDailyMetrics(dailyMetricDays), retrievalErrors),
    optionalMetric('lifetimeStatistics', () => client.getUserStatistics(), retrievalErrors),
    optionalMetric('muscleReadiness', () => client.getMuscleReadiness(), retrievalErrors),
    optionalMetric('currentStreak', () => client.getCurrentStreak(), retrievalErrors),
    optionalMetric('currentStrengthScores', () => client.getCurrentStrengthScores(), retrievalErrors),
    optionalMetric('strengthScoreHistory', () => client.getStrengthScoreHistory(), retrievalErrors),
    optionalMetric('targetScores', () => client.getTargetScores(), retrievalErrors),
    optionalMetric('metricScores', () => client.getMetricScores(), retrievalErrors),
    optionalMetric('achievementStats', () => client.getAchievementStats(), retrievalErrors),
    optionalMetric('achievements', () => client.getAchievements(), retrievalErrors),
    optionalMetric('homeCalendar', () => client.getHomeCalendar(), retrievalErrors),
    optionalMetric('goals', () => client.getGoals(), retrievalErrors),
    optionalMetric('goalMetrics', () => client.getGoalMetrics(), retrievalErrors),
    optionalMetric('trainingTypes', () => client.getTrainingTypes(), retrievalErrors),
    optionalMetric('trainingEffectGoals', () => client.getTrainingEffectGoals(), retrievalErrors),
  ])

  const totalSets = sortedActivities.reduce(
    (total, activity) => total + (activity.workoutSetActivity?.length ?? 0),
    0
  )
  const mappedWorkouts = sortedActivities.map(activity =>
    mapWorkout(activity, formattedById.get(activity.id), movementById)
  )
  const exportData = sanitizeCompleteExport({
    schemaVersion: 2,
    exportType: 'tonal-complete-health-history',
    exportedAt: new Date().toISOString(),
    privacyNotice:
      'Contains private workout and health information. Account, device, application, subscription, and authentication identifiers are excluded.',
    coverage: {
      start: sortedActivities[0]?.beginTime ?? null,
      end: sortedActivities[sortedActivities.length - 1]?.endTime ?? null,
      workoutCount: sortedActivities.length,
      detailedSetCount: totalSets,
      movementCount: usedMovements.length,
      requestedDailyMetricDays: dailyMetricDays,
    },
    unitsAndInterpretation: {
      duration: 'seconds unless a field name states otherwise',
      resistance: 'pounds',
      volume: 'pounds; Tonal totalOnMachineVolume reconciles to workout totalVolume',
      averageResistance:
        'Tonal avgWeight and oneRepMax are reported per-cable values; derivedEstimates contains volume-to-rep arithmetic estimates for total active-cable resistance',
      rangeOfMotion: 'inches when exported as rangeOfMotionInches or romLengthIn',
      strengthScores: 'Tonal score units',
      readiness: 'percentage by muscle group',
    },
    aggregateWorkoutTotals: {
      totalDurationSeconds: sortedActivities.reduce((sum, item) => sum + item.totalDuration, 0),
      activeDurationSeconds: sortedActivities.reduce(
        (sum, item) => sum + (item.activeDuration ?? 0),
        0
      ),
      restDurationSeconds: sortedActivities.reduce(
        (sum, item) => sum + (item.restDuration ?? 0),
        0
      ),
      totalSets,
      totalReps: sortedActivities.reduce((sum, item) => sum + item.totalReps, 0),
      totalVolumePounds: sortedActivities.reduce((sum, item) => sum + item.totalVolume, 0),
      totalConcentricWork: sortedActivities.reduce(
        (sum, item) => sum + (item.totalConcentricWork ?? 0),
        0
      ),
    },
    workouts: mappedWorkouts,
    longitudinalMetrics: {
      dailyMetrics,
      strengthScoreHistory,
      targetScores: targetScores === undefined
        ? undefined
        : Object.values(targetScores).flat(),
      metricScores: metricScores === undefined
        ? undefined
        : Object.values(metricScores).flat(),
    },
    currentMetrics: {
      muscleReadiness,
      currentStrengthScores,
      currentStreak,
      homeCalendar,
    },
    lifetimeAndAchievements: {
      lifetimeStatistics,
      achievementStats,
      achievements,
    },
    referenceData: {
      movements: usedMovements,
      goals,
      goalMetrics,
      trainingTypes,
      trainingEffectGoals,
    },
    retrievalErrors,
  })

  const outputPath = 'tonal-complete-health-export.json'
  // Keep the complete upload compact. This preserves every field while reducing
  // text-token usage for analysis tools such as ChatGPT.
  await writePrivateFile(outputPath, `${JSON.stringify(exportData)}\n`)

  const uploadDirectory = 'tonal-chatgpt-export'
  const exportRecord = exportData as Record<string, unknown>
  const { workouts: _workouts, ...overview } = exportRecord
  const workoutsByYear = new Map<string, unknown[]>()

  sortedActivities.forEach((activity, index) => {
    const year = Number.isNaN(Date.parse(activity.beginTime))
      ? 'unknown-year'
      : new Date(activity.beginTime).getUTCFullYear().toString()
    const yearWorkouts = workoutsByYear.get(year) ?? []
    yearWorkouts.push((exportRecord.workouts as unknown[])[index])
    workoutsByYear.set(year, yearWorkouts)
  })

  const workoutFiles = await writeChatGptBundle(
    uploadDirectory,
    overview,
    workoutsByYear,
    exportRecord.unitsAndInterpretation
  )

  console.log(`Exported ${sortedActivities.length} workouts and ${totalSets} sets to ${outputPath}`)
  console.log(`Created ChatGPT upload bundle with ${workoutFiles.length + 1} files in ${uploadDirectory}`)
  console.log(`Additional metric retrieval errors: ${retrievalErrors.length}`)
  console.log('This file contains private health information; store and share it carefully.')
}

if (process.argv[1] && basename(process.argv[1]) === 'export-complete-health-data.ts') {
  main().catch(error => {
    console.error('Failed to export complete Tonal health history:', error)
    process.exitCode = 1
  })
}
