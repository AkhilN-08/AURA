import { useState } from 'react'
import { Bell, Plus, Trash2, Check, Clock, MessageCircle } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import type { Reminder } from '../data/models'
import { REMINDER_TYPES } from '../data/models'
import Modal from '../components/ui/Modal'

export default function Assistant() {
  const [reminders, setReminders] = useLocalStorage<Reminder[]>('aura-reminders', [])
  const [showNewForm, setShowNewForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newTime, setNewTime] = useState('')
  const [newType, setNewType] = useState<Reminder['type']>('routine')

  const handleAdd = () => {
    if (!newTitle.trim()) return
    const reminder: Reminder = {
      id: Date.now().toString(),
      title: newTitle,
      time: newTime,
      type: newType,
      completed: false,
      createdAt: new Date().toISOString(),
    }
    setReminders(prev => [...prev, reminder])
    setNewTitle('')
    setNewTime('')
    setNewType('routine')
    setShowNewForm(false)
  }

  const toggleComplete = (id: string) => {
    setReminders(prev => prev.map(r =>
      r.id === id ? { ...r, completed: !r.completed } : r
    ))
  }

  const deleteReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id))
  }

  const pending = reminders.filter(r => !r.completed)
  const completed = reminders.filter(r => r.completed)

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="section-heading mb-4">
            Memory <span className="text-gradient">Assistant</span>
          </h1>
          <p className="section-subheading mx-auto">
            Your gentle companion for reminders, daily routines, and memory prompts.
          </p>
        </div>

        {/* Quick greeting */}
        <div className="card bg-gradient-to-r from-forest-50 to-cream-50 border-forest-200 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-forest-500 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🌸</span>
            </div>
            <div>
              <p className="font-semibold text-charcoal-800 mb-1">Good morning!</p>
              <p className="text-charcoal-500 text-sm">
                You have {pending.length} pending {pending.length === 1 ? 'reminder' : 'reminders'}.
                Would you like to play a memory game or check your daily routine?
              </p>
            </div>
          </div>
        </div>

        {/* Reminder sections */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-charcoal-800 flex items-center gap-2">
              <Bell size={20} />
              Reminders
            </h2>
            <button
              onClick={() => setShowNewForm(true)}
              className="btn-primary !py-2 !px-4 !text-sm !rounded-xl inline-flex items-center gap-1"
            >
              <Plus size={16} /> New
            </button>
          </div>

          {/* Pending */}
          {pending.length > 0 && (
            <div className="space-y-3 mb-6">
              {pending.map(reminder => {
                const typeInfo = REMINDER_TYPES[reminder.type]
                return (
                  <div key={reminder.id} className="card-hover flex items-center gap-4">
                    <button
                      onClick={() => toggleComplete(reminder.id)}
                      className="w-8 h-8 rounded-full border-2 border-cream-300 hover:border-forest-400 flex items-center justify-center transition-colors flex-shrink-0"
                      aria-label={`Mark "${reminder.title}" as complete`}
                    >
                      {reminder.completed && <Check size={14} className="text-forest-500" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-charcoal-800 truncate">{reminder.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${typeInfo.color}`}>
                          {typeInfo.label}
                        </span>
                        {reminder.time && (
                          <span className="text-xs text-charcoal-400 flex items-center gap-1">
                            <Clock size={10} /> {reminder.time}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteReminder(reminder.id)}
                      className="p-2 rounded-lg hover:bg-red-50 text-charcoal-300 hover:text-red-500 transition-colors"
                      aria-label={`Delete reminder "${reminder.title}"`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {/* Completed */}
          {completed.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-charcoal-400 mb-3">Completed</h3>
              <div className="space-y-2">
                {completed.map(reminder => (
                  <div key={reminder.id} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-cream-50">
                    <div className="w-6 h-6 rounded-full bg-forest-100 flex items-center justify-center">
                      <Check size={12} className="text-forest-500" />
                    </div>
                    <p className="text-sm text-charcoal-400 line-through flex-1">{reminder.title}</p>
                    <button
                      onClick={() => deleteReminder(reminder.id)}
                      className="p-1 rounded hover:bg-red-50 text-charcoal-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {reminders.length === 0 && (
            <div className="card text-center py-12">
              <Bell className="mx-auto text-charcoal-300 mb-3" size={40} />
              <p className="text-charcoal-400">No reminders yet. Create one to get started.</p>
            </div>
          )}
        </div>

        {/* Memory prompts */}
        <div className="card">
          <h2 className="text-xl font-semibold text-charcoal-800 flex items-center gap-2 mb-4">
            <MessageCircle size={20} />
            Memory Prompts
          </h2>
          <div className="space-y-3">
            {[
              "What did you have for breakfast today?",
              "Would you like to look at your family memories?",
              "What's a happy memory from this week?",
              "Tell me about someone you spoke with today.",
            ].map((prompt, i) => (
              <div key={i} className="bg-cream-50 rounded-xl px-4 py-3 text-charcoal-600 text-sm hover:bg-forest-50 transition-colors cursor-pointer">
                {prompt}
              </div>
            ))}
          </div>
        </div>

        {/* New reminder modal */}
        <Modal isOpen={showNewForm} onClose={() => setShowNewForm(false)} title="New Reminder">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-charcoal-700 mb-1 block">What should I remind you about?</label>
              <input
                type="text"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="e.g., Take medicine"
                className="w-full px-4 py-3 rounded-xl border border-cream-200 focus:outline-none focus:ring-2 focus:ring-forest-400"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-charcoal-700 mb-1 block">Time</label>
              <input
                type="time"
                value={newTime}
                onChange={e => setNewTime(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-cream-200 focus:outline-none focus:ring-2 focus:ring-forest-400"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-charcoal-700 mb-1 block">Type</label>
              <select
                value={newType}
                onChange={e => setNewType(e.target.value as Reminder['type'])}
                className="w-full px-4 py-3 rounded-xl border border-cream-200 focus:outline-none focus:ring-2 focus:ring-forest-400"
              >
                {Object.entries(REMINDER_TYPES).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>
            <button onClick={handleAdd} className="btn-primary w-full" disabled={!newTitle.trim()}>
              Save Reminder
            </button>
          </div>
        </Modal>
      </div>
    </div>
  )
}
