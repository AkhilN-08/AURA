import { useLocalStorage } from './useLocalStorage'
import type { MemoryCapsuleItem } from '../data/models'
import { generateDemoCapsule } from '../data/demoData'

const CAPSULE_KEY = 'aura-memory-capsule'
const SEEDED_KEY = 'aura-capsule-seeded'
const PERSONALIZATION_KEY = 'aura-capsule-personalization'

/**
 * Memory Capsule — a private, local library of meaningful memories.
 * Items can be added, edited, deleted, or disabled by the user or a
 * caregiver. Data stays on the device. Personalization can be turned
 * off entirely, in which case games use neutral demo content.
 */
export function useMemoryCapsule() {
  const [items, setItems] = useLocalStorage<MemoryCapsuleItem[]>(CAPSULE_KEY, [])
  const [seeded, setSeeded] = useLocalStorage<boolean>(SEEDED_KEY, false)
  const [personalizationOn, setPersonalizationOn] = useLocalStorage<boolean>(PERSONALIZATION_KEY, true)

  // Seed demo data once so the prototype works immediately
  const seedDemo = () => {
    if (!seeded && items.length === 0) {
      setItems(generateDemoCapsule())
      setSeeded(true)
    }
  }

  const addItem = (item: MemoryCapsuleItem) => {
    setItems(prev => [item, ...prev])
  }

  const updateItem = (id: string, patch: Partial<MemoryCapsuleItem>) => {
    setItems(prev => prev.map(it => (it.id === id ? { ...it, ...patch } as MemoryCapsuleItem : it)))
  }

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(it => it.id !== id))
  }

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(it => (it.id === id ? { ...it, enabled: !it.enabled } as MemoryCapsuleItem : it)))
  }

  const clearAll = () => setItems([])

  const activeItems = items.filter(it => it.enabled && personalizationOn)

  const people = activeItems.filter((it): it is Extract<MemoryCapsuleItem, { type: 'person' }> => it.type === 'person')
  const places = activeItems.filter((it): it is Extract<MemoryCapsuleItem, { type: 'place' }> => it.type === 'place')
  const objects = activeItems.filter((it): it is Extract<MemoryCapsuleItem, { type: 'object' }> => it.type === 'object')
  const events = activeItems.filter((it): it is Extract<MemoryCapsuleItem, { type: 'event' }> => it.type === 'event')
  const routines = activeItems.filter((it): it is Extract<MemoryCapsuleItem, { type: 'routine' }> => it.type === 'routine')

  return {
    items, activeItems, personalizationOn,
    setPersonalizationOn,
    people, places, objects, events, routines,
    addItem, updateItem, deleteItem, toggleItem, clearAll,
    seedDemo,
  }
}
