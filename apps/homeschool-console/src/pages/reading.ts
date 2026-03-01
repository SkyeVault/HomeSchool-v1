import { goBack, getApp } from '../nav'

interface WordItem {
  word: string
  emoji: string
  hint: string
}

const WORDS: WordItem[] = [
  { word: 'CAT', emoji: '🐱', hint: 'A fluffy pet that purrs' },
  { word: 'DOG', emoji: '🐶', hint: "Man's best friend" },
  { word: 'SUN', emoji: '☀️', hint: 'Shines bright in the sky' },
  { word: 'BEE', emoji: '🐝', hint: 'Makes honey and says buzzz' },
  { word: 'PIG', emoji: '🐷', hint: 'Goes oink oink' },
  { word: 'COW', emoji: '🐄', hint: 'Gives us milk' },
  { word: 'HAT', emoji: '🎩', hint: 'Worn on your head' },
  { word: 'BUS', emoji: '🚌', hint: 'Takes kids to school' },
  { word: 'CUP', emoji: '☕', hint: 'You drink from it' },
  { word: 'FAN', emoji: '🌀', hint: 'Keeps you cool' },
  { word: 'JAR', emoji: '🫙', hint: 'Holds food like jam' },
  { word: 'LOG', emoji: '🪵', hint: 'A piece of wood' },
  { word: 'MAP', emoji: '🗺️', hint: 'Shows you where things are' },
  { word: 'NET', emoji: '🥅', hint: 'Catches things' },
  { word: 'POT', emoji: '🍯', hint: 'Used for cooking' },
  { word: 'FROG', emoji: '🐸', hint: 'Jumps and says ribbit' },
  { word: 'DUCK', emoji: '🦆', hint: 'Says quack quack' },
  { word: 'CAKE', emoji: '🎂', hint: 'A birthday treat' },
  { word: 'STAR', emoji: '⭐', hint: 'Twinkles in the night sky' },
  { word: 'FISH', emoji: '🐟', hint: 'Lives in water' },
  { word: 'BIRD', emoji: '🐦', hint: 'Has wings and sings' },
  { word: 'BEAR', emoji: '🐻', hint: 'Big and fluffy and brown' },
  { word: 'KITE', emoji: '🪁', hint: 'Flies high in the wind' },
  { word: 'RAIN', emoji: '🌧️', hint: 'Falls from clouds' },
  { word: 'SNOW', emoji: '❄️', hint: 'Cold and white and soft' },
  { word: 'DRUM', emoji: '🥁', hint: 'Bang it to make music' },
  { word: 'LEAF', emoji: '🍃', hint: 'Grows on trees' },
  { word: 'MILK', emoji: '🥛', hint: 'White drink from a cow' },
  { word: 'SEED', emoji: '🌱', hint: 'Plant it and it grows' },
  { word: 'SHIP', emoji: '🚢', hint: 'Sails on the ocean' },
]

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

let current: WordItem
let missingIdx: number
let score = 0
let locked = false

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

function pickWord(): { item: WordItem; idx: number } {
  const item = WORDS[Math.floor(Math.random() * WORDS.length)]
  const idx = Math.floor(Math.random() * item.word.length)
  return { item, idx }
}

function makeLetterChoices(correct: string): string[] {
  const choices = new Set<string>([correct])
  while (choices.size < 4) {
    const letter = ALPHABET[Math.floor(Math.random() * 26)]
    if (letter !== correct) choices.add(letter)
  }
  return shuffle([...choices])
}

function renderRound() {
  locked = false
  const displayEl = document.getElementById('rd-word')
  if (displayEl) {
    displayEl.innerHTML = current.word.split('').map((ch, i) =>
      i === missingIdx
        ? `<span class="rd-blank">_</span>`
        : `<span class="rd-letter">${ch}</span>`
    ).join('')
  }

  const choicesEl = document.getElementById('rd-choices')
  if (choicesEl) {
    const correct = current.word[missingIdx]
    const letters = makeLetterChoices(correct)
    choicesEl.innerHTML = letters.map(l =>
      `<button class="rd-letter-btn" data-letter="${l}">${l}</button>`
    ).join('')
    choicesEl.querySelectorAll<HTMLButtonElement>('.rd-letter-btn').forEach(btn => {
      btn.addEventListener('click', () => handleLetter(btn.dataset.letter!, btn))
    })
  }

  const fb = document.getElementById('rd-feedback')
  if (fb) { fb.textContent = ''; fb.className = 'rd-feedback' }

  const emojiEl = document.getElementById('rd-emoji')
  if (emojiEl) emojiEl.textContent = current.emoji

  const hintEl = document.getElementById('rd-hint')
  if (hintEl) hintEl.textContent = current.hint
}

function handleLetter(letter: string, btn: HTMLButtonElement) {
  if (locked) return
  locked = true
  document.querySelectorAll<HTMLButtonElement>('.rd-letter-btn').forEach(b => b.disabled = true)

  const correct = current.word[missingIdx]
  const fb = document.getElementById('rd-feedback')!
  const displayEl = document.getElementById('rd-word')!

  if (letter === correct) {
    score++
    document.getElementById('rd-score')!.textContent = String(score)
    btn.classList.add('rd-letter-btn--correct')
    displayEl.innerHTML = current.word.split('').map(ch =>
      `<span class="rd-letter rd-letter--done">${ch}</span>`
    ).join('')
    fb.textContent = `✨ "${current.word}" — nicely done! ✨`
    fb.className = 'rd-feedback rd-feedback--good'
  } else {
    btn.classList.add('rd-letter-btn--wrong')
    document.querySelectorAll<HTMLButtonElement>('.rd-letter-btn').forEach(b => {
      if (b.dataset.letter === correct) b.classList.add('rd-letter-btn--correct')
    })
    fb.textContent = `The missing letter was "${correct}" 💪`
    fb.className = 'rd-feedback rd-feedback--try'
  }

  setTimeout(() => {
    const next = pickWord()
    current = next.item
    missingIdx = next.idx
    renderRound()
  }, 1800)
}

export function renderReading() {
  const first = pickWord()
  current = first.item
  missingIdx = first.idx
  score = 0
  locked = false

  getApp().innerHTML = `
    <div class="page rd-page">
      <header class="rd-header">
        <button class="back-btn" id="rd-back">← Back</button>
        <div class="rd-title">📚 Word Builder</div>
        <div class="rd-score-badge">⭐ <span id="rd-score">0</span></div>
      </header>
      <div class="rd-body">
        <div class="rd-card">
          <div class="rd-emoji-big" id="rd-emoji"></div>
          <div class="rd-hint" id="rd-hint"></div>
          <div class="rd-prompt">Fill in the missing letter!</div>
          <div class="rd-word" id="rd-word"></div>
          <div class="rd-choices" id="rd-choices"></div>
          <div class="rd-feedback" id="rd-feedback"></div>
        </div>
      </div>
    </div>`

  document.getElementById('rd-back')!.addEventListener('click', goBack)
  renderRound()
}
