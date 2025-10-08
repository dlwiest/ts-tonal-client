import 'dotenv/config'
import TonalClient from '../src/index'
import { TonalWorkoutEstimateSet, TonalWorkoutCreateRequest, TonalWorkoutUpdateRequest } from '../src/types'

const createAndEditWorkout = async () => {
  try {
    const client = await TonalClient.create({
      username: process.env.TONAL_USERNAME!,
      password: process.env.TONAL_PASSWORD!,
    })
    
    // Step 1: Create a simple workout
    console.log('🏗️ Step 1: Creating initial workout...')
    
    const initialSets: TonalWorkoutEstimateSet[] = [
      {
        blockStart: true,
        movementId: "eb067021-46de-433c-9262-deea70debde2",
        prescribedReps: 15,
        dropSet: false,
        repetition: 1,
        repetitionTotal: 2,
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
        description: ""
      },
      {
        blockStart: false,
        movementId: "eb067021-46de-433c-9262-deea70debde2",
        prescribedReps: 15,
        dropSet: false,
        repetition: 2,
        repetitionTotal: 2,
        blockNumber: 1,
        burnout: false,
        spotter: false,
        eccentric: false,
        chains: false,
        flex: false,
        warmUp: false,
        weightPercentage: 100,
        setGroup: 1,
        round: 2,
        description: ""
      }
    ]
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    const randomId = Math.random().toString(36).substring(2, 8)
    const initialTitle = `Edit-Test-${timestamp}-${randomId}`
    
    const workoutData: TonalWorkoutCreateRequest = {
      title: initialTitle,
      sets: initialSets,
      createdSource: 'WorkoutBuilder',
      shortDescription: 'Simple workout for edit testing',
      description: 'This workout will be modified to test the edit functionality.'
    }
    
    const createdWorkout = await client.createWorkout(workoutData)
    console.log(`✅ Created workout: "${createdWorkout.title}"`)
    console.log(`   ID: ${createdWorkout.id}`)
    console.log(`   Duration: ${Math.floor(createdWorkout.duration / 60)}min ${createdWorkout.duration % 60}s`)
    console.log(`   Sets: ${createdWorkout.sets.length}`)
    
    // Step 2: Edit the workout
    console.log('\n✏️ Step 2: Editing the workout...')
    
    const modifiedSets: TonalWorkoutEstimateSet[] = [
      // Keep original sets but increase reps
      {
        blockStart: true,
        movementId: "eb067021-46de-433c-9262-deea70debde2",
        prescribedReps: 25, // Increased from 15
        dropSet: false,
        repetition: 1,
        repetitionTotal: 3, // Added a third round
        blockNumber: 1,
        burnout: false,
        spotter: true, // Added spotter
        eccentric: true, // Added eccentric
        chains: false,
        flex: false,
        warmUp: false,
        weightPercentage: 100,
        setGroup: 1,
        round: 1,
        description: "Modified: increased reps, added spotter and eccentric"
      },
      {
        blockStart: false,
        movementId: "eb067021-46de-433c-9262-deea70debde2",
        prescribedReps: 25,
        dropSet: false,
        repetition: 2,
        repetitionTotal: 3,
        blockNumber: 1,
        burnout: false,
        spotter: true,
        eccentric: true,
        chains: false,
        flex: false,
        warmUp: false,
        weightPercentage: 100,
        setGroup: 1,
        round: 2,
        description: "Modified: increased reps, added spotter and eccentric"
      },
      {
        blockStart: false,
        movementId: "eb067021-46de-433c-9262-deea70debde2",
        prescribedReps: 25,
        dropSet: false,
        repetition: 3,
        repetitionTotal: 3,
        blockNumber: 1,
        burnout: true, // Added burnout for final set
        spotter: true,
        eccentric: true,
        chains: false,
        flex: false,
        warmUp: false,
        weightPercentage: 100,
        setGroup: 1,
        round: 3,
        description: "Added: third round with burnout"
      },
      // Add a completely new block with time-based exercise
      {
        blockStart: true,
        movementId: "b11f89b0-5470-44a2-b70a-5391e972eb71",
        prescribedDuration: 45,
        dropSet: false,
        repetition: 1,
        repetitionTotal: 1,
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
        description: "Added: new time-based exercise block"
      }
    ]
    
    const updateData: TonalWorkoutUpdateRequest = {
      id: createdWorkout.id,
      title: `${createdWorkout.title} - EDITED`,
      description: `${createdWorkout.description}\n\n--- EDIT HISTORY ---\nEdited on ${new Date().toISOString()}\n• Increased reps from 15 to 25\n• Added third round with burnout\n• Added spotter and eccentric modifiers\n• Added new time-based exercise block (45s)`,
      coachId: createdWorkout.coachId,
      sets: modifiedSets,
      level: createdWorkout.level,
      assetId: createdWorkout.assetId,
      createdSource: 'WorkoutBuilder'
    }
    
    const updatedWorkout = await client.updateWorkout(updateData)
    
    console.log(`✅ Workout edited successfully!`)
    console.log(`   New title: "${updatedWorkout.title}"`)
    console.log(`   New duration: ${Math.floor(updatedWorkout.duration / 60)}min ${updatedWorkout.duration % 60}s`)
    console.log(`   New sets count: ${updatedWorkout.sets.length}`)
    console.log(`   Body regions: ${updatedWorkout.bodyRegions?.join(', ') || 'None'}`)
    console.log(`   Accessories: ${updatedWorkout.accessories?.join(', ') || 'None'}`)
    
    // Step 3: Verify the changes
    console.log('\n🔍 Step 3: Verifying changes...')
    const fetchedWorkout = await client.getWorkoutById(updatedWorkout.id)
    console.log(`✅ Verification successful!`)
    console.log(`   Confirmed title: "${fetchedWorkout.title}"`)
    console.log(`   Confirmed duration: ${Math.floor(fetchedWorkout.duration / 60)}min ${fetchedWorkout.duration % 60}s`)
    console.log(`   Confirmed sets: ${fetchedWorkout.sets.length}`)
    
    // Show the differences
    console.log('\n📊 Summary of changes:')
    console.log(`   Sets: ${createdWorkout.sets.length} → ${fetchedWorkout.sets.length}`)
    console.log(`   Duration: ${Math.floor(createdWorkout.duration / 60)}min ${createdWorkout.duration % 60}s → ${Math.floor(fetchedWorkout.duration / 60)}min ${fetchedWorkout.duration % 60}s`)
    console.log(`   Title: "${createdWorkout.title}" → "${fetchedWorkout.title}"`)
    
    // Step 4: Clean up by deleting the test workout
    console.log('\n🗑️ Step 4: Cleaning up test workout...')
    await client.deleteWorkout(updatedWorkout.id)
    console.log('✅ Test workout deleted successfully!')
    
    // Verify deletion
    try {
      const deletedWorkout = await client.getWorkoutById(updatedWorkout.id)
      if (deletedWorkout.publishState === 'archived') {
        console.log('✅ Confirmed: workout is now archived (soft-deleted)')
      } else {
        console.log('❌ Unexpected: workout still exists and not archived')
      }
    } catch (error) {
      console.log('✅ Confirmed: workout no longer exists')
    }
    
    console.log('\n🎉 Complete create, edit, and delete workflow completed!')
    
  } catch (e) {
    console.error('❌ Error:', e)
  }
}

createAndEditWorkout()