import { goBack, getApp } from '../nav'

interface SciItem {
  emoji: string
  name: string
  floats: boolean
  fact: string
}

const ITEMS: SciItem[] = [
  { emoji: '🪨', name: 'Rock',         floats: false, fact: 'Rocks are heavy and dense — they sink right away!' },
  { emoji: '🪵', name: 'Wood',         floats: true,  fact: 'Wood is less dense than water, so it floats!' },
  { emoji: '🍎', name: 'Apple',        floats: true,  fact: 'Apples are full of air pockets — they float!' },
  { emoji: '🔑', name: 'Metal Key',    floats: false, fact: 'Metal is very dense — keys always sink.' },
  { emoji: '🧊', name: 'Ice Cube',     floats: true,  fact: 'Ice is less dense than liquid water — it floats!' },
  { emoji: '🪙', name: 'Coin',         floats: false, fact: 'Coins are made of metal — too heavy to float.' },
  { emoji: '🍋', name: 'Lemon',        floats: true,  fact: 'Lemons have a light, airy skin — they float!' },
  { emoji: '📎', name: 'Paperclip',    floats: false, fact: 'Metal paperclips are too dense — they sink.' },
  { emoji: '🛶', name: 'Toy Boat',     floats: true,  fact: 'Boats are shaped to push water aside — they float!' },
  { emoji: '🏐', name: 'Ball',         floats: true,  fact: 'Balls are full of air — very easy to float!' },
  { emoji: '🥚', name: 'Fresh Egg',    floats: false, fact: 'Fresh eggs sink because they are dense.' },
  { emoji: '🔧', name: 'Wrench',       floats: false, fact: 'Metal tools are very dense — they sink.' },
  { emoji: '🍃', name: 'Leaf',         floats: true,  fact: 'Leaves are very light — they float on water!' },
  { emoji: '🧲', name: 'Magnet',       floats: false, fact: 'Metal magnets are dense — they sink.' },
  { emoji: '🫧', name: 'Soap Bar',     floats: true,  fact: 'Many soaps have air whipped in — they float!' },
  { emoji: '🧱', name: 'Brick',        floats: false, fact: 'Bricks are very heavy and dense — they sink.' },
]

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

let pool: SciItem[]
let current: SciItem
let score = 0
let locked = false

function nextItem() {
  if (pool.length === 0) pool = shuffle([...ITEMS])
  current = pool.pop()!
}

function renderItem() {
  locked = false
  nextItem()

  const emojiEl = document.getElementById('sci-emoji')
  const nameEl = document.getElementById('sci-name')
  const fb = document.getElementById('sci-feedback')
  const btns = document.getElementById('sci-buttons')

  if (emojiEl) emojiEl.textContent = current.emoji
  if (nameEl) nameEl.textContent = current.name
  if (fb) { fb.textContent = ''; fb.className = 'sci-feedback' }
  if (btns) {
    btns.querySelectorAll('button').forEach(b => {
      b.disabled = false
      b.classList.remove('sci-btn--winner', 'sci-btn--loser')
    })
  }
}

function handleGuess(guessFloats: boolean) {
  if (locked) return
  locked = true

  const floatBtn = document.getElementById('sci-float') as HTMLButtonElement
  const sinkBtn  = document.getElementById('sci-sink')  as HTMLButtonElement
  const fb = document.getElementById('sci-feedback')!

  floatBtn.disabled = true
  sinkBtn.disabled  = true

  const correct = guessFloats === current.floats
  const chosen  = guessFloats ? floatBtn : sinkBtn
  const other   = guessFloats ? sinkBtn  : floatBtn

  if (correct) {
    score++
    document.getElementById('sci-score')!.textContent = String(score)
    chosen.classList.add('sci-btn--winner')
    fb.textContent = `✅ Correct! ${current.fact}`
    fb.className = 'sci-feedback sci-feedback--good'
  } else {
    chosen.classList.add('sci-btn--loser')
    other.classList.add('sci-btn--winner')
    fb.textContent = `Actually it ${current.floats ? 'floats' : 'sinks'}! ${current.fact}`
    fb.className = 'sci-feedback sci-feedback--try'
  }

  setTimeout(renderItem, 2400)
}

export function renderScience() {
  pool = shuffle([...ITEMS])
  score = 0
  locked = false

  getApp().innerHTML = `
    <div class="page sci-page">
      <header class="sci-header">
        <button class="back-btn" id="sci-back">← Back</button>
        <div class="sci-title">🔬 Sink or Float?</div>
        <div class="sci-score-badge">⭐ <span id="sci-score">0</span></div>
      </header>
      <div class="sci-body">
        <div class="sci-card">
          <div class="sci-prompt">What happens when you drop it in water?</div>
          <div class="sci-object">
            <div class="sci-emoji" id="sci-emoji"></div>
            <div class="sci-name" id="sci-name"></div>
          </div>
          <div class="sci-buttons" id="sci-buttons">
            <button class="sci-btn sci-btn--float" id="sci-float" onclick="">🌊 FLOAT</button>
            <button class="sci-btn sci-btn--sink"  id="sci-sink">🪨 SINK</button>
          </div>
          <div class="sci-feedback" id="sci-feedback"></div>
        </div>
      </div>
    </div>`

  document.getElementById('sci-back')!.addEventListener('click', goBack)
  document.getElementById('sci-float')!.addEventListener('click', () => handleGuess(true))
  document.getElementById('sci-sink')!.addEventListener('click',  () => handleGuess(false))

  renderItem()
}
