import { MuscleGroup } from './common'

export interface TonalMovement {
  id: string
  createdAt: string
  updatedAt: string
  name: string
  shortName: string
  muscleGroups: MuscleGroup[]
  bodyRegion: string
  bodyRegionDisplay: string
  baseOfSupport: string
  pushPull: string
  family: string
  familyDisplay: string
  inFreeLift: boolean
  onMachine: boolean
  countReps: boolean
  isTwoSided: boolean
  isBilateral: boolean
  isAlternating: boolean
  offMachineAccessory: string
  descriptionHow: string
  descriptionWhy: string
  sortOrder: number
  imageAssetId: string
  skillLevel: number
  active: boolean
  featureGroupIds: null | string[]
  isGeneric: boolean
}