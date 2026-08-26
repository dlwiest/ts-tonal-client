# TypeScript Tonal Client

[![npm version](https://badge.fury.io/js/@dlwiest%2Fts-tonal-client.svg)](https://badge.fury.io/js/@dlwiest%2Fts-tonal-client)
[![npm downloads](https://img.shields.io/npm/dm/@dlwiest/ts-tonal-client.svg)](https://www.npmjs.com/package/@dlwiest/ts-tonal-client)

A comprehensive TypeScript client for accessing Tonal's API. This library provides a robust interface to retrieve workout data, user information, movements, and more from your Tonal account.

## Features

- 🏋️ **Complete Workout Management** - Get, create, estimate, and share workouts including daily lifts
- 👤 **User Management** - Access user info, goals, and preferences  
- 💪 **Movement Database** - Browse all available Tonal movements
- 🎯 **Muscle Readiness Tracking** - Monitor recovery status for all muscle groups
- 📋 **Program Details** - Get comprehensive information about training programs
- 🎯 **Target Score Tracking** - Get weekly fitness targets and progress ranges for all metrics
- 📈 **Metric Score Analysis** - Track actual performance vs targets with comprehensive analytics
- 🛡️ **Enterprise-Grade Reliability** - Built-in error handling, retries, and timeouts
- 📝 **Full TypeScript Support** - Comprehensive types for all API responses
- 🔄 **Smart Token Management** - Automatic authentication and token refresh

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

`TonalClient.create()` accepts credentials and an optional movement cache directory:

```typescript
TonalClient.create(credentials: {
  username: string,
  password: string,
  cacheDir?: string,
}): Promise<TonalClient>
```

Without `cacheDir`, movement data is cached in `$XDG_CACHE_HOME/ts-tonal-client` when `XDG_CACHE_HOME` is set. Otherwise, the cache lives at `~/.cache/ts-tonal-client`. The directory is created on the first successful cache write, not when the client is created.

Pass `cacheDir` to store the movement cache somewhere else:

```typescript
const client = await TonalClient.create({
  username: 'your_email@example.com',
  password: 'your_password',
  cacheDir: '/path/to/cache',
})
```

### Cache invalidation

`TonalClient.invalidateUserInfo(): void` clears the cached user profile. Call `client.invalidateUserInfo()` before the next `getUserInfo()` request to fetch fresh data.

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
```

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

// Get comprehensive workout activity history
const activities = await client.getActivitySummaries()
console.log(`Total workouts completed: ${activities.length}`)
const totalVolume = activities.reduce((sum, activity) => sum + activity.totalVolume, 0)
console.log(`Total volume lifted: ${totalVolume.toLocaleString()} lbs`)
const guidedWorkouts = activities.filter(a => a.isGuidedWorkout).length
console.log(`Guided vs Free Lift: ${guidedWorkouts}/${activities.length - guidedWorkouts}`)

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
// Upper Body: 1693 / Core: 1363 / Lower Body: 821 / Overall: 1292

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
