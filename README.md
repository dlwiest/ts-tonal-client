# TypeScript Tonal Client

[![npm version](https://badge.fury.io/js/@dlwiest%2Fts-tonal-client.svg)](https://badge.fury.io/js/@dlwiest%2Fts-tonal-client)
[![npm downloads](https://img.shields.io/npm/dm/@dlwiest/ts-tonal-client.svg)](https://www.npmjs.com/package/@dlwiest/ts-tonal-client)

A TypeScript client for working with data from a Tonal account. It wraps
authentication, workout and movement APIs, completed performance data, recovery
metrics, programs, goals, and personal health-data exports in a typed interface.

> [!IMPORTANT]
> This is an unofficial community project. It is not affiliated with or
> supported by Tonal, and the private APIs it uses may change without notice.

## Product Overview

The client is meant for personal tools, data exports, and applications that need
more Tonal detail than a general fitness integration may provide. In particular,
it can retrieve performed set data—movements, reps, weight, volume, training
modes, timing, and estimated one-rep max—and combine it with workout summaries,
muscle readiness, and lifetime totals.

One intended workflow is to create a privacy-conscious JSON snapshot and upload
it to an AI assistant such as ChatGPT for personal health analysis. This is a
file-based bridge, not a live or automatic ChatGPT connection: generate a new
export whenever the assistant needs current Tonal data.

## Product Features

| Area | Current capabilities |
| --- | --- |
| Authentication | Sign in with Tonal account credentials and automatically manage access-token refresh |
| Workout library | List, retrieve, create, update, delete, share, and estimate workouts; retrieve Daily Lifts |
| Completed performance | Retrieve activity summaries, paginated workout history, and individual workout details including performed sets, reps, weights, volume, timing, training modes, and estimated one-rep max |
| Movements and programs | Browse Tonal movements and muscle groups and retrieve detailed training programs |
| Training and recovery | Retrieve daily metrics, streaks, muscle readiness, weekly targets, and actual metric scores |
| History and achievements | Retrieve lifetime statistics, achievement progress, earned achievements, and home-calendar recommendations |
| Health data export | Produce date-filtered JSON with aggregate totals, optional recovery and lifetime data, and optional set-level workout details |
| Developer experience | TypeScript response types, request validation, retries, timeouts, movement caching, and runnable examples |

## Current Limitations

- Tonal does not publish or guarantee the private APIs used by this project.
- Authentication currently requires Tonal account credentials; never commit a
  populated `.env` file or include credentials in an export.
- Health exports are point-in-time files. They do not continuously synchronize
  Tonal with ChatGPT or another health service.
- Detailed exports fetch paginated workout activity data, so large account
  histories may require additional requests and take longer.
- Tonal reports average resistance per cable. The export preserves that value
  and derives effective average resistance from Tonal's total on-machine volume
  divided by completed reps, correctly accounting for dual-cable movements such
  as straight-bar lifts.

## Installation

### Option 1: Install from npm (Recommended)

```bash
npm install @dlwiest/ts-tonal-client
```

### Option 2: Clone and build from source

```bash
git clone https://github.com/dlwiest/ts-tonal-client.git
cd ts-tonal-client
npm install
npm run build
```

## Quick Start

Basic usage:

```typescript
import TonalClient from '@dlwiest/ts-tonal-client'

const client = await TonalClient.create({
  username: 'your_email@example.com',
  password: 'your_password',
})

// Get your workouts
const workouts = await client.getUserWorkouts()
console.log(`You have ${workouts.length} workouts`)
```

### Client setup

`TonalClient.create()` accepts credentials and an optional cache directory:

```typescript
TonalClient.create(credentials: {
  username: string,
  password: string,
  cacheDir?: string,
}): Promise<TonalClient>
```

Without `cacheDir`, cached movements and completed workout activities are stored in `$XDG_CACHE_HOME/ts-tonal-client` when `XDG_CACHE_HOME` is set. Otherwise, the cache lives at `~/.cache/ts-tonal-client`. The directory is created on the first successful cache write, not when the client is created.

Pass `cacheDir` to store both caches somewhere else:

```typescript
const client = await TonalClient.create({
  username: 'your_email@example.com',
  password: 'your_password',
  cacheDir: '/path/to/cache',
})
```

### Cache invalidation

`await client.invalidateMovementsCache()` clears the movements cache only. It does not clear cached workout activities.

`client.invalidateUserInfo()` clears the in-memory user profile. Call it before the next `getUserInfo()` request to fetch fresh data.

## Examples

To run the example scripts, first create a `.env` file:

```bash
cp .env.sample .env
# Edit .env with your Tonal username (email) and password
```

Then try the examples:

```bash
# See all your workouts
npm run example:user-workouts

# Search for workouts by name
npm run example:workout:name "Upper Body"

# Get your user info
npm run example:user

# Browse available movements
npm run example:movements

# See fitness goals
npm run example:goals

# Estimate workout duration
npm run example:estimate

# Create a new workout
npm run example:create-workout

# Edit an existing workout
npm run example:edit-workout

# Delete a workout
npm run example:delete-workout

# Get daily lifts
npm run example:daily-lifts

# Get training effect goals
npm run example:training-effect-goals

# Get training types
npm run example:training-types

# Get user settings
npm run example:user-settings

# Get daily metrics
npm run example:daily-metrics

# Get current workout streak
npm run example:current-streak

# Get workout activity history
npm run example:activity-summaries

# Get lifetime user statistics
npm run example:user-statistics

# Get achievement stats and milestones
npm run example:achievement-stats

# Get earned achievement history
npm run example:achievements

# Get home calendar and workout recommendations
npm run example:home-calendar

# Get muscle readiness and recovery status
npm run example:muscle-readiness

# Get detailed program information by ID
npm run example:program-by-id

# Get weekly fitness targets and progress tracking
npm run example:target-scores

# Get actual performance scores vs targets with comprehensive analytics
npm run example:metric-scores

# Export workout summaries for personal health analysis
npm run example:health-export

# Export complete Tonal history and all available health metrics
npm run example:complete-health-export
```

## Health Data Export

Create a JSON-ready export containing workout summaries, aggregate totals, current
muscle readiness, and lifetime statistics:

```typescript
import { writeFile } from 'node:fs/promises'

const exportData = await client.getHealthExport({
  startDate: '2026-01-01',
  limit: 100,
  includeSetDetails: true,
})

await writeFile(
  'tonal-health-export.json',
  JSON.stringify(exportData, null, 2)
)
```

Run `npm run example:health-export` to write a complete export to
`tonal-health-export.json`. The example creates the file with owner-only
permissions where the operating system supports them.

The export intentionally excludes profile details, account identifiers, device
identifiers, application versions, and authentication data. It still contains
private health and workout information, so store and share it carefully.

Available options:

- `startDate` and `endDate`: include activities within an ISO-8601 range;
  date-only values use each workout's local calendar day
- `limit`: include at most this many activities, newest first
- `includeMuscleReadiness`: include current readiness data (default: `true`)
- `includeLifetimeStatistics`: include lifetime aggregate data (default: `true`)
- `includeExternalActivities`: include workouts imported into Tonal from another
  service (default: `false`, preventing duplication with Apple Health data)
- `includeSetDetails`: fetch performed sets, reps, weights, movement names, and
  one-rep-max estimates from paginated workout activity data (default: `false`)

Set details keep Tonal's reported per-cable values in
`averageResistancePerCablePounds` and
`estimatedOneRepMaxPerCablePounds`. Arithmetic derived from total volume and
completed reps is separated under `derivedEstimates`, with
`averageResistancePounds` and `oneRepMaxPounds` explicitly documented as
estimates rather than measured values. `totalVolumePounds` uses Tonal's
`totalOnMachineVolume`, which reconciles with the completed workout's total
volume.

Detailed completed workouts are also available directly:

```typescript
// Get a page of completed activities with performed set data
const activities = await client.getWorkoutActivities(0, 100)

// Get every activity, with duplicate-page and page-cap safety checks
const completeHistory = await client.getAllWorkoutActivities()

// Get one completed activity by its activity ID
const activity = await client.getWorkoutActivityById('activity-uuid')
console.log(activity.workoutSetActivity)

// Get the summary returned for one activity
const summary = await client.getFormattedWorkoutSummary('activity-uuid')

// Get summaries in bounded request batches
const summaries = await client.getFormattedWorkoutSummaries(
  completeHistory.map(item => item.id),
  5
)
```

### Complete History Export

Run `npm run example:complete-health-export` to retrieve every paginated Tonal
workout from the beginning of the account history. The resulting
`tonal-complete-health-export.json` includes raw set-performance metrics,
formatted workout and movement summaries, full daily metrics for the covered
period, strength-score history, weekly targets and scores, current readiness,
streaks, lifetime statistics, achievements, and reference definitions.

The complete export is structured as JSON for analysis tools such as ChatGPT.
It includes a data dictionary explaining units and Tonal's per-cable resistance
convention. Account, device, application, subscription, and authentication
identifiers are removed recursively. The JSON is compacted to reduce upload
size and text-token usage without dropping data. The file still contains highly
private health information and is created with owner-only permissions where
supported.

The script also creates a `tonal-chatgpt-export` directory containing
`overview-and-metrics.json` and one `workouts-YYYY.json` file for each year in
the history. Upload all files from that directory together. The split bundle
contains the same information but keeps each text file smaller and easier for
ChatGPT to analyze completely.

## API Reference

### Workouts

```typescript
// Get your workouts (with pagination)
const workouts = await client.getUserWorkouts(0, 10)
console.log(`You have ${workouts.length} workouts`)

// Get daily lifts (auto-detects timezone)
const dailyLifts = await client.getDailyLifts()
console.log(`You have ${dailyLifts.length} daily lifts`)

// Get daily lifts with specific timezone
const dailyLiftsEST = await client.getDailyLifts('America/New_York')

// Get specific workout details
const workout = await client.getWorkoutById('workout-uuid')

// Search for workouts by name (case-insensitive partial match)
const workouts = await client.getUserWorkouts(0, 50)
const matches = workouts.filter(w =>
  w.title.toLowerCase().includes('upper body')
)
console.log(`Found ${matches.length} matching workouts`)

// Get shared workout
const sharedWorkout = await client.getWorkoutByShareUrl('https://share.tonal.com/workout/...')

// Estimate workout duration
const sets = [/* workout sets */]
const estimate = await client.estimateWorkoutDuration(sets)
console.log(`Estimated duration: ${estimate.duration} seconds`)

// Create a new workout
const newWorkout = await client.createWorkout({
  title: 'My Custom Workout',
  sets: sets,
  createdSource: 'WorkoutBuilder',
  description: 'A great workout!'
})

// Edit an existing workout
const updatedWorkout = await client.updateWorkout({
  id: 'workout-uuid',
  title: 'My Updated Workout Title',
  description: 'Updated description with changes',
  coachId: '00000000-0000-0000-0000-000000000000',
  sets: modifiedSets,
  assetId: 'asset-uuid',
  createdSource: 'WorkoutBuilder'
})

// Delete a workout
await client.deleteWorkout('workout-uuid')
```

### Performed workout activities

A workout activity is one performed workout session, not a workout template. Get an activity ID from `getActivitySummaries()`, then fetch its detail from `/users/{userId}/workout-activities/{activityId}`:

```typescript
const summaries = await client.getActivitySummaries()
const recent = [...summaries]
  .filter(summary => summary.completed)
  .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))[0]

if (recent) {
  const activity = await client.getWorkoutActivityById(recent.id)
  console.log(`${activity.totalSets} sets, ${activity.totalReps} reps`)
  console.log(`Completed: ${activity.completed === true}`)
}
```

The method signature is:

```typescript
async getWorkoutActivityById(
  activityId: string,
  useCache: boolean = true
): Promise<TonalWorkoutActivity>
```

Completed activities are immutable, so results with `completed === true` are cached permanently with no TTL. In-progress activities are never cached. Cache keys include both the user and activity IDs, which prevents collisions between accounts. Cache reads and writes are best-effort: a cache failure never fails the API request or hides a successful response. Pass `false` for `useCache` to force a fresh request.

Activity entries use the same `cacheDir` and default cache location described under [Client setup](#client-setup). Permanent entries never expire and nothing evicts them automatically, so the cache grows by one small file for each completed activity viewed. `invalidateMovementsCache()` does not clear these entries.

#### Activity response types

`TonalWorkoutActivity` contains the performed session's IDs, timestamps, duration and aggregate totals, completion state, device metadata, and its set activity records:

```typescript
interface TonalWorkoutActivity {
  id: string
  userId: string
  workoutId: string
  workoutType?: string | null
  beginTime: string
  endTime?: string | null
  totalDuration: number
  activeDuration?: number | null
  restDuration?: number | null
  totalMovements?: number | null
  totalSets: number
  totalReps: number
  totalVolume: number
  totalConcentricWork?: number | null
  percentCompleted?: number | null
  completed?: boolean | null
  workoutSetActivity: TonalWorkoutSetActivity[]
  contentCard?: unknown
  deviceId?: string | null
  timezone?: string | null
  appVersion?: string | null
}
```

Each `TonalWorkoutSetActivity` identifies a movement and includes the performed or prescribed values available for that set:

```typescript
interface TonalWorkoutSetActivity {
  movementId: string
  prescribedReps?: number | null
  repetition?: number | null
  repetitionTotal?: number | null
  weightPercentage?: number | null
  baseWeight?: number | null
  eccentricWeight?: number | null
  chainsWeight?: number | null
  blockNumber?: number | null
  blockStart?: boolean | null
  sideNumber?: number | null
  setId?: string | null
  spotter?: boolean | null
}
```

### User Information

```typescript
// Get your profile information
const userInfo = await client.getUserInfo()
console.log(`Welcome ${userInfo.firstName}!`)
console.log(`Level: ${userInfo.level}`)
console.log(`Location: ${userInfo.location}`)

// Get available fitness goals
const goals = await client.getGoals()
goals.forEach(goal => {
  console.log(`${goal.name}: ${goal.description}`)
})

// Get training effect goals with relationships
const trainingGoals = await client.getTrainingEffectGoals()
console.log(`${trainingGoals.goals.length} training goals available`)
trainingGoals.relations.forEach(relation => {
  console.log(`Primary goal relationships found`)
})

// Get all training types
const trainingTypes = await client.getTrainingTypes()
console.log(`${trainingTypes.length} training types available`)
trainingTypes.forEach(type => {
  console.log(`${type.name}: ${type.description}`)
})

// Get goal metrics
const goalMetrics = await client.getGoalMetrics()
console.log(`${goalMetrics.length} goal metrics available`)
goalMetrics.forEach(metric => {
  console.log(`${metric.name}: ${metric.description}`)
})

// Get comprehensive user settings
const userSettings = await client.getUserSettings()
console.log(`Audio settings: ${userSettings.overallVolume * 100}% volume`)
console.log(`Preferred music service: ${userSettings.preferredMusicService}`)
console.log(`Time zone: ${userSettings.timeZone}`)
console.log(`Total settings tracked: ${Object.keys(userSettings).length}`)

// Get daily fitness metrics (analyzes 60 days, shows recent 10 workouts)
const dailyMetrics = await client.getDailyMetrics(60)
const activeDays = dailyMetrics.filter(day => day.totalWorkouts > 0)
console.log(`Workout frequency over 60 days: ${(activeDays.length / dailyMetrics.length * 100).toFixed(1)}%`)
console.log(`Total volume (all workouts): ${activeDays.reduce((sum, day) => sum + day.totalVolume, 0).toLocaleString()} lbs`)
console.log(`Average workout duration: ${Math.round(activeDays.reduce((sum, day) => sum + day.totalDuration, 0) / activeDays.length / 60)} minutes`)

// Get current workout streak
const streak = await client.getCurrentStreak()
console.log(`Current streak: ${streak.currentStreak} workouts`)
console.log(`Personal best: ${streak.maxStreak} workouts`)
console.log(`Progress to personal best: ${Math.round((streak.currentStreak / streak.maxStreak) * 100)}%`)

// Get lifetime statistics and achievements
const stats = await client.getUserStatistics()
console.log(`Total volume: ${stats.volume.total.toLocaleString()} lbs over ${stats.workouts.total} workouts`)
console.log(`Average per workout: ${stats.volume.avgVolumePerWorkout.toLocaleString()} lbs`)
console.log(`Total workout time: ${Math.round(stats.workouts.totalDuration / 3600)} hours`)
console.log(`Movement diversity: ${stats.movements.total} unique movements performed`)

// Get achievement progress and upcoming milestones
const achievementStats = await client.getAchievementStats()
console.log(`Achievements earned: ${achievementStats.totalAchievements}`)
console.log(`Upcoming milestones: ${achievementStats.nextMilestones.length}`)
achievementStats.nextMilestones.forEach(milestone => {
  console.log(`Next goal: ${milestone.name} (${milestone.value.toLocaleString()})`)
})

// Get complete earned achievement history
const earnedAchievements = await client.getAchievements()
console.log(`Total achievements earned: ${earnedAchievements.length}`)
const recentAchievement = earnedAchievements[0]
console.log(`Most recent: ${recentAchievement.name} (${new Date(recentAchievement.createdAt).toLocaleDateString()})`)
const categories = [...new Set(earnedAchievements.map(a => a.achievement.achievementCategory.name))]
console.log(`Achievement categories: ${categories.join(', ')}`)

// Get home calendar with workout history and recommendations
const homeCalendar = await client.getHomeCalendar()
const completedWorkouts = homeCalendar.dailySchedules.filter(day => 
  day.tiles.some(tile => tile.completed)
).length
const recommendationCategories = [...new Set(
  homeCalendar.dailySchedules.map(day => day.recommendationType).filter(Boolean)
)]
console.log(`Completed workout days: ${completedWorkouts}`)
console.log(`Recommendation categories: ${recommendationCategories.join(', ')}`)

// Get muscle readiness for all muscle groups
const readiness = await client.getMuscleReadiness()
console.log(`Muscle Readiness Status:`)
console.log(`  Chest: ${readiness.Chest}%`)
console.log(`  Shoulders: ${readiness.Shoulders}%`)
console.log(`  Back: ${readiness.Back}%`)
console.log(`  Triceps: ${readiness.Triceps}%`)
console.log(`  Biceps: ${readiness.Biceps}%`)
console.log(`  Abs: ${readiness.Abs}%`)
console.log(`  Obliques: ${readiness.Obliques}%`)
console.log(`  Quads: ${readiness.Quads}%`)
console.log(`  Glutes: ${readiness.Glutes}%`)
console.log(`  Hamstrings: ${readiness.Hamstrings}%`)
console.log(`  Calves: ${readiness.Calves}%`)

// Calculate average readiness
const allMuscles = Object.values(readiness)
const averageReadiness = Math.round(allMuscles.reduce((sum, val) => sum + val, 0) / allMuscles.length)
console.log(`Average readiness: ${averageReadiness}%`)

// Find muscles that need recovery (< 60%)
const needsRecovery = Object.entries(readiness)
  .filter(([_, percentage]) => percentage < 60)
  .map(([muscle]) => muscle)
if (needsRecovery.length > 0) {
  console.log(`Muscles needing recovery: ${needsRecovery.join(', ')}`)
}

// Get detailed program information
const programId = 'f243be64-76f2-4073-8ce7-8adb37657e9f' // Example: House of Volume
const program = await client.getProgramById(programId)
console.log(`Program: ${program.name}`)
console.log(`Level: ${program.level}`)
console.log(`Duration: ${program.weeks} weeks`)
console.log(`Workouts per week: ${program.workoutsPerWeek}`)
console.log(`Total workouts: ${program.workouts.length}`)
console.log(`Description: ${program.description}`)

// Analyze program structure
const targetAreas = program.workouts.map(w => w.targetArea)
const targetAreaCounts = targetAreas.reduce((acc, area) => {
  acc[area] = (acc[area] || 0) + 1
  return acc
}, {} as Record<string, number>)
console.log(`Target area distribution:`, targetAreaCounts)

// Show weekly schedule
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const schedule = program.cadence.map((isWorkout, i) => 
  isWorkout ? `${days[i]}: Workout` : `${days[i]}: Rest`
)
console.log(`Weekly schedule: ${schedule.join(', ')}`)

// Get weekly fitness targets for all metrics
const targetScores = await client.getTargetScores()
console.log('Weekly Fitness Targets:')

Object.entries(targetScores).forEach(([metricId, weeklyTargets]) => {
  // Get the most recent week target
  const currentTarget = weeklyTargets.sort((a, b) => b.weekNumber - a.weekNumber)[0]
  const year = Math.floor(currentTarget.weekNumber / 100)
  const week = currentTarget.weekNumber % 100
  
  console.log(`Metric ${metricId}:`)
  console.log(`  Target: ${currentTarget.target}`)
  console.log(`  Range: ${currentTarget.lowRange} - ${currentTarget.highRange}`)
  console.log(`  Week: ${week}/${year}`)
})

// Analyze target trends
const volumeTargets = targetScores['2a2f499e-ae13-45d1-b501-aa1d25ff6a4a'] // Volume metric
if (volumeTargets && volumeTargets.length >= 2) {
  const sorted = volumeTargets.sort((a, b) => a.weekNumber - b.weekNumber)
  const firstTarget = sorted[0].target
  const lastTarget = sorted[sorted.length - 1].target
  const change = Math.round(((lastTarget - firstTarget) / firstTarget) * 100)
  console.log(`Volume trend: ${change > 0 ? '+' : ''}${change}% over ${sorted.length} weeks`)
}

// Get actual performance scores vs targets with comprehensive analytics
const metricScores = await client.getMetricScores()
// Optional: get scores starting from a specific week
// const metricScores = await client.getMetricScores(202440) // Start from week 40 of 2024

console.log('Performance vs Targets Analysis:')

Object.entries(metricScores).forEach(([metricId, weeklyScores]) => {
  // Get the most recent week score
  const currentScore = weeklyScores.sort((a, b) => b.weekNumber - a.weekNumber)[0]
  const year = Math.floor(currentScore.weekNumber / 100)
  const week = currentScore.weekNumber % 100
  
  console.log(`Metric ${metricId}:`)
  console.log(`  Actual Score: ${currentScore.score}`)
  console.log(`  Week: ${week}/${year}`)
})

// Compare against targets to see goal achievement
const volumeScores = metricScores['2a2f499e-ae13-45d1-b501-aa1d25ff6a4a'] // Volume metric
const volumeTargets = targetScores['2a2f499e-ae13-45d1-b501-aa1d25ff6a4a']
if (volumeScores && volumeTargets) {
  const latestScore = volumeScores.sort((a, b) => b.weekNumber - a.weekNumber)[0]
  const matchingTarget = volumeTargets.find(t => t.weekNumber === latestScore.weekNumber)
  
  if (matchingTarget) {
    const achievementPercent = Math.round((latestScore.score / matchingTarget.target) * 100)
    const inRange = latestScore.score >= matchingTarget.lowRange && latestScore.score <= matchingTarget.highRange
    console.log(`Volume Achievement: ${achievementPercent}% of target (${inRange ? 'In Range' : 'Out of Range'})`)
  }
}

// Calculate performance trends
if (volumeScores && volumeScores.length >= 2) {
  const sorted = volumeScores.sort((a, b) => a.weekNumber - b.weekNumber)
  const firstScore = sorted[0].score
  const lastScore = sorted[sorted.length - 1].score
  const change = Math.round(((lastScore - firstScore) / firstScore) * 100)
  console.log(`Volume performance trend: ${change > 0 ? '+' : ''}${change}% over ${sorted.length} weeks`)
}
```

### Strength Scores

Tonal's headline Strength Score, per body region. This is a different metric from the weekly
`Functional Strength Score` returned by `getGoalMetrics()` — that one measures goal progress
for a week, this one is the score the Tonal app shows you.

```typescript
// Current score for each region
const scores = await client.getCurrentStrengthScores()
for (const score of scores) {
  // The Overall row is synthesized: bodyRegionDisplay is empty, familyActivity is absent,
  // workoutActivityId is an all-zero uuid, and updatedAt is a zero date. Fall back to
  // strengthBodyRegion for a label, and do not render its updatedAt.
  const label = score.bodyRegionDisplay || score.strengthBodyRegion
  console.log(`${label}: ${score.score}`)
}
// One row per region: Upper Body, Core, Lower Body, Overall

// Per-workout history. Defaults to the whole account.
const history = await client.getStrengthScoreHistory()
console.log(`${history.length} scored activities`)
console.log(history[0]) // { upper, lower, core, overall, activityTime, workoutActivityId, ... }
```

**`days` is a calendar-day lookback, not a row count.** The underlying API parameter is named
`limit`, but it selects a time window: a value smaller than the gap since your last workout
returns an **empty array**, not "no results found". Passing `30` on an account last used
90 days ago yields nothing.

```typescript
await client.getStrengthScoreHistory(365)   // activities in the last 365 days
await client.getStrengthScoreHistory('all') // explicit; same as the default
```

The default `'all'` derives the window from your account creation date, so it stays correct as
the account ages rather than relying on a large magic number. If `createdAt` is missing,
unparseable, or in the future it throws `TonalClientError` rather than guessing — pass an
explicit `days` in that case.

Each history entry carries `workoutActivityId`, which makes this the only complete way to
enumerate an account's activities: the list endpoints are capped at 50 records each.

### Movements

```typescript
// Get all available movements
const movements = await client.getMovements()
console.log(`${movements.length} movements available`)

// Filter by muscle group
const chestMovements = movements.filter(m => 
  m.muscleGroups.includes('Chest')
)
```

## Available Scripts

- `npm run build` - Build the TypeScript client
- `npm run typecheck` - Run TypeScript type checking
- `npm run example:movements` - List all movements
- `npm run example:user` - Show user information  
- `npm run example:goals` - Show available goals
- `npm run example:user-workouts` - List your workouts
- `npm run example:workout:id <id>` - Get specific workout
- `npm run example:workout:name <name>` - Search for workouts by name
- `npm run example:workout:share <url>` - Get shared workout
- `npm run example:estimate` - Estimate workout duration
- `npm run example:create-workout` - Create a new workout
- `npm run example:edit-workout` - Create and edit a workout
- `npm run example:delete-workout` - Create and delete a workout
- `npm run example:daily-lifts` - Get daily lifts with auto-detected timezone
- `npm run example:training-effect-goals` - Get training effect goals and relationships
- `npm run example:training-types` - Get all available training types
- `npm run example:goal-metrics` - Get goal metrics and relationships
- `npm run example:user-settings` - Get comprehensive user settings and preferences
- `npm run example:daily-metrics` - Get daily fitness metrics with workout analytics
- `npm run example:current-streak` - Get current workout streak and personal best
- `npm run example:activity-summaries` - Get comprehensive workout activity history and analytics
- `npm run example:user-statistics` - Get lifetime user statistics and achievement milestones
- `npm run example:achievement-stats` - Get achievement progress and upcoming milestone targets
- `npm run example:achievements` - Get complete earned achievement history with timeline analytics
- `npm run example:home-calendar` - Get home calendar with workout history and personalized recommendations
- `npm run example:muscle-readiness` - Get muscle readiness percentages and recovery recommendations
- `npm run example:program-by-id` - Get comprehensive program details including all workouts and structure
- `npm run example:target-scores` - Get weekly fitness targets with ranges and trend analysis for all metrics
- `npm run example:metric-scores` - Get actual performance scores vs targets with comprehensive goal achievement analytics

## Contributing

Contributions to this project are welcome, especially in the areas of error handling, expanding functionality, and improving the robustness of the client.

## License

This project is open-sourced under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Contact

For any queries or further assistance, please contact [Derrick Wiest](mailto:me@dlwiest.com).
