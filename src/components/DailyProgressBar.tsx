import Link from 'next/link'

interface Props {
  termViewed: boolean
  flashcardDone: boolean
  quizDone: boolean
  isPro: boolean
}

function Step({ label, done, locked }: { label: string; done: boolean; locked?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
          done
            ? 'bg-green-500 text-white'
            : locked
            ? 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500 border border-gray-200 dark:border-white/[0.08]'
            : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 border border-gray-200 dark:border-white/[0.08]'
        }`}
      >
        {done ? '✓' : locked ? '🔒' : '○'}
      </span>
      <span
        className={`text-sm font-medium ${
          done
            ? 'text-green-700 dark:text-green-400 line-through'
            : locked
            ? 'text-gray-400 dark:text-slate-500'
            : 'text-gray-700 dark:text-slate-300'
        }`}
      >
        {label}
      </span>
    </div>
  )
}

export default function DailyProgressBar({ termViewed, flashcardDone, quizDone, isPro }: Props) {
  const allDone = termViewed && (isPro ? flashcardDone && quizDone : true)
  const dayComplete = termViewed && (flashcardDone || quizDone)

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-white/[0.08] p-5 mb-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">Today&apos;s Learning</p>
        {dayComplete && (
          <span className="text-xs bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2.5 py-1 rounded-full font-semibold">
            Day complete ✓
          </span>
        )}
      </div>

      <div className="flex items-center gap-6 flex-wrap">
        <Step label="Read term" done={termViewed} />
        {isPro ? (
          <>
            <Step label="Flashcards" done={flashcardDone} />
            <Step label="Quiz" done={quizDone} />
          </>
        ) : (
          <>
            <Step label="Flashcards" done={false} locked />
            <Step label="Quiz" done={false} locked />
          </>
        )}
      </div>

      {/* Learning flow nudge */}
      {!dayComplete && termViewed && isPro && !flashcardDone && !quizDone && (
        <div className="mt-4 pt-4 border-t border-gray-50 dark:border-white/[0.05] flex items-center justify-between">
          <p className="text-xs text-gray-500 dark:text-slate-400">Next: practice what you just learned</p>
          <Link
            href="/dashboard/flashcards"
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            Flashcards →
          </Link>
        </div>
      )}
      {!dayComplete && termViewed && isPro && flashcardDone && !quizDone && (
        <div className="mt-4 pt-4 border-t border-gray-50 dark:border-white/[0.05] flex items-center justify-between">
          <p className="text-xs text-gray-500 dark:text-slate-400">Last step: test yourself</p>
          <Link
            href="/dashboard/quiz"
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            Take Quiz →
          </Link>
        </div>
      )}
      {allDone && isPro && (
        <p className="mt-3 pt-3 border-t border-gray-50 dark:border-white/[0.05] text-xs text-green-600 dark:text-green-400 font-medium">
          You&apos;re done for today. Great work!
        </p>
      )}
      {!isPro && termViewed && (
        <div className="mt-4 pt-4 border-t border-gray-50 dark:border-white/[0.05] flex items-center justify-between">
          <p className="text-xs text-gray-500 dark:text-slate-400">Unlock flashcards &amp; quiz to complete your day</p>
          <Link
            href="/pricing"
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            Upgrade →
          </Link>
        </div>
      )}
    </div>
  )
}
