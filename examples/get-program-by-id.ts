import 'dotenv/config'
import TonalClient from '../src/index'

const getProgramById = async () => {
  try {
    const client = await TonalClient.create({
      username: process.env.TONAL_USERNAME!,
      password: process.env.TONAL_PASSWORD!,
    })

    // Example program ID from "House of Volume" program
    const programId = 'f243be64-76f2-4073-8ce7-8adb37657e9f'
    
    console.log(`🏋️ Fetching program details for ID: ${programId}...\n`)

    const program = await client.getProgramById(programId)

    console.log('📋 Program Overview:')
    console.log(`   Name: ${program.name}`)
    console.log(`   Level: ${program.level}`)
    console.log(`   Duration: ${program.weeks} weeks`)
    console.log(`   Workouts per week: ${program.workoutsPerWeek}`)
    console.log(`   Total workouts: ${program.workouts.length}`)
    console.log(`   Coach ID: ${program.coachId}`)
    console.log(`   Published: ${new Date(program.publishedAt).toLocaleDateString()}`)
    console.log()

    console.log('📝 Description:')
    console.log(`   ${program.description}`)
    console.log()

    // Show weekly cadence
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    console.log('📅 Weekly Schedule:')
    program.cadence.forEach((isWorkoutDay, index) => {
      const status = isWorkoutDay ? '🏋️ Workout Day' : '😴 Rest Day'
      console.log(`   ${days[index]}: ${status}`)
    })
    console.log()

    // Group workouts by week
    console.log('📊 Program Structure:')
    for (let week = 1; week <= program.weeks; week++) {
      const weekWorkouts = program.programWorkouts.filter(w => w.programWeek === week)
      console.log(`\n   Week ${week}:`)
      
      weekWorkouts.forEach(workout => {
        const durationMinutes = Math.round(workout.duration / 60)
        const dayName = days[workout.programDay - 1]
        console.log(`     Day ${workout.programDay} (${dayName}): ${workout.workoutTitle} - ${durationMinutes} min`)
      })
    }
    console.log()

    // Show target areas breakdown
    const targetAreas = program.workouts.map(w => w.targetArea)
    const targetAreaCounts = targetAreas.reduce((acc, area) => {
      acc[area] = (acc[area] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    console.log('🎯 Target Areas Distribution:')
    Object.entries(targetAreaCounts).forEach(([area, count]) => {
      console.log(`   ${area}: ${count} workouts`)
    })
    console.log()

    // Show muscle groups targeted
    const allMuscleGroups = program.workouts.flatMap(w => w.bodyRegions || [])
    const muscleGroupCounts = allMuscleGroups.reduce((acc, muscle) => {
      acc[muscle] = (acc[muscle] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    console.log('💪 Muscle Groups Targeted:')
    Object.entries(muscleGroupCounts)
      .sort(([,a], [,b]) => b - a)
      .forEach(([muscle, count]) => {
        console.log(`   ${muscle}: ${count} workouts`)
      })
    console.log()

    // Show required accessories
    const allAccessories = program.workouts.flatMap(w => w.accessories || [])
    const uniqueAccessories = [...new Set(allAccessories)]
    
    console.log('🛠️ Required Equipment:')
    uniqueAccessories.forEach(accessory => {
      const count = allAccessories.filter(a => a === accessory).length
      console.log(`   ${accessory}: Used in ${count} workouts`)
    })
    console.log()

    // Show training effect goals if available
    if (program.trainingEffectGoals && program.trainingEffectGoals.length > 0) {
      console.log('🎯 Training Effect Goals:')
      program.trainingEffectGoals.forEach(goal => {
        const percentage = Math.round(goal.score * 100)
        const status = goal.goalMet ? '✅ Met' : '❌ Not Met'
        console.log(`   Goal ${goal.goalID}: ${percentage}% ${status}`)
      })
      console.log()
    }

    // Program statistics
    const totalDuration = program.programWorkouts.reduce((sum, w) => sum + w.duration, 0)
    const avgWorkoutDuration = Math.round(totalDuration / program.programWorkouts.length / 60)
    const totalHours = Math.round(totalDuration / 3600)

    console.log('📈 Program Statistics:')
    console.log(`   Total program time: ${totalHours} hours`)
    console.log(`   Average workout duration: ${avgWorkoutDuration} minutes`)
    console.log(`   Supported devices: ${program.supportedDevices?.join(', ') || 'Not specified'}`)
    console.log(`   Mobile friendly: ${program.mobileFriendly ? 'Yes' : 'No'}`)
    console.log(`   Adjustable: ${program.isAdjustable ? 'Yes' : 'No'}`)

    // Show first few workout details as sample
    console.log('\n🔍 Sample Workout Details (First 3):')
    program.workouts.slice(0, 3).forEach((workout, index) => {
      const programWorkout = program.programWorkouts.find(pw => pw.workoutId === workout.id)
      console.log(`\n   ${index + 1}. ${workout.title} (Week ${programWorkout?.programWeek}, Day ${programWorkout?.programDay})`)
      console.log(`      Target: ${workout.targetArea}`)
      console.log(`      Duration: ${Math.round(workout.duration / 60)} minutes`)
      console.log(`      Movements: ${workout.movementIds?.length || 0}`)
      console.log(`      Body Regions: ${workout.bodyRegions?.join(', ') || 'Not specified'}`)
      if (workout.accessories && workout.accessories.length > 0) {
        console.log(`      Equipment: ${workout.accessories.join(', ')}`)
      }
    })

  } catch (error) {
    console.error('❌ Error fetching program details:', error)
  }
}

getProgramById()