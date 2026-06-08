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
import ParentGate from './components/ParentGate.jsx'
import InstallHint from './components/InstallHint.jsx'
import Onboarding from './components/Onboarding.jsx'
import { addMinute, isOverLimit } from './lib/screentime'

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
}
const PLAY_SCREENS = new Set([
  'home', 'learning', 'game', 'twin', 'today', 'collection', 'chant', 'phonics',
])

export default function App() {
  const screen = useStore((s) => s.screen)
  const activeProfileId = useStore((s) => s.activeProfileId)
  const gateFor = useStore((s) => s.gateFor)
  const onboarded = useStore((s) => s.onboarded)
  const passGate = useStore((s) => s.passGate)
  const closeGate = useStore((s) => s.closeGate)
  const openRest = useStore((s) => s.openRest)

  // Screen-time: tick a minute while a child plays; wind down when over budget.
  useEffect(() => {
    const id = setInterval(() => {
      const st = useStore.getState()
      if (!st.activeProfileId || !PLAY_SCREENS.has(st.screen)) return
      addMinute()
      if (isOverLimit()) openRest()
    }, 60000)
    return () => clearInterval(id)
  }, [openRest])

  // Wind down immediately if (re)entering play while already over budget.
  useEffect(() => {
    if (activeProfileId && PLAY_SCREENS.has(screen) && isOverLimit()) openRest()
  }, [screen, activeProfileId, openRest])

  const key = screen === 'profiles' || !activeProfileId ? 'profiles' : screen
  const Screen = SCREENS[key] || HomeScreen
  const gateTitle = gateFor === 'more' ? 'A little more time?' : 'For grown-ups'

  return (
    <div className="app-shell">
      <Screen />
      {key === 'home' && activeProfileId && !onboarded && <Onboarding />}
      {key === 'home' && onboarded && <InstallHint />}
      {gateFor && <ParentGate title={gateTitle} onPass={passGate} onCancel={closeGate} />}
    </div>
  )
}
