#!/usr/bin/env tsx

import 'dotenv/config'
import TonalClient from '../src/index'

async function main() {
  const client = await TonalClient.create({
    username: process.env.TONAL_USERNAME!,
    password: process.env.TONAL_PASSWORD!,
  })

  console.log('📊 Fetching lifetime user statistics...\n')

  try {
    const stats = await client.getUserStatistics()
    
    // Volume Statistics
    console.log('🏋️  Volume Statistics:')
    console.log(`   Total volume lifted: ${stats.volume.total.toLocaleString()} lbs`)
    console.log(`   Average per workout: ${stats.volume.avgVolumePerWorkout.toLocaleString()} lbs`)
    console.log(`   Average per week: ${stats.volume.avgVolumePerWeek.toLocaleString()} lbs`)
    console.log(`   Personal best workout: ${stats.volume.maxVolumeInWorkout.toLocaleString()} lbs`)
    console.log(`   Personal best week: ${stats.volume.maxVolumeInAWeek.toLocaleString()} lbs\n`)

    // Workout Statistics  
    console.log('⏱️  Workout Statistics:')
    console.log(`   Total workouts: ${stats.workouts.total.toLocaleString()}`)
    console.log(`   Total time: ${Math.round(stats.workouts.totalDuration / 3600).toLocaleString()} hours`)
    console.log(`   Average duration: ${Math.round(stats.workouts.avgWorkoutDuration / 60)} minutes`)
    console.log(`   Longest workout: ${Math.round(stats.workouts.maxWorkoutDuration / 60)} minutes`)
    console.log(`   Total time under tension: ${Math.round(stats.workouts.totalTimeUnderTension / 60).toLocaleString()} minutes`)
    console.log(`   Average workouts per week: ${stats.workouts.avgWorkoutsPerWeek}`)
    console.log(`   Most workouts in a week: ${stats.workouts.maxWorkoutsPerWeek}\n`)

    // Workout Type Breakdown
    console.log('🎯 Workout Type Breakdown:')
    const guidedWorkouts = stats.workouts.totalCustomWorkouts
    const freeLifts = stats.workouts.totalFreeliftWorkouts
    const totalWorkouts = stats.workouts.total
    
    console.log(`   Guided workouts: ${guidedWorkouts.toLocaleString()} (${Math.round(guidedWorkouts / totalWorkouts * 100)}%)`)
    console.log(`   Free lifts: ${freeLifts.toLocaleString()} (${Math.round(freeLifts / totalWorkouts * 100)}%)`)
    
    // Calculate other workouts (if any don't fall into guided/free lift categories)
    const accountedWorkouts = guidedWorkouts + freeLifts
    if (accountedWorkouts < totalWorkouts) {
      const otherWorkouts = totalWorkouts - accountedWorkouts
      console.log(`   Other workouts: ${otherWorkouts.toLocaleString()} (${Math.round(otherWorkouts / totalWorkouts * 100)}%)`)
    }
    console.log()

    // Movement Diversity
    console.log('🤸 Movement Diversity:')
    console.log(`   Unique movements performed: ${stats.movements.total.toLocaleString()}`)
    console.log(`   Movement variety: ${(stats.movements.total / stats.workouts.total).toFixed(1)} unique movements per workout on average\n`)

    // Programs Statistics
    console.log('📋 Programs Statistics:')
    console.log(`   Programs participated in: ${stats.programs.total}`)
    if (stats.programs.totalProgramWorkouts > 0) {
      console.log(`   Program workouts completed: ${stats.programs.totalProgramWorkouts.toLocaleString()}`)
      console.log(`   Volume from programs: ${stats.programs.totalProgramVolume.toLocaleString()} lbs`)
      console.log(`   Program workout time: ${Math.round(stats.programs.totalDuration / 3600)} hours`)
      
      const programWorkoutPercentage = (stats.programs.totalProgramWorkouts / stats.workouts.total * 100)
      const programVolumePercentage = (stats.programs.totalProgramVolume / stats.volume.total * 100)
      
      console.log(`   Program workout ratio: ${programWorkoutPercentage.toFixed(1)}% of all workouts`)
      console.log(`   Program volume ratio: ${programVolumePercentage.toFixed(1)}% of total volume`)
    } else {
      console.log(`   No program workouts completed`)
    }
    console.log()

    // Efficiency & Performance Metrics
    console.log('⚡ Efficiency & Performance Metrics:')
    const avgVolumePerMinute = stats.volume.total / (stats.workouts.totalDuration / 60)
    const avgTimeUnderTensionPerWorkout = stats.workouts.totalTimeUnderTension / stats.workouts.total
    const avgTimeUnderTensionPerMinute = (stats.workouts.totalTimeUnderTension / 60) / (stats.workouts.totalDuration / 60)
    
    console.log(`   Volume per minute: ${avgVolumePerMinute.toFixed(1)} lbs/min`)
    console.log(`   Time under tension per workout: ${Math.round(avgTimeUnderTensionPerWorkout)} seconds`)
    console.log(`   Time under tension efficiency: ${(avgTimeUnderTensionPerMinute * 100).toFixed(1)}% of workout time\n`)

    // Key Achievements & Milestones
    console.log('🏆 Key Achievements & Milestones:')
    
    // Volume milestones
    const volumeMilestones = [
      { threshold: 1000000, label: '1 Million lbs' },
      { threshold: 500000, label: '500K lbs' },
      { threshold: 250000, label: '250K lbs' },
      { threshold: 100000, label: '100K lbs' },
      { threshold: 50000, label: '50K lbs' }
    ]
    
    const achievedVolumeMilestone = volumeMilestones.find(m => stats.volume.total >= m.threshold)
    if (achievedVolumeMilestone) {
      console.log(`   ✅ Volume milestone: ${achievedVolumeMilestone.label} achieved!`)
    }
    
    // Workout count milestones
    const workoutMilestones = [
      { threshold: 1000, label: '1,000 workouts' },
      { threshold: 500, label: '500 workouts' },
      { threshold: 250, label: '250 workouts' },
      { threshold: 100, label: '100 workouts' }
    ]
    
    const achievedWorkoutMilestone = workoutMilestones.find(m => stats.workouts.total >= m.threshold)
    if (achievedWorkoutMilestone) {
      console.log(`   ✅ Workout milestone: ${achievedWorkoutMilestone.label} achieved!`)
    }
    
    // Time milestones (in hours)
    const totalHours = Math.round(stats.workouts.totalDuration / 3600)
    const timeMilestones = [
      { threshold: 1000, label: '1,000 hours' },
      { threshold: 500, label: '500 hours' },
      { threshold: 250, label: '250 hours' },
      { threshold: 100, label: '100 hours' }
    ]
    
    const achievedTimeMilestone = timeMilestones.find(m => totalHours >= m.threshold)
    if (achievedTimeMilestone) {
      console.log(`   ✅ Time milestone: ${achievedTimeMilestone.label} achieved!`)
    }

  } catch (error) {
    console.error('Failed to fetch user statistics:', error)
  }
}

main().catch(console.error)