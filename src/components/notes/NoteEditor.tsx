'use client'
// src/components/notes/NoteEditor.tsx
import { useEffect, useCallback, useState, useRef } from 'react'
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import TextStyle from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { createClient } from '@/lib/supabase/client'
import type { Note } from '@/types'

const TEXT_COLORS = ['#e8f4ff','#5bc4f5','#c084fc','#5de8a0','#f5c842','#f5756a','#f5a0c0']

interface Props {
  note: Note
  onSave: (updated: Partial<Note>) => void
}

export default function NoteEditor({ note, onSave }: Props) {
  const supabase = createClient()
  const [title, setTitle] = useState(note.title)
  const [tags, setTags] = useState<string[]>(note.tags ?? [])
  const [tagInput, setTagInput] = useState('')
  const [wordCount, setWordCount] = useState(note.word_count)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved')
  const saveTimer = useRef<NodeJS.Timeout | null>(null)

  const save = useCallback(async (content: object | null, text: string, titleVal: string, tagsVal: string[]) => {
    setSaveStatus('saving')
    const wc = text.trim().split(/\s+/).filter(Boolean).length
    setWordCount(wc)
    await supabase.from('notes').update({
      title: titleVal, content, content_text: text, word_count: wc, tags: tagsVal, updated_at: new Date().toISOString(),
    }).eq('id', note.id)
    onSave({ title: titleVal, content, content_text: text, word_count: wc, tags: tagsVal })
    setSaveStatus('saved')
  }, [note.id, supabase, onSave])

  const scheduleSave = useCallback((content: object | null, text: string, titleVal: string, tagsVal: string[]) => {
    setSaveStatus('unsaved')
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => save(content, text, titleVal, tagsVal), 1500)
  }, [save])

  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight.configure({ multicolor: true }),
      TextStyle,
      Color,
      Image,
      Placeholder.configure({ placeholder: 'Start writing your note…' }),
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    content: note.content ?? '',
    onUpdate: ({ editor }) => {
      scheduleSave(editor.getJSON(), editor.getText(), title, tags)
    },
  })

  useEffect(() => {
    if (editor && note.content && editor.getHTML() !== '') {
      editor.commands.setContent(note.content)
    }
  }, [note.id])

  function addTag() {
    const t = tagInput.trim().replace(/^#/, '')
    if (!t || tags.includes(t)) return
    const newTags = [...tags, t]
    setTags(newTags)
    setTagInput('')
    if (editor) scheduleSave(editor.getJSON(), editor.getText(), title, newTags)
  }

  function removeTag(tag: string) {
    const newTags = tags.filter(t => t !== tag)
    setTags(newTags)
    if (editor) scheduleSave(editor.getJSON(), editor.getText(), title, newTags)
  }

  async function insertImage() {
    const url = prompt('Image URL:')
    if (url && editor) editor.chain().focus().setImage({ src: url }).run()
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-4 py-2 flex-wrap flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(4,12,26,0.6)', backdropFilter: 'blur(10px)' }}>

        {/* Format buttons */}
        {[
          { label: 'B', action: () => editor?.chain().focus().toggleBold().run(), active: editor?.isActive('bold') },
          { label: 'I', action: () => editor?.chain().focus().toggleItalic().run(), active: editor?.isActive('italic') },
          { label: 'U', action: () => editor?.chain().focus().toggleStrike().run(), active: editor?.isActive('strike') },
          { label: '`', action: () => editor?.chain().focus().toggleCode().run(), active: editor?.isActive('code') },
        ].map(b => (
          <button key={b.label} onClick={b.action}
            className="w-7 h-7 rounded-lg text-xs font-bold transition-all"
            style={{
              background: b.active ? 'rgba(91,196,245,0.2)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${b.active ? 'rgba(91,196,245,0.4)' : 'rgba(255,255,255,0.08)'}`,
              color: b.active ? '#5bc4f5' : '#6a9ab8',
            }}>{b.label}</button>
        ))}

        <div className="w-px h-5 mx-0.5" style={{ background: 'rgba(255,255,255,0.08)' }}/>

        {/* Headings */}
        {[1, 2, 3].map(level => (
          <button key={level} onClick={() => editor?.chain().focus().toggleHeading({ level: level as 1|2|3 }).run()}
            className="h-7 px-2 rounded-lg text-[10px] font-bold transition-all"
            style={{
              background: editor?.isActive('heading', { level }) ? 'rgba(192,132,252,0.2)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${editor?.isActive('heading', { level }) ? 'rgba(192,132,252,0.4)' : 'rgba(255,255,255,0.08)'}`,
              color: editor?.isActive('heading', { level }) ? '#c084fc' : '#6a9ab8',
              fontFamily: 'var(--font-sora)',
            }}>H{level}</button>
        ))}

        <div className="w-px h-5 mx-0.5" style={{ background: 'rgba(255,255,255,0.08)' }}/>

        {/* Lists */}
        <button onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className="w-7 h-7 rounded-lg text-xs transition-all"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#6a9ab8' }}>•≡</button>
        <button onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          className="w-7 h-7 rounded-lg text-xs transition-all"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#6a9ab8' }}>1≡</button>
        <button onClick={() => editor?.chain().focus().toggleTaskList().run()}
          className="w-7 h-7 rounded-lg text-xs transition-all"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#6a9ab8' }}>☑</button>
        <button onClick={() => editor?.chain().focus().toggleHighlight().run()}
          className="w-7 h-7 rounded-lg text-sm transition-all"
          style={{ background: editor?.isActive('highlight') ? 'rgba(245,200,66,0.2)' : 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#6a9ab8' }}>🖊</button>

        {/* Text colors */}
        <div className="flex gap-1 ml-0.5">
          {TEXT_COLORS.slice(1).map(c => (
            <button key={c} onClick={() => editor?.chain().focus().setColor(c).run()}
              className="w-4 h-4 rounded-full transition-transform hover:scale-110"
              style={{ background: c, outline: editor?.isActive('textStyle', { color: c }) ? `2px solid ${c}` : 'none', outlineOffset: 1 }}/>
          ))}
        </div>

        <div className="w-px h-5 mx-0.5" style={{ background: 'rgba(255,255,255,0.08)' }}/>

        <button onClick={insertImage}
          className="h-7 px-2 rounded-lg text-[10px] transition-all"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#6a9ab8' }}>📷 Image</button>

        {/* Save status */}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[10px]" style={{ color: saveStatus === 'saved' ? '#5de8a0' : saveStatus === 'saving' ? '#f5c842' : '#f5756a', fontFamily: 'var(--font-sora)' }}>
            {saveStatus === 'saved' ? '✓ Saved' : saveStatus === 'saving' ? '● Saving…' : '○ Unsaved'}
          </span>
          <span className="text-[10px] text-[#2a5070]">{wordCount}w</span>
        </div>
      </div>

      {/* Title */}
      <div className="px-6 pt-4 pb-1 flex-shrink-0">
        <input
          value={title}
          onChange={e => {
            setTitle(e.target.value)
            if (editor) scheduleSave(editor.getJSON(), editor.getText(), e.target.value, tags)
          }}
          className="w-full text-2xl font-bold bg-transparent border-none outline-none text-[#e8f4ff]"
          style={{ fontFamily: 'var(--font-sora)' }}
          placeholder="Note title…"
        />
        {/* Tags */}
        <div className="flex items-center gap-1.5 flex-wrap mt-2">
          {tags.map(tag => (
            <span key={tag} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-md"
              style={{ background: 'rgba(192,132,252,0.12)', border: '1px solid rgba(192,132,252,0.25)', color: '#c084fc' }}>
              #{tag}
              <button onClick={() => removeTag(tag)} className="opacity-60 hover:opacity-100 text-[10px]">✕</button>
            </span>
          ))}
          <input value={tagInput} onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => (e.key === 'Enter' || e.key === ',') && (e.preventDefault(), addTag())}
            placeholder="+ tag"
            className="text-xs bg-transparent border-none outline-none text-[#3a6080] w-16"
            style={{ fontFamily: 'var(--font-sora)' }}/>
        </div>
      </div>

      {/* Editor area */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {editor && (
          <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
            <div className="flex gap-1 p-1 rounded-xl shadow-lg"
              style={{ background: 'rgba(4,12,26,0.95)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(20px)' }}>
              <button onClick={() => editor.chain().focus().toggleBold().run()}
                className="px-2 py-1 rounded text-xs font-bold" style={{ color: editor.isActive('bold') ? '#5bc4f5' : '#a8cce8' }}>B</button>
              <button onClick={() => editor.chain().focus().toggleItalic().run()}
                className="px-2 py-1 rounded text-xs italic" style={{ color: editor.isActive('italic') ? '#5bc4f5' : '#a8cce8' }}>I</button>
              <button onClick={() => editor.chain().focus().toggleHighlight().run()}
                className="px-2 py-1 rounded text-xs" style={{ color: '#f5c842' }}>🖊</button>
            </div>
          </BubbleMenu>
        )}
        <EditorContent editor={editor}/>
      </div>
    </div>
  )
}
