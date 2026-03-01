import { goBack, getApp } from '../nav'

interface RhymeGroup {
  words: string[]
  emoji: string
}

// Rhyme families
const RHYME_GROUPS: RhymeGroup[] = [
  { words: ['CAT', 'BAT', 'HAT', 'MAT', 'RAT', 'FAT', 'PAT'], emoji: '🐱' },
  { words: ['BEE', 'SEE', 'TEA', 'KEY', 'WE',  'ME',  'FREE'], emoji: '🐝' },
  { words: ['SUN', 'RUN', 'FUN', 'BUN', 'GUN', 'ONE',  'DONE'], emoji: '☀️' },
  { words: ['DOG', 'LOG', 'FOG', 'HOG', 'JOG', 'BOG'], emoji: '🐶' },
  { words: ['CAKE', 'LAKE', 'MAKE', 'BAKE', 'RAKE', 'TAKE', 'FAKE'], emoji: '🎂' },
  { words: ['STAR', 'CAR',  'JAR', 'FAR',  'BAR',  'TAR'], emoji: '⭐' },
  { words: ['FISH', 'DISH', 'WISH'], emoji: '🐟' },
  { words: ['BEAR', 'PEAR', 'HAIR', 'FAIR', 'CARE', 'DARE', 'RARE'], emoji: '🐻' },
  { words: ['BLUE', 'GLUE', 'TRUE', 'NEW',  'SHOE', 'ZOO', 'FEW'], emoji: '💙' },
  { words: ['BALL', 'TALL', 'WALL', 'CALL', 'FALL', 'HALL', 'SMALL'], emoji: '⚽' },
  { words: ['RAIN', 'TRAIN','MAIN', 'CANE', 'LANE', 'PAIN', 'GAIN'], emoji: '🌧️' },
  { words: ['NIGHT', 'LIGHT', 'MIGHT', 'FIGHT', 'BRIGHT', 'RIGHT'], emoji: '🌙' },
  { words: ['FROG', 'BOG',  'LOG',  'HOG'], emoji: '🐸' },
  { words: ['HEN',  'PEN',  'TEN',  'DEN', 'MEN', 'THEN'], emoji: '🐔' },
  { words: ['RING',  'SING', 'KING', 'WING', 'THING', 'BRING', 'SPRING'], emoji: '💍' },
]

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

interface RhymeRound {
  prompt: string
  promptEmoji: string
  correct: string
  choices: string[]
}

function makeRound(): RhymeRound {
  const group = RHYME_GROUPS[Math.floor(Math.random() * RHYME_GROUPS.length)]
  if (group.words.length < 2) return makeRound()

  const shuffled = shuffle(group.words)
  const prompt = shuffled[0]
  const correct = shuffled[1]

  // Pick wrong answers from OTHER rhyme groups
  const otherGroups = RHYME_GROUPS.filter(g => g !== group)
  const wrongPool = otherGroups.flatMap(g => g.words)
  const wrongs = shuffle(wrongPool).slice(0, 3)

  return {
    prompt,
    promptEmoji: group.emoji,
    correct,
    choices: shuffle([correct, ...wrongs]),
  }
}

let current: RhymeRound
let score = 0
let locked = false

function renderRound() {
  locked = false
  current = makeRound()

  const promptEl = document.getElementById('la-prompt')
  const emojiEl  = document.getElementById('la-emoji')
  const choicesEl = document.getElementById('la-choices')
  const fb = document.getElementById('la-feedback')

  if (promptEl) promptEl.textContent = current.prompt
  if (emojiEl)  emojiEl.textContent  = current.promptEmoji
  if (fb) { fb.textContent = ''; fb.className = 'la-feedback' }

  if (choicesEl) {
    choicesEl.innerHTML = current.choices.map(w =>
      `<button class="la-choice" data-word="${w}">${w}</button>`
    ).join('')
    choicesEl.querySelectorAll<HTMLButtonElement>('.la-choice').forEach(btn => {
      btn.addEventListener('click', () => handleAnswer(btn.dataset.word!, btn))
    })
  }
}

function handleAnswer(word: string, btn: HTMLButtonElement) {
  if (locked) return
  locked = true
  document.querySelectorAll<HTMLButtonElement>('.la-choice').forEach(b => b.disabled = true)

  const fb = document.getElementById('la-feedback')!
  if (word === current.correct) {
    score++
    document.getElementById('la-score')!.textContent = String(score)
    btn.classList.add('la-choice--correct')
    fb.textContent = `✨ "${current.prompt}" and "${current.correct}" rhyme! Great ear! 🎶`
    fb.className = 'la-feedback la-feedback--good'
  } else {
    btn.classList.add('la-choice--wrong')
    document.querySelectorAll<HTMLButtonElement>('.la-choice').forEach(b => {
      if (b.dataset.word === current.correct) b.classList.add('la-choice--correct')
    })
    fb.textContent = `"${current.correct}" rhymes with "${current.prompt}" — try again! 💪`
    fb.className = 'la-feedback la-feedback--try'
  }

  setTimeout(renderRound, 2000)
}

export function renderLanguageArts() {
  score = 0
  locked = false

  getApp().innerHTML = `
    <div class="page la-page">
      <header class="la-header">
        <button class="back-btn" id="la-back">← Back</button>
        <div class="la-title">📝 Rhyme Time!</div>
        <div class="la-score-badge">⭐ <span id="la-score">0</span></div>
      </header>
      <div class="la-body">
        <div class="la-card">
          <div class="la-prompt-label">Find the word that rhymes with:</div>
          <div class="la-prompt-wrap">
            <span class="la-emoji" id="la-emoji"></span>
            <span class="la-word" id="la-prompt"></span>
          </div>
          <div class="la-choices" id="la-choices"></div>
          <div class="la-feedback" id="la-feedback"></div>
        </div>
      </div>
    </div>`

  document.getElementById('la-back')!.addEventListener('click', goBack)
  renderRound()
}
