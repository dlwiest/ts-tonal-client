#!/usr/bin/env tsx

import 'dotenv/config'
import TonalClient from '../src/index'

async function main() {
  const client = await TonalClient.create({
    username: process.env.TONAL_USERNAME!,
    password: process.env.TONAL_PASSWORD!,
  })

  console.log('📅 Fetching home calendar and workout recommendations...\n')

  try {
    const calendar = await client.getHomeCalendar()
    
    if (calendar.dailySchedules.length === 0) {
      console.log('No calendar data available.')
      return
    }

    // Sort schedules by date
    const sortedSchedules = calendar.dailySchedules.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    // Separate completed workouts from recommendations
    const completedWorkouts = sortedSchedules.filter(schedule => 
      schedule.tiles.some(tile => tile.completed === true)
    )
    
    const upcomingRecommendations = sortedSchedules.filter(schedule => 
      schedule.tiles.some(tile => tile.completed !== true)
    )

    // Show completed workouts
    if (completedWorkouts.length > 0) {
      console.log('✅ Recent Completed Workouts:\n')
      
      completedWorkouts.forEach(schedule => {
        const date = new Date(schedule.date).toLocaleDateString()
        
        schedule.tiles.forEach(tile => {
          if (tile.completed) {
            const duration = Math.round(tile.duration / 60)
            const workoutIcon = getWorkoutIcon(tile.targetArea)
            
            console.log(`   ${workoutIcon} ${tile.title}`)
            console.log(`     Date: ${date}`)
            console.log(`     Duration: ${duration} minutes`)
            console.log(`     Target: ${tile.targetArea}`)
            
            // Show workout summary data if available
            if (tile.workoutSummaryData) {
              const summary = tile.workoutSummaryData
              console.log(`     Volume: ${summary.volume.toLocaleString()} lbs`)
              console.log(`     Work: ${Math.round(summary.work).toLocaleString()} kJ`)
              
              // Show top muscle groups utilized
              const topMuscles = summary.muscleUtilization
                .sort((a, b) => b.value - a.value)
                .slice(0, 3)
                .map(muscle => `${muscle.muscleGroup} (${muscle.value}%)`)
                .join(', ')
              
              console.log(`     Top muscles: ${topMuscles}`)
            }
            console.log()
          }
        })
      })
    }

    // Group by recommendation type (declare outside the if block)
    const recommendationGroups = upcomingRecommendations.reduce((acc, schedule) => {
      if (schedule.recommendationType) {
        const category = schedule.recommendationType
        if (!acc[category]) {
          acc[category] = []
        }
        acc[category].push(schedule)
      }
      return acc
    }, {} as Record<string, typeof upcomingRecommendations>)

    // Show upcoming recommendations by category
    if (upcomingRecommendations.length > 0) {
      console.log('🎯 Upcoming Workout Recommendations:\n')

      // Display each recommendation category
      Object.entries(recommendationGroups).forEach(([category, schedules]) => {
        const categoryIcon = getRecommendationIcon(category)
        const categoryName = formatCategoryName(category)
        
        console.log(`${categoryIcon} ${categoryName}:\n`)
        
        schedules.forEach(schedule => {
          const date = new Date(schedule.date).toLocaleDateString()
          
          schedule.tiles.forEach(tile => {
            if (!tile.completed) {
              const duration = Math.round(tile.duration / 60)
              const workoutIcon = getWorkoutIcon(tile.targetArea)
              const level = tile.level ? ` (${tile.level})` : ''
              
              console.log(`   ${workoutIcon} ${tile.title}${level}`)
              console.log(`     Date: ${date}`)
              console.log(`     Duration: ${duration} minutes`)
              console.log(`     Target: ${tile.targetArea}`)
              
              if (tile.accessories && tile.accessories.length > 0) {
                console.log(`     Equipment: ${tile.accessories.join(', ')}`)
              }
              
              console.log()
            }
          })
        })
      })
    }

    // Calendar analytics
    console.log('📊 Calendar Analytics:\n')
    
    // Workout frequency analysis
    const totalWorkouts = completedWorkouts.reduce((sum, schedule) => 
      sum + schedule.tiles.filter(tile => tile.completed).length, 0
    )
    
    console.log(`   Recent completed workouts: ${totalWorkouts}`)
    
    // Target area distribution
    const targetAreas = completedWorkouts.flatMap(schedule => 
      schedule.tiles.filter(tile => tile.completed).map(tile => tile.targetArea)
    )
    
    const targetDistribution = targetAreas.reduce((acc, area) => {
      acc[area] = (acc[area] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    if (Object.keys(targetDistribution).length > 0) {
      console.log('\n   Target area distribution:')
      Object.entries(targetDistribution)
        .sort(([,a], [,b]) => b - a)
        .forEach(([area, count]) => {
          const percentage = Math.round((count / totalWorkouts) * 100)
          console.log(`     ${area}: ${count} workouts (${percentage}%)`)
        })
    }

    // Average workout duration
    const completedTiles = completedWorkouts.flatMap(schedule => 
      schedule.tiles.filter(tile => tile.completed)
    )
    
    if (completedTiles.length > 0) {
      const avgDuration = completedTiles.reduce((sum, tile) => sum + tile.duration, 0) / completedTiles.length
      console.log(`\n   Average workout duration: ${Math.round(avgDuration / 60)} minutes`)
    }

    // Recommendation variety
    const recommendationTypes = Object.keys(recommendationGroups)
    if (recommendationTypes.length > 0) {
      console.log(`\n   Available recommendation categories: ${recommendationTypes.length}`)
      console.log(`   Categories: ${recommendationTypes.map(formatCategoryName).join(', ')}`)
    }

  } catch (error) {
    console.error('Failed to fetch home calendar:', error)
  }
}

function getWorkoutIcon(targetArea: string): string {
  switch (targetArea.toUpperCase()) {
    case 'UPPER BODY': return '💪'
    case 'LOWER BODY': return '🦵'
    case 'FULL BODY': return '🏋️'
    case 'CORE': return '⚡'
    default: return '🎯'
  }
}

function getRecommendationIcon(category: string): string {
  switch (category.toUpperCase()) {
    case 'GOAL': return '🎯'
    case 'QUICK': return '⚡'
    case 'TRENDING': return '📈'
    case 'NEWEST': return '✨'
    case 'FEATURED': return '⭐'
    case 'STRENGTH': return '💪'
    default: return '📋'
  }
}

function formatCategoryName(category: string): string {
  switch (category.toUpperCase()) {
    case 'GOAL': return 'Goal-Based Recommendations'
    case 'QUICK': return 'Quick Workouts'
    case 'TRENDING': return 'Trending Workouts'
    case 'NEWEST': return 'Newest Workouts'
    case 'FEATURED': return 'Featured Workouts'
    case 'STRENGTH': return 'Strength Training'
    default: return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()
  }
}

main().catch(console.error)