import 'dotenv/config'
import TonalClient from '../src/index'

const getMuscleReadiness = async () => {
  try {
    const client = await TonalClient.create({
      username: process.env.TONAL_USERNAME!,
      password: process.env.TONAL_PASSWORD!,
    })

    console.log('💪 Fetching muscle readiness...\n')

    const readiness = await client.getMuscleReadiness()

    console.log('🎯 Current Muscle Readiness:\n')

    // Group muscles by body region for better visualization
    const upperBody = {
      'Chest': readiness.Chest,
      'Shoulders': readiness.Shoulders,
      'Back': readiness.Back,
      'Triceps': readiness.Triceps,
      'Biceps': readiness.Biceps,
    }

    const core = {
      'Abs': readiness.Abs,
      'Obliques': readiness.Obliques,
    }

    const lowerBody = {
      'Quads': readiness.Quads,
      'Glutes': readiness.Glutes,
      'Hamstrings': readiness.Hamstrings,
      'Calves': readiness.Calves,
    }

    // Function to get readiness status and color
    const getReadinessStatus = (percentage: number) => {
      if (percentage >= 80) return '🟢 Fully Ready'
      if (percentage >= 60) return '🟡 Moderately Ready'
      if (percentage >= 40) return '🟠 Needs Recovery'
      return '🔴 Requires Rest'
    }

    // Display upper body readiness
    console.log('💪 Upper Body:')
    Object.entries(upperBody).forEach(([muscle, percentage]) => {
      const status = getReadinessStatus(percentage)
      console.log(`   ${muscle.padEnd(12)} ${percentage.toString().padStart(3)}% ${status}`)
    })
    console.log()

    // Display core readiness
    console.log('🏋️ Core:')
    Object.entries(core).forEach(([muscle, percentage]) => {
      const status = getReadinessStatus(percentage)
      console.log(`   ${muscle.padEnd(12)} ${percentage.toString().padStart(3)}% ${status}`)
    })
    console.log()

    // Display lower body readiness
    console.log('🦵 Lower Body:')
    Object.entries(lowerBody).forEach(([muscle, percentage]) => {
      const status = getReadinessStatus(percentage)
      console.log(`   ${muscle.padEnd(12)} ${percentage.toString().padStart(3)}% ${status}`)
    })
    console.log()

    // Calculate overall readiness metrics
    const allMuscles = Object.values(readiness)
    const averageReadiness = Math.round(allMuscles.reduce((sum, val) => sum + val, 0) / allMuscles.length)
    const lowestReadiness = Math.min(...allMuscles)
    const highestReadiness = Math.max(...allMuscles)

    // Find which muscles are at lowest and highest readiness
    const lowestMuscles = Object.entries(readiness).filter(([_, percentage]) => percentage === lowestReadiness).map(([muscle]) => muscle)
    const highestMuscles = Object.entries(readiness).filter(([_, percentage]) => percentage === highestReadiness).map(([muscle]) => muscle)

    console.log('📊 Readiness Summary:')
    console.log(`   Average Readiness: ${averageReadiness}% ${getReadinessStatus(averageReadiness)}`)
    console.log(`   Lowest Readiness:  ${lowestReadiness}% (${lowestMuscles.join(', ')})`)
    console.log(`   Highest Readiness: ${highestReadiness}% (${highestMuscles.join(', ')})`)
    console.log()

    // Provide workout recommendations based on readiness
    console.log('🎯 Workout Recommendations:')
    
    const fullyReadyMuscles = Object.entries(readiness).filter(([_, percentage]) => percentage >= 80).map(([muscle]) => muscle)
    const needsRecoveryMuscles = Object.entries(readiness).filter(([_, percentage]) => percentage < 60).map(([muscle]) => muscle)

    if (fullyReadyMuscles.length > 0) {
      console.log(`   ✅ Focus on: ${fullyReadyMuscles.join(', ')}`)
    }

    if (needsRecoveryMuscles.length > 0) {
      console.log(`   ⚠️  Avoid heavy training: ${needsRecoveryMuscles.join(', ')}`)
      console.log('   💆 Consider recovery activities like stretching, mobility work, or light cardio')
    }

    if (averageReadiness >= 80) {
      console.log('   🚀 Great day for an intense full-body workout!')
    } else if (averageReadiness >= 60) {
      console.log('   💪 Good day for a moderate workout focusing on ready muscle groups')
    } else {
      console.log('   🧘 Consider a recovery day with light movement and stretching')
    }

    // Show training type recommendations based on readiness patterns
    console.log()
    console.log('🏋️ Training Type Suggestions:')
    
    const upperReadiness = (upperBody.Chest + upperBody.Shoulders + upperBody.Back + upperBody.Triceps + upperBody.Biceps) / 5
    const lowerReadiness = (lowerBody.Quads + lowerBody.Glutes + lowerBody.Hamstrings + lowerBody.Calves) / 4
    const coreReadiness = (core.Abs + core.Obliques) / 2

    if (upperReadiness >= 70 && lowerReadiness < 60) {
      console.log('   🎯 Upper body focus day - chest, back, arms')
    } else if (lowerReadiness >= 70 && upperReadiness < 60) {
      console.log('   🎯 Lower body focus day - legs and glutes')
    } else if (coreReadiness >= 80) {
      console.log('   🎯 Great day to include core-intensive exercises')
    } else if (averageReadiness < 60) {
      console.log('   🎯 Active recovery - yoga, mobility, or light cardio')
    } else {
      console.log('   🎯 Balanced full-body workout with moderate intensity')
    }

  } catch (error) {
    console.error('❌ Error fetching muscle readiness:', error)
  }
}

getMuscleReadiness()