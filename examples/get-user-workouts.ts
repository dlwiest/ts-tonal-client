import 'dotenv/config'
import TonalClient from '../src/index'

const getUserWorkouts = async () => {
  try {
    const client = await TonalClient.create({
      username: process.env.TONAL_USERNAME!,
      password: process.env.TONAL_PASSWORD!,
    })
    
    // Get first 10 workouts
    const workouts = await client.getUserWorkouts(0, 10)
    
    console.log(`Found ${workouts.length} user workouts:\n`)
    
    workouts.forEach((workout, index) => {
      console.log(`${index + 1}. ${workout.title}`)
      console.log(`   ID: ${workout.id}`)
      console.log(`   Target: ${workout.targetArea}`)
      console.log(`   Duration: ${Math.floor(workout.duration / 60)}min ${workout.duration % 60}s`)
      console.log(`   Body Regions: ${workout.bodyRegions?.join(', ') || 'None'}`)
      if (workout.accessories?.length) {
        console.log(`   Accessories: ${workout.accessories.join(', ')}`)
      }
      console.log(`   Created: ${new Date(workout.createdAt).toLocaleDateString()}`)
      console.log('')
    })

    // Test getting a specific workout by ID using the first workout
    if (workouts.length > 0) {
      const firstWorkoutId = workouts[0].id
      console.log(`🔍 Testing getWorkoutById with ID: ${firstWorkoutId}`)
      
      try {
        const specificWorkout = await client.getWorkoutById(firstWorkoutId)
        console.log(`✅ Successfully retrieved workout: "${specificWorkout.title}"`)
      } catch (error) {
        console.log(`❌ Failed to retrieve workout: ${error}`)
      }
    }
    
  } catch (e) {
    console.error(e)
  }
}

getUserWorkouts()