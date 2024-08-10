import { MapIcon, QueueListIcon } from '@heroicons/react/20/solid'

export default function MapControls({ isTimelineVisible, handleToggleMapClick }: { isTimelineVisible: boolean, handleToggleMapClick: () => void }) {
  return (
    <div className="flex items-center my-2">
      <button className="inline-flex items-center bg-accent-secondary-800 hover:bg-accent-secondary-900 text-accent-secondary-200 leading-none p-4 transition rounded-full shadow-md" onClick={handleToggleMapClick}>
        {isTimelineVisible ? <MapIcon className="w-4 h-4" /> : <QueueListIcon className="w-4 h-4" />}
        <span className="ml-2">{isTimelineVisible ? 'Show map' : 'Show timeline'}</span>
      </button>
    </div>
  )
}
