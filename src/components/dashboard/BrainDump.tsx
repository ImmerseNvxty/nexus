'use client'
// src/components/dashboard/BrainDump.tsx
import { useState, useRef } from 'react'

const QUICK_TAGS = ['#study', '#todo', '#idea', '#math', '#essay', '#reminder']

interface Item { id: string; text: string; tag: string; done: boolean }

export default function BrainDump() {
  const [items, setItems] = useState<Item[]>([])
  const [input, setInput] = useState('')
  const [activeTag, setActiveTag] = useState('#todo')
  const inputRef = useRef<HTMLInputElement>(null)

  function add() {
    const text = input.trim()
    if (!text) return
    setItems(prev => [{ id: Date.now().toString(), text, tag: activeTag, done: false }, ...prev])
    setInput('')
    inputRef.current?.focus()
  }

  function toggle(id: string) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, done: !i.done } : i))
  }

  function remove(id: string) {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  return (
    <div>
      <div className="flex gap-2">
        <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          className="island-input flex-1"
          placeholder="Quick thought, task, or idea… (Enter to capture)"/>
        <button onClick={add} className="btn-primary px-4 rounded-xl flex-shrink-0">+</button>
      </div>
      {/* Tag selector */}
      <div className="flex gap-1.5 flex-wrap mt-2">
        {QUICK_TAGS.map(tag => (
          <button key={tag} onClick={() => setActiveTag(tag)}
            className="text-xs px-2.5 py-1 rounded-lg transition-all"
            style={{
              background: activeTag === tag ? 'rgba(192,132,252,0.18)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${activeTag === tag ? 'rgba(192,132,252,0.4)' : 'rgba(255,255,255,0.08)'}`,
              color: activeTag === tag ? '#c084fc' : '#3a6080',
              fontFamily: 'var(--font-sora)',
            }}>{tag}</button>
        ))}
      </div>
      {/* Captured items */}
      {items.length > 0 && (
        <div className="mt-3 flex flex-col gap-1.5 max-h-40 overflow-y-auto">
          {items.map(item => (
            <div key={item.id} className="flex items-center gap-2.5 p-2 rounded-lg group"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <button onClick={() => toggle(item.id)}
                className="w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center text-[10px]"
                style={{ borderColor: '#3a6080', background: item.done ? '#5bc4f5' : 'transparent', color: '#041020' }}>
                {item.done ? '✓' : ''}
              </button>
              <span className="flex-1 text-xs truncate" style={{ color: item.done ? '#3a6080' : '#a8cce8', textDecoration: item.done ? 'line-through' : 'none' }}>
                {item.text}
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(192,132,252,0.12)', color: '#c084fc', fontFamily: 'var(--font-sora)' }}>
                {item.tag}
              </span>
              <button onClick={() => remove(item.id)} className="opacity-0 group-hover:opacity-100 text-[#3a6080] hover:text-[#f5756a] text-xs transition-all">✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
