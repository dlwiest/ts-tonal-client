#!/usr/bin/env tsx

import dotenv from 'dotenv'
import { basename } from 'node:path'
import TonalClient from '../src/index'
import { writePrivateFile } from './private-export-files'

export async function writeCompactHealthExport(
  outputPath: string,
  exportData: unknown
): Promise<void> {
  await writePrivateFile(outputPath, `${JSON.stringify(exportData, null, 2)}\n`)
}

async function main() {
  dotenv.config()
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

  await writeCompactHealthExport(outputPath, exportData)

  console.log(`Exported ${exportData.summary.workoutCount} activities to ${outputPath}`)
  console.log('This file contains private health information; store and share it carefully.')
}

if (process.argv[1] && basename(process.argv[1]) === 'export-health-data.ts') {
  main().catch(error => {
    console.error('Failed to export Tonal health data:', error)
    process.exitCode = 1
  })
}
