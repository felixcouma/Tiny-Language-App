import { useStore } from './store'
import ProfilePickerScreen from './screens/ProfilePickerScreen.jsx'
import HomeScreen from './screens/HomeScreen.jsx'
import LearningScreen from './screens/LearningScreen.jsx'
import SoundGameScreen from './screens/SoundGameScreen.jsx'
import TwinModeScreen from './screens/TwinModeScreen.jsx'
import ParentDashboard from './screens/ParentDashboard.jsx'

const SCREENS = {
  profiles: ProfilePickerScreen,
  home: HomeScreen,
  learning: LearningScreen,
  game: SoundGameScreen,
  twin: TwinModeScreen,
  parent: ParentDashboard,
}

export default function App() {
  const screen = useStore((s) => s.screen)
  const activeProfileId = useStore((s) => s.activeProfileId)
  // Always greet with the profile picker until someone is chosen this session.
  const key = screen === 'profiles' || !activeProfileId ? 'profiles' : screen
  const Screen = SCREENS[key] || HomeScreen
  return (
    <div className="app-shell">
      <Screen />
    </div>
  )
}
