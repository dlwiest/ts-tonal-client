import 'dotenv/config'
import TonalClient from '../src/index'

const getUserInfo = async () => {
  try {
    const client = await TonalClient.create({
      username: process.env.TONAL_USERNAME!,
      password: process.env.TONAL_PASSWORD!,
    })
    const userInfo = await client.getUserInfo()
    
    console.log(JSON.stringify(userInfo, null, 2))
  } catch (e) {
    console.error(e)
  }
}

getUserInfo()