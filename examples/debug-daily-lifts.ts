import 'dotenv/config'
import TonalClient from '../src/index'

const debugDailyLifts = async () => {
  try {
    const client = await TonalClient.create({
      username: process.env.TONAL_USERNAME!,
      password: process.env.TONAL_PASSWORD!,
    })

    console.log('🔍 Testing daily lifts endpoint...')
    
    // Test the daily lifts endpoint
    try {
      const dailyLifts = await client.getDailyLifts()
      console.log(`Daily lifts result: ${dailyLifts.length} workouts`)
      if (dailyLifts.length > 0) {
        console.log('First daily lift:', dailyLifts[0].title, 'Type:', dailyLifts[0].type)
      }
    } catch (error) {
      console.log('Daily lifts error:', error)
    }

    console.log('\n🔍 Checking all workouts for DailyLift type...')
    
    // Get all workouts and filter for type "DailyLift" 
    const allWorkouts = await client.getUserWorkouts(0, 100)
    const dailyLiftWorkouts = allWorkouts.filter(w => w.type === 'DailyLift')
    
    console.log(`Found ${dailyLiftWorkouts.length} DailyLift workouts out of ${allWorkouts.length} total workouts:`)
    
    dailyLiftWorkouts.forEach((workout, index) => {
      console.log(`${index + 1}. "${workout.title}" (${workout.type}) - ID: ${workout.id}`)
    })

    if (dailyLiftWorkouts.length > 0) {
      console.log('\n✅ Daily lifts exist in your account, but the filtered endpoint may not be working as expected.')
    } else {
      console.log('\n❌ No daily lifts found in your account.')
    }

  } catch (error) {
    console.error('❌ Debug error:', error)
  }
}

debugDailyLifts()