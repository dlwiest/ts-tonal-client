require('dotenv').config()
import TonalClient from '../src'

const getMovements = async () => {
  try {
    const client = await TonalClient.create({
      username: process.env.TONAL_USERNAME!,
      password: process.env.TONAL_PASSWORD!,
    })
    const movements = await client.getMovements()
    console.log(movements)
  } catch (e) {
    console.error(e)
  }
}

getMovements()
