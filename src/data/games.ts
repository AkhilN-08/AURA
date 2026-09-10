// NER-inspired objects for cognitive games — each with a real photo and emoji fallback
export interface GameObject {
  id: string
  label: string
  emoji: string
  image: string
  category: string
}

export const GAME_OBJECTS: GameObject[] = [
  { id: 'bamboo', label: 'Bamboo', emoji: '🎋', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=120&h=120&fit=crop&auto=format&q=75', category: 'nature' },
  { id: 'lotus', label: 'Lotus', emoji: '🪷', image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=120&h=120&fit=crop&auto=format&q=75', category: 'nature' },
  { id: 'mountain', label: 'Mountain', emoji: '🏔️', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=120&h=120&fit=crop&auto=format&q=75', category: 'landscape' },
  { id: 'rice', label: 'Rice', emoji: '🍚', image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=120&h=120&fit=crop&auto=format&q=75', category: 'food' },
  { id: 'tea', label: 'Tea', emoji: '🍵', image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=120&h=120&fit=crop&auto=format&q=75', category: 'food' },
  { id: 'drum', label: 'Drum', emoji: '🥁', image: 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=120&h=120&fit=crop&auto=format&q=75', category: 'music' },
  { id: 'lantern', label: 'Lantern', emoji: '🏮', image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=120&h=120&fit=crop&auto=format&q=75', category: 'festival' },
  { id: 'boat', label: 'Boat', emoji: '🚣', image: 'https://images.unsplash.com/photo-1500514966906-fe245eea9344?w=120&h=120&fit=crop&auto=format&q=75', category: 'transport' },
  { id: 'flower', label: 'Flower', emoji: '🌸', image: 'https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=120&h=120&fit=crop&auto=format&q=75', category: 'nature' },
  { id: 'bird', label: 'Bird', emoji: '🦜', image: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=120&h=120&fit=crop&auto=format&q=75', category: 'nature' },
  { id: 'fish', label: 'Fish', emoji: '🐟', image: 'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?w=120&h=120&fit=crop&auto=format&q=75', category: 'nature' },
  { id: 'bridge', label: 'Bridge', emoji: '🌉', image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=120&h=120&fit=crop&auto=format&q=75', category: 'landscape' },
  { id: 'spice', label: 'Chilli', emoji: '🌶️', image: 'https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=120&h=120&fit=crop&auto=format&q=75', category: 'food' },
  { id: 'weave', label: 'Yarn', emoji: '🧶', image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=120&h=120&fit=crop&auto=format&q=75', category: 'craft' },
  { id: 'sun', label: 'Sunrise', emoji: '🌅', image: 'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=120&h=120&fit=crop&auto=format&q=75', category: 'landscape' },
  { id: 'rain', label: 'Rain', emoji: '🌧️', image: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=120&h=120&fit=crop&auto=format&q=75', category: 'nature' },
  { id: 'mango', label: 'Mango', emoji: '🥭', image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=120&h=120&fit=crop&auto=format&q=75', category: 'food' },
  { id: 'incense', label: 'Diya', emoji: '🪔', image: 'https://images.unsplash.com/photo-1567591370504-8022e49493e4?w=120&h=120&fit=crop&auto=format&q=75', category: 'ritual' },
]

export const MEMORY_MATCH_ICONS = [
  { emoji: '🌺', image: 'https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=120&h=120&fit=crop&auto=format&q=75', label: 'Hibiscus' },
  { emoji: '🏠', image: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=120&h=120&fit=crop&auto=format&q=75', label: 'Home' },
  { emoji: '🎵', image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=120&h=120&fit=crop&auto=format&q=75', label: 'Music' },
  { emoji: '🌊', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=120&h=120&fit=crop&auto=format&q=75', label: 'Ocean' },
  { emoji: '🍃', image: 'https://images.unsplash.com/photo-1470058869958-2a77ade41c02?w=120&h=120&fit=crop&auto=format&q=75', label: 'Leaf' },
  { emoji: '☀️', image: 'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=120&h=120&fit=crop&auto=format&q=75', label: 'Sun' },
  { emoji: '🎹', image: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=120&h=120&fit=crop&auto=format&q=75', label: 'Piano' },
  { emoji: '🧘', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=120&h=120&fit=crop&auto=format&q=75', label: 'Peace' },
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
