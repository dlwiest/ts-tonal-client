import 'dotenv/config'
import TonalClient from '../src/index'

const getUserSettings = async () => {
  try {
    const client = await TonalClient.create({
      username: process.env.TONAL_USERNAME!,
      password: process.env.TONAL_PASSWORD!,
    })

    console.log('⚙️ Fetching user settings...\n')

    const settings = await client.getUserSettings()

    console.log('🔊 Audio Settings:')
    console.log(`   Overall Volume: ${Math.round(settings.overallVolume * 100)}%`)
    console.log(`   Music Volume: ${Math.round(settings.musicVolume * 100)}%`)
    console.log(`   Coach Volume: ${Math.round(settings.coachVolume * 100)}%`)
    console.log(`   Sound Effects Volume: ${Math.round(settings.soundEffectsVolume * 100)}%`)
    console.log(`   Coaching Cues Volume: ${Math.round(settings.coachingCuesVolume * 100)}%`)
    console.log()

    console.log('🎵 Music Service:')
    console.log(`   Preferred Service: ${settings.preferredMusicService}`)
    console.log(`   Feed FM Auto Play: ${settings.feedFmAutoPlay}`)
    console.log()

    console.log('📱 Display Settings:')
    console.log(`   Time Zone: ${settings.timeZone}`)
    console.log(`   Screen Brightness: ${settings.screenBrightness}/255`)
    console.log(`   Closed Captions: ${settings.closedCaptions}`)
    console.log()

    console.log('🏋️ Workout Settings:')
    console.log(`   Workout Demo: ${settings.workoutDemo}`)
    console.log(`   Demo Player Size: ${settings.demoPlayerSize}`)
    console.log(`   Data in Guided Workouts: ${settings.dataInGuidedWorkouts}`)
    console.log()

    console.log('🔧 Smart View:')
    console.log(`   Smart View Enabled: ${settings.isSmartViewEnabled}`)
    console.log(`   Smart View Mode: ${settings.smartViewMode || 'Not set'}`)
    console.log()

    // Analyze feature exposure
    const featureFlags = Object.entries(settings).filter(([key, value]) => 
      key.startsWith('hasSeen') || key.startsWith('hasHidden') || key.startsWith('hasDismissed')
    )

    console.log('🎯 Feature Exposure Analysis:')
    
    const seenPromos = featureFlags.filter(([key, value]) => 
      key.includes('Promo') && value === true
    ).length

    const seenModals = featureFlags.filter(([key, value]) => 
      key.includes('Modal') && value === true
    ).length

    const seenTooltips = featureFlags.filter(([key, value]) => 
      key.includes('ToolTip') && value === true
    ).length

    console.log(`   Promotional content seen: ${seenPromos} promos`)
    console.log(`   Onboarding modals completed: ${seenModals} modals`) 
    console.log(`   UI tooltips acknowledged: ${seenTooltips} tooltips`)
    console.log()

    // Identify key features user has been exposed to
    console.log('✨ Key Features User Has Seen:')
    
    const keyFeatures = [
      { flag: 'hasSeenDailyLiftPromo', name: 'Daily Lifts' },
      { flag: 'hasSeenLeaderboardIntroTile', name: 'Leaderboards' },
      { flag: 'hasSeenPublicProfilePopUp', name: 'Public Profiles' },
      { flag: 'hasSeenTrainingEffectGoalsPromo', name: 'Training Effect Goals' },
      { flag: 'hasSeenDropSetsPromo', name: 'Drop Sets' },
      { flag: 'hasSeenScorecardPromo', name: 'Workout Scorecards' },
      { flag: 'hasSeenAnkleStrapsPromo', name: 'Ankle Straps Accessory' },
      { flag: 'hasSeenPilatesLoopsPromo', name: 'Pilates Loops Accessory' },
      { flag: 'hasSeenTonalVisionPromo', name: 'Tonal Vision' },
      { flag: 'hasSeenChatbotAnnouncementModal', name: 'AI Chatbot' },
      { flag: 'hasSeenPostWorkoutSelfiePromo', name: 'Post-Workout Selfies' },
      { flag: 'hasSeenUpdatedAppleHealthScreen', name: 'Apple Health Integration' },
      { flag: 'hasSeenEditorialContentsPromo', name: 'Editorial Content' },
    ]

    keyFeatures.forEach(feature => {
      const exposed = settings[feature.flag as keyof typeof settings]
      const status = exposed ? '✅' : '⭕'
      console.log(`   ${status} ${feature.name}`)
    })

    console.log()
    console.log('📊 Settings Summary:')
    console.log(`   Total settings tracked: ${Object.keys(settings).length}`)
    console.log(`   Feature flags: ${featureFlags.length}`)
    console.log(`   Account deletion requested: ${settings.hasRequestedAccountDeletion}`)
    console.log(`   Program prompts enabled: ${settings.joinProgramPromptEnabled}`)

  } catch (error) {
    console.error('❌ Error fetching user settings:', error)
  }
}

getUserSettings()