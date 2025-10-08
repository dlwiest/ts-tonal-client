import 'dotenv/config'
import TonalClient from '../src/index'
import { TonalWorkoutEstimateSet, TonalWorkoutCreateRequest } from '../src/types'

const deleteWorkoutExample = async () => {
  try {
    const client = await TonalClient.create({
      username: process.env.TONAL_USERNAME!,
      password: process.env.TONAL_PASSWORD!,
    })
    
    // Create a temporary workout to delete
    console.log('🏗️ Creating temporary workout for deletion test...')
    
    const tempSets: TonalWorkoutEstimateSet[] = [
      {
        blockStart: true,
        movementId: "eb067021-46de-433c-9262-deea70debde2",
        prescribedReps: 10,
        dropSet: false,
        repetition: 1,
        repetitionTotal: 1,
        blockNumber: 1,
        burnout: false,
        spotter: false,
        eccentric: false,
        chains: false,
        flex: false,
        warmUp: false,
        weightPercentage: 100,
        setGroup: 1,
        round: 1,
        description: "Temporary workout for deletion test"
      }
    ]
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    const randomId = Math.random().toString(36).substring(2, 8)
    
    const workoutData: TonalWorkoutCreateRequest = {
      title: `DELETE-ME-${timestamp}-${randomId}`,
      sets: tempSets,
      createdSource: 'WorkoutBuilder',
      shortDescription: 'Temporary workout for deletion testing',
      description: 'This workout will be deleted immediately after creation to test the delete functionality.'
    }
    
    const createdWorkout = await client.createWorkout(workoutData)
    console.log(`✅ Created temporary workout: "${createdWorkout.title}"`)
    console.log(`   ID: ${createdWorkout.id}`)
    
    // Verify it exists
    console.log('\n🔍 Verifying workout exists...')
    const fetchedWorkout = await client.getWorkoutById(createdWorkout.id)
    console.log(`✅ Confirmed workout exists: "${fetchedWorkout.title}"`)
    
    // Delete the workout
    console.log('\n🗑️ Deleting workout...')
    await client.deleteWorkout(createdWorkout.id)
    console.log('✅ Workout deleted successfully!')
    
    // Verify deletion by checking publishState (Tonal uses soft-deletion)
    console.log('\n🔍 Verifying deletion status...')
    try {
      const deletedWorkout = await client.getWorkoutById(createdWorkout.id)
      
      if (deletedWorkout.publishState === 'archived') {
        console.log('✅ Deletion confirmed: workout is now archived')
        console.log(`   publishState: "${deletedWorkout.publishState}" (was "published")`)
        console.log('   Note: Archived workouts are hidden from the app but remain accessible via API')
      } else {
        console.log(`⚠️ Unexpected publishState: "${deletedWorkout.publishState}"`)
        console.log('   Expected "archived" for deleted workouts')
      }
      
      console.log(`   Title: "${deletedWorkout.title}"`)
      console.log('   Status: Soft-deleted (archived)')
      
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        console.log('✅ Hard deletion confirmed: workout no longer exists (404 error)')
      } else {
        console.log('❌ Error checking deletion status')
        console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
    
    console.log('\n🎉 Delete workflow completed successfully!')
    
  } catch (e) {
    console.error('❌ Error:', e)
  }
}

deleteWorkoutExample()