import { goBack, getApp } from '../../nav'
import { speakWord } from './typing'

// ---- Object themes ---------------------------------------------------
const THEMES = [
  { items: ['⭐','🌟','💫'] },
  { items: ['🍎','🍊','🍓','🍋','🍇','🫐'] },
  { items: ['🐱','🐶','🐸','🐻','🐼','🐰'] },
  { items: ['🌸','🌺','🌻','🌼','🌷','💐'] },
  { items: ['🎈','🎉','🎊','🎀','🎁','🎆'] },
  { items: ['🚗','🚕','🚙','🚌','🚎','🏎️'] },
  { items: ['🍕','🍔','🌮','🌯','🍟','🌭'] },
]

// Numbers 1–10
const MAX_COUNT    = 10
const TOTAL_ROUNDS = 10
const NUM_COLORS   = ['#FF6B6B','#FF922B','#FFD43B','#51CF66','#339AF0','#845EF7','#F783AC','#20C997','#E64980','#74C0FC']

// ---- State -----------------------------------------------------------
type Mode = 'hub' | 'game' | 'win'
let mode: Mode     = 'hub'
let round          = 0
let correct        = 0
let targetCount    = 0
let choices: number[]      = []
let currentEmoji   = '⭐'
let awaitingNext   = false
let celebTimer     = 0

function pickRound() {
  targetCount = Math.ceil(Math.random() * MAX_COUNT)

  // Pick 2 wrong numerals — prefer neighbours so it's not too easy
  const pool  = Array.from({ length: MAX_COUNT }, (_, i) => i + 1).filter(n => n !== targetCount)
  const wrong: number[] = []
  // Bias toward adjacent numbers first for appropriate challenge
  const adjacent = pool.filter(n => Math.abs(n - targetCount) === 1)
  if (adjacent.length > 0 && wrong.length < 2) wrong.push(adjacent[Math.floor(Math.random() * adjacent.length)])
  while (wrong.length < 2) {
    const p = pool[Math.floor(Math.random() * pool.length)]
    if (!wrong.includes(p)) wrong.push(p)
  }
  choices = [targetCount, ...wrong].sort(() => Math.random() - 0.5)

  const theme = THEMES[Math.floor(Math.random() * THEMES.length)]
  currentEmoji = theme.items[Math.floor(Math.random() * theme.items.length)]
}

// ---- Hub HTML --------------------------------------------------------
function hubHTML(): string {
  // Show subitization dots 1–10 as a visual teaser
  const dots = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n, i) => {
    const col = NUM_COLORS[i]
    const dotSpans = Array.from({ length: n }, () =>
      `<span class="nh-dot" style="background:${col}"></span>`
    ).join('')
    return `<div class="nh-preview-group">
      <div class="nh-dots">${dotSpans}</div>
      <div class="nh-preview-num" style="color:${col}">${n}</div>
    </div>`
  }).join('')

  return `<div class="nh-hub">
    <h2 class="nh-hub-title">Number Hunt!</h2>
    <p class="nh-hub-sub">Count the objects and tap the right number!</p>
    <div class="nh-hub-preview">${dots}</div>
    <button class="nh-start-btn" id="nh-start-btn">🎮 Let's Count!</button>
  </div>`
}

// ---- Game HTML -------------------------------------------------------
function gameHTML(): string {
  const stars   = '⭐'.repeat(correct)
  const objects = Array.from({ length: targetCount }, (_, i) =>
    `<span class="nh-obj" style="animation-delay:${(i * 0.08).toFixed(2)}s">${currentEmoji}</span>`
  ).join('')

  const numBtns = choices.map(n =>
    `<button class="nh-num-btn" data-num="${n}" style="--nc:${NUM_COLORS[n - 1]}">${n}</button>`
  ).join('')

  return `<div class="nh-game">
    <div class="nh-game-score">
      <span class="nh-stars">${stars || '·'}</span>
      <span class="nh-round">${round + 1} / ${TOTAL_ROUNDS}</span>
    </div>
    <div class="nh-question">How many ${currentEmoji}?</div>
    <div class="nh-objects">${objects}</div>
    <div class="nh-num-row">${numBtns}</div>
    <div class="nh-feedback" id="nh-feedback"></div>
  </div>`
}

// ---- Win HTML --------------------------------------------------------
function winHTML(): string {
  const pct    = correct / TOTAL_ROUNDS
  const trophy = pct === 1 ? '🏆' : pct >= 0.75 ? '🌟' : '🎉'
  return `<div class="nh-win">
    <div class="nh-win-trophy">${trophy}</div>
    <div class="nh-win-title">You can count!</div>
    <div class="nh-win-score">${correct} out of ${TOTAL_ROUNDS}!</div>
    <div class="nh-win-stars">${'⭐'.repeat(correct)}</div>
    <div class="nh-win-btns">
      <button class="nh-start-btn" id="nh-play-again">🎮 Play Again!</button>
      <button class="nh-start-btn nh-start-btn--alt" id="nh-back-hub">🏠 Menu</button>
    </div>
  </div>`
}

// ---- Repaint ---------------------------------------------------------
function repaint() {
  const main = document.getElementById('nh-main')
  if (!main) return
  switch (mode) {
    case 'hub':  main.innerHTML = hubHTML();  break
    case 'game': main.innerHTML = gameHTML(); break
    case 'win':  main.innerHTML = winHTML();  break
  }
  attachListeners()
}

function startGame() {
  clearTimeout(celebTimer)
  mode = 'game'; round = 0; correct = 0
  awaitingNext = false; pickRound(); repaint()
}

// ---- Listeners -------------------------------------------------------
function attachListeners() {
  document.getElementById('nh-start-btn')?.addEventListener('click', startGame)
  document.getElementById('nh-play-again')?.addEventListener('click', () => {
    clearTimeout(celebTimer); awaitingNext = false; startGame()
  })
  document.getElementById('nh-back-hub')?.addEventListener('click', () => {
    clearTimeout(celebTimer); awaitingNext = false; mode = 'hub'; repaint()
  })
  document.querySelectorAll<HTMLButtonElement>('.nh-num-btn').forEach(btn =>
    btn.addEventListener('click', () => {
      if (awaitingNext) return
      handleChoice(Number(btn.dataset.num), btn)
    })
  )
}

// ---- Choice handler --------------------------------------------------
function handleChoice(n: number, btn: HTMLButtonElement) {
  if (n === targetCount) {
    awaitingNext = true
    correct++
    btn.classList.add('nh-btn--correct')
    const fb = document.getElementById('nh-feedback')!
    fb.innerHTML = `<div class="nh-fb nh-fb--win">🎉 Yes! ${targetCount} ${currentEmoji}! ⭐</div>`
    speakWord(String(targetCount))
    clearTimeout(celebTimer)
    celebTimer = window.setTimeout(() => {
      awaitingNext = false
      round++
      if (round >= TOTAL_ROUNDS) { mode = 'win'; repaint() }
      else { pickRound(); repaint() }
    }, 1600)
  } else {
    btn.classList.add('nh-btn--wrong')
    btn.addEventListener('animationend', () => btn.classList.remove('nh-btn--wrong'), { once: true })
    const fb = document.getElementById('nh-feedback')!
    fb.innerHTML = `<div class="nh-fb nh-fb--try">Count again! 🔍</div>`
    setTimeout(() => {
      const el = document.getElementById('nh-feedback')
      if (el?.querySelector('.nh-fb--try')) el.innerHTML = ''
    }, 1000)
  }
}

// ---- Entry point -----------------------------------------------------
export function renderNumberHunt() {
  mode = 'hub'
  clearTimeout(celebTimer); awaitingNext = false

  getApp().innerHTML = `
    <div class="page nh-page">
      <header class="el-hub-header">
        <button class="back-btn" id="nh-back">← Back</button>
        <div class="el-hub-title">🎯 Number Hunt</div>
        <div class="el-hub-sub">Count &amp; tap the right number!</div>
      </header>
      <div class="nh-main" id="nh-main"></div>
    </div>`

  document.getElementById('nh-back')!.addEventListener('click', () => {
    clearTimeout(celebTimer); awaitingNext = false
    if (mode !== 'hub') { mode = 'hub'; repaint() }
    else goBack()
  })

  repaint()
}
