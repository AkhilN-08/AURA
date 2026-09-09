import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Heart, Plus, Pencil, Trash2, Eye, EyeOff, X, Sparkles,
  User, MapPin, Package, CalendarDays, Clock, ShieldCheck, ArrowLeft, Camera,
} from 'lucide-react'
import { useMemoryCapsule } from '../hooks/useMemoryCapsule'
import { useGameProgress } from '../hooks/useGameProgress'
import { useTranslation } from '../hooks/useTranslation'
import MemoryGarden from '../components/garden/MemoryGarden'
import { getRecommendedGame, getCategoryScores } from '../utils/adaptiveEngine'
import { playTapSound, speakText } from '../utils/audio'
import { useAuth } from '../hooks/useAuth'
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
  const { t, language } = useTranslation()
  const { user } = useAuth()
  const capsule = useMemoryCapsule()
  const { seedDemo } = capsule
  const userName = user?.name || 'Ravi'
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
    <div className="room room-archive px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header — editorial, human */}
        <div className="mb-12">
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-[#a08d70] mb-4">{t('the memory capsule')}</p>
          <h1 className="font-serif-display text-5xl md:text-7xl leading-[0.95] tracking-tight text-charcoal-800 dark:text-white mb-5">
            {t('MEMORIES')}<br />{t('THAT MATTER.')}
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-charcoal-500 dark:text-charcoal-400">
            {t('The little library of what matters — people, places, and moments that AURA gently weaves into your games.')}
          </p>
          <p className="text-xs text-charcoal-400 mt-4 flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-sage-500" />
            {t('Memory Capsule is private and controlled by you. Nothing leaves this device.')}
          </p>
        </div>

        {/* The garden — every memory lives here */}
        <div className="mb-12">
          <MemoryGarden onSelectMemory={(id, name) => {
            const it = capsule.items.find(i => i.id === id)
            if (it) setEditor({ mode: 'edit', item: it })
            else speakText(t(name), language)
          }} />
          <p className="mt-3 font-mono text-[11px] text-[#a0937e] flex items-center gap-2">
            <Sparkles size={12} className="text-[#b3895e]" />
            {t('Tap a tree, a bush, or a lantern to visit that memory. Every memory in your capsule is planted here.')}
          </p>
        </div>

        {/* Personalization toggle */}
        <div className="card mb-8 !p-5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Sparkles size={20} className={capsule.personalizationOn ? 'text-amber-500' : 'text-charcoal-300'} />
            <div>
              <p className="font-semibold text-charcoal-800 dark:text-white">{t('Personalization')}</p>
              <p className="text-sm text-charcoal-400">
                {capsule.personalizationOn
                  ? t('Your memories are used to personalize games.')
                  : t('Games are using neutral demo memories.')}
              </p>
            </div>
          </div>
          <button
            onClick={() => { playTapSound(); capsule.setPersonalizationOn(!capsule.personalizationOn) }}
            className={`relative w-16 h-9 rounded-full transition-colors ${capsule.personalizationOn ? 'bg-sage-500' : 'bg-charcoal-200'}`}
            aria-label={t('Toggle personalization')}
            role="switch"
            aria-checked={capsule.personalizationOn}
          >
            <span className={`absolute top-1 w-7 h-7 rounded-full bg-white shadow transition-all ${capsule.personalizationOn ? 'left-8' : 'left-1'}`} />
          </button>
        </div>

        {/* Filters + add */}
        <div className="flex items-center justify-between gap-4 mb-10 flex-wrap">
          <div className="aura-meta">{capsule.items.length} {t('memories kept')}</div>
          <AddButton onPick={(type) => setEditor({ mode: 'add', type })} />
        </div>

        {/* ── The archive — an album, not a database ── */}
        {visible.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-ink/15 rounded-2xl">
            <div className="text-5xl mb-4">🕊️</div>
            <h3 className="font-serif-display text-2xl text-ink dark:text-white mb-2">{t('Your capsule is waiting')}</h3>
            <p className="text-charcoal-500 dark:text-charcoal-400 max-w-sm mx-auto mb-6">
              {t('Add a person, a place, or a little story — and watch AURA turn it into a game your family will recognize.')}
            </p>
            <AddButton onPick={(type) => setEditor({ mode: 'add', type })} centered />
          </div>
        ) : (
          (Object.keys(CAPSULE_TYPE_META) as CapsuleType[])
            .filter(ct => visible.some(i => i.type === ct))
            .map(ct => {
              const sectionItems = visible.filter(i => i.type === ct)
              const Icon = TYPE_ICONS[ct]
              const sectionTitles: Record<CapsuleType, string> = {
                person: t('MY PEOPLE'),
                place: t('MY PLACES'),
                object: t('MY OBJECTS'),
                event: t('MY MEMORIES'),
                routine: t('MY ROUTINES'),
              }
              return (
                <section key={ct} className="mb-14">
                  <div className="flex items-baseline gap-4 mb-6">
                    <Icon size={18} className="text-[#b3895e] self-center" />
                    <h2 className="font-serif-display text-2xl md:text-3xl text-ink dark:text-white">{sectionTitles[ct]}</h2>
                    <div className="flex-1 h-px bg-ink/15" />
                    <span className="aura-meta">{sectionItems.length}</span>
                  </div>

                  <div className="space-y-0">
                    {sectionItems.map(item => (
                      <article
                        key={item.id}
                        className={`aura-index-row !items-start !py-5 ${item.enabled ? '' : 'opacity-55'}`}
                      >
                        {/* The photograph — printed, with its white border */}
                        <div className="flex-shrink-0 bg-white p-1.5 pb-4 shadow-[0_4px_14px_-4px_rgba(23,23,23,0.3)] self-start">
                          {item.photoData
                            ? <img src={item.photoData} alt={labelOf(item)} className="w-20 h-20 object-cover" />
                            : <div className="w-20 h-20 bg-[#f3ead9] flex items-center justify-center text-4xl">{item.emoji}</div>}
                        </div>

                        {/* The record */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-3 flex-wrap">
                            <h3 className="font-serif-display text-xl md:text-2xl text-ink dark:text-white">{labelOf(item)}</h3>
                            <span className="aura-meta" style={{ color: '#b3895e' }}>{t(itemSubtitle(item))}</span>
                            {!item.enabled && <span className="aura-meta">· {t('Paused')}</span>}
                          </div>
                          <p className="font-serif-display italic text-ink/70 dark:text-charcoal-300 mt-1.5 leading-snug">
                            “{t(itemStory(item))}”
                          </p>
                          <Link
                            to="/welcome"
                            className="mt-2 inline-block aura-meta hover:text-[#b3895e] transition-colors"
                          >
                            {t('VIEW IN MEMORY GARDEN')} →
                          </Link>
                        </div>

                        {/* Actions — quiet, on the margin */}
                        <div className="flex flex-col gap-1 self-center">
                          <button onClick={() => { playTapSound(); setEditor({ mode: 'edit', item }) }} className="p-2 rounded-lg text-ink/40 hover:text-ink hover:bg-ink/5 transition-colors" aria-label={t('Edit {name}', { name: labelOf(item) })} title={t('Edit')}>
                            <Pencil size={16} />
                          </button>
                          <button onClick={() => { playTapSound(); capsule.toggleItem(item.id) }} className="p-2 rounded-lg text-ink/40 hover:text-ink hover:bg-ink/5 transition-colors" aria-label={item.enabled ? t('Pause') : t('Resume')} title={item.enabled ? t('Pause from games') : t('Use in games again')}>
                            {item.enabled ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                          <button
                            onClick={() => { playTapSound(); if (confirm(t('Remove {name} from your capsule?', { name: labelOf(item) }))) capsule.deleteItem(item.id) }}
                            className="p-2 rounded-lg text-ink/30 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            aria-label={t('Delete {name}', { name: labelOf(item) })} title={t('Delete')}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              )
            })
        )}

        {/* Where memories are used */}
        <div className="card mt-10 !p-6">
          <h3 className="font-bold text-charcoal-800 dark:text-white mb-2 flex items-center gap-2">
            <Sparkles size={17} className="text-amber-500" /> {t('Where your memories appear')}
          </h3>
          <p className="text-sm text-charcoal-400 mb-4">
            {t('Every enabled memory quietly becomes part of these activities:')}
          </p>
          <div className="flex flex-wrap gap-2">
            {(['memory-replay', 'memory-story', 'my-place-memories', 'forget-teach-retest', 'what-changed'] as GameSession['gameType'][]).map(gt => (
              <Link key={gt} to="/games" className="text-sm bg-cream-50 border border-cream-200 rounded-full px-4 py-2 text-charcoal-600 hover:border-sage-300 hover:text-sage-600 transition-colors">
                {GAME_TYPES[gt].icon} {t(GAME_TYPES[gt].label)}
              </Link>
            ))}
          </div>
        </div>

        {/* AURA profile preview — from adaptive engine */}
        {sessions.length > 0 && (
          <div className="card mt-6 !p-6">
            <h3 className="font-bold text-charcoal-800 dark:text-white mb-4">{t('Your AURA Profile')}</h3>
            <div className="space-y-3">
              {getCategoryScores(sessions).map(cat => (
                <div key={cat.category} className="flex items-center gap-3">
                  <span className="text-sm text-charcoal-500 w-40 flex-shrink-0">{t(cat.label)}</span>
                  <div className="flex-1 h-2.5 bg-cream-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-sage-400 to-sage-500 rounded-full transition-all" style={{ width: `${cat.value}%` }} />
                  </div>
                  <span className="text-sm font-bold text-charcoal-700 w-10 text-right">{cat.value}%</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-charcoal-500 mt-4 border-t border-cream-100 pt-4">
              <Sparkles size={14} className="inline text-amber-500 mr-1.5" />
              {t('AURA recommends {game} for your next session.', { game: t(GAME_TYPES[getRecommendedGame(sessions)].label) })}
            </p>
          </div>
        )}

        {/* ── Memory Connections — a personal memory map ── */}
        {capsule.activeItems.length >= 2 && (() => {
          // Build organic chains: person → place they're associated with → event → object
          const chains: MemoryCapsuleItem[][] = []
          const used = new Set<string>()
          for (const person of capsule.people) {
            const chain: MemoryCapsuleItem[] = [person]
            used.add(person.id)
            const place = capsule.places.find(pl => pl.people.includes(person.name) && !used.has(pl.id))
            if (place) { chain.push(place); used.add(place.id) }
            const event = capsule.events.find(ev => ev.people.includes(person.name) && !used.has(ev.id))
            if (event) { chain.push(event); used.add(event.id) }
            const obj = capsule.objects.find(o => !used.has(o.id))
            if (obj) { chain.push(obj); used.add(obj.id) }
            if (chain.length >= 2) chains.push(chain)
          }
          // leftovers → one more chain
          const rest = capsule.activeItems.filter(i => !used.has(i.id))
          if (rest.length >= 2) chains.push(rest.slice(0, 4))
          if (chains.length === 0) return null
          return (
            <div className="mt-6 border-2 border-[#e4dccd] rounded-2xl p-6 bg-white/50">
              <h3 className="font-serif-display text-2xl text-charcoal-800 dark:text-white mb-1">{t('How your memories hold each other')}</h3>
              <p className="text-sm text-charcoal-400 mb-6">
                {t('Memory rarely lives alone — a face, a place, a day, a thing. Here is your map.')}
              </p>
              <div className="space-y-5">
                {chains.map((chain, ci) => (
                  <div key={ci} className="flex flex-wrap items-center gap-x-2 gap-y-2">
                    {chain.map((item, ii) => (
                      <span key={item.id} className="flex items-center gap-2">
                        {ii > 0 && (
                          <svg width="26" height="14" viewBox="0 0 26 14" className="text-[#c9b8a0]" aria-hidden>
                            <path d="M 0 7 C 8 2 18 12 26 7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                            <circle cx="24" cy="7" r="2" fill="currentColor" />
                          </svg>
                        )}
                        <button
                          onClick={() => setEditor({ mode: 'edit', item })}
                          className="flex items-center gap-2 bg-white border border-[#e4dccd] rounded-full pl-2 pr-4 py-1.5 hover:border-[#b3895e] hover:shadow-sm transition-all"
                        >
                          {item.photoData
                            ? <img src={item.photoData} alt="" className="w-7 h-7 rounded-full object-cover" />
                            : <span className="text-lg leading-none">{item.emoji}</span>}
                          <span className="text-sm font-semibold text-charcoal-700 dark:text-white">{labelOf(item)}</span>
                        </button>
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )
        })()}
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
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  if (!open) {
    return (
      <button
        onClick={() => { playTapSound(); setOpen(true) }}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-sage-500 hover:bg-sage-600 text-white font-semibold transition-all hover:-translate-y-0.5 shadow-md ${centered ? 'mx-auto' : ''}`}
      >
        <Plus size={18} /> {t('Add a Memory')}
      </button>
    )
  }
  return (
    <div className={`flex items-center gap-2 flex-wrap ${centered ? 'justify-center' : ''}`}>
      {(Object.keys(CAPSULE_TYPE_META) as CapsuleType[]).map(ct => {
        const Icon = TYPE_ICONS[ct]
        return (
          <button
            key={ct}
            onClick={() => { playTapSound(); setOpen(false); onPick(ct) }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white border border-cream-200 text-sm font-semibold text-charcoal-600 hover:border-sage-400 hover:text-sage-600 transition-all"
          >
            <Icon size={15} /> {t(CAPSULE_TYPE_META[ct].label)}
          </button>
        )
      })}
      <button onClick={() => setOpen(false)} className="p-2.5 rounded-2xl text-charcoal-400 hover:text-charcoal-600" aria-label={t('Cancel')}>
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
  const { t } = useTranslation()
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
    reader.onload = ev => {
      // Downscale + compress so photos fit comfortably in localStorage
      const img = new Image()
      img.onload = () => {
        const MAX = 480
        const scale = Math.min(1, MAX / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height)
        setPhotoData(canvas.toDataURL('image/jpeg', 0.8))
      }
      img.onerror = () => setPhotoData(ev.target?.result as string)
      img.src = ev.target?.result as string
    }
    reader.readAsDataURL(file)
    e.target.value = '' // allow re-selecting the same photo
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

  const secondaryLabel = type === 'person' ? t('Relationship') : type === 'object' ? t('Where it belongs') : type === 'event' ? t('Date / Year') : type === 'routine' ? t('Approximate time') : t('Associated people (optional)')

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4" onClick={onClose}>
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-bold text-charcoal-800 flex items-center gap-2">
            {(() => { const Icon = TYPE_ICONS[type]; return <Icon size={20} className="text-rose-500" /> })()}
            {isEdit ? t('Edit Memory') : t('Add {thing}', { thing: t(CAPSULE_TYPE_META[type].label.replace(/s$/, '')) })}
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg text-charcoal-400 hover:bg-cream-50" aria-label={t('Close')}>
            <X size={20} />
          </button>
        </div>

        {/* Photo / emoji */}
        <div className="flex items-center gap-4 mb-5">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-rose-50 to-amber-50 border border-cream-200 flex items-center justify-center overflow-hidden flex-shrink-0 relative">
            {photoData ? <img src={photoData} alt="preview" className="w-full h-full object-cover" /> : <span className="text-4xl">{emoji}</span>}
            {photoData && (
              <button
                onClick={() => setPhotoData('')}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center"
                aria-label={t('Remove photo')}
                title={t('Remove photo')}
              >
                <X size={13} />
              </button>
            )}
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-charcoal-500 mb-2">{t('Photo (optional)')}</label>
            <label className="flex items-center justify-center gap-2 min-h-[52px] rounded-2xl border-2 border-dashed border-cream-200 bg-cream-50 px-4 py-2 text-base font-semibold text-charcoal-600 hover:border-sage-400 hover:text-sage-600 transition-colors cursor-pointer mb-2">
              <Camera size={18} />
              {photoData ? t('Change Photo') : t('Add a Photo')}
              <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {EMOJI_CHOICES.map(e2 => (
                <button key={e2} onClick={() => { setEmoji(e2); setPhotoData('') }} className={`w-8 h-8 rounded-lg text-lg flex items-center justify-center transition-all ${emoji === e2 && !photoData ? 'bg-sage-100 ring-2 ring-sage-400' : 'hover:bg-cream-50'}`}>
                  {e2}
                </button>
              ))}
            </div>
          </div>
        </div>

        <label className="block text-xs font-semibold text-charcoal-500 mb-1.5">
          {type === 'routine' ? t('Activity name') : t('Name')}
        </label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder={type === 'person' ? 'Ananya' : type === 'place' ? 'Family Garden' : type === 'object' ? 'Walking Stick' : type === 'event' ? 'Family Gathering' : 'Morning Routine'}
          className="w-full min-h-[52px] rounded-2xl border-2 border-cream-200 px-4 mb-4 text-lg focus:border-sage-400 outline-none" />

        <label className="block text-xs font-semibold text-charcoal-500 mb-1.5">{secondaryLabel}</label>
        <input value={secondary} onChange={e => setSecondary(e.target.value)} placeholder={type === 'person' ? 'Daughter' : type === 'object' ? 'Beside the front door' : type === 'event' ? '2025' : type === 'routine' ? '7:00 AM' : ''}
          className="w-full min-h-[52px] rounded-2xl border-2 border-cream-200 px-4 mb-4 text-lg focus:border-sage-400 outline-none" />

        {type === 'routine' && (
          <>
            <label className="block text-xs font-semibold text-charcoal-500 mb-1.5">{t('Steps (one per line)')}</label>
            <textarea value={steps} onChange={e => setSteps(e.target.value)} rows={4} placeholder={'Wake up\nBreakfast\nMorning walk'}
              className="w-full rounded-2xl border-2 border-cream-200 px-4 py-3 mb-4 focus:border-sage-400 outline-none" />
          </>
        )}

        <label className="block text-xs font-semibold text-charcoal-500 mb-1.5">
          {type === 'place' ? t('The memory of this place') : type === 'event' ? t('The story') : t('A short note')}
        </label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
          placeholder={type === 'person' ? 'Something warm about them…' : type === 'place' ? 'Ravi spends mornings here with Ananya…' : 'What makes this special?'}
          className="w-full rounded-2xl border-2 border-cream-200 px-4 py-3 mb-6 focus:border-sage-400 outline-none" />

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 min-h-[52px] rounded-2xl border-2 border-cream-200 font-semibold text-charcoal-500 hover:bg-cream-50 transition-colors">
            {t('Cancel')}
          </button>
          <button onClick={save} disabled={!name.trim()} className="flex-1 min-h-[52px] rounded-2xl bg-sage-500 hover:bg-sage-600 disabled:opacity-40 text-white font-semibold transition-all shadow-md">
            {isEdit ? t('Save Changes') : t('Add to Capsule')}
          </button>
        </div>
      </div>
    </div>
  )
}
