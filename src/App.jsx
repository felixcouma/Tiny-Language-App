import { useStore } from './store'
import HomeScreen from './screens/HomeScreen.jsx'
import LearningScreen from './screens/LearningScreen.jsx'
import SoundGameScreen from './screens/SoundGameScreen.jsx'
import TwinModeScreen from './screens/TwinModeScreen.jsx'
import ParentDashboard from './screens/ParentDashboard.jsx'

const SCREENS = {
  home: HomeScreen,
  learning: LearningScreen,
  game: SoundGameScreen,
  twin: TwinModeScreen,
  parent: ParentDashboard,
}

export default function App() {
  const screen = useStore((s) => s.screen)
  const Screen = SCREENS[screen] || HomeScreen
  return (
    <div className="app-shell">
      <Screen />
    </div>
  )
}
