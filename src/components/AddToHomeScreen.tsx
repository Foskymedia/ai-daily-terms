'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_KEY = 'pwa_banner_dismissed'
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000

export default function AddToHomeScreen() {
  const [show, setShow] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // Already installed as PWA — don't show
    if (window.matchMedia('(display-mode: standalone)').matches) return
    if ((navigator as { standalone?: boolean }).standalone === true) return

    // Dismissed within the last week — don't show
    const dismissed = localStorage.getItem(DISMISS_KEY)
    if (dismissed && Date.now() - parseInt(dismissed, 10) < ONE_WEEK_MS) return

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
    setIsIOS(ios)

    if (ios) {
      // On iOS we can't prompt programmatically — show manual instructions
      setShow(true)
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShow(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, Date.now().toString())
    setShow(false)
  }

  async function install() {
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setShow(false)
        return
      }
    }
    dismiss()
  }

  if (!show) return null

  return (
    <div className="fixed bottom-20 md:bottom-4 left-3 right-3 z-40 md:left-auto md:right-4 md:max-w-xs">
      <div className="bg-gray-900 text-white rounded-2xl p-4 shadow-2xl flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-xs leading-none">AI</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">Add to home screen</p>
          <p className="text-xs text-gray-400 mt-0.5 leading-snug">
            {isIOS
              ? 'Tap the Share button, then "Add to Home Screen"'
              : 'Get your daily AI term without opening a browser'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {!isIOS && deferredPrompt && (
            <button
              onClick={install}
              className="text-xs bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-lg font-semibold transition-colors"
            >
              Install
            </button>
          )}
          <button
            onClick={dismiss}
            className="text-gray-400 hover:text-white transition-colors p-1 -mr-1"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
