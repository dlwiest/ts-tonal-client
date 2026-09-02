import {
  TonalActivitySummary,
  TonalClientError,
  TonalHealthExport,
  TonalHealthExportActivity,
  TonalHealthExportOptions,
  TonalHealthExportSet,
  TonalHealthExportSource,
  TonalMovement,
  TonalWorkoutActivity,
  TonalWorkoutSetActivity,
} from '../types'

interface DateBoundary {
  timestamp: number
  localDate?: string
}

function parseDate(
  value: string | Date | undefined,
  fieldName: string,
  endOfDay: boolean = false
): DateBoundary | undefined {
  if (value === undefined) {
    return undefined
  }

  const timestamp = value instanceof Date ? value.getTime() : Date.parse(value)
  if (Number.isNaN(timestamp)) {
    throw new TonalClientError(`${fieldName} must be a valid ISO-8601 date or timestamp`)
  }

  const isDateOnly = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
  return {
    timestamp: endOfDay && isDateOnly ? timestamp + 24 * 60 * 60 * 1000 - 1 : timestamp,
    localDate: isDateOnly ? value : undefined,
  }
}

function getActivityLocalDate(activity: TonalActivitySummary): string | undefined {
  const localTimestampDate = /^(\d{4}-\d{2}-\d{2})T/.exec(
    activity.localTimestamp
  )?.[1]

  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: activity.timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(new Date(activity.timestamp))
    const partValues = Object.fromEntries(parts.map(part => [part.type, part.value]))
    if (partValues.year && partValues.month && partValues.day) {
      return `${partValues.year}-${partValues.month}-${partValues.day}`
    }
  } catch {
    // Fall back to Tonal's local timestamp when a historical time zone is unavailable.
  }

  return localTimestampDate
}

function mapSetActivity(
  set: TonalWorkoutSetActivity,
  movement?: TonalMovement
): TonalHealthExportSet {
  const totalVolume = set.totalOnMachineVolume ?? set.volume
  const estimatedAverageResistance =
    set.repCount !== undefined &&
    set.repCount > 0 &&
    totalVolume !== undefined &&
    totalVolume > 0
      ? totalVolume / set.repCount
      : undefined
  const estimatedOneRepMax =
    set.oneRepMax !== undefined &&
    set.avgWeight !== undefined &&
    set.avgWeight > 0 &&
    estimatedAverageResistance !== undefined
      ? set.oneRepMax * (estimatedAverageResistance / set.avgWeight)
      : undefined
  const derivedEstimates =
    estimatedAverageResistance !== undefined || estimatedOneRepMax !== undefined
      ? {
          averageResistancePounds: estimatedAverageResistance,
          oneRepMaxPounds: estimatedOneRepMax,
        }
      : undefined

  return {
    setActivityId: set.id,
    movementId: set.movementId,
    movementName: movement?.name,
    muscleGroups: movement?.muscleGroups,
    accessory: movement?.onMachineInfo?.accessory,
    bilateral: movement?.isBilateral,
    twoSided: movement?.isTwoSided,
    beginTime: set.beginTime,
    endTime: set.endTime,
    durationSeconds: set.duration,
    prescribedReps: set.prescribedReps ?? undefined,
    prescribedDurationSeconds: set.prescribedDuration ?? undefined,
    completedReps: set.repCount,
    repsInReserve: set.repsInReserve ?? undefined,
    repetition: set.repetition ?? undefined,
    repetitionTotal: set.repetitionTotal ?? undefined,
    sideNumber: set.sideNumber ?? undefined,
    movementSide: set.movementSide,
    averageResistancePerCablePounds: set.avgWeight,
    baseResistancePerCablePounds: set.baseWeight ?? undefined,
    minimumResistancePerCablePounds: set.minWeight,
    maximumResistancePerCablePounds: set.maxWeight,
    totalVolumePounds: totalVolume,
    estimatedOneRepMaxPerCablePounds: set.oneRepMax,
    derivedEstimates,
    rangeOfMotionInches: set.romLengthIn,
    maxConcentricPowerWatts: set.maxConPower,
    warmUp: set.warmUp,
    spotter: set.spotter ?? undefined,
    eccentric: set.eccentric,
    chains: set.chains,
    flex: set.flex,
  }
}

function mapActivity(
  activity: TonalActivitySummary,
  detail?: TonalWorkoutActivity,
  movements: Map<string, TonalMovement> = new Map()
): TonalHealthExportActivity {
  const exported: TonalHealthExportActivity = {
    activityId: activity.id,
    workoutId: activity.workoutId,
    source: activity.activityType === 'Internal' ? 'tonal' : 'external',
    name: activity.name,
    timestamp: activity.timestamp,
    localTimestamp: activity.localTimestamp,
    timeZone: activity.timeZone,
    targetArea: activity.targetArea,
    workoutType: activity.workoutType,
    level: activity.level,
    durationSeconds: activity.duration,
    timeUnderTensionSeconds: activity.timeUnderTension,
    totalReps: activity.totalReps,
    totalVolumePounds: activity.totalVolume,
    totalWorkKilojoules: activity.totalWork,
    completed: activity.completed,
    guided: activity.isGuidedWorkout,
    inProgram: activity.isInProgram,
    baselineWorkout: activity.isBaselineWorkout,
  }

  if (detail !== undefined) {
    exported.totalSets = detail.totalSets
    exported.activeDurationSeconds = detail.activeDuration ?? undefined
    exported.restDurationSeconds = detail.restDuration ?? undefined
    exported.percentCompleted = detail.percentCompleted ?? undefined
    exported.sets = (detail.workoutSetActivity ?? []).map(set =>
      mapSetActivity(set, movements.get(set.movementId))
    )
  }

  return exported
}

/**
 * Build a compact, privacy-conscious health export from Tonal API data.
 *
 * The export intentionally excludes profile details, account identifiers,
 * device identifiers, application versions, and authentication data.
 */
export function buildHealthExport(
  source: TonalHealthExportSource,
  options: TonalHealthExportOptions = {},
  exportedAt: Date = new Date()
): TonalHealthExport {
  const startTimestamp = parseDate(options.startDate, 'startDate')
  const endTimestamp = parseDate(options.endDate, 'endDate', true)

  if (
    startTimestamp !== undefined &&
    endTimestamp !== undefined &&
    startTimestamp.timestamp > endTimestamp.timestamp
  ) {
    throw new TonalClientError('startDate must be before or equal to endDate')
  }
  if (
    options.limit !== undefined &&
    (!Number.isInteger(options.limit) || options.limit <= 0)
  ) {
    throw new TonalClientError('limit must be a positive integer')
  }

  const details = new Map(
    (source.activityDetails ?? []).map(detail => [detail.id, detail])
  )
  const movements = new Map(
    (source.movements ?? []).map(movement => [movement.id, movement])
  )

  const activities = source.activities
    .filter(activity => {
      const timestamp = Date.parse(activity.timestamp)
      const localDate =
        startTimestamp?.localDate !== undefined || endTimestamp?.localDate !== undefined
          ? getActivityLocalDate(activity)
          : undefined
      const afterStart =
        startTimestamp === undefined ||
        (startTimestamp.localDate !== undefined
          ? localDate !== undefined && localDate >= startTimestamp.localDate
          : timestamp >= startTimestamp.timestamp)
      const beforeEnd =
        endTimestamp === undefined ||
        (endTimestamp.localDate !== undefined
          ? localDate !== undefined && localDate <= endTimestamp.localDate
          : timestamp <= endTimestamp.timestamp)

      return (
        (options.includeExternalActivities === true ||
          activity.activityType === 'Internal') &&
        !Number.isNaN(timestamp) &&
        afterStart &&
        beforeEnd
      )
    })
    .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))
    .slice(0, options.limit)
    .map(activity => mapActivity(activity, details.get(activity.id), movements))

  const summary = activities.reduce(
    (totals, activity) => ({
      workoutCount: totals.workoutCount + 1,
      completedWorkoutCount: totals.completedWorkoutCount + (activity.completed ? 1 : 0),
      totalDurationSeconds: totals.totalDurationSeconds + activity.durationSeconds,
      totalTimeUnderTensionSeconds:
        totals.totalTimeUnderTensionSeconds + activity.timeUnderTensionSeconds,
      totalReps: totals.totalReps + activity.totalReps,
      totalVolumePounds: totals.totalVolumePounds + activity.totalVolumePounds,
      totalWorkKilojoules: totals.totalWorkKilojoules + activity.totalWorkKilojoules,
    }),
    {
      workoutCount: 0,
      completedWorkoutCount: 0,
      totalDurationSeconds: 0,
      totalTimeUnderTensionSeconds: 0,
      totalReps: 0,
      totalVolumePounds: 0,
      totalWorkKilojoules: 0,
    }
  )

  const exportData: TonalHealthExport = {
    schemaVersion: 1,
    exportedAt: exportedAt.toISOString(),
    period: {
      start: activities.length > 0 ? activities[activities.length - 1].timestamp : null,
      end: activities.length > 0 ? activities[0].timestamp : null,
    },
    summary,
    activities,
  }

  if (source.muscleReadiness !== undefined) {
    exportData.muscleReadiness = source.muscleReadiness
  }
  if (source.lifetimeStatistics !== undefined) {
    exportData.lifetimeStatistics = source.lifetimeStatistics
  }

  return exportData
}
