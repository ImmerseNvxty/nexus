'use client'
// src/components/calendar/CalendarClient.tsx
import { useState, useMemo } from 'react'
import { Calendar, dateFnsLocalizer, Views, type SlotInfo, type Event } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay, addMinutes } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useProfileStore } from '@/store'
import toast from 'react-hot-toast'
import type { CalendarEvent, ClassItem, ClassScheduleSlot } from '@/types'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales: { 'en-US': enUS } })

interface RBCEvent extends Event {
  id?: string
  color?: string
  eventType?: string
  classId?: string
  isClassEvent?: boolean
}

const EVENT_COLORS: Record<string, string> = {
  event: '#5bc4f5', study: '#5de8a0', class: '#c084fc', deadline: '#f5756a',
}

interface Props { initialEvents: CalendarEvent[]; classes: ClassItem[] }

export default function CalendarClient({ initialEvents, classes }: Props) {
  const { profile } = useProfileStore()
  const supabase = createClient()
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents)
  const [view, setView] = useState<(typeof Views)[keyof typeof Views]>(Views.WEEK)
  const [date, setDate] = useState(new Date())
  const [showModal, setShowModal] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<RBCEvent | null>(null)

  // Form state
  const [eTitle, setETitle] = useState('')
  const [eType, setEType] = useState<'event'|'study'|'class'|'deadline'>('event')
  const [eColor, setEColor] = useState('#5bc4f5')
  const [eStart, setEStart] = useState('')
  const [eEnd, setEEnd] = useState('')
  const [eAllDay, setEAllDay] = useState(false)
  const [eDesc, setEDesc] = useState('')
  const [eClassId, setEClassId] = useState('')

  // Convert stored events + generate class events from schedule
  const rbcEvents = useMemo<RBCEvent[]>(() => {
    const stored: RBCEvent[] = events.map(e => ({
      id: e.id, title: e.title, start: new Date(e.start_time), end: new Date(e.end_time),
      allDay: e.all_day, color: e.color, eventType: e.event_type,
    }))

    // Generate recurring class events for the next 90 days
    const classEvents: RBCEvent[] = []
    const dayMap: Record<string, number> = { Monday:1, Tuesday:2, Wednesday:3, Thursday:4, Friday:5, Saturday:6, Sunday:0 }
    const today = new Date(); today.setHours(0,0,0,0)

    classes.forEach(cls => {
      (cls.schedule as ClassScheduleSlot[])?.forEach(slot => {
        const targetDay = dayMap[slot.day]
        for (let week = 0; week < 16; week++) {
          const d = new Date(today)
          d.setDate(d.getDate() + ((targetDay - d.getDay() + 7) % 7) + week * 7)
          const [sh, sm] = slot.start.split(':').map(Number)
          const [eh, em] = slot.end.split(':').map(Number)
          const start = new Date(d); start.setHours(sh, sm, 0, 0)
          const end = new Date(d); end.setHours(eh, em, 0, 0)
          classEvents.push({ title: cls.code ?? cls.name, start, end, color: cls.color, eventType: 'class', isClassEvent: true, classId: cls.id })
        }
      })
    })

    return [...stored, ...classEvents]
  }, [events, classes])

  function openSlot(slotInfo: SlotInfo) {
    setSelectedSlot({ start: slotInfo.start, end: slotInfo.end })
    setEStart(format(slotInfo.start, "yyyy-MM-dd'T'HH:mm"))
    setEEnd(format(slotInfo.end, "yyyy-MM-dd'T'HH:mm"))
    setETitle(''); setEType('event'); setEColor('#5bc4f5'); setEDesc(''); setEClassId(''); setEAllDay(false)
    setSelectedEvent(null)
    setShowModal(true)
  }

  function openEvent(event: RBCEvent) {
    if (event.isClassEvent) return // read-only
    setSelectedEvent(event)
    setETitle(event.title as string ?? '')
    setEStart(format(event.start!, "yyyy-MM-dd'T'HH:mm"))
    setEEnd(format(event.end!, "yyyy-MM-dd'T'HH:mm"))
    setEType((event.eventType as any) ?? 'event')
    setEColor(event.color ?? '#5bc4f5')
    setShowModal(true)
  }

  async function saveEvent() {
    if (!profile || !eTitle) return
    const payload = {
      user_id: profile.id, title: eTitle, event_type: eType, color: eColor,
      start_time: new Date(eStart).toISOString(), end_time: new Date(eEnd).toISOString(),
      all_day: eAllDay, description: eDesc || null, class_id: eClassId || null,
    }
    if (selectedEvent?.id) {
      // Update
      await supabase.from('calendar_events').update(payload).eq('id', selectedEvent.id)
      setEvents(prev => prev.map(e => e.id === selectedEvent.id ? { ...e, ...payload } as CalendarEvent : e))
      toast.success('Event updated!')
    } else {
      const { data } = await supabase.from('calendar_events').insert(payload).select().single()
      if (data) setEvents(prev => [...prev, data as CalendarEvent])
      toast.success('Event added!')
    }
    setShowModal(false)
  }

  async function deleteEvent() {
    if (!selectedEvent?.id) return
    await supabase.from('calendar_events').delete().eq('id', selectedEvent.id)
    setEvents(prev => prev.filter(e => e.id !== selectedEvent.id))
    setShowModal(false)
    toast.success('Event deleted')
  }

  const eventStyleGetter = (event: RBCEvent) => ({
    style: {
      backgroundColor: (event.color ?? '#5bc4f5') + '28',
      border: `1px solid ${event.color ?? '#5bc4f5'}88`,
      color: event.color ?? '#5bc4f5',
      borderRadius: '6px',
      fontSize: 11,
      fontFamily: 'var(--font-sora)',
      opacity: event.isClassEvent ? 0.75 : 1,
    },
  })

  return (
    <div className="p-4 flex flex-col gap-3 h-full" style={{ height: 'calc(100vh - 56px)' }}>
      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap">
        {Object.entries(EVENT_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1.5 text-xs capitalize" style={{ color: '#6a9ab8' }}>
            <div className="w-3 h-3 rounded-full" style={{ background: color }}/>
            {type}
          </div>
        ))}
        <div className="flex items-center gap-1.5 text-xs" style={{ color: '#6a9ab8' }}>
          <div className="w-3 h-3 rounded-full" style={{ background: '#c084fc', opacity: 0.7 }}/>
          Recurring class
        </div>
        <button onClick={() => { setSelectedEvent(null); setSelectedSlot({ start: new Date(), end: addMinutes(new Date(),60) }); setEStart(format(new Date(),"yyyy-MM-dd'T'HH:mm")); setEEnd(format(addMinutes(new Date(),60),"yyyy-MM-dd'T'HH:mm")); setETitle(''); setEType('event'); setEColor('#5bc4f5'); setEDesc(''); setEClassId(''); setEAllDay(false); setShowModal(true) }}
          className="ml-auto btn-primary px-3 py-1.5 rounded-xl text-xs">+ Add Event</button>
      </div>

      {/* Calendar */}
      <div className="glass-card flex-1 overflow-hidden p-3">
        <Calendar
          localizer={localizer}
          events={rbcEvents}
          startAccessor="start"
          endAccessor="end"
          view={view}
          date={date}
          onView={v => setView(v)}
          onNavigate={d => setDate(d)}
          onSelectSlot={openSlot}
          onSelectEvent={openEvent}
          selectable
          eventPropGetter={eventStyleGetter}
          style={{ height: '100%' }}
          views={[Views.MONTH, Views.WEEK, Views.DAY]}
        />
      </div>

      {/* ── EVENT MODAL ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
          onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <motion.div className="glass-card p-6 w-full max-w-sm" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <h2 className="text-base font-bold text-[#e8f4ff] mb-4" style={{ fontFamily: 'var(--font-sora)' }}>
              {selectedEvent ? 'Edit Event' : 'New Event'}
            </h2>
            <div className="flex flex-col gap-3">
              <input className="island-input" placeholder="Event title *" value={eTitle} onChange={e => setETitle(e.target.value)}/>
              <div className="grid grid-cols-2 gap-2">
                <select className="island-input py-2" value={eType} onChange={e => { setEType(e.target.value as any); setEColor(EVENT_COLORS[e.target.value] ?? '#5bc4f5') }}>
                  <option value="event">📅 Event</option>
                  <option value="study">📚 Study session</option>
                  <option value="deadline">⏰ Deadline</option>
                </select>
                <select className="island-input py-2" value={eClassId} onChange={e => setEClassId(e.target.value)}>
                  <option value="">No class</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.code ?? c.name}</option>)}
                </select>
              </div>
              <input type="datetime-local" className="island-input py-2" value={eStart} onChange={e => setEStart(e.target.value)}/>
              <input type="datetime-local" className="island-input py-2" value={eEnd} onChange={e => setEEnd(e.target.value)}/>
              <label className="flex items-center gap-2 text-xs text-[#6a9ab8] cursor-pointer">
                <input type="checkbox" checked={eAllDay} onChange={e => setEAllDay(e.target.checked)} className="accent-[#5bc4f5]"/>
                All day event
              </label>
              {/* Color dots */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#6a9ab8]">Color</span>
                {Object.values(EVENT_COLORS).map(c => (
                  <button key={c} onClick={() => setEColor(c)} className="w-5 h-5 rounded-full transition-transform hover:scale-110"
                    style={{ background: c, outline: eColor === c ? `2px solid ${c}` : 'none', outlineOffset: 2 }}/>
                ))}
              </div>
              <textarea className="island-input py-2 resize-none" rows={2} placeholder="Notes…" value={eDesc} onChange={e => setEDesc(e.target.value)}/>
            </div>
            <div className="flex gap-2 mt-4">
              {selectedEvent && (
                <button onClick={deleteEvent} className="btn-ghost py-2 rounded-xl text-xs text-[#f5756a] border-[#f5756a44]">Delete</button>
              )}
              <button onClick={() => setShowModal(false)} className="btn-ghost flex-1 py-2 rounded-xl text-sm">Cancel</button>
              <button onClick={saveEvent} className="btn-primary flex-1 py-2 rounded-xl text-sm">Save</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
