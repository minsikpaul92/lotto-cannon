import { useState } from 'react'
import HomeScreen from './components/home/HomeScreen.jsx'
import PlayScreen from './components/play/PlayScreen.jsx'

export default function App() {
  const [stage, setStage] = useState('home') // 'home' | 'play'
  const [totalN, setTotalN] = useState(10)

  const handleStart = (n) => {
    setTotalN(n)
    setStage('play')
  }

  const handleExit = () => {
    setStage('home')
  }

  return stage === 'home'
    ? <HomeScreen onStart={handleStart} />
    : <PlayScreen totalN={totalN} onExit={handleExit} />
}
