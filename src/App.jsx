import { useEffect } from 'react'
import { useStore } from './store'
import ProfilePickerScreen from './screens/ProfilePickerScreen.jsx'
import HomeScreen from './screens/HomeScreen.jsx'
import LearningScreen from './screens/LearningScreen.jsx'
import SoundGameScreen from './screens/SoundGameScreen.jsx'
import TwinModeScreen from './screens/TwinModeScreen.jsx'
import ParentDashboard from './screens/ParentDashboard.jsx'
import TodayScreen from './screens/TodayScreen.jsx'
import CollectionScreen from './screens/CollectionScreen.jsx'
import RestScreen from './screens/RestScreen.jsx'
import ChantScreen from './screens/ChantScreen.jsx'
import PhonicsGameScreen from './screens/PhonicsGameScreen.jsx'
import PhraseScreen from './screens/PhraseScreen.jsx'
import GridScreen from './screens/GridScreen.jsx'
import ParentGate from './components/ParentGate.jsx'
import InstallHint from './components/InstallHint.jsx'
import Onboarding from './components/Onboarding.jsx'
import CollectToast from './components/CollectToast.jsx'
import UpdatePrompt from './components/UpdatePrompt.jsx'
import { addMinute, isRestTime } from './lib/screentime'

const SCREENS = {
  profiles: ProfilePickerScreen,
  home: HomeScreen,
  learning: LearningScreen,
  game: SoundGameScreen,
  twin: TwinModeScreen,
  parent: ParentDashboard,
  today: TodayScreen,
  collection: CollectionScreen,
  rest: RestScreen,
  chant: ChantScreen,
  phonics: PhonicsGameScreen,
  phrase: PhraseScreen,
  grid: GridScreen,
}
// Screens where active play accrues time / can trigger the wind-down. The Home
// hub is intentionally NOT here, so "Home" is always a safe neutral landing —
// the wind-down re-engages only when the child starts playing again.
const PLAY_SCREENS = new Set([
  'learning', 'game', 'twin', 'today', 'collection', 'chant', 'phonics', 'phrase', 'grid',
])

// Should the active child wind down now? (their limit reached or quiet hours)
function restCheck(st) {
  const prof = st.profiles.find((p) => p.id === st.activeProfileId)
  return !!prof && isRestTime(st.activeProfileId, prof.limit || 0, prof.bedtime)
}

export default function App() {
  const screen = useStore((s) => s.screen)
  const activeProfileId = useStore((s) => s.activeProfileId)
  const gateFor = useStore((s) => s.gateFor)
  const onboarded = useStore((s) => s.onboarded)
  const passGate = useStore((s) => s.passGate)
  const closeGate = useStore((s) => s.closeGate)
  const openRest = useStore((s) => s.openRest)

  // Per-child screen-time: tick a minute while a child plays; wind down when
  // over their budget or during their quiet hours (bedtime).
  useEffect(() => {
    const id = setInterval(() => {
      const st = useStore.getState()
      if (!st.activeProfileId || !PLAY_SCREENS.has(st.screen)) return
      addMinute(st.activeProfileId)
      if (restCheck(st)) openRest()
    }, 60000)
    return () => clearInterval(id)
  }, [openRest])

  // Wind down immediately if (re)entering play while already over budget / quiet.
  useEffect(() => {
    if (activeProfileId && PLAY_SCREENS.has(screen) && restCheck(useStore.getState())) openRest()
  }, [screen, activeProfileId, openRest])

  const key = screen === 'profiles' || !activeProfileId ? 'profiles' : screen
  const Screen = SCREENS[key] || HomeScreen
  const gateTitle = gateFor === 'more' ? 'A little more time?' : 'For grown-ups'

  return (
    <div className="app-shell">
      <Screen />
      <UpdatePrompt />
      <CollectToast />
      {key === 'home' && activeProfileId && !onboarded && <Onboarding />}
      {key === 'home' && onboarded && <InstallHint />}
      {gateFor && <ParentGate title={gateTitle} onPass={passGate} onCancel={closeGate} />}
    </div>
  )
}
