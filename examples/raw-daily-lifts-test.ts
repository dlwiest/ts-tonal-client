import 'dotenv/config'
import TonalClient from '../src/index'

const testRawDailyLifts = async () => {
  try {
    const client = await TonalClient.create({
      username: process.env.TONAL_USERNAME!,
      password: process.env.TONAL_PASSWORD!,
    })

    // Access the private httpClient through any public method to get a token
    await client.getUserInfo() // This ensures we have a valid token
    
    // Make the exact same request as Charles Proxy
    const response = await fetch('https://api.tonal.com/v6/user-workouts?types=DailyLift', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${(client as any).authManager.getValidToken()}`,
        'Accept': '*/*',
        'Content-Type': 'application/json',
        'User-Agent': 'Tonal/3004226 CFNetwork/3860.100.1 Darwin/25.0.0',
      },
    })

    console.log('Response status:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))
    
    if (response.ok) {
      const data = await response.json()
      console.log('Daily lifts from raw request:', data.length, 'workouts')
      if (data.length > 0) {
        console.log('First workout:', data[0].title, 'Type:', data[0].type)
      }
    } else {
      console.log('Error response:', await response.text())
    }

  } catch (error) {
    console.error('❌ Raw test error:', error)
  }
}

testRawDailyLifts()