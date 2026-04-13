'use client'

import Link from 'next/link'
import { X } from 'lucide-react'

interface UpgradeModalProps {
  feature: string
  onClose: () => void
}

const featureDetails: Record<string, { title: string; bullets: string[] }> = {
  Glossary: {
    title: 'Unlock the Full Glossary',
    bullets: [
      'Browse all 365+ plain-English AI terms',
      'Filter by category and difficulty level',
      'Access your complete learning history',
    ],
  },
  Flashcards: {
    title: 'Unlock Flashcards',
    bullets: [
      'Practice with interactive flip cards',
      'Reinforce learning through repetition',
      'Study any term — at any time',
    ],
  },
  Quiz: {
    title: 'Unlock Quiz Mode',
    bullets: [
      'Test yourself with multiple-choice questions',
      'Track which terms you\'ve mastered',
      'Score tracking and progress dashboard',
    ],
  },
}

export default function UpgradeModal({ feature, onClose }: UpgradeModalProps) {
  const details = featureDetails[feature] ?? {
    title: 'Upgrade to Pro',
    bullets: [
      'Access the full glossary (365+ terms)',
      'Flashcards and quiz mode',
      'Track your learning progress',
    ],
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-sm p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="text-4xl mb-4">🔒</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">{details.title}</h2>
        <p className="text-sm text-gray-500 mb-6">This feature is available on the Pro plan.</p>

        <ul className="space-y-3 mb-6">
          {details.bullets.map((b) => (
            <li key={b} className="flex items-start gap-3 text-sm text-gray-600">
              <span className="text-blue-600 mt-0.5 flex-shrink-0">✓</span>
              {b}
            </li>
          ))}
        </ul>

        <p className="text-center text-sm font-bold text-gray-900 mb-4">
          $4.99/month · Cancel anytime
        </p>

        <Link
          href="/pricing"
          className="w-full block bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-center mb-3"
          onClick={onClose}
        >
          Upgrade to Pro
        </Link>
        <button
          onClick={onClose}
          className="w-full text-gray-400 text-sm hover:text-gray-600 transition-colors py-2"
        >
          Maybe later
        </button>
      </div>
    </div>
  )
}
