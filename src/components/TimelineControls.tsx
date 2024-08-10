import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid'

export default function TimelineControls({ isFirstItemActive, isLastItemActive, handlePrevClick, handleNextClick }: { isFirstItemActive: boolean, isLastItemActive: boolean, handlePrevClick: () => void, handleNextClick: () => void }) {
  return (
    <div className="flex items-center">
      <button className="bg-accent-primary-500 hover:bg-accent-primary-600 disabled:hidden text-accent-primary-200 leading-none p-4 transition rounded-full shadow-md ml-2" onClick={handleNextClick} disabled={isFirstItemActive}>
        <ChevronUpIcon className="w-8 h-8" />
        <span className="sr-only">Scroll to next photo</span>
      </button>
      <button className="bg-accent-primary-500 hover:bg-accent-primary-600 disabled:hidden text-accent-primary-200 leading-none p-4 transition rounded-full shadow-md ml-2" onClick={handlePrevClick} disabled={isLastItemActive}>
        <ChevronDownIcon className="w-8 h-8" />
        <span className="sr-only">Scroll to previous photo</span>
      </button>
    </div>
  )
}
