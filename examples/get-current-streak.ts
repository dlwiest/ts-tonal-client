import 'dotenv/config'
import TonalClient from '../src/index'

const getCurrentStreak = async () => {
  try {
    const client = await TonalClient.create({
      username: process.env.TONAL_USERNAME!,
      password: process.env.TONAL_PASSWORD!,
    })

    console.log('🔥 Fetching current workout streak...\n')

    const streak = await client.getCurrentStreak()

    console.log('🏆 Current Streak Information:')
    console.log(`   Current Streak: ${streak.currentStreak} workouts`)
    
    const startDate = new Date(streak.currentStreakStartDate).toLocaleDateString()
    console.log(`   Started: ${startDate}`)
    
    const lastUpdated = new Date(streak.lastUpdatedWeek).toLocaleDateString()
    console.log(`   Last Updated: ${lastUpdated}`)
    console.log()

    console.log('🥇 Personal Best:')
    console.log(`   Best Streak: ${streak.maxStreak} workouts`)
    
    const maxStartDate = new Date(streak.maxStreakStartDate).toLocaleDateString()
    console.log(`   Achieved: ${maxStartDate}`)
    console.log()

    // Calculate progress towards personal best
    const progressPercentage = Math.round((streak.currentStreak / streak.maxStreak) * 100)
    console.log('📊 Streak Analysis:')
    console.log(`   Progress toward personal best: ${progressPercentage}%`)
    
    if (streak.currentStreak === 0) {
      console.log('   Status: Ready to start a new streak! 💪')
    } else if (streak.currentStreak === streak.maxStreak) {
      console.log('   Status: Tied your personal best! Keep going! 🚀')
    } else if (streak.currentStreak > streak.maxStreak) {
      console.log('   Status: NEW PERSONAL RECORD! Amazing! 🎉')
    } else {
      const remaining = streak.maxStreak - streak.currentStreak
      console.log(`   Workouts to tie personal best: ${remaining}`)
    }

    // Motivational messaging based on current streak
    console.log()
    console.log('💪 Motivation:')
    
    if (streak.currentStreak === 0) {
      console.log('   Every journey starts with a single workout!')
    } else if (streak.currentStreak === 1) {
      console.log('   Great start! One workout down, keep the momentum going!')
    } else if (streak.currentStreak < 5) {
      console.log('   You\'re building consistency! Each workout counts!')
    } else if (streak.currentStreak < 10) {
      console.log('   Excellent consistency! You\'re in the groove!')
    } else if (streak.currentStreak < 20) {
      console.log('   Outstanding dedication! You\'re crushing it!')
    } else {
      console.log('   Legendary streak! You\'re an inspiration!')
    }

    // Show days since streak started
    const streakStart = new Date(streak.currentStreakStartDate)
    const now = new Date()
    const daysSinceStart = Math.floor((now.getTime() - streakStart.getTime()) / (1000 * 60 * 60 * 24))
    
    if (streak.currentStreak > 0) {
      console.log()
      console.log('📅 Streak Timeline:')
      console.log(`   Days since streak started: ${daysSinceStart}`)
      
      if (daysSinceStart > 0) {
        const frequency = (streak.currentStreak / daysSinceStart * 100).toFixed(1)
        console.log(`   Workout frequency during streak: ${frequency}%`)
      }
    }

    console.log()
    console.log(`🔗 Last updated by workout: ${streak.updatedByActivityId}`)

  } catch (error) {
    console.error('❌ Error fetching current streak:', error)
  }
}

getCurrentStreak()