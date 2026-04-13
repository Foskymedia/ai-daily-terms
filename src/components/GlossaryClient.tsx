'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Term } from '@/types'
import { Bookmark, BookmarkCheck, X } from 'lucide-react'

type ProgressMap = Record<string, 'seen' | 'saved' | 'mastered'>

interface GlossaryClientProps {
  terms: Term[]
  progressMap: ProgressMap
  userId: string
  totalPublished: number
}

const difficultyColors = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced: 'bg-red-100 text-red-700',
}

function ProgressRing({ pct, size = 52 }: { pct: number; size?: number }) {
  const stroke = 5
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  return (
    <svg width={size} height={size} className="flex-shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke="#2563eb" strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        strokeLinecap="round"
      />
      <text
        x={size / 2} y={size / 2 + 4}
        textAnchor="middle"
        fontSize="11"
        fontWeight="700"
        fill="#1d4ed8"
      >
        {pct}%
      </text>
    </svg>
  )
}

interface FlashcardModalProps {
  term: Term
  onClose: () => void
}

function FlashcardModal({ term, onClose }: FlashcardModalProps) {
  const [flipped, setFlipped] = useState(false)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-end mb-2">
          <button onClick={onClose} className="text-white/70 hover:text-white"><X size={20} /></button>
        </div>
        <div
          className="cursor-pointer select-none"
          onClick={() => setFlipped((f) => !f)}
          style={{ perspective: '1000px' }}
        >
          <div
            className="relative w-full transition-transform duration-500"
            style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : '', minHeight: '220px' }}
          >
            <div
              className="absolute inset-0 bg-white rounded-2xl p-8 flex flex-col items-center justify-center text-center"
              style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
            >
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Term</p>
              <h3 className="text-xl font-bold text-gray-900">{term.term}</h3>
              <p className="text-sm text-gray-400 mt-4">Tap to flip</p>
            </div>
            <div
              className="absolute inset-0 bg-blue-600 rounded-2xl p-8 flex flex-col items-center justify-center text-center overflow-y-auto"
              style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <p className="text-xs text-blue-200 uppercase tracking-wide mb-3">Definition</p>
              <p className="text-white text-sm leading-relaxed">{term.plain_explanation ?? term.definition}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function GlossaryClient({ terms, progressMap, userId, totalPublished }: GlossaryClientProps) {
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const [filterDifficulty, setFilterDifficulty] = useState<string | null>(null)
  const [savedOnly, setSavedOnly] = useState(false)
  const [masteredOnly, setMasteredOnly] = useState(false)
  const [localProgress, setLocalProgress] = useState<ProgressMap>({ ...progressMap })
  const [flashcardTerm, setFlashcardTerm] = useState<Term | null>(null)

  const categories = useMemo(() => {
    const cats = new Set(terms.map((t) => t.category).filter(Boolean) as string[])
    return Array.from(cats).sort()
  }, [terms])

  const seenCount = useMemo(
    () => Object.keys(localProgress).length,
    [localProgress]
  )
  const pct = totalPublished > 0 ? Math.round((seenCount / totalPublished) * 100) : 0

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return terms.filter((t) => {
      if (q && !t.term.toLowerCase().includes(q) && !t.definition.toLowerCase().includes(q) && !(t.plain_explanation ?? '').toLowerCase().includes(q)) return false
      if (filterCategory && t.category !== filterCategory) return false
      if (filterDifficulty && t.difficulty !== filterDifficulty) return false
      if (savedOnly && localProgress[t.id] !== 'saved') return false
      if (masteredOnly && localProgress[t.id] !== 'mastered') return false
      return true
    })
  }, [terms, search, filterCategory, filterDifficulty, savedOnly, masteredOnly, localProgress])

  const grouped = useMemo(() => {
    const g: Record<string, Term[]> = {}
    for (const t of filtered) {
      const letter = t.term[0].toUpperCase()
      if (!g[letter]) g[letter] = []
      g[letter].push(t)
    }
    return g
  }, [filtered])

  const letters = Object.keys(grouped).sort()

  async function toggleSave(term: Term) {
    const current = localProgress[term.id]
    const newStatus: 'saved' | 'seen' = current === 'saved' ? 'seen' : 'saved'
    setLocalProgress((prev) => ({ ...prev, [term.id]: newStatus }))

    const supabase = createClient()
    await supabase.from('user_progress').upsert(
      {
        user_id: userId,
        term_id: term.id,
        vertical_id: 'general',
        status: newStatus,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,term_id' }
    )
  }

  return (
    <>
      {/* Header + progress */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Glossary</h1>
          <p className="text-gray-500 mt-1 text-sm">{totalPublished} terms · General</p>
        </div>
        <div className="flex items-center gap-3">
          <ProgressRing pct={pct} />
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {seenCount} / {totalPublished} explored
            </p>
            <p className="text-xs text-gray-400">{totalPublished - seenCount} terms remaining</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search terms and definitions..."
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <select
          value={filterCategory ?? ''}
          onChange={(e) => setFilterCategory(e.target.value || null)}
          className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">All categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <select
          value={filterDifficulty ?? ''}
          onChange={(e) => setFilterDifficulty(e.target.value || null)}
          className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">All levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>

        <button
          onClick={() => { setSavedOnly((v) => !v); setMasteredOnly(false) }}
          className={`text-sm px-3 py-2 rounded-xl border font-medium transition-colors ${
            savedOnly ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          Saved only
        </button>

        <button
          onClick={() => { setMasteredOnly((v) => !v); setSavedOnly(false) }}
          className={`text-sm px-3 py-2 rounded-xl border font-medium transition-colors ${
            masteredOnly ? 'bg-green-600 text-white border-green-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          Mastered only
        </button>

        {(search || filterCategory || filterDifficulty || savedOnly || masteredOnly) && (
          <button
            onClick={() => { setSearch(''); setFilterCategory(null); setFilterDifficulty(null); setSavedOnly(false); setMasteredOnly(false) }}
            className="text-sm px-3 py-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors flex items-center gap-1"
          >
            <X size={13} /> Clear
          </button>
        )}
      </div>

      {/* Term count */}
      <p className="text-sm text-gray-400 mb-6">
        {filtered.length === terms.length
          ? `Showing all ${terms.length} terms`
          : `${filtered.length} of ${terms.length} terms`}
      </p>

      {/* Term list */}
      {letters.length === 0 ? (
        <div className="text-center text-gray-400 py-16">No terms match your filters.</div>
      ) : (
        <div className="space-y-10">
          {letters.map((letter) => (
            <div key={letter}>
              <h2 className="text-xl font-bold text-gray-300 mb-4 border-b border-gray-100 pb-2">{letter}</h2>
              <div className="space-y-3">
                {grouped[letter].map((term) => {
                  const status = localProgress[term.id]
                  const isSaved = status === 'saved'
                  const isMastered = status === 'mastered'

                  return (
                    <div
                      key={term.id}
                      className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-gray-900">{term.term}</h3>
                          {term.difficulty && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${difficultyColors[term.difficulty]}`}>
                              {term.difficulty}
                            </span>
                          )}
                          {isMastered && (
                            <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">
                              Mastered ✓
                            </span>
                          )}
                        </div>

                        {/* Quick actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => setFlashcardTerm(term)}
                            title="Flashcard"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors text-sm"
                          >
                            🃏
                          </button>
                          <button
                            onClick={() => toggleSave(term)}
                            title={isSaved ? 'Unsave' : 'Save'}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isSaved
                                ? 'text-blue-600 hover:bg-blue-50'
                                : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                            }`}
                          >
                            {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                          </button>
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm leading-relaxed">
                        {term.plain_explanation ?? term.definition}
                      </p>
                      {term.example_sentence && (
                        <p className="text-xs text-gray-400 italic mt-2 border-l-2 border-gray-200 pl-3">
                          &ldquo;{term.example_sentence}&rdquo;
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Continue learning prompt */}
      {pct < 100 && (
        <div className="mt-12 text-center bg-blue-50 rounded-2xl p-8 border border-blue-100">
          <p className="text-gray-700 font-semibold mb-1">
            You&apos;ve explored {seenCount} of {totalPublished} terms.
          </p>
          <p className="text-gray-500 text-sm">Keep going!</p>
        </div>
      )}

      {/* Inline flashcard modal */}
      {flashcardTerm && (
        <FlashcardModal term={flashcardTerm} onClose={() => setFlashcardTerm(null)} />
      )}
    </>
  )
}
