import { useEffect } from 'react'
import { useCalendarStore } from './lib/store'
import { Calendar } from './components/Calendar'

function App() {
  const initialize = useCalendarStore((state) => state.initialize)

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Calendar />
    </div>
  )
}

export default App
