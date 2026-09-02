import type {
  TonalFormattedWorkoutMovementSet,
  TonalFormattedWorkoutSet,
  TonalFormattedWorkoutSummary,
} from '../src'

type IsOptional<T, K extends keyof T> = {} extends Pick<T, K> ? true : false
type IsRequired<T, K extends keyof T> = IsOptional<T, K> extends true ? false : true
type IsEqual<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends <Value>() => Value extends Right ? 1 : 2
    ? (<Value>() => Value extends Right ? 1 : 2) extends <Value>() => Value extends Left ? 1 : 2
      ? true
      : false
    : false

type OptionalSummaryField =
  | 'assetID'
  | 'coachName'
  | 'goalIds'
  | 'lastWorkoutSummary'
  | 'primaryTrainingTypeName'
  | 'programDay'
  | 'programEnrollmentId'
  | 'programId'
  | 'programName'
  | 'programWeek'
  | 'programWorkoutId'
  | 'tileChips'
  | 'trainingTypeIds'
  | 'userAchievements'
  | 'workoutNumber'

type RequiredSummaryField =
  | 'movementSets'
  | 'programWeeks'
  | 'programWorkoutsPerWeek'
  | 'repGoalPercentage'
  | 'timeUnderTension'

const optionalSummaryFields: {
  [K in OptionalSummaryField]: IsOptional<TonalFormattedWorkoutSummary, K>
} = {
  assetID: true,
  coachName: true,
  goalIds: true,
  lastWorkoutSummary: true,
  primaryTrainingTypeName: true,
  programDay: true,
  programEnrollmentId: true,
  programId: true,
  programName: true,
  programWeek: true,
  programWorkoutId: true,
  tileChips: true,
  trainingTypeIds: true,
  userAchievements: true,
  workoutNumber: true,
}

const requiredSummaryFields: {
  [K in RequiredSummaryField]: IsRequired<TonalFormattedWorkoutSummary, K>
} = {
  movementSets: true,
  programWeeks: true,
  programWorkoutsPerWeek: true,
  repGoalPercentage: true,
  timeUnderTension: true,
}

const exactSummaryFieldTypes: {
  groupIds: IsEqual<TonalFormattedWorkoutSummary['groupIds'], string[]>
  repGoalPercentage: IsEqual<TonalFormattedWorkoutSummary['repGoalPercentage'], number>
} = {
  groupIds: true,
  repGoalPercentage: true,
}

type OptionalMovementField =
  | 'bilateralMovementMetrics'
  | 'isInactiveMovement'
  | 'movementMetricsDiff'
  | 'movementMetricsSide1'
  | 'movementMetricsSide2'

const optionalMovementFields: {
  [K in OptionalMovementField]: IsOptional<TonalFormattedWorkoutMovementSet, K>
} = {
  bilateralMovementMetrics: true,
  isInactiveMovement: true,
  movementMetricsDiff: true,
  movementMetricsSide1: true,
  movementMetricsSide2: true,
}

const unmeasuredSet: TonalFormattedWorkoutSet = {
  repCount: 10,
}

describe('formatted workout summary types', () => {
  it('keeps partially observed summary fields optional and universal fields required', () => {
    expect(optionalSummaryFields).toEqual(
      expect.objectContaining({
        coachName: true,
        programDay: true,
        programEnrollmentId: true,
        programId: true,
        programName: true,
        programWeek: true,
        programWorkoutId: true,
        workoutNumber: true,
      })
    )
    expect(requiredSummaryFields).toEqual({
      movementSets: true,
      programWeeks: true,
      programWorkoutsPerWeek: true,
      repGoalPercentage: true,
      timeUnderTension: true,
    })
  })

  it('keeps measured summary field types exact', () => {
    expect(exactSummaryFieldTypes).toEqual({
      groupIds: true,
      repGoalPercentage: true,
    })
  })

  it('keeps partially observed movement fields optional and set fields unclaimed', () => {
    expect(optionalMovementFields).toEqual({
      bilateralMovementMetrics: true,
      isInactiveMovement: true,
      movementMetricsDiff: true,
      movementMetricsSide1: true,
      movementMetricsSide2: true,
    })
    expect(unmeasuredSet.repCount).toBe(10)
  })
})
