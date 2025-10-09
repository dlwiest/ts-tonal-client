import 'dotenv/config'
import TonalClient from '../src/index'

const getTrainingEffectGoals = async () => {
  try {
    const client = await TonalClient.create({
      username: process.env.TONAL_USERNAME!,
      password: process.env.TONAL_PASSWORD!,
    })

    console.log('🎯 Fetching training effect goals...\n')

    const trainingGoals = await client.getTrainingEffectGoals()

    console.log(`Found ${trainingGoals.goals.length} training effect goals:\n`)

    // Display all goals
    trainingGoals.goals.forEach((goal, index) => {
      console.log(`${index + 1}. ${goal.name}`)
      console.log(`   Description: ${goal.description}`)
      console.log(`   Active: ${goal.active}`)
      console.log(`   ID: ${goal.id}`)
      console.log(`   Filter Item ID: ${goal.filterItemId}`)
      console.log()
    })

    // Display goal relationships
    if (trainingGoals.relations.length > 0) {
      console.log(`\n🔗 Goal Relationships (${trainingGoals.relations.length} primary goals with relationships):\n`)
      
      trainingGoals.relations.forEach((relation) => {
        const primaryGoal = trainingGoals.goals.find(g => g.id === relation.id)
        if (primaryGoal) {
          console.log(`Primary: ${primaryGoal.name}`)
          
          if (relation.secondary.length > 0) {
            console.log('  Secondary goals:')
            relation.secondary.forEach(secondaryId => {
              const secondaryGoal = trainingGoals.goals.find(g => g.id === secondaryId)
              if (secondaryGoal) {
                console.log(`    • ${secondaryGoal.name}`)
              }
            })
          }
          
          if (relation.tertiary.length > 0) {
            console.log('  Tertiary goals:')
            relation.tertiary.forEach(tertiaryId => {
              const tertiaryGoal = trainingGoals.goals.find(g => g.id === tertiaryId)
              if (tertiaryGoal) {
                console.log(`    • ${tertiaryGoal.name}`)
              }
            })
          }
          console.log()
        }
      })
    }

  } catch (error) {
    console.error('❌ Error fetching training effect goals:', error)
  }
}

getTrainingEffectGoals()