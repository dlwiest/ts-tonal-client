# TypeScript Tonal Client

A comprehensive TypeScript client for accessing Tonal's API. This library provides a robust interface to retrieve workout data, user information, movements, and more from your Tonal account.

## Features

- 🏋️ **Complete Workout Management** - Get, create, estimate, and share workouts including daily lifts
- 👤 **User Management** - Access user info, goals, and preferences  
- 💪 **Movement Database** - Browse all available Tonal movements
- 🛡️ **Enterprise-Grade Reliability** - Built-in error handling, retries, and timeouts
- 📝 **Full TypeScript Support** - Comprehensive types for all API responses
- 🔄 **Smart Token Management** - Automatic authentication and token refresh

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/dlwiest/ts-tonal-client.git
cd ts-tonal-client
npm install
```

## Quick Start

Basic usage:

```typescript
import TonalClient from './src/index'

const client = await TonalClient.create({
  username: 'your_email@example.com',
  password: 'your_password',
})

// Get your workouts
const workouts = await client.getUserWorkouts()
console.log(`You have ${workouts.length} workouts`)
```

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
```

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

## Contributing

Contributions to this project are welcome, especially in the areas of error handling, expanding functionality, and improving the robustness of the client.

## License

This project is open-sourced under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Contact

For any queries or further assistance, please contact [Derrick Wiest](mailto:me@dlwiest.com).
