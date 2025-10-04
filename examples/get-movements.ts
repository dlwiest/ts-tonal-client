import 'dotenv/config'
import { writeFileSync } from 'fs'
import { join } from 'path'
import TonalClient from '../src/index'

const getMovements = async () => {
  try {
    const client = await TonalClient.create({
      username: process.env.TONAL_USERNAME!,
      password: process.env.TONAL_PASSWORD!,
    })
    const movements = await client.getMovements()
    
    // Check if --save flag is provided
    const shouldSave = process.argv.includes('--save')
    
    if (shouldSave) {
      const outputFile = join(process.cwd(), 'movements.json')
      writeFileSync(outputFile, JSON.stringify(movements, null, 2))
      console.log(`✅ Saved ${movements.length} movements to ${outputFile}`)
    } else {
      console.log(movements)
      console.log(`\n💡 Tip: Use --save flag to save to movements.json`)
    }
  } catch (e) {
    console.error(e)
  }
}

getMovements()
