import { goBack, getApp } from '../../nav'
import { type NoteValue, drawNoteShape } from './shared'

interface NoteType {
  type: NoteValue
  name: string
  beats: number
  beatLabel: string
  color: string
}

const NOTE_TYPES: NoteType[] = [
  { type:'whole',   name:'Whole Note',   beats:4, beatLabel:'4 beats',  color:'#7950F2' },
  { type:'half',    name:'Half Note',    beats:2, beatLabel:'2 beats',  color:'#E64980' },
  { type:'quarter', name:'Quarter Note', beats:1, beatLabel:'1 beat',   color:'#0CA678' },
  { type:'eighth',  name:'Eighth Note',  beats:1, beatLabel:'½ beat',   color:'#FF922B' },
]

let current: NoteType
let score = 0
let locked = false

function pick(): NoteType {
  return NOTE_TYPES[Math.floor(Math.random() * NOTE_TYPES.length)]
}

function beatDots(n: NoteType, lit: boolean): string {
  const count = n.beats === 1 && n.type === 'eighth' ? 1 : n.beats
  return Array.from({ length: count }, (_, i) => `
    <span class="nv-dot ${lit ? 'nv-dot--lit' : ''}"
          style="--dc:${n.color};--dd:${(i * 0.18).toFixed(2)}s">
    </span>`).join('')
}

function showChallenge() {
  locked = false
  current = pick()

  document.getElementById('nv-shape')!.innerHTML = drawNoteShape(current.type)
  document.getElementById('nv-feedback')!.className = 'nv-feedback hidden'

  document.querySelectorAll<HTMLButtonElement>('.nv-card').forEach(card => {
    card.classList.remove('nv-card--correct', 'nv-card--wrong')
    const idx = Number(card.dataset.idx)
    card.querySelector('.nv-dots')!.innerHTML = beatDots(NOTE_TYPES[idx], false)
  })
}

function handleAnswer(idx: number) {
  if (locked) return
  const chosen = NOTE_TYPES[idx]
  const card = document.querySelector<HTMLButtonElement>(`.nv-card[data-idx="${idx}"]`)!

  if (chosen.type === current.type) {
    locked = true
    score++
    document.getElementById('nv-score')!.textContent = String(score)

    card.classList.add('nv-card--correct')
    card.querySelector('.nv-dots')!.innerHTML = beatDots(chosen, true)

    const fb = document.getElementById('nv-feedback')!
    fb.textContent = `⭐ ${chosen.name} — ${chosen.beatLabel}!`
    fb.className = 'nv-feedback nv-feedback--correct'

    setTimeout(showChallenge, 1200)
  } else {
    card.classList.add('nv-card--wrong')
    card.addEventListener('animationend', () => card.classList.remove('nv-card--wrong'), { once: true })

    const fb = document.getElementById('nv-feedback')!
    fb.textContent = '❌ Not quite — try again!'
    fb.className = 'nv-feedback nv-feedback--wrong'
  }
}

export function renderNoteValues() {
  score = 0
  locked = false

  const cards = NOTE_TYPES.map((n, i) => `
    <button class="nv-card" data-idx="${i}" style="--nc:${n.color}">
      <div class="nv-card-name">${n.name}</div>
      <div class="nv-card-beats">${n.beatLabel}</div>
      <div class="nv-dots">${beatDots(n, false)}</div>
    </button>`).join('')

  getApp().innerHTML = `
    <div class="page ms-page">
      <header class="el-hub-header">
        <button class="back-btn" id="nv-back">← Back</button>
        <div class="el-hub-title">🎼 Note Values</div>
        <div class="ms-score-badge">⭐ <span id="nv-score">0</span></div>
      </header>

      <div class="nv-main">
        <div class="nv-prompt">What kind of note is this?</div>
        <div class="nv-shape-wrap" id="nv-shape"></div>
        <div class="nv-feedback hidden" id="nv-feedback"></div>
        <div class="nv-cards">${cards}</div>
      </div>
    </div>`

  document.getElementById('nv-back')!.addEventListener('click', goBack)
  document.querySelectorAll<HTMLButtonElement>('.nv-card').forEach(card => {
    card.addEventListener('click', () => handleAnswer(Number(card.dataset.idx)))
  })

  showChallenge()
}
