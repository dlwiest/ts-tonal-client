import 'dotenv/config'
import TonalClient from '../src/index'

const getGoalMetrics = async () => {
  try {
    const client = await TonalClient.create({
      username: process.env.TONAL_USERNAME!,
      password: process.env.TONAL_PASSWORD!,
    })

    console.log('📊 Fetching goal metrics and training effect goals...\n')

    // Fetch both endpoints to cross-reference
    const [goalMetrics, trainingGoals] = await Promise.all([
      client.getGoalMetrics(),
      client.getTrainingEffectGoals()
    ])

    console.log(`Found ${goalMetrics.length} goal metrics:\n`)

    // Display each metric with its corresponding training goal
    goalMetrics.forEach((metric, index) => {
      const relatedGoal = trainingGoals.goals.find(goal => goal.id === metric.goalId)
      
      console.log(`${index + 1}. ${metric.name}`)
      console.log(`   Metric ID: ${metric.id}`)
      console.log(`   Description: ${metric.description}`)
      console.log(`   Related Goal: ${relatedGoal ? relatedGoal.name : 'Unknown'} (${metric.goalId})`)
      if (relatedGoal) {
        console.log(`   Goal Description: ${relatedGoal.description}`)
      }
      console.log()
    })

    // Group metrics by their related training goals
    console.log('🎯 Goal Metrics Grouped by Training Goals:\n')
    
    const goalMetricsByGoal = new Map<string, typeof goalMetrics>()
    goalMetrics.forEach(metric => {
      if (!goalMetricsByGoal.has(metric.goalId)) {
        goalMetricsByGoal.set(metric.goalId, [])
      }
      goalMetricsByGoal.get(metric.goalId)!.push(metric)
    })

    goalMetricsByGoal.forEach((metrics, goalId) => {
      const goal = trainingGoals.goals.find(g => g.id === goalId)
      if (goal) {
        console.log(`🏆 ${goal.name}:`)
        metrics.forEach(metric => {
          console.log(`   • ${metric.name}: ${metric.description}`)
        })
        console.log()
      }
    })

    // Validate all goal references exist
    console.log('✅ Goal Reference Validation:\n')
    
    const validReferences = goalMetrics.filter(metric => 
      trainingGoals.goals.some(goal => goal.id === metric.goalId)
    )
    
    const invalidReferences = goalMetrics.filter(metric => 
      !trainingGoals.goals.some(goal => goal.id === metric.goalId)
    )

    console.log(`Valid goal references: ${validReferences.length}/${goalMetrics.length}`)
    
    if (invalidReferences.length > 0) {
      console.log(`⚠️  Invalid goal references found:`)
      invalidReferences.forEach(metric => {
        console.log(`   • ${metric.name} references unknown goal: ${metric.goalId}`)
      })
    } else {
      console.log('🎉 All goal metrics reference valid training effect goals!')
    }

    // Show which training goals have metrics vs which don't
    console.log('\n📈 Training Goals Coverage:\n')
    
    const goalsWithMetrics = trainingGoals.goals.filter(goal =>
      goalMetrics.some(metric => metric.goalId === goal.id)
    )
    
    const goalsWithoutMetrics = trainingGoals.goals.filter(goal =>
      !goalMetrics.some(metric => metric.goalId === goal.id)
    )

    console.log(`Goals with metrics (${goalsWithMetrics.length}):`)
    goalsWithMetrics.forEach(goal => {
      const metricCount = goalMetrics.filter(m => m.goalId === goal.id).length
      console.log(`   • ${goal.name} (${metricCount} metric${metricCount !== 1 ? 's' : ''})`)
    })

    if (goalsWithoutMetrics.length > 0) {
      console.log(`\nGoals without metrics (${goalsWithoutMetrics.length}):`)
      goalsWithoutMetrics.forEach(goal => {
        console.log(`   • ${goal.name}`)
      })
    }

  } catch (error) {
    console.error('❌ Error fetching goal metrics:', error)
  }
}

getGoalMetrics()