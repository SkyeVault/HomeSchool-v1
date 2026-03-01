import { goBack, getApp } from '../../nav'
import { speakWord } from './typing'

const WORDS = [
  { emoji: '🐱', word: 'CAT' },
  { emoji: '🐶', word: 'DOG' },
  { emoji: '🍎', word: 'APPLE' },
  { emoji: '🐝', word: 'BEE' },
  { emoji: '🌙', word: 'MOON' },
  { emoji: '🦊', word: 'FOX' },
  { emoji: '🦁', word: 'LION' },
  { emoji: '🐸', word: 'FROG' },
  { emoji: '🦒', word: 'GIRAFFE' },
  { emoji: '🐧', word: 'PENGUIN' },
  { emoji: '🌈', word: 'RAINBOW' },
  { emoji: '🐢', word: 'TURTLE' },
  { emoji: '🦉', word: 'OWL' },
  { emoji: '🦈', word: 'SHARK' },
  { emoji: '🎈', word: 'BALLOON' },
  { emoji: '🐻', word: 'BEAR' },
  { emoji: '🐮', word: 'COW' },
  { emoji: '🦆', word: 'DUCK' },
  { emoji: '🌺', word: 'ROSE' },
  { emoji: '⭐', word: 'STAR' },
]

const ALL_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const BTN_COLORS  = ['#FF6B6B', '#51CF66', '#4C6EF5', '#FFD43B', '#F06595', '#20C997']

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

export function renderWords() {
  getApp().innerHTML = `
    <div class="words-page page">
      <header class="el-hub-header">
        <button class="back-btn" id="words-back">← Back</button>
        <div class="el-hub-title">🔡 Word Builder</div>
      </header>
      <div class="words-main" id="words-main"></div>
    </div>`

  document.getElementById('words-back')!.addEventListener('click', goBack)

  const wordList = shuffle(WORDS)
  let idx    = 0
  let locked = false

  function showWord() {
    locked = false
    const entry   = wordList[idx % wordList.length]
    const correct = entry.word[0]
    const distractors = shuffle(ALL_LETTERS.filter(l => l !== correct)).slice(0, 2)
    const choices = shuffle([correct, ...distractors])
    const colors  = shuffle(BTN_COLORS).slice(0, 3)

    const btns = choices.map((letter, i) => `
      <button class="words-letter-btn" id="wbtn-${i}"
        style="background:${colors[i]};
               box-shadow:0 8px 0 color-mix(in srgb,${colors[i]} 55%,#000);"
        data-letter="${letter}">${letter}</button>
    `).join('')

    document.getElementById('words-main')!.innerHTML = `
      <div class="words-emoji" id="words-emoji">${entry.emoji}</div>
      <div class="words-name">${entry.word}</div>
      <div class="words-question">What letter does it start with?</div>
      <div class="words-btns">${btns}</div>
      <div class="words-feedback hidden" id="words-feedback"></div>`

    choices.forEach((letter, i) => {
      document.getElementById(`wbtn-${i}`)!.addEventListener('click', () => {
        if (locked) return
        if (letter === correct) {
          locked = true
          speakWord(entry.word)
          document.getElementById(`wbtn-${i}`)!.classList.add('words-btn--correct')
          const fb = document.getElementById('words-feedback')!
          fb.textContent = `⭐ ${correct}!`
          fb.style.color = colors[i]
          fb.classList.remove('hidden')
          document.getElementById('words-emoji')!.classList.add('words-emoji--bounce')
          setTimeout(() => { idx++; showWord() }, 1400)
        } else {
          const btn = document.getElementById(`wbtn-${i}`)!
          btn.classList.add('words-btn--wrong')
          setTimeout(() => btn.classList.remove('words-btn--wrong'), 450)
        }
      })
    })
  }

  showWord()
}
