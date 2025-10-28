import 'dotenv/config'
import TonalClient from '../src/index'

const getDailyMetrics = async () => {
  try {
    const client = await TonalClient.create({
      username: process.env.TONAL_USERNAME!,
      password: process.env.TONAL_PASSWORD!,
    })

    console.log('📊 Fetching daily metrics (last 60 days)...\n')

    const dailyMetrics = await client.getDailyMetrics(60)

    // Filter out days with no activity for cleaner output
    const activeDays = dailyMetrics.filter(day => day.totalWorkouts > 0)
    const totalDays = dailyMetrics.length

    console.log(`📈 Daily Metrics Summary:`)
    console.log(`   Total days analyzed: ${totalDays}`)
    console.log(`   Active workout days: ${activeDays.length}`)
    console.log(`   Rest days: ${totalDays - activeDays.length}`)
    console.log(`   Workout frequency: ${((activeDays.length / totalDays) * 100).toFixed(1)}%`)
    console.log()

    if (activeDays.length === 0) {
      console.log('No workout activity found in the last 60 days.')
      return
    }

    // Calculate totals and averages
    const totals = activeDays.reduce((acc, day) => ({
      volume: acc.volume + day.totalVolume,
      workouts: acc.workouts + day.totalWorkouts,
      duration: acc.duration + day.totalDuration,
      work: acc.work + day.totalWork,
      timeUnderTension: acc.timeUnderTension + day.totalTimeUnderTension,
    }), { volume: 0, workouts: 0, duration: 0, work: 0, timeUnderTension: 0 })

    const averages = {
      volume: Math.round(totals.volume / activeDays.length),
      duration: Math.round(totals.duration / activeDays.length),
      work: Math.round(totals.work / activeDays.length),
      timeUnderTension: Math.round(totals.timeUnderTension / activeDays.length),
    }

    console.log('🎯 Workout Totals:')
    console.log(`   Total Volume: ${totals.volume.toLocaleString()} lbs`)
    console.log(`   Total Workouts: ${totals.workouts}`)
    console.log(`   Total Duration: ${Math.round(totals.duration / 3600)} hours ${Math.round((totals.duration % 3600) / 60)} minutes`)
    console.log(`   Total Work: ${totals.work.toLocaleString()} kJ`)
    console.log(`   Total Time Under Tension: ${Math.round(totals.timeUnderTension / 60)} minutes ${totals.timeUnderTension % 60} seconds`)
    console.log()

    console.log('📊 Average Per Workout:')
    console.log(`   Average Volume: ${averages.volume.toLocaleString()} lbs`)
    console.log(`   Average Duration: ${Math.round(averages.duration / 60)} minutes`)
    console.log(`   Average Work: ${averages.work.toLocaleString()} kJ`)
    console.log(`   Average Time Under Tension: ${averages.timeUnderTension} seconds`)
    console.log()

    // Show recent activity (last 10 workout days)
    console.log('🗓️  Recent Workout Activity (last 10 workout days):')
    console.log()
    
    activeDays.slice(0, 10).forEach((day, index) => {
      const date = new Date(day.date).toLocaleDateString()
      const durationMin = Math.round(day.totalDuration / 60)
      const volumeK = (day.totalVolume / 1000).toFixed(1)
      const workK = (day.totalWork / 1000).toFixed(1)
      const tensionMin = Math.round(day.totalTimeUnderTension / 60)
      
      console.log(`${index + 1}. ${date}`)
      console.log(`   Volume: ${volumeK}k lbs | Duration: ${durationMin}min | Work: ${workK}k kJ | Tension: ${tensionMin}min`)
      console.log()
    })

    // Analyze workout consistency
    const workoutDates = activeDays.map(day => new Date(day.date))
    if (workoutDates.length >= 2) {
      const daysBetween = workoutDates.map((date, index) => {
        if (index === 0) return 0
        const prevDate = workoutDates[index - 1]
        return Math.round((prevDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
      }).filter(days => days > 0)

      const avgRestDays = daysBetween.length > 0 ? 
        (daysBetween.reduce((a, b) => a + b, 0) / daysBetween.length).toFixed(1) : 0

      console.log('📅 Workout Patterns:')
      console.log(`   Average rest days between workouts: ${avgRestDays}`)
      
      const maxGap = Math.max(...daysBetween)
      const minGap = Math.min(...daysBetween)
      console.log(`   Longest break: ${maxGap} days`)
      console.log(`   Shortest break: ${minGap} days`)
    }

  } catch (error) {
    console.error('❌ Error fetching daily metrics:', error)
  }
}

getDailyMetrics()