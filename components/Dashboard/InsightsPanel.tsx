import { Insight } from '@/lib/types'

interface InsightsPanelProps {
  insights: Insight[]
}

const TYPE_STYLES: Record<Insight['type'], string> = {
  positive: 'border-l-emerald-400 bg-emerald-50',
  negative: 'border-l-red-400 bg-red-50',
  neutral: 'border-l-amber-400 bg-amber-50',
}

const TEXT_STYLES: Record<Insight['type'], string> = {
  positive: 'text-emerald-800',
  negative: 'text-red-800',
  neutral: 'text-amber-800',
}

export default function InsightsPanel({ insights }: InsightsPanelProps) {
  if (insights.length === 0) return null

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
      <h2 className="text-base font-semibold text-slate-900 mb-1">Spending Insights</h2>
      <p className="text-xs text-slate-400 mb-4">Personalized summaries from your data</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {insights.map((insight, i) => (
          <div
            key={i}
            className={`border-l-4 rounded-xl px-4 py-3 ${TYPE_STYLES[insight.type]}`}
          >
            <div className="flex items-start gap-2">
              <span className="text-lg leading-none mt-0.5 shrink-0">{insight.icon}</span>
              <p className={`text-xs font-medium leading-snug ${TEXT_STYLES[insight.type]}`}>
                {insight.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
