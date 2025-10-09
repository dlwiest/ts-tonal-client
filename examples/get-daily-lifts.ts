import 'dotenv/config'
import TonalClient from '../src/index'

const getDailyLifts = async () => {
  try {
    const client = await TonalClient.create({
      username: process.env.TONAL_USERNAME!,
      password: process.env.TONAL_PASSWORD!,
    })

    console.log('🏋️ Fetching daily lifts...')
    const dailyLifts = await client.getDailyLifts()

    if (dailyLifts.length === 0) {
      console.log('No daily lifts found.')
      return
    }

    console.log(`\nFound ${dailyLifts.length} daily lifts:\n`)

    dailyLifts.forEach((workout, index) => {
      const durationMinutes = Math.floor(workout.duration / 60)
      const durationSeconds = workout.duration % 60
      const createdDate = new Date(workout.createdAt).toLocaleDateString()

      console.log(`${index + 1}. ${workout.title}`)
      console.log(`   ID: ${workout.id}`)
      console.log(`   Type: ${workout.type}`)
      console.log(`   Target: ${workout.targetArea}`)
      console.log(`   Level: ${workout.level}`)
      console.log(`   Duration: ${durationMinutes}min ${durationSeconds}s`)
      console.log(`   Created: ${createdDate}`)
      console.log(`   Body Regions: ${workout.bodyRegions?.join(', ') || 'None'}`)
      console.log(`   Accessories: ${workout.accessories?.join(', ') || 'None'}`)
      console.log(`   Movements: ${workout.movementIds?.length || 0}`)
      console.log('')
    })

  } catch (error) {
    console.error('❌ Error fetching daily lifts:', error)
  }
}

getDailyLifts()