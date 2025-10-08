import 'dotenv/config'
import TonalClient from '../src/index'
import { TonalWorkoutEstimateSet } from '../src/types'

const estimateWorkout = async () => {
  try {
    const client = await TonalClient.create({
      username: process.env.TONAL_USERNAME!,
      password: process.env.TONAL_PASSWORD!,
    })
    
    // Example workout: 3 sets of 20 reps of Chest Press
    const sampleSets: TonalWorkoutEstimateSet[] = [
      {
        blockStart: true,
        movementId: "eb067021-46de-433c-9262-deea70debde2", // From your example
        prescribedReps: 20,
        dropSet: false,
        repetition: 1,
        repetitionTotal: 3,
        blockNumber: 1,
        burnout: false,
        spotter: true,
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
        prescribedReps: 20,
        dropSet: false,
        repetition: 2,
        repetitionTotal: 3,
        blockNumber: 1,
        burnout: false,
        spotter: true,
        eccentric: false,
        chains: false,
        flex: false,
        warmUp: false,
        weightPercentage: 100,
        setGroup: 1,
        round: 2,
        description: ""
      },
      {
        blockStart: false,
        movementId: "eb067021-46de-433c-9262-deea70debde2",
        prescribedReps: 20,
        dropSet: false,
        repetition: 3,
        repetitionTotal: 3,
        blockNumber: 1,
        burnout: false,
        spotter: true,
        eccentric: false,
        chains: false,
        flex: false,
        warmUp: false,
        weightPercentage: 100,
        setGroup: 1,
        round: 3,
        description: ""
      }
    ]
    
    console.log('Estimating workout duration...')
    console.log(`Sets: ${sampleSets.length}`)
    console.log(`Movement ID: ${sampleSets[0].movementId}`)
    console.log(`Reps per set: ${sampleSets[0].prescribedReps}`)
    
    const estimate = await client.estimateWorkoutDuration(sampleSets)
    
    const minutes = Math.floor(estimate.duration / 60)
    const seconds = estimate.duration % 60
    
    console.log(`\n⏱️  Estimated Duration: ${minutes}min ${seconds}s (${estimate.duration} seconds)`)
    
  } catch (e) {
    console.error(e)
  }
}

estimateWorkout()