import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Heart, Plus, Pencil, Trash2, Eye, EyeOff, X, Sparkles,
  User, MapPin, Package, CalendarDays, Clock, ShieldCheck, ArrowLeft,
} from 'lucide-react'
import { useMemoryCapsule } from '../hooks/useMemoryCapsule'
import { useGameProgress } from '../hooks/useGameProgress'
import { getRecommendedGame, getCategoryScores } from '../utils/adaptiveEngine'
import { playTapSound, speakText } from '../utils/audio'
import { GAME_TYPES, CAPSULE_TYPE_META } from '../data/models'
import type { MemoryCapsuleItem, CapsuleType, CapsulePerson, CapsulePlace, CapsuleObject, CapsuleEvent, CapsuleRoutine } from '../data/models'
import type { GameSession } from '../data/models'

const TYPE_ICONS = { person: User, place: MapPin, object: Package, event: CalendarDays, routine: Clock } as const
const EMOJI_CHOICES = ['👧', '👩', '👨', '👵', '🧑', '🌿', '🏠', '🛕', '🏞️', '🦯', '📻', '🧵', '📸', '☕', '🍵', '🐈', '🕰️', '📖']

type EditorState =
  | { mode: 'closed' }
  | { mode: 'add'; type: CapsuleType }
  | { mode: 'edit'; item: MemoryCapsuleItem }

export default function Capsule() {
  const capsule = useMemoryCapsule()
  const { seedDemo } = capsule
  // Seed demo on first visit so the prototype feels alive immediately
  useState(() => { seedDemo(); return null })

  const [editor, setEditor] = useState<EditorState>({ mode: 'closed' })
  const [filter, setFilter] = useState<CapsuleType | 'all'>('all')
  const { sessions } = useGameProgress()

  const counts = {
    person: capsule.people.length + capsule.items.filter(i => i.type === 'person' && !i.enabled).length,
    place: capsule.places.length + capsule.items.filter(i => i.type === 'place' && !i.enabled).length,
    object: capsule.objects.length + capsule.items.filter(i => i.type === 'object' && !i.enabled).length,
    event: capsule.events.length + capsule.items.filter(i => i.type === 'event' && !i.enabled).length,
    routine: capsule.routines.length + capsule.items.filter(i => i.type === 'routine' && !i.enabled).length,
  }

  const visible = capsule.items.filter(i => filter === 'all' || i.type === filter)

  const itemSubtitle = (item: MemoryCapsuleItem): string => {
    switch (item.type) {
      case 'person': return item.relationship
      case 'place': return item.people.length > 0 ? `with ${item.people.join(', ')}` : 'a familiar place'
      case 'object': return item.belongsTo
      case 'event': return item.dateLabel
      case 'routine': return item.time
    }
  }

  const itemStory = (item: MemoryCapsuleItem): string => {
    switch (item.type) {
      case 'person': return item.description
      case 'place': return item.memory
      case 'object': return item.description
      case 'event': return item.story
      case 'routine': return item.steps.join(' → ')
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header — warm, human */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-rose-100 to-amber-100 flex items-center justify-center mb-4">
            <Heart size={30} className="text-rose-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-charcoal-800 dark:text-white mb-3">
            Memory <span className="text-gradient">Capsule</span>
          </h1>
          <p className="section-subheading mx-auto !text-lg">
            The little library of what matters — people, places, and moments that AURA
            gently weaves into your games. <em className="text-charcoal-500">Turn memories that matter into personalized experiences.</em>
          </p>
          <p className="text-xs text-charcoal-400 mt-3 flex items-center justify-center gap-1.5">
            <ShieldCheck size={13} className="text-sage-500" />
            Memory Capsule is private and controlled by you. Nothing leaves this device.
          </p>
        </div>

        {/* Personalization toggle */}
        <div className="card mb-8 !p-5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Sparkles size={20} className={capsule.personalizationOn ? 'text-amber-500' : 'text-charcoal-300'} />
            <div>
              <p className="font-semibold text-charcoal-800 dark:text-white">Personalization</p>
              <p className="text-sm text-charcoal-400">
                {capsule.personalizationOn
                  ? 'Your memories are used to personalize games.'
                  : 'Games are using neutral demo memories.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => { playTapSound(); capsule.setPersonalizationOn(!capsule.personalizationOn) }}
            className={`relative w-16 h-9 rounded-full transition-colors ${capsule.personalizationOn ? 'bg-sage-500' : 'bg-charcoal-200'}`}
            aria-label="Toggle personalization"
            role="switch"
            aria-checked={capsule.personalizationOn}
          >
            <span className={`absolute top-1 w-7 h-7 rounded-full bg-white shadow transition-all ${capsule.personalizationOn ? 'left-8' : 'left-1'}`} />
          </button>
        </div>

        {/* Filters + add */}
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => { playTapSound(); setFilter('all') }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === 'all' ? 'bg-charcoal-700 text-white' : 'bg-white border border-cream-200 text-charcoal-500 hover:border-charcoal-300'}`}
            >
              All · {capsule.items.length}
            </button>
            {(Object.keys(CAPSULE_TYPE_META) as CapsuleType[]).map(t => {
              const Icon = TYPE_ICONS[t]
              return (
                <button
                  key={t}
                  onClick={() => { playTapSound(); setFilter(t) }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${filter === t ? 'bg-charcoal-700 text-white' : 'bg-white border border-cream-200 text-charcoal-500 hover:border-charcoal-300'}`}
                >
                  <Icon size={14} /> {CAPSULE_TYPE_META[t].label} · {counts[t]}
                </button>
              )
            })}
          </div>
          <AddButton onPick={(type) => setEditor({ mode: 'add', type })} />
        </div>

        {/* Memory cards — warm, photo-like */}
        {visible.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-5xl mb-4">🕊️</div>
            <h3 className="text-xl font-bold text-charcoal-800 mb-2">Your capsule is waiting</h3>
            <p className="text-charcoal-400 max-w-sm mx-auto mb-6">
              Add a person, a place, or a little story — and watch AURA turn it into a game
              your family will recognize.
            </p>
            <AddButton onPick={(type) => setEditor({ mode: 'add', type })} centered />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {visible.map(item => (
              <div key={item.id} className={`relative rounded-3xl overflow-hidden border transition-all ${item.enabled ? 'bg-white border-cream-200 shadow-sm hover:shadow-md' : 'bg-stone-50 border-stone-200 opacity-70'}`}>
                {/* Photo area */}
                <div className="h-28 bg-gradient-to-br from-rose-50 via-amber-50 to-sage-50 flex items-center justify-center relative">
                  {item.photoData
                    ? <img src={item.photoData} alt={labelOf(item)} className="w-full h-full object-cover" />
                    : <span className="text-5xl">{item.emoji}</span>}
                  <div className="absolute top-2 left-2 bg-white/85 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-charcoal-500 flex items-center gap-1">
                    {(() => { const Icon = TYPE_ICONS[item.type]; return <Icon size={11} /> })()}
                    {CAPSULE_TYPE_META[item.type].label.replace(/s$/, '')}
                  </div>
                  {!item.enabled && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                      <span className="text-xs font-semibold text-charcoal-500 bg-white/90 rounded-full px-3 py-1">Paused</span>
                    </div>
                  )}
                </div>
                {/* Body */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-charcoal-800 dark:text-white leading-tight">{labelOf(item)}</h3>
                      <p className="text-xs font-medium text-rose-400 capitalize">{itemSubtitle(item)}</p>
                    </div>
                  </div>
                  <p className="text-sm text-charcoal-500 mt-2 line-clamp-2 leading-relaxed">{itemStory(item)}</p>
                  {/* Actions */}
                  <div className="flex items-center gap-1 mt-3 pt-3 border-t border-cream-100">
                    <button onClick={() => { playTapSound(); setEditor({ mode: 'edit', item }) }} className="p-2 rounded-lg text-charcoal-400 hover:text-charcoal-700 hover:bg-cream-50 transition-colors" aria-label={`Edit ${labelOf(item)}`} title="Edit">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => { playTapSound(); capsule.toggleItem(item.id) }} className="p-2 rounded-lg text-charcoal-400 hover:text-charcoal-700 hover:bg-cream-50 transition-colors" aria-label={item.enabled ? 'Pause' : 'Resume'} title={item.enabled ? 'Pause from games' : 'Use in games again'}>
                      {item.enabled ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                    <button
                      onClick={() => { playTapSound(); if (confirm(`Remove ${labelOf(item)} from your capsule?`)) capsule.deleteItem(item.id) }}
                      className="p-2 rounded-lg text-charcoal-300 hover:text-red-500 hover:bg-red-50 transition-colors ml-auto"
                      aria-label={`Delete ${labelOf(item)}`} title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Where memories are used */}
        <div className="card mt-10 !p-6">
          <h3 className="font-bold text-charcoal-800 dark:text-white mb-2 flex items-center gap-2">
            <Sparkles size={17} className="text-amber-500" /> Where your memories appear
          </h3>
          <p className="text-sm text-charcoal-400 mb-4">
            Every enabled memory quietly becomes part of these activities:
          </p>
          <div className="flex flex-wrap gap-2">
            {(['memory-replay', 'memory-story', 'my-place-memories', 'forget-teach-retest', 'what-changed'] as GameSession['gameType'][]).map(gt => (
              <Link key={gt} to="/games" className="text-sm bg-cream-50 border border-cream-200 rounded-full px-4 py-2 text-charcoal-600 hover:border-sage-300 hover:text-sage-600 transition-colors">
                {GAME_TYPES[gt].icon} {GAME_TYPES[gt].label}
              </Link>
            ))}
          </div>
        </div>

        {/* AURA profile preview — from adaptive engine */}
        {sessions.length > 0 && (
          <div className="card mt-6 !p-6">
            <h3 className="font-bold text-charcoal-800 dark:text-white mb-4">Your AURA Profile</h3>
            <div className="space-y-3">
              {getCategoryScores(sessions).map(cat => (
                <div key={cat.category} className="flex items-center gap-3">
                  <span className="text-sm text-charcoal-500 w-40 flex-shrink-0">{cat.label}</span>
                  <div className="flex-1 h-2.5 bg-cream-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-sage-400 to-sage-500 rounded-full transition-all" style={{ width: `${cat.value}%` }} />
                  </div>
                  <span className="text-sm font-bold text-charcoal-700 w-10 text-right">{cat.value}%</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-charcoal-500 mt-4 border-t border-cream-100 pt-4">
              <Sparkles size={14} className="inline text-amber-500 mr-1.5" />
              AURA recommends <strong className="text-sage-600">{GAME_TYPES[getRecommendedGame(sessions)].label}</strong> for your next session.
            </p>
          </div>
        )}
      </div>

      {/* Editor modal */}
      {editor.mode !== 'closed' && (
        <CapsuleEditor
          editor={editor}
          onClose={() => setEditor({ mode: 'closed' })}
          onSave={(item) => {
            if (editor.mode === 'add') capsule.addItem(item)
            else capsule.updateItem(editor.item.id, item as Partial<MemoryCapsuleItem>)
            setEditor({ mode: 'closed' })
          }}
        />
      )}
    </div>
  )
}

function labelOf(item: MemoryCapsuleItem): string {
  switch (item.type) {
    case 'person': return item.name
    case 'place': return item.name
    case 'object': return item.name
    case 'event': return item.name
    case 'routine': return item.activity
  }
}

function AddButton({ onPick, centered }: { onPick: (t: CapsuleType) => void; centered?: boolean }) {
  const [open, setOpen] = useState(false)
  if (!open) {
    return (
      <button
        onClick={() => { playTapSound(); setOpen(true) }}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-sage-500 hover:bg-sage-600 text-white font-semibold transition-all hover:-translate-y-0.5 shadow-md ${centered ? 'mx-auto' : ''}`}
      >
        <Plus size={18} /> Add a Memory
      </button>
    )
  }
  return (
    <div className={`flex items-center gap-2 flex-wrap ${centered ? 'justify-center' : ''}`}>
      {(Object.keys(CAPSULE_TYPE_META) as CapsuleType[]).map(t => {
        const Icon = TYPE_ICONS[t]
        return (
          <button
            key={t}
            onClick={() => { playTapSound(); setOpen(false); onPick(t) }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white border border-cream-200 text-sm font-semibold text-charcoal-600 hover:border-sage-400 hover:text-sage-600 transition-all"
          >
            <Icon size={15} /> {CAPSULE_TYPE_META[t].label}
          </button>
        )
      })}
      <button onClick={() => setOpen(false)} className="p-2.5 rounded-2xl text-charcoal-400 hover:text-charcoal-600" aria-label="Cancel">
        <X size={18} />
      </button>
    </div>
  )
}

// ── Editor ──────────────────────────────────────────────────────

function CapsuleEditor({ editor, onClose, onSave }: {
  editor: EditorState
  onClose: () => void
  onSave: (item: MemoryCapsuleItem) => void
}) {
  const isEdit = editor.mode === 'edit'
  const base = editor.mode === 'edit' ? editor.item : null
  const type: CapsuleType = base?.type ?? (editor.mode === 'add' ? editor.type : 'person')

  const [name, setName] = useState(
    base ? (base.type === 'routine' ? base.activity : base.name) : ''
  )
  const [secondary, setSecondary] = useState(
    base
      ? base.type === 'person' ? base.relationship
        : base.type === 'object' ? base.belongsTo
        : base.type === 'event' ? base.dateLabel
        : base.type === 'routine' ? base.time
        : ''
      : ''
  )
  const [description, setDescription] = useState(
    base
      ? base.type === 'place' ? base.memory
        : base.type === 'event' ? base.story
        : base.type === 'routine' ? base.notes ?? ''
        : base.description
      : ''
  )
  const [steps, setSteps] = useState(base?.type === 'routine' ? base.steps.join('\n') : '')
  const [emoji, setEmoji] = useState(base?.emoji ?? '🌸')
  const [photoData, setPhotoData] = useState(base?.photoData ?? '')

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setPhotoData(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const save = () => {
    playTapSound()
    const now = new Date().toISOString()
    const id = base?.id ?? `capsule-${Date.now()}`
    const common = { id, emoji, photoData: photoData || undefined, enabled: base?.enabled ?? true, createdAt: base?.createdAt ?? now }
    switch (type) {
      case 'person':
        onSave({ ...common, type: 'person', name, relationship: secondary || 'Family', description } as CapsulePerson)
        break
      case 'place':
        onSave({ ...common, type: 'place', name, description, people: [], memory: description } as CapsulePlace)
        break
      case 'object':
        onSave({ ...common, type: 'object', name, belongsTo: secondary || 'At home', description } as CapsuleObject)
        break
      case 'event':
        onSave({ ...common, type: 'event', name, dateLabel: secondary || '2025', people: [], story: description } as CapsuleEvent)
        break
      case 'routine':
        onSave({ ...common, type: 'routine', activity: name, time: secondary || 'Morning', steps: steps.split('\n').map(s => s.trim()).filter(Boolean), notes: description } as CapsuleRoutine)
        break
    }
  }

  const secondaryLabel = type === 'person' ? 'Relationship' : type === 'object' ? 'Where it belongs' : type === 'event' ? 'Date / Year' : type === 'routine' ? 'Approximate time' : 'Associated people (optional)'

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4" onClick={onClose}>
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-bold text-charcoal-800 flex items-center gap-2">
            {(() => { const Icon = TYPE_ICONS[type]; return <Icon size={20} className="text-rose-500" /> })()}
            {isEdit ? 'Edit Memory' : `Add ${CAPSULE_TYPE_META[type].label.replace(/s$/, '')}`}
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg text-charcoal-400 hover:bg-cream-50" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Photo / emoji */}
        <div className="flex items-center gap-4 mb-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-rose-50 to-amber-50 border border-cream-200 flex items-center justify-center overflow-hidden flex-shrink-0">
            {photoData ? <img src={photoData} alt="preview" className="w-full h-full object-cover" /> : <span className="text-4xl">{emoji}</span>}
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-charcoal-500 mb-2">Photo (optional)</label>
            <input type="file" accept="image/*" onChange={handlePhoto} className="text-sm text-charcoal-500 file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-cream-100 file:text-charcoal-600 file:text-sm" />
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {EMOJI_CHOICES.map(e2 => (
                <button key={e2} onClick={() => { setEmoji(e2); setPhotoData('') }} className={`w-8 h-8 rounded-lg text-lg flex items-center justify-center transition-all ${emoji === e2 && !photoData ? 'bg-sage-100 ring-2 ring-sage-400' : 'hover:bg-cream-50'}`}>
                  {e2}
                </button>
              ))}
            </div>
          </div>
        </div>

        <label className="block text-xs font-semibold text-charcoal-500 mb-1.5">
          {type === 'routine' ? 'Activity name' : type === 'person' ? 'Name' : 'Name'}
        </label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder={type === 'person' ? 'Ananya' : type === 'place' ? 'Family Garden' : type === 'object' ? 'Walking Stick' : type === 'event' ? 'Family Gathering' : 'Morning Routine'}
          className="w-full min-h-[52px] rounded-2xl border-2 border-cream-200 px-4 mb-4 text-lg focus:border-sage-400 outline-none" />

        <label className="block text-xs font-semibold text-charcoal-500 mb-1.5">{secondaryLabel}</label>
        <input value={secondary} onChange={e => setSecondary(e.target.value)} placeholder={type === 'person' ? 'Daughter' : type === 'object' ? 'Beside the front door' : type === 'event' ? '2025' : type === 'routine' ? '7:00 AM' : ''}
          className="w-full min-h-[52px] rounded-2xl border-2 border-cream-200 px-4 mb-4 text-lg focus:border-sage-400 outline-none" />

        {type === 'routine' && (
          <>
            <label className="block text-xs font-semibold text-charcoal-500 mb-1.5">Steps (one per line)</label>
            <textarea value={steps} onChange={e => setSteps(e.target.value)} rows={4} placeholder={'Wake up\nBreakfast\nMorning walk'}
              className="w-full rounded-2xl border-2 border-cream-200 px-4 py-3 mb-4 focus:border-sage-400 outline-none" />
          </>
        )}

        <label className="block text-xs font-semibold text-charcoal-500 mb-1.5">
          {type === 'place' ? 'The memory of this place' : type === 'event' ? 'The story' : 'A short note'}
        </label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
          placeholder={type === 'person' ? 'Something warm about them…' : type === 'place' ? 'Ravi spends mornings here with Ananya…' : 'What makes this special?'}
          className="w-full rounded-2xl border-2 border-cream-200 px-4 py-3 mb-6 focus:border-sage-400 outline-none" />

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 min-h-[52px] rounded-2xl border-2 border-cream-200 font-semibold text-charcoal-500 hover:bg-cream-50 transition-colors">
            Cancel
          </button>
          <button onClick={save} disabled={!name.trim()} className="flex-1 min-h-[52px] rounded-2xl bg-sage-500 hover:bg-sage-600 disabled:opacity-40 text-white font-semibold transition-all shadow-md">
            {isEdit ? 'Save Changes' : 'Add to Capsule'}
          </button>
        </div>
      </div>
    </div>
  )
}
