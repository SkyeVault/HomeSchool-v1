import { goBack, getApp } from '../nav'

interface MachineQ {
  tool: string
  emoji: string
  correct: string
  wrongChoices: string[]
  explanation: string
}

const MACHINE_TYPES = ['Lever', 'Wheel & Axle', 'Pulley', 'Inclined Plane', 'Wedge', 'Screw']

const QUESTIONS: MachineQ[] = [
  {
    tool: 'Seesaw', emoji: '⚖️',
    correct: 'Lever',
    wrongChoices: ['Pulley', 'Wedge', 'Screw'],
    explanation: 'A seesaw is a lever! It balances on a point in the middle called a fulcrum.',
  },
  {
    tool: 'Ramp', emoji: '📐',
    correct: 'Inclined Plane',
    wrongChoices: ['Lever', 'Screw', 'Pulley'],
    explanation: 'A ramp is an inclined plane — a flat surface tilted at an angle to help move things up!',
  },
  {
    tool: 'Bicycle Wheel', emoji: '🚲',
    correct: 'Wheel & Axle',
    wrongChoices: ['Lever', 'Wedge', 'Inclined Plane'],
    explanation: 'A bicycle wheel is a wheel & axle — the wheel turns around a central rod called an axle.',
  },
  {
    tool: 'Flagpole', emoji: '🚩',
    correct: 'Pulley',
    wrongChoices: ['Lever', 'Screw', 'Wheel & Axle'],
    explanation: 'A flagpole uses a pulley — a rope over a wheel that lets you raise and lower the flag!',
  },
  {
    tool: 'Knife', emoji: '🔪',
    correct: 'Wedge',
    wrongChoices: ['Lever', 'Pulley', 'Screw'],
    explanation: 'A knife is a wedge — a thick piece that gets thin at one end to slice through things.',
  },
  {
    tool: 'Jar Lid', emoji: '🫙',
    correct: 'Screw',
    wrongChoices: ['Lever', 'Pulley', 'Wedge'],
    explanation: 'A jar lid uses a screw — the twisting spiral shape on the edge holds it tight!',
  },
  {
    tool: 'Scissors', emoji: '✂️',
    correct: 'Lever',
    wrongChoices: ['Wedge', 'Screw', 'Pulley'],
    explanation: 'Scissors are two levers joined at a pivot — they let you cut with less effort!',
  },
  {
    tool: 'Doorknob', emoji: '🚪',
    correct: 'Wheel & Axle',
    wrongChoices: ['Lever', 'Inclined Plane', 'Pulley'],
    explanation: 'A doorknob is a wheel & axle — turning the knob (wheel) turns the latch rod (axle)!',
  },
  {
    tool: 'Axe', emoji: '🪓',
    correct: 'Wedge',
    wrongChoices: ['Lever', 'Screw', 'Inclined Plane'],
    explanation: 'An axe head is a wedge — its sharp, angled edge splits wood apart when you swing it!',
  },
  {
    tool: 'Spiral Staircase', emoji: '🌀',
    correct: 'Screw',
    wrongChoices: ['Inclined Plane', 'Lever', 'Pulley'],
    explanation: 'A spiral staircase is like a screw — it wraps around a central pole to go up in a spiral!',
  },
  {
    tool: 'Bottle Opener', emoji: '🍾',
    correct: 'Lever',
    wrongChoices: ['Wedge', 'Pulley', 'Wheel & Axle'],
    explanation: 'A bottle opener is a lever — you push one end down to pry the cap up off the bottle!',
  },
  {
    tool: 'Zipper', emoji: '🤐',
    correct: 'Wedge',
    wrongChoices: ['Screw', 'Lever', 'Pulley'],
    explanation: 'A zipper uses tiny wedge shapes — pulling the slider pushes the teeth apart or together!',
  },
  {
    tool: 'Elevator', emoji: '🛗',
    correct: 'Pulley',
    wrongChoices: ['Lever', 'Inclined Plane', 'Wheel & Axle'],
    explanation: 'An elevator uses pulleys — a motor pulls cables over wheels to lift the cabin up!',
  },
  {
    tool: 'Slide at the Playground', emoji: '🛝',
    correct: 'Inclined Plane',
    wrongChoices: ['Lever', 'Pulley', 'Screw'],
    explanation: 'A playground slide is an inclined plane — a smooth ramp that lets you slide down easily!',
  },
]

// Machine type descriptions shown in the info panel
const MACHINE_INFO: Record<string, { emoji: string; desc: string }> = {
  'Lever':           { emoji: '⚖️',  desc: 'A bar that rests on a point (fulcrum) to lift things.' },
  'Wheel & Axle':   { emoji: '🎡',  desc: 'A wheel attached to a rod that spins together.' },
  'Pulley':         { emoji: '🪂',  desc: 'A rope over a wheel that changes the direction of a force.' },
  'Inclined Plane': { emoji: '📐',  desc: 'A flat surface at an angle — like a ramp.' },
  'Wedge':          { emoji: '🔺',  desc: 'A thick piece that is thin at one end — splits or holds things.' },
  'Screw':          { emoji: '🔩',  desc: 'A wrapped inclined plane — turns to hold things together.' },
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

let pool: MachineQ[]
let current: MachineQ
let score = 0
let locked = false

function nextQ() {
  if (pool.length === 0) pool = shuffle([...QUESTIONS])
  current = pool.pop()!
}

function renderQuestion() {
  locked = false
  nextQ()

  const toolEl  = document.getElementById('eng-tool')
  const emojiEl = document.getElementById('eng-emoji')
  const choicesEl = document.getElementById('eng-choices')
  const fb = document.getElementById('eng-feedback')

  if (toolEl) toolEl.textContent = current.tool
  if (emojiEl) emojiEl.textContent = current.emoji
  if (fb) { fb.innerHTML = ''; fb.className = 'eng-feedback' }

  if (choicesEl) {
    const choices = shuffle([current.correct, ...current.wrongChoices])
    choicesEl.innerHTML = choices.map(c =>
      `<button class="eng-choice" data-answer="${c}">${c}</button>`
    ).join('')
    choicesEl.querySelectorAll<HTMLButtonElement>('.eng-choice').forEach(btn => {
      btn.addEventListener('click', () => handleAnswer(btn.dataset.answer!, btn))
    })
  }
}

function handleAnswer(answer: string, btn: HTMLButtonElement) {
  if (locked) return
  locked = true
  document.querySelectorAll<HTMLButtonElement>('.eng-choice').forEach(b => b.disabled = true)

  const fb = document.getElementById('eng-feedback')!
  if (answer === current.correct) {
    score++
    document.getElementById('eng-score')!.textContent = String(score)
    btn.classList.add('eng-choice--correct')
    fb.innerHTML = `⚙️ Correct! <em>${current.explanation}</em>`
    fb.className = 'eng-feedback eng-feedback--good'
  } else {
    btn.classList.add('eng-choice--wrong')
    document.querySelectorAll<HTMLButtonElement>('.eng-choice').forEach(b => {
      if (b.dataset.answer === current.correct) b.classList.add('eng-choice--correct')
    })
    fb.innerHTML = `It's a <strong>${current.correct}</strong>! <em>${current.explanation}</em>`
    fb.className = 'eng-feedback eng-feedback--try'
  }

  setTimeout(renderQuestion, 2800)
}

export function renderEngineering() {
  pool = shuffle([...QUESTIONS])
  score = 0
  locked = false

  const infoCards = MACHINE_TYPES.map(m => {
    const info = MACHINE_INFO[m]
    return `<div class="eng-info-card">
      <span class="eng-info-icon">${info.emoji}</span>
      <div>
        <strong>${m}</strong>
        <div class="eng-info-desc">${info.desc}</div>
      </div>
    </div>`
  }).join('')

  getApp().innerHTML = `
    <div class="page eng-page">
      <header class="eng-header">
        <button class="back-btn" id="eng-back">← Back</button>
        <div class="eng-title">🔧 Simple Machines</div>
        <div class="eng-score-badge">⭐ <span id="eng-score">0</span></div>
      </header>
      <div class="eng-layout">
        <div class="eng-main">
          <div class="eng-card">
            <div class="eng-prompt">What kind of simple machine is this?</div>
            <div class="eng-tool-display">
              <div class="eng-emoji" id="eng-emoji"></div>
              <div class="eng-tool" id="eng-tool"></div>
            </div>
            <div class="eng-choices" id="eng-choices"></div>
            <div class="eng-feedback" id="eng-feedback"></div>
          </div>
        </div>
        <div class="eng-sidebar">
          <div class="eng-sidebar-title">6 Simple Machines</div>
          ${infoCards}
        </div>
      </div>
    </div>`

  document.getElementById('eng-back')!.addEventListener('click', goBack)
  renderQuestion()
}
