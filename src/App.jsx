import { useState } from 'react'
import HomeScreen from './components/HomeScreen'
import PlayScreen from './components/PlayScreen'

// Generate an array of ball colors (cycling through a palette)
const BALL_COLORS = [
  '#FF6B6B', '#FF8E53', '#FFC107', '#4CAF50', '#00BCD4',
  '#2196F3', '#9C27B0', '#E91E63', '#FF5722', '#009688',
  '#3F51B5', '#795548', '#607D8B', '#F44336', '#8BC34A',
]

function getBallColor(n) {
  return BALL_COLORS[(n - 1) % BALL_COLORS.length]
}

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
    : <PlayScreen totalN={totalN} getBallColor={getBallColor} onExit={handleExit} />
}
