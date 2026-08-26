// NER-inspired objects for cognitive games
export const GAME_OBJECTS = [
  { id: 'bamboo', label: 'Bamboo', emoji: '🎋', category: 'nature' },
  { id: 'lotus', label: 'Lotus', emoji: '🪷', category: 'nature' },
  { id: 'mountain', label: 'Mountain', emoji: '🏔️', category: 'landscape' },
  { id: 'rice', label: 'Rice', emoji: '🍚', category: 'food' },
  { id: 'tea', label: 'Tea', emoji: '🍵', category: 'food' },
  { id: 'drum', label: 'Drum', emoji: '🥁', category: 'music' },
  { id: 'lantern', label: 'Lantern', emoji: '🏮', category: 'festival' },
  { id: 'boat', label: 'Boat', emoji: '🚣', category: 'transport' },
  { id: 'orchid', label: 'Orchid', emoji: '🌸', category: 'nature' },
  { id: 'bird', label: 'Hornbill', emoji: '🦜', category: 'nature' },
  { id: 'fish', label: 'Fish', emoji: '🐟', category: 'nature' },
  { id: 'bridge', label: 'Bridge', emoji: '🌉', category: 'landscape' },
  { id: 'spice', label: 'Spice', emoji: '🌶️', category: 'food' },
  { id: 'weave', label: 'Weave', emoji: '🧶', category: 'craft' },
  { id: 'sun', label: 'Sunrise', emoji: '🌅', category: 'landscape' },
  { id: 'rain', label: 'Rain', emoji: '🌧️', category: 'nature' },
  { id: 'mango', label: 'Mango', emoji: '🥭', category: 'food' },
  { id: 'incense', label: 'Incense', emoji: '🪔', category: 'ritual' },
]

export const MEMORY_MATCH_ICONS = [
  '🌺', '🏠', '🎵', '🌊', '🍃', '☀️', '🎹', '🧘',
  '🐘', '🌺', '🏡', '🎶', '🌊', '🍃', '☀️', '🎹',
]

export const GAME_CATEGORIES = [
  {
    id: 'memory',
    title: 'Memory',
    description: 'Remember and match objects',
    icon: '🧠',
    color: 'from-forest-400 to-forest-600',
  },
  {
    id: 'focus',
    title: 'Focus',
    description: 'Identify important visual information',
    icon: '👁️',
    color: 'from-sage-400 to-sage-600',
  },
  {
    id: 'recognition',
    title: 'Recognition',
    description: 'Recognize familiar people, places and objects',
    icon: '🔍',
    color: 'from-amber-400 to-amber-600',
  },
  {
    id: 'recall',
    title: 'Recall',
    description: 'Remember information shown moments earlier',
    icon: '💭',
    color: 'from-forest-300 to-sage-500',
  },
]
