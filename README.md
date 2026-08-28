# AURA-NER NER

## AI-Powered Cognitive Gaming and Memory Assistance Platform

A warm, accessible prototype designed to support elderly people experiencing memory and cognitive difficulties, with caregivers and family as secondary users.

**Built for the North Eastern Region (NER) of India.**

---

## Problem

Millions of elderly people in the North Eastern Region face dementia-related cognitive challenges. Access to specialized cognitive care is limited. Families need gentle, accessible tools to keep minds engaged and stay connected with their loved ones' cognitive health.

## Solution

AURA-NER combines:

- **Cognitive Games** — Three playable games (Memory Match, Object Recall, Sequence Recall) that exercise different aspects of memory and attention
- **AI-Assisted Personalization** — Adaptive difficulty that adjusts based on individual performance
- **Memory Assistant** — A voice-enabled companion for reminders, daily routines, and memory prompts
- **Caregiver Dashboard** — Gentle insights into cognitive activity, game performance, and weekly trends

---

## Key Features

- 🌳 **Interactive 3D Memory Garden** — A living Three.js environment with cursor interaction
- 🧠 **Three Playable Cognitive Games** — Memory Match, Object Recall, Sequence Recall
- 🎯 **Adaptive Difficulty** — AI-assisted personalization based on performance
- 🌸 **AI Memory Assistant** — Voice interaction, reminders, and memory prompts
- 👨‍👩‍👧 **Caregiver Dashboard** — Charts, trends, and AI-generated insights
- 🗣️ **Voice-First Design** — Speech recognition with text fallback
- ♿ **Accessible** — Keyboard navigation, ARIA labels, reduced motion support
- 📱 **Responsive** — Works on desktop, tablet, and mobile
- 🎨 **Premium Design** — Calm, nature-inspired palette with GSAP animations

---

## Tech Stack

| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| TypeScript | Type safety |
| Vite | Build tool |
| Tailwind CSS | Styling |
| Three.js / React Three Fiber | 3D memory garden |
| GSAP + ScrollTrigger | Scroll animations |
| Recharts | Dashboard charts |
| React Router | Client-side routing |
| Lucide React | Icons |
| localStorage | Prototype persistence |

---

## Architecture

```
src/
├── components/
│   ├── navigation/    — Navbar, MobileMenu
│   ├── hero/          — MemoryGarden (Three.js), HeroContent
│   ├── sections/      — Landing page scroll chapters
│   ├── games/         — MemoryMatch, ObjectRecall, SequenceRecall
│   ├── assistant/     — AssistantButton, AssistantPanel
│   └── ui/            — Button, Card, Modal, AnimatedText
├── data/              — Game data, models, mock analytics
├── hooks/             — useLocalStorage, useReducedMotion, useGameProgress
├── utils/             — Adaptive difficulty, analytics
└── pages/             — Landing, Games, Assistant, Caregiver
```

---

## Installation

```bash
# Clone the repository
git clone https://github.com/your-org/aura-ner.git
cd aura-ner

# Install dependencies
npm install

# Start development server
npm run dev
```

## Build

```bash
npm run build
```

## Preview Production Build

```bash
npm run preview
```

---

## Demo Flow

1. Open the landing page — explore the 3D Memory Garden with cursor
2. Scroll through the story: Memory → Games → AI → Assistant → Caregiver
3. Open Cognitive Games — play Memory Match
4. Open the AI Assistant — create a reminder
5. Visit the Caregiver Dashboard — view performance insights

---

## Project Structure

- **Landing Page** — 3D hero, scroll storytelling, NER cultural relevance
- **Cognitive Games** (`/games`) — Three playable games with adaptive difficulty
- **Memory Assistant** (`/assistant`) — Reminders, voice interaction, memory prompts
- **Caregiver Dashboard** (`/caregiver`) — Activity charts, AI insights, session history

---

## Medical Safety Disclaimer

AURA-NER is a support platform prototype. It is **not**:

- A diagnostic tool
- A dementia severity detector
- A replacement for medical professionals
- A clinical assessment system

---

## Future Scope

- Real AI models for personalized cognitive assessment
- Multilingual voice support (Hindi, Assamese, Manipuri, etc.)
- Regional NER datasets with culturally familiar content
- Cloud synchronization for cross-device access
- Caregiver accounts with real-time notifications
- Clinical validation and healthcare integration
- Offline-first architecture

---

## License

MIT
