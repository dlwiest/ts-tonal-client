#!/usr/bin/env tsx

import 'dotenv/config'
import TonalClient from '../src/index'

async function main() {
  const client = await TonalClient.create({
    username: process.env.TONAL_USERNAME!,
    password: process.env.TONAL_PASSWORD!,
  })

  console.log('🏆 Fetching achievement statistics and upcoming milestones...\n')

  try {
    const achievementStats = await client.getAchievementStats()
    
    // Total achievements earned
    console.log('🎖️  Achievement Summary:')
    console.log(`   Total achievements earned: ${achievementStats.totalAchievements}`)
    console.log(`   Upcoming milestones: ${achievementStats.nextMilestones.length}\n`)

    if (achievementStats.nextMilestones.length === 0) {
      console.log('🎯 No upcoming milestones found. You might have achieved all available goals!')
      return
    }

    // Categorize milestones by type
    const milestonesByCategory = achievementStats.nextMilestones.reduce((acc, milestone) => {
      const categoryId = milestone.achievementCategoryId
      if (!acc[categoryId]) {
        acc[categoryId] = []
      }
      acc[categoryId].push(milestone)
      return acc
    }, {} as Record<string, typeof achievementStats.nextMilestones>)

    console.log('🎯 Next Milestones to Achieve:\n')

    // Determine category names based on milestone names and values
    Object.entries(milestonesByCategory).forEach(([categoryId, milestones]) => {
      // Infer category name from milestone names
      const sampleMilestone = milestones[0]
      let categoryName = 'Unknown Category'
      
      if (sampleMilestone.name.includes('Workout')) {
        categoryName = '🏋️  Workout Milestones'
      } else if (sampleMilestone.name.includes('lbs') || sampleMilestone.name.includes('Million')) {
        categoryName = '💪 Volume Milestones'
      } else if (sampleMilestone.name.includes('Streak') || sampleMilestone.name.includes('Week')) {
        categoryName = '🔥 Streak Milestones'
      } else if (sampleMilestone.name.includes('Target')) {
        categoryName = '🎯 Weekly Target Milestones'
      }

      console.log(`${categoryName}:`)
      
      milestones.forEach((milestone, index) => {
        const icon = getAchievementIcon(milestone.name)
        console.log(`   ${icon} ${milestone.name}`)
        console.log(`     ${milestone.shortDescription}`)
        console.log(`     Target: ${milestone.value.toLocaleString()}`)
        
        if (milestone.description !== milestone.shortDescription) {
          console.log(`     "${milestone.description}"`)
        }
        
        if (index < milestones.length - 1) console.log()
      })
      console.log()
    })

    // Show progress motivation
    console.log('💡 Progress Tips:')
    
    const workoutMilestones = achievementStats.nextMilestones.filter(m => 
      m.name.includes('Workout') || m.name.includes('workout')
    )
    
    const volumeMilestones = achievementStats.nextMilestones.filter(m => 
      m.name.includes('lbs') || m.name.includes('Million')
    )
    
    const streakMilestones = achievementStats.nextMilestones.filter(m => 
      m.name.includes('Streak') || m.name.includes('Week')
    )

    if (workoutMilestones.length > 0) {
      const nextWorkoutMilestone = workoutMilestones[0]
      console.log(`   🏋️  Keep showing up! ${nextWorkoutMilestone.value - achievementStats.totalAchievements} more workouts to unlock "${nextWorkoutMilestone.name}"`)
    }

    if (volumeMilestones.length > 0) {
      const nextVolumeMilestone = volumeMilestones[0]
      console.log(`   💪 Keep lifting heavy! Working toward ${nextVolumeMilestone.value.toLocaleString()} lbs total volume`)
    }

    if (streakMilestones.length > 0) {
      const nextStreakMilestone = streakMilestones[0]
      console.log(`   🔥 Stay consistent! Target ${nextStreakMilestone.value} weeks of regular workouts`)
    }

  } catch (error) {
    console.error('Failed to fetch achievement statistics:', error)
  }
}

function getAchievementIcon(achievementName: string): string {
  if (achievementName.includes('Workout')) return '🏋️'
  if (achievementName.includes('Million') || achievementName.includes('lbs')) return '💪'
  if (achievementName.includes('Streak') || achievementName.includes('Week')) return '🔥'
  if (achievementName.includes('Target')) return '🎯'
  return '🏆'
}

main().catch(console.error)