'use client'

import { useState, useEffect } from 'react'

interface XPToastProps {
  notifications: string[]
}

export default function XPToast({ notifications }: XPToastProps) {
  const [queue, setQueue] = useState<string[]>(notifications)
  const [current, setCurrent] = useState<string | null>(notifications[0] ?? null)
  const [visible, setVisible] = useState(notifications.length > 0)

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
      }, 300)
    }, 2200)
    return () => clearTimeout(timer)
  }, [current, visible, queue])

  if (!current || !visible) return null

  return (
    <div
      className={`fixed top-4 right-4 z-[70] transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}
    >
      <div className="bg-blue-600 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-sm font-semibold">
        <span className="text-base">⚡</span>
        {current}
      </div>
    </div>
  )
}
