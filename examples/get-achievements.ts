#!/usr/bin/env tsx

import 'dotenv/config'
import TonalClient from '../src/index'

async function main() {
  const client = await TonalClient.create({
    username: process.env.TONAL_USERNAME!,
    password: process.env.TONAL_PASSWORD!,
  })

  console.log('🏆 Fetching earned achievement history...\n')

  try {
    const achievements = await client.getAchievements()
    
    if (achievements.length === 0) {
      console.log('No achievements earned yet. Keep working out to unlock your first achievement!')
      return
    }

    // Sort by most recent first
    const sortedAchievements = achievements.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    console.log(`🎖️  Total Achievements Earned: ${achievements.length}\n`)

    // Categorize achievements by type
    const achievementsByCategory = sortedAchievements.reduce((acc, achievement) => {
      const categoryName = achievement.achievement.achievementCategory.name
      if (!acc[categoryName]) {
        acc[categoryName] = []
      }
      acc[categoryName].push(achievement)
      return acc
    }, {} as Record<string, typeof sortedAchievements>)

    // Display achievements by category
    Object.entries(achievementsByCategory).forEach(([categoryName, categoryAchievements]) => {
      const categoryIcon = getCategoryIcon(categoryName)
      console.log(`${categoryIcon} ${categoryName} (${categoryAchievements.length}):\n`)
      
      categoryAchievements.forEach((achievement, index) => {
        const earnedDate = new Date(achievement.localTimestamp).toLocaleDateString()
        const achievementIcon = getAchievementIcon(achievement.name)
        
        console.log(`   ${achievementIcon} ${achievement.name}`)
        console.log(`     ${achievement.shortDescription}`)
        console.log(`     Earned: ${earnedDate}`)
        
        // Show value for milestone achievements
        if (achievement.achievement.value !== null) {
          console.log(`     Target: ${achievement.achievement.value.toLocaleString()}`)
        }
        
        // Show associated workout if available
        if (achievement.workoutActivityId) {
          console.log(`     Triggered by workout: ${achievement.workoutActivityId.substring(0, 8)}...`)
        }
        
        if (index < categoryAchievements.length - 1) console.log()
      })
      console.log()
    })

    // Achievement timeline (recent achievements)
    console.log('📅 Recent Achievement Timeline (Last 10):\n')
    const recentAchievements = sortedAchievements.slice(0, 10)
    
    recentAchievements.forEach((achievement, index) => {
      const earnedDate = new Date(achievement.localTimestamp).toLocaleDateString()
      const earnedTime = new Date(achievement.localTimestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      const achievementIcon = getAchievementIcon(achievement.name)
      
      console.log(`   ${index + 1}. ${earnedDate} at ${earnedTime}`)
      console.log(`      ${achievementIcon} ${achievement.name}`)
      console.log(`      "${achievement.shortDescription}"`)
    })

    // Achievement analytics
    console.log('\n📊 Achievement Analytics:\n')
    
    // Achievements by year
    const achievementsByYear = sortedAchievements.reduce((acc, achievement) => {
      const year = new Date(achievement.createdAt).getFullYear()
      acc[year] = (acc[year] || 0) + 1
      return acc
    }, {} as Record<number, number>)

    console.log('   Achievements by year:')
    Object.entries(achievementsByYear)
      .sort(([a], [b]) => parseInt(b) - parseInt(a))
      .forEach(([year, count]) => {
        console.log(`     ${year}: ${count} achievements`)
      })

    // Most productive periods
    const achievementsByMonth = sortedAchievements.reduce((acc, achievement) => {
      const monthYear = new Date(achievement.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
      acc[monthYear] = (acc[monthYear] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const topMonths = Object.entries(achievementsByMonth)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)

    if (topMonths.length > 0) {
      console.log('\n   Most productive months:')
      topMonths.forEach(([month, count], index) => {
        console.log(`     ${index + 1}. ${month}: ${count} achievements`)
      })
    }

    // Achievement streak analysis
    const streakAchievements = achievements.filter(a => a.name.includes('Streak'))
    const volumeAchievements = achievements.filter(a => a.name.includes('lbs') || a.name.includes('Million'))
    const workoutAchievements = achievements.filter(a => a.name.includes('Workouts'))

    console.log('\n   Achievement progress:')
    if (streakAchievements.length > 0) {
      const latestStreak = streakAchievements[0]
      console.log(`     🔥 Latest streak milestone: ${latestStreak.name}`)
    }
    if (volumeAchievements.length > 0) {
      const latestVolume = volumeAchievements[0]
      console.log(`     💪 Latest volume milestone: ${latestVolume.name}`)
    }
    if (workoutAchievements.length > 0) {
      const latestWorkout = workoutAchievements[0]
      console.log(`     🏋️ Latest workout milestone: ${latestWorkout.name}`)
    }

  } catch (error) {
    console.error('Failed to fetch achievements:', error)
  }
}

function getCategoryIcon(categoryName: string): string {
  switch (categoryName.toLowerCase()) {
    case 'badges': return '🏅'
    case 'volume milestone': return '💪'
    case 'workout milestone': return '🏋️'
    case 'streak milestone': return '🔥'
    case 'weekly target milestone': return '🎯'
    case 'new user badge': return '🌟'
    default: return '🏆'
  }
}

function getAchievementIcon(achievementName: string): string {
  if (achievementName.includes('Million') || achievementName.includes('lbs')) return '💪'
  if (achievementName.includes('Workout')) return '🏋️'
  if (achievementName.includes('Streak') || achievementName.includes('Week')) return '🔥'
  if (achievementName.includes('Target')) return '🎯'
  if (achievementName.includes('Stronger')) return '💥'
  if (achievementName.includes('Friday')) return '🍀'
  if (achievementName.includes('Birthday') || achievementName.includes('Cake')) return '🎂'
  if (achievementName.includes('Firecracker') || achievementName.includes('July')) return '🎆'
  if (achievementName.includes('Night') || achievementName.includes('Owl')) return '🦉'
  if (achievementName.includes('Custom') || achievementName.includes('DIY')) return '🔧'
  if (achievementName.includes('Goal')) return '🎯'
  if (achievementName.includes('Starting') || achievementName.includes('Assessment')) return '📏'
  if (achievementName.includes('Habit') || achievementName.includes('Healthy')) return '💚'
  return '🏆'
}

main().catch(console.error)