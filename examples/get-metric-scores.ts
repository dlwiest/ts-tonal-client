import 'dotenv/config'
import TonalClient from '../src/index'

const getMetricScores = async () => {
  try {
    const client = await TonalClient.create({
      username: process.env.TONAL_USERNAME!,
      password: process.env.TONAL_PASSWORD!,
    })

    console.log('📊 Fetching metric scores, targets, and goal metrics...\n')

    // Get all data needed for comprehensive analysis
    const [metricScores, targetScores, goalMetrics] = await Promise.all([
      client.getMetricScores(), // Gets all historical scores
      client.getTargetScores(), // Gets target ranges
      client.getGoalMetrics()   // Gets metric names and descriptions
    ])

    // Create metric lookup map
    const metricMap = goalMetrics.reduce((acc, metric) => {
      acc[metric.id] = metric
      return acc
    }, {} as Record<string, any>)

    console.log('🎯 Performance vs Targets Analysis:\n')

    // Compare current week performance vs targets
    Object.entries(metricScores).forEach(([metricId, scores]) => {
      const metric = metricMap[metricId]
      const targets = targetScores[metricId]
      
      if (!metric || !targets) return

      // Get most recent score and target
      const latestScore = scores.sort((a, b) => b.weekNumber - a.weekNumber)[0]
      const latestTarget = targets.sort((a, b) => b.weekNumber - a.weekNumber)[0]
      
      if (!latestScore || !latestTarget) return

      const year = Math.floor(latestScore.weekNumber / 100)
      const week = latestScore.weekNumber % 100
      const achievementPercent = Math.round((latestScore.score / latestTarget.target) * 100)
      
      // Determine performance status
      let status = '✅ Target Met'
      let statusColor = 'green'
      if (latestScore.score < latestTarget.lowRange) {
        status = '🔴 Below Range'
        statusColor = 'red'
      } else if (latestScore.score > latestTarget.highRange) {
        status = '🚀 Exceeded Range'
        statusColor = 'blue'
      } else if (latestScore.score < latestTarget.target) {
        status = '🟡 Below Target'
        statusColor = 'yellow'
      }

      console.log(`💪 ${metric.name} (Week ${week}/${year}):`)
      console.log(`   Target: ${latestTarget.target} | Actual: ${latestScore.score} | Achievement: ${achievementPercent}%`)
      console.log(`   Range: ${latestTarget.lowRange} - ${latestTarget.highRange} | Status: ${status}`)
      console.log()
    })

    // Weekly trend analysis - last 4 weeks
    console.log('📈 4-Week Performance Trends:\n')
    
    Object.entries(metricScores).forEach(([metricId, scores]) => {
      const metric = metricMap[metricId]
      if (!metric) return

      // Get last 4 weeks of data
      const recentScores = scores
        .sort((a, b) => b.weekNumber - a.weekNumber)
        .slice(0, 4)
        .reverse() // oldest to newest for trend analysis

      if (recentScores.length < 2) return

      console.log(`📊 ${metric.name}:`)
      console.log(`   Recent scores: ${recentScores.map(s => s.score.toFixed(1)).join(' → ')}`)
      
      // Calculate trend
      const firstScore = recentScores[0].score
      const lastScore = recentScores[recentScores.length - 1].score
      const change = lastScore - firstScore
      const changePercent = Math.round((change / firstScore) * 100)
      
      let trendEmoji = '→'
      if (changePercent > 10) trendEmoji = '📈'
      else if (changePercent < -10) trendEmoji = '📉'
      
      console.log(`   Trend: ${trendEmoji} ${changePercent > 0 ? '+' : ''}${changePercent}% over ${recentScores.length} weeks`)
      console.log()
    })

    // Goal achievement summary
    console.log('🏆 Goal Achievement Summary:\n')
    
    const currentWeekAnalysis = Object.entries(metricScores).map(([metricId, scores]) => {
      const metric = metricMap[metricId]
      const targets = targetScores[metricId]
      
      if (!metric || !targets) return null

      const latestScore = scores.sort((a, b) => b.weekNumber - a.weekNumber)[0]
      const latestTarget = targets.sort((a, b) => b.weekNumber - a.weekNumber)[0]
      
      if (!latestScore || !latestTarget) return null

      const inRange = latestScore.score >= latestTarget.lowRange && latestScore.score <= latestTarget.highRange
      const metTarget = latestScore.score >= latestTarget.target
      const exceededRange = latestScore.score > latestTarget.highRange
      
      return {
        metric: metric.name,
        inRange,
        metTarget,
        exceededRange,
        achievementPercent: (latestScore.score / latestTarget.target) * 100
      }
    }).filter((item): item is NonNullable<typeof item> => item !== null)

    const totalMetrics = currentWeekAnalysis.length
    const metricsInRange = currentWeekAnalysis.filter(m => m.inRange).length
    const metricsMetTarget = currentWeekAnalysis.filter(m => m.metTarget).length
    const metricsExceeded = currentWeekAnalysis.filter(m => m.exceededRange).length

    console.log(`Metrics in acceptable range: ${metricsInRange}/${totalMetrics} (${Math.round(metricsInRange/totalMetrics*100)}%)`)
    console.log(`Metrics meeting target: ${metricsMetTarget}/${totalMetrics} (${Math.round(metricsMetTarget/totalMetrics*100)}%)`)
    console.log(`Metrics exceeding range: ${metricsExceeded}/${totalMetrics} (${Math.round(metricsExceeded/totalMetrics*100)}%)`)
    console.log()

    // Best and worst performing metrics
    const sortedByAchievement = currentWeekAnalysis.sort((a, b) => b.achievementPercent - a.achievementPercent)
    
    console.log('🏅 Best Performing Metrics:')
    sortedByAchievement.slice(0, 3).forEach((metric, index) => {
      console.log(`   ${index + 1}. ${metric.metric}: ${metric.achievementPercent.toFixed(1)}% of target`)
    })
    console.log()

    console.log('⚠️ Areas for Improvement:')
    sortedByAchievement.slice(-3).reverse().forEach((metric, index) => {
      console.log(`   ${index + 1}. ${metric.metric}: ${metric.achievementPercent.toFixed(1)}% of target`)
    })
    console.log()

    // Historical performance analysis
    console.log('📊 Historical Performance Analysis (Last 8 Weeks):\n')
    
    // Calculate how many weeks each metric hit targets
    Object.entries(metricScores).forEach(([metricId, scores]) => {
      const metric = metricMap[metricId]
      const targets = targetScores[metricId]
      
      if (!metric || !targets) return

      // Get last 8 weeks
      const recent8Weeks = scores
        .sort((a, b) => b.weekNumber - a.weekNumber)
        .slice(0, 8)
      
      if (recent8Weeks.length < 4) return

      let targetsHit = 0
      let inRangeCount = 0
      
      recent8Weeks.forEach(score => {
        const weekTarget = targets.find(t => t.weekNumber === score.weekNumber)
        if (weekTarget) {
          if (score.score >= weekTarget.target) targetsHit++
          if (score.score >= weekTarget.lowRange && score.score <= weekTarget.highRange) inRangeCount++
        }
      })

      const targetHitRate = Math.round((targetsHit / recent8Weeks.length) * 100)
      const rangeHitRate = Math.round((inRangeCount / recent8Weeks.length) * 100)
      
      console.log(`${metric.name}:`)
      console.log(`   Target hit rate: ${targetsHit}/${recent8Weeks.length} weeks (${targetHitRate}%)`)
      console.log(`   In range rate: ${inRangeCount}/${recent8Weeks.length} weeks (${rangeHitRate}%)`)
      console.log()
    })

    // Show specific week data if requested
    console.log('📅 Recent Weekly Breakdown:\n')
    
    // Get the last 3 weeks for detailed view
    const recentWeeks = [...new Set(
      Object.values(metricScores)
        .flat()
        .map(score => score.weekNumber)
        .sort((a, b) => b - a)
        .slice(0, 3)
    )]

    recentWeeks.forEach(weekNumber => {
      const year = Math.floor(weekNumber / 100)
      const week = weekNumber % 100
      
      console.log(`Week ${week}/${year}:`)
      
      Object.entries(metricScores).forEach(([metricId, scores]) => {
        const metric = metricMap[metricId]
        const targets = targetScores[metricId]
        
        if (!metric || !targets) return

        const weekScore = scores.find(s => s.weekNumber === weekNumber)
        const weekTarget = targets.find(t => t.weekNumber === weekNumber)
        
        if (weekScore && weekTarget) {
          const achievement = Math.round((weekScore.score / weekTarget.target) * 100)
          let status = '✅'
          if (weekScore.score < weekTarget.lowRange) status = '🔴'
          else if (weekScore.score > weekTarget.highRange) status = '🚀'
          else if (weekScore.score < weekTarget.target) status = '🟡'
          
          console.log(`   ${metric.name}: ${weekScore.score.toFixed(1)} (${achievement}%) ${status}`)
        }
      })
      console.log()
    })

  } catch (error) {
    console.error('❌ Error fetching metric scores:', error)
  }
}

getMetricScores()