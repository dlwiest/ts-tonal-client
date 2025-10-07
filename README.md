# TypeScript Tonal Client

A comprehensive TypeScript client for accessing Tonal's API. This library provides a robust interface to retrieve workout data, user information, movements, and more from your Tonal account.

## Features

- 🏋️ **Complete Workout Access** - Get your workouts, workout details, and shared workouts
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

## Setup

Create a `.env` file with your Tonal credentials:

```bash
cp .env.sample .env
# Edit .env with your Tonal username (email) and password
```

## Quick Start

Try the example scripts:

```bash
# See all your workouts
npm run example:user-workouts

# Get your user info
npm run example:user

# Browse available movements
npm run example:movements

# See fitness goals
npm run example:goals
```

## API Usage

Import and use the client in your TypeScript code:

```typescript
import TonalClient from './src/index'

const client = await TonalClient.create({
  username: 'your_email@example.com',
  password: 'your_password',
})
```

### Workouts

```typescript
// Get your workouts (with pagination)
const workouts = await client.getUserWorkouts(0, 10)
console.log(`You have ${workouts.length} workouts`)

// Get specific workout details  
const workout = await client.getWorkoutById('workout-uuid')

// Get shared workout
const sharedWorkout = await client.getWorkoutByShareUrl('https://share.tonal.com/workout/...')
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

## Contributing

Contributions to this project are welcome, especially in the areas of error handling, expanding functionality, and improving the robustness of the client.

## License

This project is open-sourced under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Contact

For any queries or further assistance, please contact [Derrick Wiest](mailto:me@dlwiest.com).
