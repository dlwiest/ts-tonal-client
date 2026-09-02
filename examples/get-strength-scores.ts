import 'dotenv/config'
import TonalClient from '../src/index'

const getStrengthScores = async () => {
  try {
    const client = await TonalClient.create({
      username: process.env.TONAL_USERNAME!,
      password: process.env.TONAL_PASSWORD!,
    })

    console.log('💪 Fetching Strength Scores...\n')

    const [current, history] = await Promise.all([
      client.getCurrentStrengthScores(),
      // Default is 'all', which derives the window from the account creation date.
      client.getStrengthScoreHistory(),
    ])

    console.log('🏋️ Current Strength Score:')
    for (const score of current) {
      // The Overall row is synthesized by Tonal: bodyRegionDisplay is empty, familyActivity is
      // absent, workoutActivityId is an all-zero uuid, and updatedAt is a zero date. Fall back
      // to strengthBodyRegion for the label and never print its timestamp.
      const label = score.bodyRegionDisplay || score.strengthBodyRegion
      const isSynthesized = score.strengthBodyRegion === 'Overall'
      const updated = isSynthesized
        ? ''
        : `  (updated ${new Date(score.updatedAt).toLocaleDateString()})`
      console.log(`   ${label.padEnd(12)} ${String(score.score).padStart(5)}${updated}`)
    }
    console.log()

    if (history.length === 0) {
      console.log('📈 No scored activities found in the requested window.')
      return
    }

    const sorted = [...history].sort(
      (a, b) => Date.parse(a.activityTime) - Date.parse(b.activityTime)
    )
    const oldest = sorted[0]
    const newest = sorted[sorted.length - 1]

    console.log('📅 Coverage:')
    console.log(`   Scored activities: ${history.length}`)
    console.log(`   Earliest: ${new Date(oldest.activityTime).toLocaleDateString()}`)
    console.log(`   Latest:   ${new Date(newest.activityTime).toLocaleDateString()}`)
    console.log()

    console.log('📊 Change over the full history:')
    for (const region of ['overall', 'upper', 'core', 'lower'] as const) {
      const delta = newest[region] - oldest[region]
      const sign = delta > 0 ? '+' : ''
      console.log(
        `   ${region.padEnd(8)} ${String(oldest[region]).padStart(5)} → ${String(newest[region]).padStart(5)}  (${sign}${delta})`
      )
    }
    console.log()

    console.log('🕒 Five most recent scored activities:')
    for (const entry of [...sorted].reverse().slice(0, 5)) {
      const date = new Date(entry.activityTime).toLocaleDateString()
      console.log(
        `   ${date}  overall ${entry.overall} | upper ${entry.upper} | core ${entry.core} | lower ${entry.lower}`
      )
    }
    console.log()

    // `days` is a CALENDAR-DAY WINDOW, not a row count. A window shorter than the gap since
    // the last workout legitimately returns an empty array rather than an error, so a small
    // number here is not a way to "fetch the last N scores".
    const recent = await client.getStrengthScoreHistory(90)
    console.log('🔍 Windowed query (days is a time window, not a row limit):')
    console.log(`   getStrengthScoreHistory(90) → ${recent.length} activities in the last 90 days`)
    if (recent.length === 0) {
      console.log('   An empty result here means no activity in that window, not a failure.')
    }
  } catch (error) {
    console.error('❌ Error fetching strength scores:', error)
  }
}

getStrengthScores()
