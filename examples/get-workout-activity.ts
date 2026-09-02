import 'dotenv/config'
import TonalClient from '../src/index'

const getWorkoutActivity = async () => {
  try {
    const client = await TonalClient.create({
      username: process.env.TONAL_USERNAME!,
      password: process.env.TONAL_PASSWORD!,
    })

    console.log('🏋️ Fetching a recent completed workout activity...\n')

    const summaries = await client.getActivitySummaries()
    const recent = [...summaries]
      .filter(summary => summary.completed)
      .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))[0]

    if (!recent) {
      console.log('No completed workout activities found.')
      return
    }

    const freshStartedAt = performance.now()
    const activity = await client.getWorkoutActivityById(recent.id, false)
    const freshDuration = performance.now() - freshStartedAt

    console.log(`📋 ${recent.name}`)
    console.log(`   Started: ${new Date(activity.beginTime).toLocaleString()}`)
    console.log(`   Completed: ${activity.completed === true ? 'Yes' : 'No'}`)
    console.log(`   Duration: ${Math.round(activity.totalDuration / 60)} minutes`)
    console.log(`   Sets: ${activity.totalSets.toLocaleString()}`)
    console.log(`   Reps: ${activity.totalReps.toLocaleString()}`)
    console.log(`   Volume: ${activity.totalVolume.toLocaleString()} lbs`)
    console.log(`   Set activity entries: ${activity.workoutSetActivity.length.toLocaleString()}\n`)

    const cachedStartedAt = performance.now()
    await client.getWorkoutActivityById(recent.id)
    const cachedDuration = performance.now() - cachedStartedAt

    console.log('⏱️ Cache timing:')
    console.log(`   Fresh API request: ${freshDuration.toFixed(1)} ms`)
    console.log(`   Second call: ${cachedDuration.toFixed(1)} ms`)
  } catch (error) {
    console.error('❌ Error fetching workout activity:', error)
  }
}

getWorkoutActivity()
