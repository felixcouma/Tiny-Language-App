import { useStore } from './store'
import HomeScreen from './screens/HomeScreen.jsx'
import LearningScreen from './screens/LearningScreen.jsx'

export default function App() {
  const screen = useStore((s) => s.screen)
  return (
    <div className="app-shell">
      {screen === 'home' ? <HomeScreen /> : <LearningScreen />}
    </div>
  )
}
