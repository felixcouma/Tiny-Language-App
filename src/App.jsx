import { lazy, Suspense, useEffect } from 'react'
import { useStore } from './store'
import HomeScreen from './screens/HomeScreen.jsx' // eager — the landing + fallback screen
// The rest are code-split: each screen's JS loads on demand the first time it's opened
// (then cached by the service worker), so the initial bundle stays small and Home paints
// fast — the biggest win for slow devices.
const SetupScreen = lazy(() => import('./screens/SetupScreen.jsx'))
const ProfilePickerScreen = lazy(() => import('./screens/ProfilePickerScreen.jsx'))
const LearningScreen = lazy(() => import('./screens/LearningScreen.jsx'))
const SoundGameScreen = lazy(() => import('./screens/SoundGameScreen.jsx'))
const TwinModeScreen = lazy(() => import('./screens/TwinModeScreen.jsx'))
const ParentDashboard = lazy(() => import('./screens/ParentDashboard.jsx'))
const TodayScreen = lazy(() => import('./screens/TodayScreen.jsx'))
const CollectionScreen = lazy(() => import('./screens/CollectionScreen.jsx'))
const RestScreen = lazy(() => import('./screens/RestScreen.jsx'))
const ChantScreen = lazy(() => import('./screens/ChantScreen.jsx'))
const PhonicsGameScreen = lazy(() => import('./screens/PhonicsGameScreen.jsx'))
const PhraseScreen = lazy(() => import('./screens/PhraseScreen.jsx'))
const GridScreen = lazy(() => import('./screens/GridScreen.jsx'))
const ABCSongScreen = lazy(() => import('./screens/ABCSongScreen.jsx'))
const EchoScreen = lazy(() => import('./screens/EchoScreen.jsx'))
const SongScreen = lazy(() => import('./screens/SongScreen.jsx'))
const RoutineScreen = lazy(() => import('./screens/RoutineScreen.jsx'))
import ParentGate from './components/ParentGate.jsx'
import InstallHint from './components/InstallHint.jsx'
import Onboarding from './components/Onboarding.jsx'
import ParentIntro from './components/ParentIntro.jsx'
import CollectToast from './components/CollectToast.jsx'
import UpdatePrompt from './components/UpdatePrompt.jsx'
import { addMinute, isRestTime } from './lib/screentime'
import { useWakeLock } from './lib/useWakeLock'
import { initCloud } from './lib/cloud'

const SCREENS = {
  setup: SetupScreen,
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
  abc: ABCSongScreen,
  echo: EchoScreen,
  songs: SongScreen,
  routines: RoutineScreen,
}
// Screens where active play accrues time / can trigger the wind-down. The Home
// hub is intentionally NOT here, so "Home" is always a safe neutral landing —
// the wind-down re-engages only when the child starts playing again.
const PLAY_SCREENS = new Set([
  'learning', 'game', 'twin', 'today', 'collection', 'chant', 'phonics', 'phrase', 'grid', 'abc', 'echo', 'songs', 'routines',
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
  const seenIntro = useStore((s) => s.seenIntro)
  const finishIntro = useStore((s) => s.finishIntro)
  const passGate = useStore((s) => s.passGate)
  const closeGate = useStore((s) => s.closeGate)
  const openRest = useStore((s) => s.openRest)

  // Hold the display on while the app is open (re-acquired on tab focus).
  useWakeLock()

  // Wire optional cloud accounts + sync once (no-op when Supabase isn't configured).
  useEffect(() => {
    initCloud(useStore)
  }, [])

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

  // Browser Back should return to Home from any sub-screen — never silently leave
  // the app (the old behavior on desktop). We "arm" one history entry the first time
  // a child enters a sub-screen; a Back press pops it and we route to Home instead.
  // From Home/Profiles, Back is allowed to leave (that's the natural exit).
  const isSubScreen = !!activeProfileId && screen !== 'home' && screen !== 'profiles'
  useEffect(() => {
    if (isSubScreen && window.history.state?.tv !== 'trap') {
      window.history.pushState({ tv: 'trap' }, '')
    }
  }, [isSubScreen])
  useEffect(() => {
    const onPop = () => {
      const st = useStore.getState()
      if (st.activeProfileId && st.screen !== 'home' && st.screen !== 'profiles') {
        st.goHome() // Back from a sub-screen → the Home dashboard, not out of the app
      }
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const key =
    screen === 'setup' ? 'setup' : screen === 'profiles' || !activeProfileId ? 'profiles' : screen
  const Screen = SCREENS[key] || HomeScreen
  const gateTitle = gateFor === 'more' ? 'A little more time?' : 'For grown-ups'

  return (
    <div className="app-shell">
      <Suspense fallback={<div className="scene"><div className="scene-globe" /></div>}>
        <Screen />
      </Suspense>
      <UpdatePrompt />
      <CollectToast />
      {key === 'setup' && !seenIntro && <ParentIntro onDone={finishIntro} />}
      {key === 'home' && activeProfileId && !onboarded && <Onboarding />}
      {key === 'home' && onboarded && <InstallHint />}
      {gateFor && <ParentGate title={gateTitle} onPass={passGate} onCancel={closeGate} />}
    </div>
  )
}
