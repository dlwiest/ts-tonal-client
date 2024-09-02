require('dotenv').config()
import TonalClient from '../src'

const getWorkoutById = async (workoutId: string) => {
  try {
    const client = await TonalClient.create({
      username: process.env.TONAL_USERNAME!,
      password: process.env.TONAL_PASSWORD!,
    })
    const workout = await client.getWorkoutById(workoutId)
    console.log(workout)
  } catch (e) {
    console.error(e)
  }
}

// Example usage: Pass the workout ID as a command line argument
const workoutId = process.argv[2]
if (!workoutId) {
  console.error('Please provide a workout ID as the parameter')
  process.exit(1)
}

getWorkoutById(workoutId)
