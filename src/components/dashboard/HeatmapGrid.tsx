'use client'
// src/components/dashboard/HeatmapGrid.tsx
import { useMemo } from 'react'
import type { HabitCompletion } from '@/types'

interface Props { completions: HabitCompletion[] }

export default function HeatmapGrid({ completions }: Props) {
  const cells = useMemo(() => {
    const counts: Record<string, number> = {}
    completions.forEach(c => { counts[c.date] = (counts[c.date] ?? 0) + 1 })
    const today = new Date()
    return Array.from({ length: 49 }).map((_, i) => {
      const d = new Date(today)
      d.setDate(d.getDate() - (48 - i))
      const key = d.toISOString().split('T')[0]
      const count = counts[key] ?? 0
      const isToday = i === 48
      return { key, count, isToday }
    })
  }, [completions])

  function level(count: number) {
    if (count === 0) return 0
    if (count <= 1) return 1
    if (count <= 3) return 2
    return 3
  }

  const colors = [
    'rgba(255,255,255,0.05)',
    'rgba(91,196,245,0.2)',
    'rgba(91,196,245,0.45)',
    'rgba(91,196,245,0.75)',
  ]

  return (
    <div>
      <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {cells.map(cell => (
          <div key={cell.key}
            className="rounded-sm transition-all duration-200 hover:scale-110"
            title={`${cell.key}: ${cell.count} completions`}
            style={{
              aspectRatio: '1',
              background: colors[level(cell.count)],
              outline: cell.isToday ? '2px solid rgba(91,196,245,0.6)' : 'none',
              boxShadow: level(cell.count) === 3 ? '0 0 6px rgba(91,196,245,0.4)' : 'none',
            }}
          />
        ))}
      </div>
      <div className="flex items-center gap-1.5 mt-2">
        {colors.map((c, i) => (
          <div key={i} className="w-2.5 h-2.5 rounded-sm" style={{ background: c, outline: '1px solid rgba(255,255,255,0.06)' }}/>
        ))}
        <span className="text-[9px] text-[#3a6080] ml-1">Less → More</span>
      </div>
    </div>
  )
}
