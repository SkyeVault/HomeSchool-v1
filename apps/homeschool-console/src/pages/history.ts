import { goBack, getApp } from '../nav'

interface HistoryQ {
  question: string
  emoji: string
  correct: string
  wrong: [string, string, string]
  funFact: string
}

const QUESTIONS: HistoryQ[] = [
  {
    question: 'Who was the first President of the United States?',
    emoji: '🇺🇸',
    correct: 'George Washington',
    wrong: ['Abraham Lincoln', 'Benjamin Franklin', 'Thomas Jefferson'],
    funFact: 'George Washington became president in 1789 and never lived in the White House!',
  },
  {
    question: 'What was the first animal sent to space?',
    emoji: '🚀',
    correct: 'A dog named Laika',
    wrong: ['A chimpanzee named Ham', 'A cat named Félicette', 'A rabbit named Marfusa'],
    funFact: 'Laika was a stray dog from Moscow who flew to space in 1957!',
  },
  {
    question: 'Who invented the telephone?',
    emoji: '📞',
    correct: 'Alexander Graham Bell',
    wrong: ['Thomas Edison', 'Nikola Tesla', 'Benjamin Franklin'],
    funFact: 'Alexander Graham Bell made the first phone call in 1876, saying "Mr. Watson, come here!"',
  },
  {
    question: 'What ancient wonder was built as a tomb for a king?',
    emoji: '🏺',
    correct: 'The Great Pyramid of Giza',
    wrong: ['The Colosseum', 'The Great Wall', 'Stonehenge'],
    funFact: 'The Great Pyramid was built around 2560 BC and was the tallest structure in the world for 3,800 years!',
  },
  {
    question: 'Who was the first woman to fly solo across the Atlantic Ocean?',
    emoji: '✈️',
    correct: 'Amelia Earhart',
    wrong: ['Bessie Coleman', 'Harriet Quimby', 'Sally Ride'],
    funFact: 'Amelia Earhart crossed the Atlantic in 1932, flying from Canada to Northern Ireland in about 15 hours!',
  },
  {
    question: 'Who wrote the Declaration of Independence?',
    emoji: '📜',
    correct: 'Thomas Jefferson',
    wrong: ['John Adams', 'Benjamin Franklin', 'James Madison'],
    funFact: 'Thomas Jefferson wrote most of the Declaration of Independence in just a few weeks in 1776!',
  },
  {
    question: 'Where did the ancient Olympic Games begin?',
    emoji: '🏅',
    correct: 'Ancient Greece',
    wrong: ['Ancient Rome', 'Ancient Egypt', 'Ancient China'],
    funFact: 'The first Olympic Games were held in Olympia, Greece, in 776 BC — over 2,800 years ago!',
  },
  {
    question: 'Who invented the light bulb?',
    emoji: '💡',
    correct: 'Thomas Edison',
    wrong: ['Nikola Tesla', 'Alexander Graham Bell', 'Isaac Newton'],
    funFact: 'Thomas Edison patented a practical light bulb in 1879 and tested over 1,000 different materials!',
  },
  {
    question: 'Which country sent the first people to walk on the Moon?',
    emoji: '🌕',
    correct: 'The United States',
    wrong: ['The Soviet Union', 'France', 'China'],
    funFact: 'Neil Armstrong and Buzz Aldrin landed on the Moon on July 20, 1969, on the Apollo 11 mission!',
  },
  {
    question: 'Who painted the Mona Lisa?',
    emoji: '🎨',
    correct: 'Leonardo da Vinci',
    wrong: ['Michelangelo', 'Raphael', 'Rembrandt'],
    funFact: 'Leonardo da Vinci painted the Mona Lisa around 1503–1519. It now lives in the Louvre museum in Paris!',
  },
  {
    question: 'What was the name of the ship that brought the Pilgrims to America?',
    emoji: '⛵',
    correct: 'The Mayflower',
    wrong: ['The Santa María', 'The Endeavour', 'The Victory'],
    funFact: 'The Mayflower carried 102 passengers from England to Plymouth, Massachusetts in 1620!',
  },
  {
    question: 'Who discovered that the Earth goes around the Sun?',
    emoji: '🌍',
    correct: 'Nicolaus Copernicus',
    wrong: ['Galileo Galilei', 'Isaac Newton', 'Johannes Kepler'],
    funFact: 'Copernicus published his theory in 1543 — before that, most people believed the Sun went around the Earth!',
  },
]

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

let pool: HistoryQ[]
let current: HistoryQ
let score = 0
let locked = false

function nextQuestion() {
  if (pool.length === 0) pool = shuffle([...QUESTIONS])
  current = pool.pop()!
}

function renderQuestion() {
  locked = false
  nextQuestion()

  const qEl = document.getElementById('hist-question')
  const emojiEl = document.getElementById('hist-emoji')
  const choicesEl = document.getElementById('hist-choices')
  const fb = document.getElementById('hist-feedback')

  if (qEl) qEl.textContent = current.question
  if (emojiEl) emojiEl.textContent = current.emoji
  if (fb) { fb.innerHTML = ''; fb.className = 'hist-feedback' }

  if (choicesEl) {
    const choices = shuffle([current.correct, ...current.wrong])
    choicesEl.innerHTML = choices.map(c =>
      `<button class="hist-choice" data-answer="${c}">${c}</button>`
    ).join('')
    choicesEl.querySelectorAll<HTMLButtonElement>('.hist-choice').forEach(btn => {
      btn.addEventListener('click', () => handleAnswer(btn.dataset.answer!, btn))
    })
  }
}

function handleAnswer(answer: string, btn: HTMLButtonElement) {
  if (locked) return
  locked = true
  document.querySelectorAll<HTMLButtonElement>('.hist-choice').forEach(b => b.disabled = true)

  const fb = document.getElementById('hist-feedback')!
  if (answer === current.correct) {
    score++
    document.getElementById('hist-score')!.textContent = String(score)
    btn.classList.add('hist-choice--correct')
    fb.innerHTML = `✨ Correct! <em>${current.funFact}</em>`
    fb.className = 'hist-feedback hist-feedback--good'
  } else {
    btn.classList.add('hist-choice--wrong')
    document.querySelectorAll<HTMLButtonElement>('.hist-choice').forEach(b => {
      if (b.dataset.answer === current.correct) b.classList.add('hist-choice--correct')
    })
    fb.innerHTML = `The answer was <strong>${current.correct}</strong>. <em>${current.funFact}</em>`
    fb.className = 'hist-feedback hist-feedback--try'
  }

  setTimeout(renderQuestion, 3000)
}

export function renderHistory() {
  pool = shuffle([...QUESTIONS])
  score = 0
  locked = false

  getApp().innerHTML = `
    <div class="page hist-page">
      <header class="hist-header">
        <button class="back-btn" id="hist-back">← Back</button>
        <div class="hist-title">🏺 History Quest</div>
        <div class="hist-score-badge">⭐ <span id="hist-score">0</span></div>
      </header>
      <div class="hist-body">
        <div class="hist-card">
          <div class="hist-emoji" id="hist-emoji"></div>
          <div class="hist-question" id="hist-question"></div>
          <div class="hist-choices" id="hist-choices"></div>
          <div class="hist-feedback" id="hist-feedback"></div>
        </div>
      </div>
    </div>`

  document.getElementById('hist-back')!.addEventListener('click', goBack)
  renderQuestion()
}
