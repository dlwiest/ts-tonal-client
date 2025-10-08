import 'dotenv/config'
import TonalClient from '../src/index'
import { TonalWorkoutEstimateSet, TonalWorkoutCreateRequest } from '../src/types'

const createWorkout = async () => {
  try {
    const client = await TonalClient.create({
      username: process.env.TONAL_USERNAME!,
      password: process.env.TONAL_PASSWORD!,
    })
    
    // Define complex workout with multiple blocks, rep/time-based exercises, and modifiers
    const workoutSets: TonalWorkoutEstimateSet[] = [
      // Block 1: Rep-based exercises with eccentric modifier
      {
        blockStart: true,
        movementId: "eb067021-46de-433c-9262-deea70debde2",
        prescribedReps: 20,
        dropSet: false,
        repetition: 1,
        repetitionTotal: 3,
        blockNumber: 1,
        burnout: false,
        spotter: true,
        eccentric: true, // Eccentric modifier for slower negatives
        chains: false,
        flex: false,
        warmUp: false,
        weightPercentage: 100,
        setGroup: 1,
        round: 1,
        description: ""
      },
      {
        blockStart: false,
        movementId: "1f5e8776-3b9c-4fe7-80d1-75b5b28a4455",
        prescribedReps: 20,
        dropSet: false,
        repetition: 1,
        repetitionTotal: 3,
        blockNumber: 1,
        burnout: true, // Burnout set - push to failure
        spotter: false,
        eccentric: false,
        chains: false,
        flex: false,
        warmUp: false,
        weightPercentage: 100,
        setGroup: 2,
        round: 1,
        description: ""
      },
      
      // Block 2: Time-based exercises with custom descriptions
      {
        blockStart: true,
        movementId: "b11f89b0-5470-44a2-b70a-5391e972eb71",
        prescribedDuration: 30, // Time-based: 30 seconds
        dropSet: false,
        repetition: 1,
        repetitionTotal: 2,
        blockNumber: 2,
        burnout: false,
        spotter: false,
        eccentric: false,
        chains: false,
        flex: false,
        warmUp: false,
        weightPercentage: 100,
        setGroup: 1,
        round: 1,
        description: ""
      },
      {
        blockStart: false,
        movementId: "00000000-0000-0000-0000-000000000006",
        prescribedReps: 10,
        dropSet: false,
        repetition: 1,
        repetitionTotal: 2,
        blockNumber: 2,
        burnout: false,
        spotter: false,
        eccentric: false,
        chains: false,
        flex: false,
        warmUp: false,
        weightPercentage: 100,
        setGroup: 2,
        round: 1,
        description: "custom ankle strap move" // Custom description
      },
      {
        blockStart: false,
        movementId: "3fbe5a3b-2140-473a-be43-2d19f19a1b59",
        prescribedDuration: 30, // Time-based: 30 seconds
        dropSet: false,
        repetition: 1,
        repetitionTotal: 2,
        blockNumber: 2,
        burnout: false,
        spotter: true,
        eccentric: false,
        chains: true, // Chains modifier for variable resistance
        flex: false,
        warmUp: false,
        weightPercentage: 100,
        setGroup: 3,
        round: 1,
        description: ""
      }
    ]
    
    console.log('🔍 Step 1: Estimating workout duration...')
    const estimate = await client.estimateWorkoutDuration(workoutSets)
    const estimatedMinutes = Math.floor(estimate.duration / 60)
    const estimatedSeconds = estimate.duration % 60
    console.log(`   Estimated: ${estimatedMinutes}min ${estimatedSeconds}s`)
    
    console.log('\n🏗️  Step 2: Creating workout...')
    // Generate unique name with timestamp and random component
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    const randomId = Math.random().toString(36).substring(2, 8)
    const uniqueTitle = `API-Test-${timestamp}-${randomId}`
    
    const workoutData: TonalWorkoutCreateRequest = {
      title: uniqueTitle,
      sets: workoutSets,
      createdSource: 'WorkoutBuilder',
      shortDescription: 'Complex workout with modifiers and time-based exercises',
      description: 'Advanced workout featuring:\n• Rep-based exercises with eccentric modifier\n• Time-based exercises with chains\n• Multiple blocks and movement types\n• Custom movement descriptions'
    }
    
    const createdWorkout = await client.createWorkout(workoutData)
    
    console.log(`✅ Workout created successfully!`)
    console.log(`   ID: ${createdWorkout.id}`)
    console.log(`   Title: ${createdWorkout.title}`)
    console.log(`   Actual Duration: ${Math.floor(createdWorkout.duration / 60)}min ${createdWorkout.duration % 60}s`)
    console.log(`   Sets: ${createdWorkout.sets?.length || 'Unknown'}`)
    console.log(`   Target Area: ${createdWorkout.targetArea}`)
    console.log(`   Body Regions: ${createdWorkout.bodyRegions?.join(', ') || 'None'}`)
    console.log(`   Accessories: ${createdWorkout.accessories?.join(', ') || 'None'}`)
    
    console.log('\n🔍 Step 3: Verifying by fetching the created workout...')
    const fetchedWorkout = await client.getWorkoutById(createdWorkout.id)
    console.log(`✅ Verification successful: "${fetchedWorkout.title}"`)
    
    console.log('\n🎉 Full workout creation workflow completed!')
    
  } catch (e) {
    console.error('❌ Error:', e)
  }
}

createWorkout()