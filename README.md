# Tonal Client

This repository contains a TypeScript client for accessing Tonal data. It is designed to interact with Tonal's systems to retrieve various types of workout-related data.


## Features

- Retrieve detailed workout data by ID.
- Access shared workouts through share URLs.
- Fetch movements and other related workout data.

## Installation

To use this client, clone the repository and install the necessary dependencies:

\```bash
git clone https://github.com/yourusername/tonal-client.git
cd tonal-client
npm install
\```

## Usage

The client can be used in scripts or applications that require data from Tonal. Here are some examples of how to use the client:

### Get Movements

\```typescript
// Example: Fetching movements
import { TonalClient } from './src/client';

async function fetchMovements() {
    const client = await TonalClient.create({ username: 'your_username', password: 'your_password' });
    const movements = await client.getMovements();
    console.log(movements);
}

fetchMovements();
\```

### Get Workout by ID

\```typescript
// Example: Fetching a workout by ID
import { TonalClient } from './src/client';

async function fetchWorkoutById(workoutId: string) {
    const client = await TonalClient.create({ username: 'your_username', password: 'your_password' });
    const workout = await client.getWorkoutById(workoutId);
    console.log(workout);
}

fetchWorkoutById('workout_id_here');
\```

### Get Workout by Share URL

\```typescript
// Example: Fetching a workout by its share URL
import { TonalClient } from './src/client';

async function fetchWorkoutByShareUrl(shareUrl: string) {
    const client = await TonalClient.create({ username: 'your_username', password: 'your_password' });
    const workout = await client.getWorkoutByShareUrl(shareUrl);
    console.log(workout);
}

fetchWorkoutByShareUrl('https://link.tonal.com/custom-workout/your_workout_id');
\```

## Contributing

Contributions to this project are welcome, especially in the areas of error handling, expanding functionality, and improving the robustness of the client.

## License

This project is open-sourced under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Contact

For any queries or further assistance, please contact [your-email@example.com](mailto:your-email@example.com).