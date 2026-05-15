'use client'
// src/components/schedule/ScheduleClient.tsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useProfileStore } from '@/store'
import toast from 'react-hot-toast'
import type { ClassItem, Assignment, ClassScheduleSlot } from '@/types'
import { format, isToday, isTomorrow, differenceInDays } from 'date-fns'

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
const HOURS = Array.from({ length: 14 }, (_, i) => i + 7) // 7am-8pm
const CLASS_COLORS = ['#5bc4f5','#c084fc','#5de8a0','#f5c842','#f5756a','#f5a0c0','#7ec8f5','#e0b4ff']
const PRIORITY_COLORS: Record<string, string> = { urgent:'#f5756a', high:'#f5c842', medium:'#5bc4f5', low:'#5de8a0' }

interface Props { initialClasses: ClassItem[]; initialAssignments: (Assignment & { class?: { name:string; color:string }|null })[] }

export default function ScheduleClient({ initialClasses, initialAssignments }: Props) {
  const { profile } = useProfileStore()
  const supabase = createClient()
  const [classes, setClasses] = useState(initialClasses)
  const [assignments, setAssignments] = useState(initialAssignments)
  const [tab, setTab] = useState<'timetable'|'assignments'|'classes'>('timetable')
  const [showClassForm, setShowClassForm] = useState(false)
  const [showAssignForm, setShowAssignForm] = useState(false)
  const [editClass, setEditClass] = useState<ClassItem | null>(null)

  // ── Class form state ──
  const [cName, setCName] = useState(''); const [cCode, setCCode] = useState('')
  const [cProf, setCProf] = useState(''); const [cLoc, setCLoc] = useState('')
  const [cColor, setCColor] = useState(CLASS_COLORS[0]); const [cSemester, setCSemester] = useState('')
  const [cSlots, setCSlots] = useState<ClassScheduleSlot[]>([{ day: 'Monday', start: '09:00', end: '10:30' }])

  // ── Assignment form state ──
  const [aTitle, setATitle] = useState(''); const [aClass, setAClass] = useState('')
  const [aDue, setADue] = useState(''); const [aPriority, setAPriority] = useState<'low'|'medium'|'high'|'urgent'>('medium')
  const [aDesc, setADesc] = useState(''); const [aEst, setAEst] = useState('')

  async function saveClass() {
    if (!profile || !cName) return
    const payload = { user_id: profile.id, name: cName, code: cCode || null, professor: cProf || null, location: cLoc || null, color: cColor, semester: cSemester || null, schedule: cSlots }
    if (editClass) {
      const { data } = await supabase.from('classes').update(payload).eq('id', editClass.id).select().single()
      if (data) setClasses(prev => prev.map(c => c.id === editClass.id ? data as ClassItem : c))
      toast.success('Class updated!')
    } else {
      const { data } = await supabase.from('classes').insert(payload).select().single()
      if (data) setClasses(prev => [...prev, data as ClassItem])
      toast.success('Class added!')
    }
    setShowClassForm(false); setEditClass(null)
    setCName(''); setCCode(''); setCProf(''); setCLoc(''); setCSemester(''); setCSlots([{ day:'Monday', start:'09:00', end:'10:30' }])
  }

  async function deleteClass(id: string) {
    if (!confirm('Delete this class?')) return
    await supabase.from('classes').delete().eq('id', id)
    setClasses(prev => prev.filter(c => c.id !== id))
    toast.success('Class removed')
  }

  async function saveAssignment() {
    if (!profile || !aTitle) return
    const { data } = await supabase.from('assignments').insert({
      user_id: profile.id, title: aTitle, class_id: aClass || null,
      due_date: aDue ? new Date(aDue).toISOString() : null,
      priority: aPriority, description: aDesc || null,
      estimated_minutes: aEst ? parseInt(aEst) : null, status: 'todo',
    }).select('*, class:classes(name,color)').single()
    if (data) setAssignments(prev => [...prev, data as any])
    toast.success('Assignment added! +50 XP when done 🎯')
    setShowAssignForm(false); setATitle(''); setAClass(''); setADue(''); setAPriority('medium'); setADesc(''); setAEst('')
  }

  async function updateStatus(id: string, status: Assignment['status']) {
    await supabase.from('assignments').update({ status }).eq('id', id)
    setAssignments(prev => prev.map(a => a.id === id ? { ...a, status } : a))
    if (status === 'done' && profile) {
      await supabase.rpc('award_xp', { p_user_id: profile.id, p_amount: 50, p_reason: 'Assignment completed', p_source_type: 'assignment', p_source_id: id })
      toast.success('Assignment complete! +50 XP 🎉')
    }
  }

  // Build timetable: for each day, find classes with that day in schedule
  const timetableData: Record<string, { cls: ClassItem; slot: ClassScheduleSlot }[]> = {}
  DAYS.slice(0,5).forEach(day => {
    timetableData[day] = []
    classes.forEach(cls => {
      const slot = cls.schedule?.find((s: ClassScheduleSlot) => s.day === day)
      if (slot) timetableData[day].push({ cls, slot })
    })
    timetableData[day].sort((a, b) => a.slot.start.localeCompare(b.slot.start))
  })

  const card = 'glass-card p-4'

  return (
    <div className="p-4 flex flex-col gap-3 h-full">
      {/* Tab bar */}
      <div className="flex items-center gap-2">
        {(['timetable','assignments','classes'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-2 rounded-xl text-xs font-medium transition-all capitalize"
            style={{
              fontFamily: 'var(--font-sora)',
              background: tab === t ? 'rgba(91,196,245,0.15)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${tab === t ? 'rgba(91,196,245,0.4)' : 'rgba(255,255,255,0.07)'}`,
              color: tab === t ? '#5bc4f5' : '#6a9ab8',
            }}>{t}</button>
        ))}
        <div className="ml-auto flex gap-2">
          <button onClick={() => setShowClassForm(true)} className="btn-ghost px-3 py-2 rounded-xl text-xs">+ Class</button>
          <button onClick={() => setShowAssignForm(true)} className="btn-primary px-3 py-2 rounded-xl text-xs">+ Assignment</button>
        </div>
      </div>

      {/* ── TIMETABLE ── */}
      {tab === 'timetable' && (
        <div className={`${card} flex-1 overflow-auto`}>
          <div className="grid" style={{ gridTemplateColumns: '52px repeat(5, 1fr)', minWidth: 600, gap: 1 }}>
            {/* Header */}
            <div/>
            {DAYS.slice(0,5).map(day => (
              <div key={day} className="text-center text-xs font-semibold py-2 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.04)', color: day === format(new Date(),'EEEE') ? '#5bc4f5' : '#6a9ab8', fontFamily: 'var(--font-sora)' }}>
                {day.slice(0,3)}
              </div>
            ))}
            {/* Time slots */}
            {HOURS.map(hour => (
              <>
                <div key={hour} className="text-right pr-2 py-3 text-[10px] text-[#2a5070]" style={{ fontFamily: 'var(--font-sora)' }}>
                  {hour > 12 ? `${hour-12}PM` : hour === 12 ? '12PM' : `${hour}AM`}
                </div>
                {DAYS.slice(0,5).map(day => {
                  const slotClasses = timetableData[day].filter(({ slot }) => {
                    const startH = parseInt(slot.start.split(':')[0])
                    return startH === hour
                  })
                  return (
                    <div key={day} className="min-h-[48px] rounded-lg relative"
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                      {slotClasses.map(({ cls, slot }) => (
                        <div key={cls.id} className="absolute inset-x-0.5 top-0.5 rounded-md px-2 py-1"
                          style={{ background: cls.color + '22', border: `1px solid ${cls.color}55`, minHeight: 40 }}>
                          <div className="text-[10px] font-semibold truncate" style={{ color: cls.color, fontFamily: 'var(--font-sora)' }}>{cls.code ?? cls.name}</div>
                          <div className="text-[9px] text-[#3a6080]">{slot.start} — {slot.end}</div>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </>
            ))}
          </div>
        </div>
      )}

      {/* ── ASSIGNMENTS ── */}
      {tab === 'assignments' && (
        <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
          {(['todo','in_progress','done'] as const).map(status => {
            const group = assignments.filter(a => a.status === status)
            if (group.length === 0) return null
            return (
              <div key={status}>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[#2a5070] mb-1.5 px-1" style={{ fontFamily: 'var(--font-sora)' }}>
                  {status === 'todo' ? '📋 To Do' : status === 'in_progress' ? '⚡ In Progress' : '✅ Done'} ({group.length})
                </div>
                <div className="flex flex-col gap-1.5">
                  {group.map(a => {
                    const due = a.due_date ? new Date(a.due_date) : null
                    const days = due ? differenceInDays(due, new Date()) : null
                    return (
                      <motion.div key={a.id} className="glass-card p-3 flex items-center gap-3"
                        initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}>
                        <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ background: PRIORITY_COLORS[a.priority] }}/>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-[#e8f4ff] truncate">{a.title}</div>
                          <div className="text-xs text-[#3a6080] flex items-center gap-2 mt-0.5">
                            {a.class?.name && <span style={{ color: a.class.color }}>{a.class.name}</span>}
                            {due && <span className={days !== null && days <= 2 ? 'text-[#f5756a]' : ''}>
                              📅 {isToday(due) ? 'Today' : isTomorrow(due) ? 'Tomorrow' : format(due, 'MMM d')}
                            </span>}
                            {a.estimated_minutes && <span>⏱ {a.estimated_minutes}min est.</span>}
                          </div>
                        </div>
                        <select value={a.status} onChange={e => updateStatus(a.id, e.target.value as Assignment['status'])}
                          className="text-xs rounded-lg px-2 py-1 outline-none cursor-pointer"
                          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#a8cce8' }}>
                          <option value="todo">To Do</option>
                          <option value="in_progress">In Progress</option>
                          <option value="done">Done</option>
                          <option value="overdue">Overdue</option>
                        </select>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            )
          })}
          {assignments.length === 0 && (
            <div className="glass-card p-12 text-center text-[#3a6080]">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-sm">No assignments yet. Add your first one!</p>
            </div>
          )}
        </div>
      )}

      {/* ── CLASSES LIST ── */}
      {tab === 'classes' && (
        <div className="grid grid-cols-3 gap-3 flex-1 overflow-y-auto content-start">
          {classes.map(cls => (
            <motion.div key={cls.id} className="glass-card p-4"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-start justify-between mb-2">
                <div className="w-3 h-3 rounded-full mt-0.5" style={{ background: cls.color, boxShadow: `0 0 8px ${cls.color}66` }}/>
                <div className="flex gap-1">
                  <button onClick={() => { setEditClass(cls); setCName(cls.name); setCCode(cls.code??''); setCProf(cls.professor??''); setCLoc(cls.location??''); setCColor(cls.color); setCSemester(cls.semester??''); setCSlots(cls.schedule??[]); setShowClassForm(true) }}
                    className="text-xs text-[#3a6080] hover:text-[#5bc4f5] transition-colors">✎</button>
                  <button onClick={() => deleteClass(cls.id)} className="text-xs text-[#3a6080] hover:text-[#f5756a] transition-colors">✕</button>
                </div>
              </div>
              <div className="text-sm font-semibold text-[#e8f4ff]" style={{ fontFamily: 'var(--font-sora)' }}>{cls.name}</div>
              {cls.code && <div className="text-xs text-[#5bc4f5] mt-0.5">{cls.code}</div>}
              {cls.professor && <div className="text-xs text-[#3a6080] mt-1">👤 {cls.professor}</div>}
              {cls.location && <div className="text-xs text-[#3a6080]">📍 {cls.location}</div>}
              {(cls.schedule ?? []).length > 0 && (
                <div className="mt-2 flex flex-col gap-1">
                  {(cls.schedule as ClassScheduleSlot[]).map((s, i) => (
                    <div key={i} className="text-[10px] rounded-md px-2 py-1"
                      style={{ background: cls.color + '18', color: cls.color, fontFamily: 'var(--font-sora)' }}>
                      {s.day.slice(0,3)} {s.start}–{s.end}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
          {classes.length === 0 && (
            <div className="col-span-3 glass-card p-12 text-center text-[#3a6080]">
              <div className="text-4xl mb-3">🎓</div>
              <p className="text-sm">No classes yet. Add your first course!</p>
              <button onClick={() => setShowClassForm(true)} className="btn-primary px-5 py-2 rounded-xl text-sm mt-4">+ Add Class</button>
            </div>
          )}
        </div>
      )}

      {/* ── CLASS FORM MODAL ── */}
      {showClassForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <motion.div className="glass-card p-6 w-full max-w-md" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <h2 className="text-lg font-bold text-[#e8f4ff] mb-4" style={{ fontFamily: 'var(--font-sora)' }}>{editClass ? 'Edit Class' : 'Add Class'}</h2>
            <div className="flex flex-col gap-3">
              <input className="island-input" placeholder="Class name *" value={cName} onChange={e => setCName(e.target.value)}/>
              <div className="grid grid-cols-2 gap-2">
                <input className="island-input" placeholder="Course code (e.g. MATH 301)" value={cCode} onChange={e => setCCode(e.target.value)}/>
                <input className="island-input" placeholder="Semester (e.g. Fall 2025)" value={cSemester} onChange={e => setCSemester(e.target.value)}/>
                <input className="island-input" placeholder="Professor" value={cProf} onChange={e => setCProf(e.target.value)}/>
                <input className="island-input" placeholder="Location / Room" value={cLoc} onChange={e => setCLoc(e.target.value)}/>
              </div>
              {/* Color picker */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#6a9ab8]">Color</span>
                {CLASS_COLORS.map(c => (
                  <button key={c} onClick={() => setCColor(c)} className="w-5 h-5 rounded-full transition-transform hover:scale-110"
                    style={{ background: c, outline: cColor === c ? `2px solid ${c}` : 'none', outlineOffset: 2 }}/>
                ))}
              </div>
              {/* Schedule slots */}
              <div>
                <div className="text-xs text-[#6a9ab8] mb-2">Schedule</div>
                {cSlots.map((slot, i) => (
                  <div key={i} className="flex gap-2 mb-2 items-center">
                    <select value={slot.day} onChange={e => { const s=[...cSlots]; s[i]={...s[i],day:e.target.value as ClassScheduleSlot['day']}; setCSlots(s) }}
                      className="island-input flex-1 py-1.5">
                      {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <input type="time" value={slot.start} onChange={e => { const s=[...cSlots]; s[i]={...s[i],start:e.target.value}; setCSlots(s) }} className="island-input w-28 py-1.5"/>
                    <input type="time" value={slot.end} onChange={e => { const s=[...cSlots]; s[i]={...s[i],end:e.target.value}; setCSlots(s) }} className="island-input w-28 py-1.5"/>
                    <button onClick={() => setCSlots(prev => prev.filter((_,j) => j!==i))} className="text-[#f5756a] text-sm">✕</button>
                  </div>
                ))}
                <button onClick={() => setCSlots(prev => [...prev, { day:'Monday', start:'09:00', end:'10:30' }])}
                  className="text-xs text-[#5bc4f5] hover:underline">+ Add time slot</button>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => { setShowClassForm(false); setEditClass(null) }} className="btn-ghost flex-1 py-2 rounded-xl text-sm">Cancel</button>
              <button onClick={saveClass} className="btn-primary flex-1 py-2 rounded-xl text-sm">Save Class</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── ASSIGNMENT FORM MODAL ── */}
      {showAssignForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <motion.div className="glass-card p-6 w-full max-w-md" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <h2 className="text-lg font-bold text-[#e8f4ff] mb-4" style={{ fontFamily: 'var(--font-sora)' }}>Add Assignment</h2>
            <div className="flex flex-col gap-3">
              <input className="island-input" placeholder="Assignment title *" value={aTitle} onChange={e => setATitle(e.target.value)}/>
              <div className="grid grid-cols-2 gap-2">
                <select className="island-input py-2" value={aClass} onChange={e => setAClass(e.target.value)}>
                  <option value="">No class</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.code ?? c.name}</option>)}
                </select>
                <select className="island-input py-2" value={aPriority} onChange={e => setAPriority(e.target.value as any)}>
                  <option value="low">Low priority</option>
                  <option value="medium">Medium priority</option>
                  <option value="high">High priority</option>
                  <option value="urgent">Urgent</option>
                </select>
                <input type="datetime-local" className="island-input py-2" value={aDue} onChange={e => setADue(e.target.value)}/>
                <input className="island-input py-2" placeholder="Est. minutes" type="number" value={aEst} onChange={e => setAEst(e.target.value)}/>
              </div>
              <textarea className="island-input py-2 resize-none" rows={3} placeholder="Description / notes…" value={aDesc} onChange={e => setADesc(e.target.value)}/>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowAssignForm(false)} className="btn-ghost flex-1 py-2 rounded-xl text-sm">Cancel</button>
              <button onClick={saveAssignment} className="btn-primary flex-1 py-2 rounded-xl text-sm">Add Assignment</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
