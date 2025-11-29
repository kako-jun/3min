import { useCalendarStore } from '../lib/store'

export function SettingsBar() {
  const settings = useCalendarStore((state) => state.settings)
  const updateSettings = useCalendarStore((state) => state.updateSettings)

  const handleWeekStartToggle = () => {
    updateSettings({ weekStartsOn: settings.weekStartsOn === 0 ? 1 : 0 })
  }

  return (
    <div className="flex items-center justify-end gap-4 text-sm">
      {/* 週の開始日スイッチ */}
      <div className="flex items-center gap-2">
        <span className={settings.weekStartsOn === 0 ? 'text-white' : 'text-gray-500'}>日曜</span>
        <button
          onClick={handleWeekStartToggle}
          className={`relative h-6 w-11 rounded-full transition-colors ${
            settings.weekStartsOn === 1 ? 'bg-blue-600' : 'bg-gray-600'
          }`}
          aria-label="週の開始日を切り替え"
        >
          <span
            className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
              settings.weekStartsOn === 1 ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
        <span className={settings.weekStartsOn === 1 ? 'text-white' : 'text-gray-500'}>月曜</span>
      </div>
    </div>
  )
}
