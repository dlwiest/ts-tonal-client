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

## Contributing

Contributions to this project are welcome, especially in the areas of error handling, expanding functionality, and improving the robustness of the client.

## License

This project is open-sourced under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Contact

For any queries or further assistance, please contact [Derrick Wiest](mailto:me@dlwiest.com).
