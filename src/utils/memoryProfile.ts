import type { MemoryCapsuleItem, CapsulePerson, CapsulePlace, CapsuleObject, CapsuleEvent, CapsuleRoutine } from '../data/models'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { generateDemoCapsule } from '../data/demoData'

const CAPSULE_KEY = 'aura-memory-capsule'
const SEEDED_KEY = 'aura-capsule-seeded'
const PERSONALIZATION_KEY = 'aura-capsule-personalization'

/** Thin capsule hook reused by the profile layer. */

function useRawCapsule() {
  const [items, setItems] = useLocalStorage<MemoryCapsuleItem[]>(CAPSULE_KEY, [])
  const [seeded, setSeeded] = useLocalStorage<boolean>(SEEDED_KEY, false)
  const [personalizationOn, setPersonalizationOn] = useLocalStorage<boolean>(PERSONALIZATION_KEY, true)

  const seedDemo = () => {
    if (!seeded && items.length === 0) {
      setItems(generateDemoCapsule())
      setSeeded(true)
    }
  }

  const addItem = (item: MemoryCapsuleItem) => setItems(prev => [item, ...prev])
  const updateItem = (id: string, patch: Partial<MemoryCapsuleItem>) =>
    setItems(prev => prev.map(it => (it.id === id ? { ...it, ...patch } as MemoryCapsuleItem : it)))
  const deleteItem = (id: string) => setItems(prev => prev.filter(it => it.id !== id))
  const toggleItem = (id: string) =>
    setItems(prev => prev.map(it => (it.id === id ? { ...it, enabled: !it.enabled } as MemoryCapsuleItem : it)))
  const clearAll = () => setItems([])

  const activeItems = items.filter(it => it.enabled && personalizationOn)

  const people = activeItems.filter((it): it is CapsulePerson => it.type === 'person')
  const places = activeItems.filter((it): it is CapsulePlace => it.type === 'place')
  const objects = activeItems.filter((it): it is CapsuleObject => it.type === 'object')
  const events = activeItems.filter((it): it is CapsuleEvent => it.type === 'event')
  const routines = activeItems.filter((it): it is CapsuleRoutine => it.type === 'routine')

  return {
    items,
    activeItems,
    personalizationOn,
    setPersonalizationOn,
    people,
    places,
    objects,
    events,
    routines,
    addItem,
    updateItem,
    deleteItem,
    toggleItem,
    clearAll,
    seedDemo,
  }
}

/**
 * MemoryProfile — a single, coherent "understanding" of the person's
 * memories, built once from the capsule and shared by the games that are
 * designed to use them.
 *
 * Without this layer, each game reads raw capsule fields on its own and
 * builds its own ad-hoc version of the same memory. With it, the same
 * memories appear consistently across Memory Replay, Memory Story,
 * What Changed?, Routine Deviation, and Forget → Teach → Retest.
 *
 * Profile is intentionally small and readable. It is NOT a medical or
 * diagnostic model.
 */
export interface MemoryProfile {
  /** Whether the profile is using the user's own enabled capsule data. */
  personalized: boolean
  /** People the user has saved. */
  people: ProfilePerson[]
  /** Places the user has saved. */
  places: ProfilePlace[]
  /** Objects the user has saved. */
  objects: ProfileObject[]
  /** Events the user has saved. */
  events: ProfileEvent[]
  /** Routines the user has saved. */
  routines: ProfileRoutine[]
  /** A plain sentence describing what the profile is built from. */
  sourceNote: string
}

export interface ProfilePerson {
  id: string
  name: string
  relationship: string
  description: string
  emoji: string
}

export interface ProfilePlace {
  id: string
  name: string
  description: string
  memory: string
  people: string[]
  emoji: string
}

export interface ProfileObject {
  id: string
  name: string
  belongsTo: string
  description: string
  emoji: string
}

export interface ProfileEvent {
  id: string
  name: string
  dateLabel: string
  story: string
  people: string[]
  emoji: string
}

export interface ProfileRoutine {
  id: string
  activity: string
  time: string
  steps: string[]
  notes: string
  emoji: string
}

const DEMO_SOURCE = 'familiar demo memories — the ones you add will take their place'

/**
 * Build a profile from the capsule.
 *
 * Used by:
 *  - Memory Replay
 *  - Memory Story
 *  - What Changed?
 *  - Routine Deviation
 *  - Forget → Teach → Retest (indirectly, through capsule reads)
 */
export function buildMemoryProfile(capsule: ReturnType<typeof useRawCapsule>): MemoryProfile {
  const people = capsule.people.map(p => ({
    id: p.id,
    name: p.name,
    relationship: p.relationship,
    description: p.description,
    emoji: p.emoji,
  }))

  const places = capsule.places.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description,
    memory: p.memory,
    people: p.people,
    emoji: p.emoji,
  }))

  const objects = capsule.objects.map(o => ({
    id: o.id,
    name: o.name,
    belongsTo: o.belongsTo,
    description: o.description,
    emoji: o.emoji,
  }))

  const events = capsule.events.map(e => ({
    id: e.id,
    name: e.name,
    dateLabel: e.dateLabel,
    story: e.story,
    people: e.people,
    emoji: e.emoji,
  }))

  const routines = capsule.routines.map(r => ({
    id: r.id,
    activity: r.activity,
    time: r.time,
    steps: r.steps,
    notes: r.notes ?? '',
    emoji: r.emoji,
  }))

  const personalized = people.length > 0 || places.length > 0 || objects.length > 0 || events.length > 0 || routines.length > 0

  let sourceNote = DEMO_SOURCE
  if (personalized) {
    const parts: string[] = []
    if (people.length > 0) parts.push(`${people.length} person${people.length > 1 ? 's' : ''}`)
    if (places.length > 0) parts.push(`${places.length} place${places.length > 1 ? 's' : ''}`)
    if (objects.length > 0) parts.push(`${objects.length} object${objects.length > 1 ? 's' : ''}`)
    if (events.length > 0) parts.push(`${events.length} event${events.length > 1 ? 's' : ''}`)
    if (routines.length > 0) parts.push(`${routines.length} routine${routines.length > 1 ? 's' : ''}`)
    sourceNote = `from your ${parts.join(', ')}`
  }

  return {
    personalized,
    people,
    places,
    objects,
    events,
    routines,
    sourceNote,
  }
}

/**
 * Default demo profile used as a readable fallback when the capsule is
 * effectively empty. This keeps the prototype usable on first visit and
 * in demo mode without pretending it is the user's own data.
 */
export const DEMO_PROFILE: MemoryProfile = {
  personalized: false,
  people: [
    { id: 'demo-ananya', name: 'Ananya', relationship: "Ravi's daughter", description: 'Loves gardening and evening walks.', emoji: '👧' },
    { id: 'demo-lakshmi', name: 'Lakshmi', relationship: "Ravi's wife", description: 'Evenings are for the radio and her filter coffee.', emoji: '👩' },
  ],
  places: [
    { id: 'demo-garden', name: 'Family Garden', description: 'A small garden behind the house with rose plants.', memory: 'Ravi spends his mornings here watering the roses with Ananya.', people: ['Ananya', 'Lakshmi'], emoji: '🌿' },
    { id: 'demo-home', name: 'Home', description: 'The house Ravi has lived in for 35 years.', memory: 'Every evening ends with tea on the front porch.', people: ['Lakshmi', 'Ananya'], emoji: '🏠' },
  ],
  objects: [
    { id: 'demo-stick', name: 'Walking Stick', belongsTo: 'Beside the front door', description: 'A wooden walking stick Ravi has used for 8 years.', emoji: '🦯' },
    { id: 'demo-radio', name: 'Old Radio', belongsTo: 'On the kitchen shelf', description: 'The old radio that fills every evening with familiar songs.', emoji: '📻' },
  ],
  events: [
    { id: 'demo-gathering', name: 'Sunday Family Gathering', dateLabel: '2025', story: 'One Sunday, everyone gathered in the garden. Ananya visited Ravi, and the family planted a new rose bush together.', people: ['Ananya', 'Lakshmi'], emoji: '📸' },
  ],
  routines: [
    { id: 'demo-morning', activity: 'Morning Routine', time: '7:00 AM', steps: ['Wake up', 'Breakfast', 'Morning walk', 'Memory activity'], notes: 'Radio plays bhajans during breakfast.', emoji: '🕰️' },
  ],
  sourceNote: DEMO_SOURCE,
}
