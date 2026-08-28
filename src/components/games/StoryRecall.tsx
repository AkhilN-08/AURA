import { useState, useEffect, useCallback, useRef } from 'react'
import { RotateCcw, Trophy, Clock, BookOpen, Check, X } from 'lucide-react'
import { useGameProgress } from '../../hooks/useGameProgress'
import { calculateDifficulty, getDifficultyConfig } from '../../utils/adaptiveDifficulty'
import type { GameSession } from '../../data/models'

const STORIES = [
  {
    title: 'The Bamboo Bridge',
    paragraphs: [
      'Every morning, Grandmother Mei walks across the old bamboo bridge to visit the village market. She carries a woven basket made by her sister.',
      'The bridge sways gently over the clear river where children play with paper boats. Grandmother Mei always stops to wave at them.',
      'At the market, she buys fresh mangoes, fragrant spices, and a small bag of jasmine rice. She also picks up a new lantern for the temple.',
      'On her way home, she often meets the village elder who tells stories about the mountains. They share tea and watch the sunset together.',
      'Grandmother Mei feels grateful for these simple daily pleasures. The bamboo bridge connects her to everything she loves.',
    ],
    questions: [
      { question: 'What does Grandmother Mei carry to the market?', options: ['A plastic bag', 'A woven basket', 'A wooden box', 'A leather purse'], correct: 1 },
      { question: 'What do the children play with in the river?', options: ['Stone skipping', 'Paper boats', 'Wooden toys', 'Kites'], correct: 1 },
      { question: 'What does Grandmother Mei buy at the market?', options: ['Only mangoes', 'Fruits and vegetables', 'Mangoes, spices, rice, and a lantern', 'Just tea'], correct: 2 },
      { question: 'Who does she meet on the way home?', options: ['Her daughter', 'The village elder', 'A traveling merchant', 'Her grandson'], correct: 1 },
    ],
  },
  {
    title: 'The Singing Bird',
    paragraphs: [
      'Little Arjun found a bright yellow bird near the riverbank one rainy afternoon. Its wing was hurt and it could not fly.',
      'He carefully carried the bird home in his jacket pocket. His mother helped him make a small nest from soft cloth and a wooden box.',
      'Every day, Arjun fed the bird pieces of ripe mango and fresh water. He sang to it every evening before bedtime.',
      'After two weeks, the bird began to sing beautiful melodies. The whole neighborhood would stop to listen to its songs.',
      'One morning, the bird was strong enough to fly. It circled Arjun\'s house three times, sang one last song, and flew toward the mountains.',
    ],
    questions: [
      { question: 'What color was the bird?', options: ['Red', 'Blue', 'Bright yellow', 'Green'], correct: 2 },
      { question: 'Where did Arjun find the bird?', options: ['In a tree', 'Near the riverbank', 'At the market', 'In the garden'], correct: 1 },
      { question: 'What did Arjun feed the bird?', options: ['Bread crumbs', 'Seeds', 'Ripe mango and water', 'Rice'], correct: 2 },
      { question: 'What happened when the bird recovered?', options: ['It stayed with Arjun forever', 'It sang and then flew toward the mountains', 'It flew to the river', 'It brought other birds'], correct: 1 },
    ],
  },
  {
    title: 'The Festival of Lights',
    paragraphs: [
      'Every autumn, the village of Diphu celebrates the Festival of Lights. Families hang colorful lanterns outside their homes.',
      'This year, young Tara was chosen to carry the first lantern to the temple. She practiced walking with it for three days.',
      'On the festival night, Tara walked slowly through the streets while villagers clapped and sang traditional songs behind her.',
      'At the temple, the old priest lit a special candle and placed it beside Tara\'s lantern. The light glowed warmly in the dark.',
      'After the ceremony, everyone shared rice pudding and told stories about their ancestors. Tara felt proud to be part of the tradition.',
    ],
    questions: [
      { question: 'When does the village celebrate?', options: ['In winter', 'Every autumn', 'During summer', 'In spring'], correct: 1 },
      { question: 'What was Tara chosen to do?', options: ['Sing a song', 'Carry the first lantern to the temple', 'Cook rice pudding', 'Tell a story'], correct: 1 },
      { question: 'What did the old priest place beside the lantern?', options: ['A flower', 'A special candle', 'A crystal', 'A book'], correct: 1 },
      { question: 'What did everyone share after the ceremony?', options: ['Fruit salad', 'Tea and cookies', 'Rice pudding', 'Fresh bread'], correct: 2 },
    ],
  },
]

function shuffle<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

interface StoryRecallProps {
  onComplete?: (session: GameSession) => void
}

export default function StoryRecall({ onComplete }: StoryRecallProps) {
  const { getAverageAccuracy } = useGameProgress()
  const lastAccuracy = useRef(getAverageAccuracy('story-recall'))
  const difficulty = calculateDifficulty(lastAccuracy.current || 75)
  const config = getDifficultyConfig(difficulty)

  const [phase, setPhase] = useState<'ready' | 'reading' | 'questions' | 'result' | 'gameover'>('ready')
  const [storyIndex, setStoryIndex] = useState(0)
  const [currentParagraph, setCurrentParagraph] = useState(0)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [rounds, setRounds] = useState(0)
  const [totalScore, setTotalScore] = useState(0)
  const [elapsed, setElapsed] = useState(0)

  const story = STORIES[storyIndex % STORIES.length]
  const questionsToShow = story.questions.slice(0, config.storyQuestions)

  const initRound = useCallback(() => {
    const idx = Math.floor(Math.random() * STORIES.length)
    setStoryIndex(idx)
    setCurrentParagraph(0)
    setQuestionIndex(0)
    setAnswers([])
    setSelectedAnswer(null)
    setShowFeedback(false)
    setPhase('reading')
  }, [])

  const startGame = () => { setRounds(0); setTotalScore(0); setElapsed(0); initRound() }

  useEffect(() => {
    if (phase !== 'reading' && phase !== 'questions') return
    const interval = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(interval)
  }, [phase])

  const handleNextParagraph = () => {
    if (currentParagraph < story.paragraphs.length - 1) {
      setCurrentParagraph(c => c + 1)
    } else {
      setPhase('questions')
    }
  }

  const handlePrevParagraph = () => {
    if (currentParagraph > 0) setCurrentParagraph(c => c - 1)
  }

  const handleAnswer = (answerIdx: number) => {
    if (showFeedback) return
    setSelectedAnswer(answerIdx)
  }

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return
    setShowFeedback(true)
    const newAnswers = [...answers, selectedAnswer]
    setAnswers(newAnswers)

    setTimeout(() => {
      if (questionIndex < questionsToShow.length - 1) {
        setQuestionIndex(q => q + 1)
        setSelectedAnswer(null)
        setShowFeedback(false)
      } else {
        // Round complete
        const correct = newAnswers.filter((a, i) => a === questionsToShow[i].correct).length
        const accuracy = Math.round((correct / questionsToShow.length) * 100)
        const newTotal = totalScore + accuracy
        const newRounds = rounds + 1
        setRounds(newRounds)
        setTotalScore(newTotal)
        setPhase('result')

        if (newRounds >= 3) {
          setTimeout(() => {
            onComplete?.({
              gameType: 'story-recall',
              score: Math.round(newTotal / newRounds),
              accuracy: Math.round(newTotal / newRounds),
              duration: elapsed,
              timestamp: new Date().toISOString(),
              difficulty,
            })
            setPhase('gameover')
          }, 1500)
        }
      }
    }, 1200)
  }

  const currentQuestion = questionsToShow[questionIndex]
  const correctInRound = answers.filter((a, i) => a === questionsToShow[i]?.correct).length

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-charcoal-500">
            <BookOpen size={18} />
            <span className="font-medium">Round {rounds + 1}/3</span>
          </div>
          <div className="flex items-center gap-2 text-charcoal-500">
            <Clock size={18} />
            <span className="font-medium">{elapsed}s</span>
          </div>
        </div>
        <div className="bg-amber-50 px-4 py-2 rounded-xl">
          <span className="text-sm font-medium text-amber-600">{difficulty} mode</span>
        </div>
      </div>

      {phase === 'ready' && (
        <div className="text-center py-16">
          <div className="text-6xl mb-6">📚</div>
          <h3 className="text-2xl font-bold text-charcoal-800 mb-3">Story Recall</h3>
          <p className="text-charcoal-400 mb-8 max-w-md mx-auto">
            Read a short story paragraph by paragraph, then answer questions about what you remember.
          </p>
          <button onClick={startGame} className="btn-primary">Start Round 1</button>
        </div>
      )}

      {phase === 'reading' && (
        <div className="text-center">
          <h3 className="text-xl font-bold text-charcoal-800 mb-2">{story.title}</h3>
          <div className="flex items-center justify-center gap-1 mb-6">
            {story.paragraphs.map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i <= currentParagraph ? 'bg-amber-400' : 'bg-cream-200'}`} />
            ))}
          </div>
          <div className="card p-6 md:p-8 mb-6 text-left max-w-lg mx-auto">
            <p className="text-charcoal-700 leading-relaxed text-base">
              {story.paragraphs[currentParagraph]}
            </p>
          </div>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handlePrevParagraph}
              disabled={currentParagraph === 0}
              className="btn-ghost disabled:opacity-30"
            >
              ← Previous
            </button>
            <span className="text-sm text-charcoal-400">
              {currentParagraph + 1} of {story.paragraphs.length}
            </span>
            <button onClick={handleNextParagraph} className="btn-primary !px-6">
              {currentParagraph < story.paragraphs.length - 1 ? 'Next →' : 'Answer Questions →'}
            </button>
          </div>
        </div>
      )}

      {phase === 'questions' && currentQuestion && (
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-6">
            {questionsToShow.map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full transition-colors ${
                i < questionIndex ? 'bg-green-400' :
                i === questionIndex ? 'bg-amber-400' : 'bg-cream-200'
              }`} />
            ))}
          </div>
          <p className="text-sm text-charcoal-400 mb-2">Question {questionIndex + 1} of {questionsToShow.length}</p>
          <div className="card p-6 mb-6 max-w-lg mx-auto">
            <p className="text-lg font-semibold text-charcoal-800 mb-6">{currentQuestion.question}</p>
            <div className="space-y-3">
              {currentQuestion.options.map((option, i) => {
                let optionClass = 'bg-white border-cream-200 hover:border-amber-300 hover:bg-amber-50/50 cursor-pointer'
                if (showFeedback) {
                  if (i === currentQuestion.correct) optionClass = 'bg-green-50 border-green-400 text-green-700'
                  else if (i === selectedAnswer) optionClass = 'bg-red-50 border-red-300 text-red-600'
                  else optionClass = 'bg-cream-50 border-cream-200 text-charcoal-300'
                } else if (selectedAnswer === i) {
                  optionClass = 'bg-amber-50 border-amber-400 shadow-md'
                }
                return (
                  <button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    disabled={showFeedback}
                    className={`w-full text-left px-5 py-3.5 rounded-xl border-2 transition-all duration-400 ease-[cubic-bezier(0.25,0.1,0.25,1)] ease-[cubic-bezier(0.25,0.1,0.25,1)] font-medium ${optionClass}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full border-2 border-current flex items-center justify-center text-sm flex-shrink-0">
                        {showFeedback && i === currentQuestion.correct ? <Check size={14} /> :
                         showFeedback && i === selectedAnswer ? <X size={14} /> :
                         String.fromCharCode(65 + i)}
                      </span>
                      <span>{option}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
          {!showFeedback && (
            <button
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Answer
            </button>
          )}
        </div>
      )}

      {phase === 'result' && (
        <div className="text-center">
          <div className="card bg-amber-50 border-amber-200 mb-6">
            <p className="text-charcoal-700">
              You got <strong>{correctInRound}</strong> of <strong>{questionsToShow.length}</strong> questions correct!
            </p>
          </div>
          {rounds < 3 && (
            <button onClick={initRound} className="btn-primary">Next Round ({rounds + 2}/3)</button>
          )}
        </div>
      )}

      {phase === 'gameover' && (
        <div className="text-center mt-8 animate-fade-in">
          <div className="card bg-amber-50 border-amber-200">
            <Trophy className="mx-auto text-amber-500 mb-4" size={48} />
            <h3 className="text-2xl font-bold text-charcoal-800 mb-2">Wonderful Recall!</h3>
            <p className="text-charcoal-400 mb-4">Average accuracy: {Math.round(totalScore / 3)}%</p>
            <p className="text-sm text-charcoal-400">Story recall strengthens episodic memory and comprehension.</p>
          </div>
        </div>
      )}
    </div>
  )
}
