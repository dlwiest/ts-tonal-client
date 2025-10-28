#!/usr/bin/env tsx

import 'dotenv/config'
import TonalClient from '../src/index'

async function main() {
  const client = await TonalClient.create({
    username: process.env.TONAL_USERNAME!,
    password: process.env.TONAL_PASSWORD!,
  })

  console.log('🏋️  Fetching workout activity history...\n')

  try {
    const activities = await client.getActivitySummaries()
    
    if (activities.length === 0) {
      console.log('No workout activities found.')
      return
    }

    // Sort by most recent first
    const sortedActivities = activities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )

    // Display totals first
    const totalWorkouts = activities.length
    const totalVolume = activities.reduce((sum, activity) => sum + activity.totalVolume, 0)
    const totalWork = activities.reduce((sum, activity) => sum + activity.totalWork, 0)
    const totalReps = activities.reduce((sum, activity) => sum + activity.totalReps, 0)
    const totalDuration = activities.reduce((sum, activity) => sum + activity.duration, 0)

    console.log('📊 Activity Summary Totals:')
    console.log(`   Total workouts: ${totalWorkouts.toLocaleString()}`)
    console.log(`   Total volume: ${totalVolume.toLocaleString()} lbs`)
    console.log(`   Total work: ${Math.round(totalWork).toLocaleString()} kJ`)
    console.log(`   Total reps: ${totalReps.toLocaleString()}`)
    console.log(`   Total time: ${Math.round(totalDuration / 3600)} hours\n`)

    // Workout pattern analysis
    const guidedWorkouts = activities.filter(a => a.isGuidedWorkout).length
    const freeLifts = activities.filter(a => !a.isGuidedWorkout).length
    const upperBodyWorkouts = activities.filter(a => a.targetArea === 'UPPER BODY').length
    const lowerBodyWorkouts = activities.filter(a => a.targetArea === 'LOWER BODY').length
    
    console.log('🎯 Workout Pattern Analysis:')
    console.log(`   Guided workouts: ${guidedWorkouts} (${Math.round(guidedWorkouts / totalWorkouts * 100)}%)`)
    console.log(`   Free lifts: ${freeLifts} (${Math.round(freeLifts / totalWorkouts * 100)}%)`)
    console.log(`   Upper body focus: ${upperBodyWorkouts} (${Math.round(upperBodyWorkouts / totalWorkouts * 100)}%)`)
    console.log(`   Lower body focus: ${lowerBodyWorkouts} (${Math.round(lowerBodyWorkouts / totalWorkouts * 100)}%)\n`)

    // Workout frequency analysis
    const firstWorkout = new Date(sortedActivities[sortedActivities.length - 1].timestamp)
    const lastWorkout = new Date(sortedActivities[0].timestamp)
    const daySpan = Math.ceil((lastWorkout.getTime() - firstWorkout.getTime()) / (1000 * 60 * 60 * 24))
    const averageFrequency = daySpan / totalWorkouts

    console.log('📅 Frequency Analysis:')
    console.log(`   Period: ${firstWorkout.toLocaleDateString()} to ${lastWorkout.toLocaleDateString()} (${daySpan} days)`)
    console.log(`   Average frequency: Every ${averageFrequency.toFixed(1)} days`)
    console.log(`   Workouts per week: ${(7 / averageFrequency).toFixed(1)}\n`)

    // Recent activity (last 10 workouts)
    console.log('🔥 Recent Activity (Last 10 Workouts):')
    const recentActivities = sortedActivities.slice(0, 10)
    
    recentActivities.forEach((activity, index) => {
      const date = new Date(activity.localTimestamp).toLocaleDateString()
      const duration = Math.round(activity.duration / 60) // Convert to minutes
      const volume = activity.totalVolume.toLocaleString()
      const workoutType = activity.isGuidedWorkout ? '🎯 Guided' : '🆓 Free Lift'
      const target = activity.targetArea ? `(${activity.targetArea})` : ''
      
      console.log(`   ${index + 1}. ${date} - ${activity.name} ${target}`)
      console.log(`      ${workoutType} • ${duration}min • ${volume} lbs • ${activity.totalReps} reps`)
    })

    // Performance trends (comparing first 10 vs last 10 workouts)
    if (activities.length >= 20) {
      console.log('\n📈 Performance Trends (First 10 vs Latest 10):')
      
      const first10 = sortedActivities.slice(-10)
      const latest10 = sortedActivities.slice(0, 10)
      
      const firstAvgVolume = first10.reduce((sum, a) => sum + a.totalVolume, 0) / 10
      const latestAvgVolume = latest10.reduce((sum, a) => sum + a.totalVolume, 0) / 10
      const volumeChange = ((latestAvgVolume - firstAvgVolume) / firstAvgVolume * 100)
      
      const firstAvgDuration = first10.reduce((sum, a) => sum + a.duration, 0) / 10 / 60
      const latestAvgDuration = latest10.reduce((sum, a) => sum + a.duration, 0) / 10 / 60
      const durationChange = ((latestAvgDuration - firstAvgDuration) / firstAvgDuration * 100)
      
      console.log(`   Average volume: ${firstAvgVolume.toFixed(0)} → ${latestAvgVolume.toFixed(0)} lbs (${volumeChange > 0 ? '+' : ''}${volumeChange.toFixed(1)}%)`)
      console.log(`   Average duration: ${firstAvgDuration.toFixed(0)} → ${latestAvgDuration.toFixed(0)} min (${durationChange > 0 ? '+' : ''}${durationChange.toFixed(1)}%)`)
    }

  } catch (error) {
    console.error('Failed to fetch activity summaries:', error)
  }
}

main().catch(console.error)