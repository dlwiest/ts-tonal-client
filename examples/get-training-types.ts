import 'dotenv/config'
import TonalClient from '../src/index'

const getTrainingTypes = async () => {
  try {
    const client = await TonalClient.create({
      username: process.env.TONAL_USERNAME!,
      password: process.env.TONAL_PASSWORD!,
    })

    console.log('🏋️ Fetching training types...\n')

    const trainingTypes = await client.getTrainingTypes()

    console.log(`Found ${trainingTypes.length} training types:\n`)

    trainingTypes.forEach((type, index) => {
      console.log(`${index + 1}. ${type.name}`)
      console.log(`   Description: ${type.description}`)
      console.log(`   ID: ${type.id}`)
      console.log(`   Asset ID: ${type.assetId}`)
      console.log(`   Filter Item ID: ${type.filterItemId}`)
      
      // Show if this training type has an info video
      if (type.infoVidId !== "00000000-0000-0000-0000-000000000000") {
        console.log(`   Info Video ID: ${type.infoVidId}`)
      }
      console.log()
    })

    // Group training types by category for easier browsing
    const strengthBasedTypes = trainingTypes.filter(t => 
      t.name.toLowerCase().includes('strength') || 
      t.name.toLowerCase().includes('high intensity') ||
      t.name.toLowerCase().includes('bootcamp')
    )

    const mindBodyTypes = trainingTypes.filter(t => 
      t.name.toLowerCase().includes('yoga') || 
      t.name.toLowerCase().includes('pilates') ||
      t.name.toLowerCase().includes('meditation') ||
      t.name.toLowerCase().includes('mobility') ||
      t.name.toLowerCase().includes('recovery')
    )

    const cardioTypes = trainingTypes.filter(t => 
      t.name.toLowerCase().includes('cardio') || 
      t.name.toLowerCase().includes('dance') ||
      t.name.toLowerCase().includes('boxing') ||
      t.name.toLowerCase().includes('kickboxing')
    )

    const specialtyTypes = trainingTypes.filter(t => 
      t.name.toLowerCase().includes('golf') || 
      t.name.toLowerCase().includes('family') ||
      t.name.toLowerCase().includes('pre') ||
      t.name.toLowerCase().includes('barre') ||
      t.name.toLowerCase().includes('theragun') ||
      t.name.toLowerCase().includes('warm')
    )

    console.log('📊 Training Type Categories:\n')
    
    if (strengthBasedTypes.length > 0) {
      console.log(`💪 Strength-Based (${strengthBasedTypes.length}):`)
      strengthBasedTypes.forEach(t => console.log(`   • ${t.name}`))
      console.log()
    }

    if (mindBodyTypes.length > 0) {
      console.log(`🧘 Mind-Body (${mindBodyTypes.length}):`)
      mindBodyTypes.forEach(t => console.log(`   • ${t.name}`))
      console.log()
    }

    if (cardioTypes.length > 0) {
      console.log(`🔥 Cardio-Based (${cardioTypes.length}):`)
      cardioTypes.forEach(t => console.log(`   • ${t.name}`))
      console.log()
    }

    if (specialtyTypes.length > 0) {
      console.log(`⭐ Specialty/Targeted (${specialtyTypes.length}):`)
      specialtyTypes.forEach(t => console.log(`   • ${t.name}`))
      console.log()
    }

  } catch (error) {
    console.error('❌ Error fetching training types:', error)
  }
}

getTrainingTypes()