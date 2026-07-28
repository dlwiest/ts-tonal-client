#!/usr/bin/env tsx

import 'dotenv/config'
import { writeFile } from 'node:fs/promises'
import TonalClient from '../src/index'

async function main() {
  const username = process.env.TONAL_USERNAME
  const password = process.env.TONAL_PASSWORD

  if (!username || !password) {
    throw new Error('TONAL_USERNAME and TONAL_PASSWORD must be configured')
  }

  const client = await TonalClient.create({ username, password })
  const exportData = await client.getHealthExport({
    includeSetDetails: true,
    limit: 50,
  })
  const outputPath = 'tonal-health-export.json'

  await writeFile(outputPath, `${JSON.stringify(exportData, null, 2)}\n`, {
    mode: 0o600,
  })

  console.log(`Exported ${exportData.summary.workoutCount} activities to ${outputPath}`)
  console.log('This file contains private health information; store and share it carefully.')
}

main().catch(error => {
  console.error('Failed to export Tonal health data:', error)
  process.exitCode = 1
})
