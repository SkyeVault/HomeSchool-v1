import { goBack, getApp } from '../../nav'
import { speakWord } from './typing'

// ---- Shape definitions -----------------------------------------------
const SHAPES = [
  { name: 'Circle' },
  { name: 'Square' },
  { name: 'Triangle' },
  { name: 'Star' },
  { name: 'Heart' },
  { name: 'Diamond' },
  { name: 'Rectangle' },
  { name: 'Oval' },
]

const PALETTE = [
  '#FF6B6B', '#FF922B', '#FFD43B', '#51CF66',
  '#339AF0', '#845EF7', '#F783AC', '#20C997',
  '#E64980', '#74C0FC', '#A9E34B', '#FF8787',
]

function randColor(exclude: string[] = []): string {
  const avail = PALETTE.filter(c => !exclude.includes(c))
  return avail[Math.floor(Math.random() * avail.length)]
}

// ---- SVG shape renderer ----------------------------------------------
function shapeSVG(name: string, color: string, size = 110): string {
  const s = size
  switch (name) {
    case 'Circle':
      return `<svg width="${s}" height="${s}" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="${color}"/></svg>`
    case 'Square':
      return `<svg width="${s}" height="${s}" viewBox="0 0 100 100"><rect x="7" y="7" width="86" height="86" rx="6" fill="${color}"/></svg>`
    case 'Triangle':
      return `<svg width="${s}" height="${s}" viewBox="0 0 100 100"><polygon points="50,5 96,93 4,93" fill="${color}"/></svg>`
    case 'Star':
      return `<svg width="${s}" height="${s}" viewBox="0 0 100 100"><polygon points="50,5 61,36 95,36 68,56 78,91 50,70 22,91 32,56 5,36 39,36" fill="${color}"/></svg>`
    case 'Heart':
      return `<svg width="${s}" height="${s}" viewBox="0 0 100 100"><path d="M50 83 C23 63 5 49 5 32 C5 17 16 8 28 8 C36 8 45 13 50 21 C55 13 64 8 72 8 C84 8 95 17 95 32 C95 49 77 63 50 83Z" fill="${color}"/></svg>`
    case 'Diamond':
      return `<svg width="${s}" height="${s}" viewBox="0 0 100 100"><polygon points="50,4 97,50 50,96 3,50" fill="${color}"/></svg>`
    case 'Rectangle':
      return `<svg width="${Math.round(s * 1.55)}" height="${s}" viewBox="0 0 155 100"><rect x="5" y="10" width="145" height="80" rx="6" fill="${color}"/></svg>`
    case 'Oval':
      return `<svg width="${Math.round(s * 1.5)}" height="${s}" viewBox="0 0 150 100"><ellipse cx="75" cy="50" rx="70" ry="42" fill="${color}"/></svg>`
    default:
      return `<svg width="${s}" height="${s}" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="${color}"/></svg>`
  }
}

// ---- Game state ------------------------------------------------------
type Mode = 'hub' | 'learn' | 'quiz' | 'win'
let mode: Mode       = 'hub'
let learnIdx         = 0
let round            = 0
let correct          = 0
let target           = 0
let choices: number[]        = []
let recentTargets: number[]  = []
let awaitingNext     = false
let celebTimer       = 0
let promptColor      = PALETTE[0]

const TOTAL_ROUNDS = 8

function pickNextRound() {
  const avail = SHAPES.map((_, i) => i).filter(i => !recentTargets.includes(i))
  target = avail[Math.floor(Math.random() * avail.length)]
  recentTargets = [...recentTargets.slice(-3), target]

  const others = SHAPES.map((_, i) => i).filter(i => i !== target)
  const wrong: number[] = []
  while (wrong.length < 2) {
    const p = others[Math.floor(Math.random() * others.length)]
    if (!wrong.includes(p)) wrong.push(p)
  }
  choices = [target, ...wrong].sort(() => Math.random() - 0.5)
  promptColor = randColor()
}

// ---- Hub HTML --------------------------------------------------------
function hubHTML(): string {
  const miniShapes = SHAPES.slice(0, 4).map((s, i) =>
    `<div class="sg-mini" style="animation-delay:${i * 0.08}s">${shapeSVG(s.name, PALETTE[i * 2], 54)}</div>`
  ).join('')

  return `<div class="sg-hub">
    <div class="sg-hub-preview">${miniShapes}</div>
    <h2 class="sg-hub-title">Shape Time!</h2>
    <p class="sg-hub-sub">Learn to spot all 8 shapes!</p>
    <div class="sg-hub-btns">
      <button class="sg-big-btn sg-big-btn--learn" id="sg-learn-btn">🎓 Learn Shapes</button>
      <button class="sg-big-btn sg-big-btn--play"  id="sg-play-btn">🎮 Play the Game!</button>
    </div>
  </div>`
}

// ---- Learn HTML ------------------------------------------------------
function learnHTML(): string {
  const s      = SHAPES[learnIdx]
  const color  = PALETTE[(learnIdx * 2) % PALETTE.length]
  const isFirst = learnIdx === 0
  const isLast  = learnIdx === SHAPES.length - 1

  return `<div class="sg-learn">
    <div class="sg-learn-counter">${learnIdx + 1} / ${SHAPES.length}</div>
    <div class="sg-learn-shape">${shapeSVG(s.name, color, 170)}</div>
    <div class="sg-learn-name" style="--lc:${color}">${s.name.toUpperCase()}</div>
    <div class="sg-learn-nav">
      <button class="sg-nav-btn" id="sg-prev" ${isFirst ? 'disabled' : ''}>◄ Prev</button>
      ${isLast
        ? `<button class="sg-nav-btn sg-nav-btn--play" id="sg-play-from-learn">🎮 Play!</button>`
        : `<button class="sg-nav-btn sg-nav-btn--next" id="sg-next">Next ►</button>`
      }
    </div>
  </div>`
}

// ---- Quiz HTML -------------------------------------------------------
function quizHTML(): string {
  const t           = SHAPES[target]
  const usedColors  = [promptColor]

  const choiceCards = choices.map(shapeIdx => {
    const s   = SHAPES[shapeIdx]
    const col = randColor(usedColors)
    usedColors.push(col)
    return `<button class="sg-choice" data-choice="${shapeIdx}" style="--cc:${col}">
      <div class="sg-choice-shape">${shapeSVG(s.name, col, 88)}</div>
      <div class="sg-choice-name">${s.name}</div>
    </button>`
  }).join('')

  const stars = '⭐'.repeat(correct)

  return `<div class="sg-quiz">
    <div class="sg-quiz-top">
      <span class="sg-quiz-stars">${stars || '·'}</span>
      <span class="sg-quiz-round">${round + 1} / ${TOTAL_ROUNDS}</span>
    </div>
    <div class="sg-quiz-prompt">
      <div class="sg-prompt-hint">Which one is the…</div>
      <div class="sg-prompt-shape">${shapeSVG(t.name, promptColor, 140)}</div>
      <div class="sg-prompt-name" style="--pc:${promptColor}">${t.name.toUpperCase()}</div>
    </div>
    <div class="sg-quiz-choices">${choiceCards}</div>
    <div class="sg-quiz-feedback" id="sg-feedback"></div>
  </div>`
}

// ---- Win HTML --------------------------------------------------------
function winHTML(): string {
  const stars  = '⭐'.repeat(correct)
  const pct    = correct / TOTAL_ROUNDS
  const trophy = pct === 1 ? '🏆' : pct >= 0.75 ? '🌟' : '🎉'

  return `<div class="sg-win">
    <div class="sg-win-trophy">${trophy}</div>
    <div class="sg-win-title">You did it!</div>
    <div class="sg-win-score">${correct} out of ${TOTAL_ROUNDS} correct!</div>
    <div class="sg-win-stars">${stars}</div>
    <div class="sg-win-btns">
      <button class="sg-big-btn sg-big-btn--play"  id="sg-play-again">🎮 Play Again!</button>
      <button class="sg-big-btn sg-big-btn--learn" id="sg-learn-again">🎓 Learn Shapes</button>
    </div>
  </div>`
}

// ---- Repaint current mode --------------------------------------------
function repaint() {
  const main = document.getElementById('sg-main')
  if (!main) return
  switch (mode) {
    case 'hub':   main.innerHTML = hubHTML();   break
    case 'learn': main.innerHTML = learnHTML(); break
    case 'quiz':  main.innerHTML = quizHTML();  break
    case 'win':   main.innerHTML = winHTML();   break
  }
  attachListeners()
}

// ---- Listeners -------------------------------------------------------
function attachListeners() {
  // Hub
  document.getElementById('sg-learn-btn')?.addEventListener('click', () => {
    mode = 'learn'; learnIdx = 0; repaint()
  })
  document.getElementById('sg-play-btn')?.addEventListener('click', startQuiz)

  // Learn
  document.getElementById('sg-prev')?.addEventListener('click', () => {
    if (learnIdx > 0) { learnIdx--; repaint() }
  })
  document.getElementById('sg-next')?.addEventListener('click', () => {
    if (learnIdx < SHAPES.length - 1) { learnIdx++; repaint() }
  })
  document.getElementById('sg-play-from-learn')?.addEventListener('click', startQuiz)

  // Quiz choices
  document.querySelectorAll<HTMLButtonElement>('.sg-choice').forEach(btn => {
    btn.addEventListener('click', () => {
      if (awaitingNext) return
      handleChoice(Number(btn.dataset.choice), btn)
    })
  })

  // Win
  document.getElementById('sg-play-again')?.addEventListener('click', () => {
    clearTimeout(celebTimer); awaitingNext = false; startQuiz()
  })
  document.getElementById('sg-learn-again')?.addEventListener('click', () => {
    clearTimeout(celebTimer); awaitingNext = false; mode = 'learn'; learnIdx = 0; repaint()
  })

  // Auto-speak shape name in learn mode
  if (mode === 'learn') speakWord(SHAPES[learnIdx].name)
}

function startQuiz() {
  clearTimeout(celebTimer)
  mode = 'quiz'; round = 0; correct = 0
  recentTargets = []; awaitingNext = false
  pickNextRound(); repaint()
}

// ---- Choice handler --------------------------------------------------
function handleChoice(chosen: number, btn: HTMLButtonElement) {
  if (chosen === target) {
    awaitingNext = true
    correct++
    btn.classList.add('sg-choice--correct')

    const fb = document.getElementById('sg-feedback')!
    fb.innerHTML = `<div class="sg-fb sg-fb--win">🎉 Yes! That's a ${SHAPES[target].name}! ⭐</div>`
    speakWord(SHAPES[target].name)

    clearTimeout(celebTimer)
    celebTimer = window.setTimeout(() => {
      awaitingNext = false
      round++
      if (round >= TOTAL_ROUNDS) { mode = 'win'; repaint() }
      else { pickNextRound(); repaint() }
    }, 1600)
  } else {
    btn.classList.add('sg-choice--wrong')
    btn.addEventListener('animationend', () => btn.classList.remove('sg-choice--wrong'), { once: true })

    const fb = document.getElementById('sg-feedback')!
    fb.innerHTML = `<div class="sg-fb sg-fb--try">Oops! Try again! 🔍</div>`
    setTimeout(() => {
      const el = document.getElementById('sg-feedback')
      if (el?.querySelector('.sg-fb--try')) el.innerHTML = ''
    }, 1000)
  }
}

// ---- Entry point -----------------------------------------------------
export function renderShapes() {
  mode = 'hub'; learnIdx = 0
  clearTimeout(celebTimer); awaitingNext = false

  getApp().innerHTML = `
    <div class="page sg-page">
      <header class="el-hub-header">
        <button class="back-btn" id="sg-back">← Back</button>
        <div class="el-hub-title">⭐ Shape Game ⭐</div>
        <div class="el-hub-sub">8 shapes to learn!</div>
      </header>
      <div class="sg-main" id="sg-main"></div>
    </div>`

  document.getElementById('sg-back')!.addEventListener('click', () => {
    clearTimeout(celebTimer); awaitingNext = false
    if (mode !== 'hub') { mode = 'hub'; repaint() }
    else goBack()
  })

  repaint()
}
