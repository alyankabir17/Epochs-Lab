import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

export type SlideTab = {
  label: string
  href: string
}

type CursorPosition = {
  left: number
  width: number
  opacity: number
}

type SlideTabsProps = {
  tabs: SlideTab[]
  className?: string
  onSelect?: (tab: SlideTab, index: number) => void
}

const initialPosition: CursorPosition = { left: 0, width: 0, opacity: 0 }

export function SlideTabs({ tabs, className = '', onSelect }: SlideTabsProps) {
  const [position, setPosition] = useState<CursorPosition>(initialPosition)
  const tabsRef = useRef<Array<HTMLLIElement | null>>([])

  const updatePosition = useCallback((index: number) => {
    const selectedTab = tabsRef.current[index]
    if (!selectedTab) return

    setPosition({
      left: selectedTab.offsetLeft,
      width: selectedTab.getBoundingClientRect().width,
      opacity: 1,
    })
  }, [])

  const hidePosition = useCallback(() => setPosition(initialPosition), [])

  useLayoutEffect(() => {
    const handleResize = () => hidePosition()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [hidePosition])

  const selectTab = (tab: SlideTab, index: number) => {
    onSelect?.(tab, index)
  }

  return (
    <ul
      aria-label="Landing page sections"
      className={`slide-tabs relative mx-auto flex w-fit rounded-full border-2 p-1 ${className}`}
      onMouseLeave={hidePosition}
    >
      {tabs.map((tab, index) => (
        <li
          key={tab.label}
          ref={(element) => { tabsRef.current[index] = element }}
          className="relative z-10"
        >
          <a
            href={tab.href}
            className="slide-tabs-link block cursor-pointer px-4 py-2 text-xs uppercase md:px-4 md:py-2 md:text-sm"
            onClick={() => selectTab(tab, index)}
            onMouseEnter={() => updatePosition(index)}
            onFocus={() => updatePosition(index)}
            onBlur={(event) => {
              if (!event.currentTarget.closest('.slide-tabs')?.contains(document.activeElement)) hidePosition()
            }}
          >
            {tab.label}
          </a>
        </li>
      ))}

      <motion.li
        aria-hidden="true"
        animate={position}
        transition={{ type: 'spring', stiffness: 500, damping: 40, mass: 0.3 }}
        className="slide-tabs-cursor pointer-events-none absolute inset-y-1 z-0 h-auto rounded-full"
      />
    </ul>
  )
}
