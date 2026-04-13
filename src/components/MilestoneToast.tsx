'use client'

import { useState, useEffect } from 'react'
import { MILESTONE_LABELS } from '@/lib/levels'

interface MilestoneToastProps {
  milestones: string[]
}

export default function MilestoneToast({ milestones }: MilestoneToastProps) {
  const [queue, setQueue] = useState<string[]>(milestones)
  const [current, setCurrent] = useState<string | null>(milestones[0] ?? null)
  const [visible, setVisible] = useState(milestones.length > 0)

  useEffect(() => {
    if (!visible || !current) return
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(() => {
        const next = queue.slice(1)
        setQueue(next)
        if (next.length > 0) {
          setCurrent(next[0])
          setVisible(true)
        }
      }, 400)
    }, 4000)
    return () => clearTimeout(timer)
  }, [current, visible, queue])

  if (!current || !visible) return null

  return (
    <div
      className={`fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-[60] transition-all duration-400 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="bg-gray-900 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 max-w-sm">
        <span className="text-xl flex-shrink-0">🏆</span>
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Milestone achieved!</p>
          <p className="text-sm font-medium">{MILESTONE_LABELS[current] ?? current}</p>
        </div>
        <button
          onClick={() => setVisible(false)}
          className="ml-2 text-gray-500 hover:text-gray-300 flex-shrink-0 text-lg leading-none"
        >
          ×
        </button>
      </div>
    </div>
  )
}
