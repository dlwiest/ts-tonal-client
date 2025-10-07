import 'dotenv/config'
import TonalClient from '../src/index'

const getGoals = async () => {
  try {
    const client = await TonalClient.create({
      username: process.env.TONAL_USERNAME!,
      password: process.env.TONAL_PASSWORD!,
    })
    const goals = await client.getGoals()
    
    console.log('Available Tonal Goals:')
    goals.forEach(goal => {
      console.log(`\n📋 ${goal.name}`)
      console.log(`   ${goal.description}`)
      console.log(`   ID: ${goal.id}`)
      console.log(`   Active: ${goal.active}`)
    })
  } catch (e) {
    console.error(e)
  }
}

getGoals()