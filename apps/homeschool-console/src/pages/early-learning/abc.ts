import { goBack, getApp } from '../../nav'
import { speakWord } from './typing'

// ---- Letter definitions ----------------------------------------------
const ALPHA = [
  { letter:'A', emoji:'🍎', word:'Apple'     },
  { letter:'B', emoji:'🐝', word:'Bee'       },
  { letter:'C', emoji:'🐱', word:'Cat'       },
  { letter:'D', emoji:'🐶', word:'Dog'       },
  { letter:'E', emoji:'🐘', word:'Elephant'  },
  { letter:'F', emoji:'🐸', word:'Frog'      },
  { letter:'G', emoji:'🍇', word:'Grapes'    },
  { letter:'H', emoji:'🏠', word:'House'     },
  { letter:'I', emoji:'🍦', word:'Ice Cream' },
  { letter:'J', emoji:'🪼', word:'Jellyfish' },
  { letter:'K', emoji:'🗝️', word:'Key'       },
  { letter:'L', emoji:'🦁', word:'Lion'      },
  { letter:'M', emoji:'🌙', word:'Moon'      },
  { letter:'N', emoji:'🪺', word:'Nest'      },
  { letter:'O', emoji:'🍊', word:'Orange'    },
  { letter:'P', emoji:'🐷', word:'Pig'       },
  { letter:'Q', emoji:'👑', word:'Queen'     },
  { letter:'R', emoji:'🌈', word:'Rainbow'   },
  { letter:'S', emoji:'⭐', word:'Star'      },
  { letter:'T', emoji:'🐢', word:'Turtle'    },
  { letter:'U', emoji:'☂️', word:'Umbrella'  },
  { letter:'V', emoji:'🎻', word:'Violin'    },
  { letter:'W', emoji:'🐳', word:'Whale'     },
  { letter:'X', emoji:'🎹', word:'Xylophone' },
  { letter:'Y', emoji:'🧶', word:'Yarn'      },
  { letter:'Z', emoji:'🦓', word:'Zebra'     },
]

const PALETTE = [
  '#FF6B6B','#FF922B','#FFD43B','#51CF66','#339AF0',
  '#845EF7','#F783AC','#20C997','#E64980','#74C0FC',
  '#A9E34B','#FF8787','#63E6BE','#F06595','#CC5DE8',
  '#4DABF7','#69DB7C','#FF922B','#FF6B6B','#845EF7',
  '#20C997','#E64980','#51CF66','#339AF0','#F783AC','#FFD43B',
]

function lc(idx: number) { return PALETTE[idx % PALETTE.length] }

// ---- State -----------------------------------------------------------
type Mode = 'hub' | 'explore' | 'game' | 'win'
let mode: Mode         = 'hub'
let exploreIdx         = 0
let gameRound          = 0
let gameCorrect        = 0
let gameTarget         = 0
let gameChoices: number[]       = []
let recentTargets: number[]     = []
let awaitingNext       = false
let celebTimer         = 0
const TOTAL_ROUNDS     = 8

function pickGameRound() {
  const avail = ALPHA.map((_, i) => i).filter(i => !recentTargets.includes(i))
  gameTarget = avail[Math.floor(Math.random() * avail.length)]
  recentTargets = [...recentTargets.slice(-5), gameTarget]

  const others = ALPHA.map((_, i) => i).filter(i => i !== gameTarget)
  const wrong: number[] = []
  while (wrong.length < 2) {
    const p = others[Math.floor(Math.random() * others.length)]
    if (!wrong.includes(p)) wrong.push(p)
  }
  gameChoices = [gameTarget, ...wrong].sort(() => Math.random() - 0.5)
}

// ---- Hub HTML --------------------------------------------------------
function hubHTML(): string {
  const grid = ALPHA.map((a, i) =>
    `<button class="ae-grid-card" data-idx="${i}"
             style="--lc:${lc(i)};animation-delay:${((i * 0.035) % 1).toFixed(2)}s">
       ${a.letter}
     </button>`
  ).join('')

  return `<div class="ae-hub">
    <div class="ae-hub-top">
      <div class="ae-hub-title">A · B · C</div>
      <button class="ae-play-btn" id="ae-game-btn">🎮 Play Game!</button>
    </div>
    <div class="ae-grid">${grid}</div>
  </div>`
}

// ---- Explore (letter detail) HTML ------------------------------------
function exploreHTML(): string {
  const a      = ALPHA[exploreIdx]
  const color  = lc(exploreIdx)
  const isFirst = exploreIdx === 0
  const isLast  = exploreIdx === ALPHA.length - 1

  return `<div class="ae-explore">
    <div class="ae-explore-card" style="--lc:${color}">
      <div class="ae-explore-letter">${a.letter}</div>
      <div class="ae-explore-emoji">${a.emoji}</div>
      <div class="ae-explore-word">${a.word}</div>
    </div>
    <div class="ae-explore-nav">
      <button class="ae-nav-btn" id="ae-prev" ${isFirst ? 'disabled' : ''}>◄</button>
      <span class="ae-explore-pos">${exploreIdx + 1} / ${ALPHA.length}</span>
      ${isLast
        ? `<button class="ae-nav-btn ae-nav-btn--play" id="ae-play-from-explore">🎮 Play!</button>`
        : `<button class="ae-nav-btn ae-nav-btn--fwd" id="ae-next">►</button>`
      }
    </div>
  </div>`
}

// ---- Game HTML -------------------------------------------------------
function gameHTML(): string {
  const t     = ALPHA[gameTarget]
  const stars = '⭐'.repeat(gameCorrect)

  const choiceBtns = gameChoices.map(idx =>
    `<button class="ae-choice" data-choice="${idx}" style="--lc:${lc(idx)}">
       ${ALPHA[idx].letter}
     </button>`
  ).join('')

  return `<div class="ae-game">
    <div class="ae-game-score">
      <span class="ae-game-stars">${stars || '·'}</span>
      <span class="ae-game-round">${gameRound + 1} / ${TOTAL_ROUNDS}</span>
    </div>
    <div class="ae-game-prompt">
      <div class="ae-prompt-hint">Find this letter!</div>
      <div class="ae-prompt-letter" style="--lc:${lc(gameTarget)}">${t.letter}</div>
      <div class="ae-prompt-assoc">${t.emoji} ${t.word}</div>
    </div>
    <div class="ae-choices">${choiceBtns}</div>
    <div class="ae-feedback" id="ae-feedback"></div>
  </div>`
}

// ---- Win HTML --------------------------------------------------------
function winHTML(): string {
  const pct    = gameCorrect / TOTAL_ROUNDS
  const trophy = pct === 1 ? '🏆' : pct >= 0.75 ? '🌟' : '🎉'
  return `<div class="ae-win">
    <div class="ae-win-trophy">${trophy}</div>
    <div class="ae-win-title">Brilliant!</div>
    <div class="ae-win-score">${gameCorrect} out of ${TOTAL_ROUNDS}!</div>
    <div class="ae-win-stars">${'⭐'.repeat(gameCorrect)}</div>
    <div class="ae-win-btns">
      <button class="ae-play-btn" id="ae-play-again">🎮 Play Again!</button>
      <button class="ae-grid-btn" id="ae-learn-again">🔤 ABC Grid</button>
    </div>
  </div>`
}

// ---- Repaint ---------------------------------------------------------
function repaint() {
  const main = document.getElementById('ae-main')
  if (!main) return
  switch (mode) {
    case 'hub':     main.innerHTML = hubHTML();     break
    case 'explore': main.innerHTML = exploreHTML(); break
    case 'game':    main.innerHTML = gameHTML();    break
    case 'win':     main.innerHTML = winHTML();     break
  }
  attachListeners()
}

function startGame() {
  clearTimeout(celebTimer)
  mode = 'game'; gameRound = 0; gameCorrect = 0
  recentTargets = []; awaitingNext = false
  pickGameRound(); repaint()
}

// ---- Listeners -------------------------------------------------------
function attachListeners() {
  document.querySelectorAll<HTMLButtonElement>('.ae-grid-card').forEach(btn =>
    btn.addEventListener('click', () => {
      exploreIdx = Number(btn.dataset.idx)
      mode = 'explore'; repaint()
    })
  )
  document.getElementById('ae-game-btn')?.addEventListener('click', startGame)

  document.getElementById('ae-prev')?.addEventListener('click', () => {
    if (exploreIdx > 0) { exploreIdx--; repaint() }
  })
  document.getElementById('ae-next')?.addEventListener('click', () => {
    if (exploreIdx < ALPHA.length - 1) { exploreIdx++; repaint() }
  })
  document.getElementById('ae-play-from-explore')?.addEventListener('click', startGame)

  document.querySelectorAll<HTMLButtonElement>('.ae-choice').forEach(btn =>
    btn.addEventListener('click', () => {
      if (awaitingNext) return
      handleChoice(Number(btn.dataset.choice), btn)
    })
  )

  document.getElementById('ae-play-again')?.addEventListener('click', () => {
    clearTimeout(celebTimer); awaitingNext = false; startGame()
  })
  document.getElementById('ae-learn-again')?.addEventListener('click', () => {
    clearTimeout(celebTimer); awaitingNext = false; mode = 'hub'; repaint()
  })

  if (mode === 'explore') speakWord(ALPHA[exploreIdx].letter)
}

// ---- Choice handler --------------------------------------------------
function handleChoice(chosen: number, btn: HTMLButtonElement) {
  if (chosen === gameTarget) {
    awaitingNext = true
    gameCorrect++
    btn.classList.add('ae-choice--correct')
    const fb = document.getElementById('ae-feedback')!
    fb.innerHTML = `<div class="ae-fb ae-fb--win">🎉 ${ALPHA[gameTarget].letter} for ${ALPHA[gameTarget].word}! ⭐</div>`
    speakWord(ALPHA[gameTarget].letter)
    clearTimeout(celebTimer)
    celebTimer = window.setTimeout(() => {
      awaitingNext = false
      gameRound++
      if (gameRound >= TOTAL_ROUNDS) { mode = 'win'; repaint() }
      else { pickGameRound(); repaint() }
    }, 1600)
  } else {
    btn.classList.add('ae-choice--wrong')
    btn.addEventListener('animationend', () => btn.classList.remove('ae-choice--wrong'), { once: true })
    const fb = document.getElementById('ae-feedback')!
    fb.innerHTML = `<div class="ae-fb ae-fb--try">Look carefully! 🔍</div>`
    setTimeout(() => {
      const el = document.getElementById('ae-feedback')
      if (el?.querySelector('.ae-fb--try')) el.innerHTML = ''
    }, 1000)
  }
}

// ---- Entry point -----------------------------------------------------
export function renderABC() {
  mode = 'hub'; exploreIdx = 0
  clearTimeout(celebTimer); awaitingNext = false

  getApp().innerHTML = `
    <div class="page ae-page">
      <header class="el-hub-header">
        <button class="back-btn" id="ae-back">← Back</button>
        <div class="el-hub-title">🔤 ABC Explorer</div>
        <div class="el-hub-sub">Tap a letter to learn it!</div>
      </header>
      <div class="ae-main" id="ae-main"></div>
    </div>`

  document.getElementById('ae-back')!.addEventListener('click', () => {
    clearTimeout(celebTimer); awaitingNext = false
    if (mode !== 'hub') { mode = 'hub'; repaint() }
    else goBack()
  })

  repaint()
}
