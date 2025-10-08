export interface TonalUserDevice {
  deviceId: string
  tonalDeviceId: string
  userId: string
  createdAt: string
  updatedAt: string
  loggedIn: boolean
  postWorkoutNotifs: boolean
  reminderNotifs: boolean
  productUpdateNotifs: boolean
  socialNotifs: boolean
  blogNotifs: boolean
  chatbotNotifs: boolean
  deviceModel: string
  osVersion: string
  appVersion: string
  platform: string
}

export interface TonalGoal {
  id: string
  name: string
  description: string
  active: boolean
  filterItemId: string // TODO: investigate what filterItemId is used for
}

export interface TonalUserGoal {
  id: string
  userID: string
  goalID: string
  tier: number // Priority tier: 1=highest priority, 2=medium, 3=lowest
}

export interface TonalUserInfo {
  id: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  email: string
  firstName: string
  lastName: string
  gender: 'MALE' | 'FEMALE' | string // TODO: investigate all possible gender values
  heightInches: number
  weightPounds: number
  auth0Id: string
  dateOfBirth: string // TODO: investigate format (ISO date observed)
  isGuestAccount: boolean
  isDemoAccount: boolean
  watchedSafetyVideo: boolean
  recentMobileDevice: TonalUserDevice
  emailVerified: boolean
  username: string
  workoutsPerWeek: number
  tonalStatus: 'purchased' | string // TODO: investigate other possible statuses
  social: unknown | null // TODO: investigate social object structure
  profileAssetID: string | null
  mobileWorkoutsEnabled: boolean
  accountType: 'PublicUser' | string // TODO: investigate other account types
  location: string
  sharingCustomWorkoutsDisabled: boolean
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | string // TODO: verify all level values
  goalId: string // Primary goal ID (matches one of the goals array entries)
  goals: TonalUserGoal[]
  workoutDurationMin: number // TODO: investigate units (seconds observed)
  workoutDurationMax: number // TODO: investigate units (seconds observed)
  updatedPreferencesAt: string
  primaryDeviceType: 'Classic' | string // TODO: investigate other device types (Smart Gym, etc.)
}