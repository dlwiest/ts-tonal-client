#!/usr/bin/env tsx

import 'dotenv/config'
import { mkdir, writeFile } from 'node:fs/promises'
import TonalClient, {
  TonalFormattedWorkoutSummary,
  TonalMovement,
  TonalWorkoutActivity,
  TonalWorkoutSetActivity,
} from '../src/index'

const EXCLUDED_KEYS = new Set([
  'userId',
  'deviceId',
  'appVersion',
  'subscriptionId',
  'partnerActivityId',
  'mcbServiceVersion',
  'programEnrollmentId',
  'workoutSignupId',
])

function sanitize(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sanitize)
  }
  if (value === null || typeof value !== 'object') {
    return value
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !EXCLUDED_KEYS.has(key))
      .filter(([key]) => !/(password|accessToken|refreshToken|authorization)/i.test(key))
      .map(([key, nestedValue]) => [key, sanitize(nestedValue)])
  )
}

function sanitizedRecord(value: object): Record<string, unknown> {
  return sanitize(value) as Record<string, unknown>
}

function derivedSetMetrics(set: TonalWorkoutSetActivity) {
  const totalVolumePounds = set.totalOnMachineVolume ?? set.volume
  const effectiveAverageResistancePounds =
    set.repCount !== undefined &&
    set.repCount > 0 &&
    totalVolumePounds !== undefined &&
    totalVolumePounds > 0
      ? totalVolumePounds / set.repCount
      : undefined
  const effectiveEstimatedOneRepMaxPounds =
    set.oneRepMax !== undefined &&
    set.avgWeight !== undefined &&
    set.avgWeight > 0 &&
    effectiveAverageResistancePounds !== undefined
      ? set.oneRepMax * (effectiveAverageResistancePounds / set.avgWeight)
      : undefined

  return {
    totalVolumePounds,
    averageResistancePerCablePounds: set.avgWeight,
    effectiveAverageResistancePounds,
    estimatedOneRepMaxPerCablePounds: set.oneRepMax,
    effectiveEstimatedOneRepMaxPounds,
    rangeOfMotionInches: set.romLengthIn,
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
      : sanitize(formattedSummary),
    sets: workoutSetActivity.map(set => ({
      ...sanitizedRecord(set),
      movement: movementReference(movements.get(set.movementId)),
      derivedMetrics: derivedSetMetrics(set),
    })),
  }
}

async function optionalMetric<T>(
  label: string,
  getValue: () => Promise<T>,
  errors: string[]
): Promise<T | undefined> {
  try {
    return await getValue()
  } catch (error) {
    errors.push(`${label}: ${error instanceof Error ? error.message : 'Unavailable'}`)
    return undefined
  }
}

async function main() {
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
  const formattedSummaries = await client.getFormattedWorkoutSummaries(activityIds)
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
  const retrievalErrors: string[] = []

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
  const exportData = sanitize({
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
        'Tonal avgWeight is per cable; derived effective resistance accounts for bilateral cable use',
      rangeOfMotion: 'inches when exported as rangeOfMotionInches or romLengthIn',
      strengthScores: 'Tonal score units',
      readiness: 'percentage by muscle group',
    },
    aggregateWorkoutTotals: {
      totalDurationSeconds: sortedActivities.reduce((sum, item) => sum + item.totalDuration, 0),
      activeDurationSeconds: sortedActivities.reduce((sum, item) => sum + item.activeDuration, 0),
      restDurationSeconds: sortedActivities.reduce((sum, item) => sum + item.restDuration, 0),
      totalSets,
      totalReps: sortedActivities.reduce((sum, item) => sum + item.totalReps, 0),
      totalVolumePounds: sortedActivities.reduce((sum, item) => sum + item.totalVolume, 0),
      totalConcentricWork: sortedActivities.reduce(
        (sum, item) => sum + item.totalConcentricWork,
        0
      ),
    },
    workouts: mappedWorkouts,
    longitudinalMetrics: {
      dailyMetrics,
      strengthScoreHistory,
      targetScores,
      metricScores,
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
  await writeFile(outputPath, `${JSON.stringify(exportData)}\n`, {
    mode: 0o600,
  })

  const uploadDirectory = 'tonal-chatgpt-export'
  await mkdir(uploadDirectory, { recursive: true, mode: 0o700 })
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

  const workoutFiles = [...workoutsByYear.keys()]
    .sort()
    .map(year => `workouts-${year}.json`)
  await writeFile(
    `${uploadDirectory}/overview-and-metrics.json`,
    `${JSON.stringify({
      ...overview,
      uploadInstructions:
        'Upload this file together with every file listed in workoutFiles. Treat activity.id as the workout key and movementId as the movement-catalog key.',
      workoutFiles,
    })}\n`,
    { mode: 0o600 }
  )

  await Promise.all(
    [...workoutsByYear.entries()].map(([year, workouts]) =>
      writeFile(
        `${uploadDirectory}/workouts-${year}.json`,
        `${JSON.stringify({
          schemaVersion: 2,
          exportType: 'tonal-workout-history-segment',
          year,
          unitsAndInterpretation: exportRecord.unitsAndInterpretation,
          workouts,
        })}\n`,
        { mode: 0o600 }
      )
    )
  )

  console.log(`Exported ${sortedActivities.length} workouts and ${totalSets} sets to ${outputPath}`)
  console.log(`Created ChatGPT upload bundle with ${workoutFiles.length + 1} files in ${uploadDirectory}`)
  console.log(`Additional metric retrieval errors: ${retrievalErrors.length}`)
  console.log('This file contains private health information; store and share it carefully.')
}

main().catch(error => {
  console.error('Failed to export complete Tonal health history:', error)
  process.exitCode = 1
})
