import { Transition } from '@headlessui/react'
import { Dispatch, MutableRefObject, SetStateAction, useEffect, useRef, useState } from 'react'
import { CachedGooglePhotosMediaItem } from '../lib/media-cache'
import { groupByDay } from '../utils/sort-media-items'
import TimelineControls from './TimelineControls'
import TimelineItemGroup from './TimelineItemGroup'
import { isArchived } from '../utils/config'

export default function Timeline({ sortedMediaItems, isVisible, activeMediaItemId, setActiveMediaItemId, activeItemRef, isScrollingUserControlled, setActiveMediaItemIdWithScrollTo }: { sortedMediaItems: CachedGooglePhotosMediaItem[], isVisible: boolean, activeMediaItemId?: string, setActiveMediaItemId: Dispatch<SetStateAction<string|undefined>>, activeItemRef?: MutableRefObject<HTMLElement|null>, isScrollingUserControlled: boolean, setActiveMediaItemIdWithScrollTo: (activeItemId: string|undefined) => void }) {
  const itemsByDay = groupByDay(sortedMediaItems)
  const sortedDays = isArchived()
    ? Object.keys(itemsByDay).sort()
    : Object.keys(itemsByDay).sort().reverse()

  const visibleItemIds = useRef<string[]>([])
  const [itemVisibilityObserver, setItemVisibilityObserver] = useState<IntersectionObserver|undefined>()
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (!isScrollingUserControlled) return

        const updates = entries
          .map(({ target, isIntersecting }) => ({
            itemId: target.getAttribute('data-id') || '',
            isIntersecting,
          }))
          .filter(({ itemId }) => itemId)

        const stillVisibleItemIds = visibleItemIds.current
          .filter(visibleItemId => {
            const update = updates.find(({ itemId }) => itemId === visibleItemId)

            return !update || update.isIntersecting
          })

        const newlyVisibleItemIds = updates
          .filter(({ isIntersecting }) => isIntersecting)
          .map(({ itemId }) => itemId)
          .filter(itemId => !stillVisibleItemIds.includes(itemId))

        visibleItemIds.current = [
          ...stillVisibleItemIds,
          ...newlyVisibleItemIds,
        ]

        // To reduce unnecessary focus flickers and jumps in edge cases,
        // only change active item when previous one is no longer visible or
        // new items become visible.
        const shouldKeepActive = activeMediaItemId && visibleItemIds.current.includes(activeMediaItemId) && newlyVisibleItemIds.length === 0
        if (!shouldKeepActive) {
          const topmostVisibleItem = sortedMediaItems
            .find(item => visibleItemIds.current.includes(item.id))

          if (topmostVisibleItem) {
            setActiveMediaItemId(topmostVisibleItem.id)
          }
        }
      },
      { threshold: 0.5 }
    )

    setItemVisibilityObserver(observer)

    return () => {
      observer.disconnect()
    }
  }, [sortedMediaItems, activeMediaItemId, setActiveMediaItemId, isScrollingUserControlled])

  const handlePrevClick = (): void => {
    const maxIndex = sortedMediaItems.length - 1
    const activeIndex = sortedMediaItems.findIndex(item => item.id === activeMediaItemId) ?? maxIndex
    const prevIndex = Math.min(maxIndex, activeIndex + 1)

    setActiveMediaItemIdWithScrollTo(sortedMediaItems[prevIndex]?.id)
  }

  const handleNextClick = (): void => {
    const minIndex = 0
    const activeIndex = sortedMediaItems.findIndex(item => item.id === activeMediaItemId) ?? minIndex
    const nextIndex = Math.max(minIndex, activeIndex - 1)

    setActiveMediaItemIdWithScrollTo(sortedMediaItems[nextIndex]?.id)
  }

  return (
    <Transition
      show={isVisible}
    >
      <div className={`md:hidden fixed inset-0 transition backdrop-blur ${isVisible ? 'backdrop-opacity-1' : 'backdrop-opacity-0'}`}></div>

      <Transition.Child
        enter="ease-out duration-150"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="ease-in duration-150"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
        className="relative z-10"
      >
        <div className="pb-20">
          <header className="p-4 rounded-2xl bg-map-background text-neutral-400 shadow-lg">
            <h1 className="text-xl">Bike tour Frankfurt-Toulouse in 2024</h1>
            <p className="mt-2">All times are in CET (UTC +1).</p>
          </header>
          <ol>
            {sortedDays.map(day => {
              return (
                <li key={day}>
                  <TimelineItemGroup
                    items={itemsByDay[day]}
                    activeItemId={activeMediaItemId}
                    activeItemRef={activeItemRef}
                    setActiveItemId={setActiveMediaItemIdWithScrollTo}
                    itemVisibilityObserver={itemVisibilityObserver}
                    setActiveMediaItemIdWithScrollTo={setActiveMediaItemIdWithScrollTo}
                  />
                </li>
              )
            })}
            {!sortedDays.length && <div className="my-4 p-4 bg-neutral-200 rounded-2xl shadow-lg">
              <p>Nothing to see here yet :)</p>
            </div>}
          </ol>
        </div>
      </Transition.Child>

      <div className="fixed z-10 bottom-4 right-4 lg:hidden">
        <TimelineControls
          isFirstItemActive={sortedMediaItems[0]?.id === activeMediaItemId}
          isLastItemActive={sortedMediaItems[sortedMediaItems.length - 1]?.id === activeMediaItemId}
          handlePrevClick={handlePrevClick}
          handleNextClick={handleNextClick}
        />
      </div>
    </Transition>
  )
}
