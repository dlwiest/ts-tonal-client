import 'dotenv/config'
import TonalClient from '../src/index'

const getTargetScores = async () => {
  try {
    const client = await TonalClient.create({
      username: process.env.TONAL_USERNAME!,
      password: process.env.TONAL_PASSWORD!,
    })

    console.log('🎯 Fetching target scores and goal metrics...\n')

    // Get target scores and goal metrics to provide context
    const [targetScores, goalMetrics] = await Promise.all([
      client.getTargetScores(),
      client.getGoalMetrics()
    ])

    // Create a map of metric ID to metric details
    const metricMap = goalMetrics.reduce((acc, metric) => {
      acc[metric.id] = metric
      return acc
    }, {} as Record<string, any>)

    console.log('📊 Weekly Target Scores by Metric:\n')

    // Process each metric
    Object.entries(targetScores).forEach(([metricId, weeklyTargets]) => {
      const metric = metricMap[metricId]
      if (!metric) {
        console.log(`❓ Unknown metric: ${metricId}`)
        return
      }

      console.log(`💪 ${metric.name}`)
      console.log(`   Description: ${metric.description}`)
      console.log(`   Recent Weekly Targets:`)

      // Sort by week number (most recent first) and show last 4 weeks
      const recentTargets = weeklyTargets
        .sort((a, b) => b.weekNumber - a.weekNumber)
        .slice(0, 4)

      recentTargets.forEach(target => {
        const year = Math.floor(target.weekNumber / 100)
        const week = target.weekNumber % 100
        const rangeWidth = target.highRange - target.lowRange
        const rangePercent = Math.round((rangeWidth / target.target) * 100)
        
        console.log(`     Week ${week}, ${year}: Target ${target.target} (Range: ${target.lowRange}-${target.highRange}, ±${rangePercent}%)`)
      })
      console.log()
    })

    // Show current week targets summary
    console.log('🎯 Current Week Target Summary:\n')
    
    // Get the most recent week for each metric
    const currentWeekTargets = Object.entries(targetScores).map(([metricId, weeklyTargets]) => {
      const mostRecent = weeklyTargets.sort((a, b) => b.weekNumber - a.weekNumber)[0]
      return {
        metricId,
        metric: metricMap[metricId],
        target: mostRecent
      }
    }).filter(item => item.metric)

    currentWeekTargets.forEach(({ metric, target }) => {
      const year = Math.floor(target.weekNumber / 100)
      const week = target.weekNumber % 100
      const flexibilityPercent = Math.round(((target.highRange - target.lowRange) / target.target) * 100)
      
      console.log(`${metric.name}:`)
      console.log(`   Target: ${target.target}`)
      console.log(`   Acceptable Range: ${target.lowRange} - ${target.highRange}`)
      console.log(`   Flexibility: ±${flexibilityPercent}% from target`)
      console.log(`   Week: ${week}/${year}`)
      console.log()
    })

    // Analyze target trends
    console.log('📈 Target Trends Analysis:\n')
    
    Object.entries(targetScores).forEach(([metricId, weeklyTargets]) => {
      const metric = metricMap[metricId]
      if (!metric) return

      // Sort by week number
      const sortedTargets = weeklyTargets.sort((a, b) => a.weekNumber - b.weekNumber)
      
      if (sortedTargets.length >= 2) {
        const firstTarget = sortedTargets[0].target
        const lastTarget = sortedTargets[sortedTargets.length - 1].target
        const change = lastTarget - firstTarget
        const changePercent = Math.round((change / firstTarget) * 100)
        
        let trend = '→'
        if (changePercent > 5) trend = '📈'
        else if (changePercent < -5) trend = '📉'
        
        console.log(`${metric.name}: ${trend} ${changePercent > 0 ? '+' : ''}${changePercent}% change`)
        console.log(`   From ${firstTarget} to ${lastTarget} over ${sortedTargets.length} weeks`)
      }
    })
    console.log()

    // Show metric categories by target range flexibility
    console.log('🔧 Target Flexibility by Metric:\n')
    
    const flexibilityAnalysis = currentWeekTargets.map(({ metric, target }) => {
      const flexibilityPercent = ((target.highRange - target.lowRange) / target.target) * 100
      return { metric: metric.name, flexibility: flexibilityPercent }
    }).sort((a, b) => b.flexibility - a.flexibility)

    flexibilityAnalysis.forEach(({ metric, flexibility }) => {
      const flexCategory = flexibility > 25 ? '🟢 High' : flexibility > 15 ? '🟡 Medium' : '🔴 Low'
      console.log(`   ${metric}: ${flexibility.toFixed(1)}% ${flexCategory}`)
    })
    console.log()

    // Weekly progression insights
    console.log('💡 Weekly Progression Insights:\n')
    
    Object.entries(targetScores).forEach(([metricId, weeklyTargets]) => {
      const metric = metricMap[metricId]
      if (!metric) return

      const sortedTargets = weeklyTargets.sort((a, b) => b.weekNumber - a.weekNumber)
      
      if (sortedTargets.length >= 3) {
        // Look at last 3 weeks to see progression pattern
        const last3 = sortedTargets.slice(0, 3).reverse() // oldest to newest
        const week1 = last3[0].target
        const week2 = last3[1].target
        const week3 = last3[2].target
        
        let pattern = 'Stable'
        if (week3 > week2 && week2 > week1) pattern = 'Increasing 📈'
        else if (week3 < week2 && week2 < week1) pattern = 'Decreasing 📉'
        else if (week3 > week1) pattern = 'Recovering 🔄'
        else if (week3 < week1) pattern = 'Deloading 📉'
        
        console.log(`${metric.name}: ${pattern}`)
        console.log(`   Recent targets: ${week1} → ${week2} → ${week3}`)
      }
    })

    // Show how target scores relate to goals
    console.log('\n🎯 Target Scores by Training Goal:\n')
    
    // Group by goal
    const goalGroups = currentWeekTargets.reduce((acc, { metric, target }) => {
      if (!acc[metric.goalId]) {
        acc[metric.goalId] = []
      }
      acc[metric.goalId].push({ metric, target })
      return acc
    }, {} as Record<string, any[]>)

    // We'd need to get training goals to show goal names, but we can show the grouping
    Object.entries(goalGroups).forEach(([goalId, metrics]) => {
      console.log(`Goal ${goalId}:`)
      metrics.forEach(({ metric, target }) => {
        console.log(`   • ${metric.name}: Target ${target.target}`)
      })
      console.log()
    })

  } catch (error) {
    console.error('❌ Error fetching target scores:', error)
  }
}

getTargetScores()