import { goBack, getApp } from '../../nav'
import { ALL_NOTES, type Note, drawStaff, playNote } from './shared'

const LETTERS = ['A','B','C','D','E','F','G']
const LETTER_COLORS = ['#FF6B6B','#FF922B','#FFD43B','#51CF66','#339AF0','#845EF7','#F783AC']

let current: Note
let score = 0
let locked = false

function pick(): Note {
  return ALL_NOTES[Math.floor(Math.random() * ALL_NOTES.length)]
}

function showNote() {
  locked = false
  current = pick()

  const staffEl = document.getElementById('nn-staff')!
  staffEl.innerHTML = drawStaff(current.clef, current)
  staffEl.classList.remove('nn-staff--shake')

  const clefLabel = document.getElementById('nn-clef-label')!
  clefLabel.textContent = current.clef === 'treble' ? 'Treble Clef' : 'Bass Clef'

  document.getElementById('nn-feedback')!.className = 'nn-feedback hidden'

  playNote(current.freq)
}

function handleAnswer(letter: string) {
  if (locked) return
  if (letter === current.name) {
    locked = true
    score++
    document.getElementById('nn-score')!.textContent = String(score)

    const fb = document.getElementById('nn-feedback')!
    fb.textContent = '⭐ Yes!'
    fb.className = 'nn-feedback nn-feedback--correct'

    // Highlight correct button
    document.querySelectorAll<HTMLButtonElement>('.nn-letter').forEach(btn => {
      if (btn.dataset.letter === letter) btn.classList.add('nn-letter--correct')
    })

    setTimeout(showNote, 900)
  } else {
    const fb = document.getElementById('nn-feedback')!
    fb.textContent = '❌ Try again!'
    fb.className = 'nn-feedback nn-feedback--wrong'

    const btn = document.querySelector<HTMLButtonElement>(`.nn-letter[data-letter="${letter}"]`)
    btn?.classList.add('nn-letter--wrong')
    btn?.addEventListener('animationend', () => btn.classList.remove('nn-letter--wrong'), { once: true })

    const staffEl = document.getElementById('nn-staff')!
    staffEl.classList.add('nn-staff--shake')
    staffEl.addEventListener('animationend', () => staffEl.classList.remove('nn-staff--shake'), { once: true })
  }
}

export function renderNoteNames() {
  score = 0
  locked = false
  current = pick()

  const buttons = LETTERS.map((l, i) => `
    <button class="nn-letter" data-letter="${l}"
            style="--lc:${LETTER_COLORS[i]}">
      ${l}
    </button>`).join('')

  getApp().innerHTML = `
    <div class="page ms-page">
      <header class="el-hub-header">
        <button class="back-btn" id="nn-back">← Back</button>
        <div class="el-hub-title">🎵 Note Names</div>
        <div class="ms-score-badge">⭐ <span id="nn-score">0</span></div>
      </header>

      <div class="nn-main">
        <div class="nn-clef-label" id="nn-clef-label"></div>
        <div class="nn-staff-wrap">
          <div id="nn-staff"></div>
        </div>
        <div class="nn-question">What note is this?</div>
        <div class="nn-feedback hidden" id="nn-feedback"></div>
        <div class="nn-letters">${buttons}</div>
        <button class="ms-hear-btn" id="nn-hear">🔊 Hear it again</button>
      </div>
    </div>`

  document.getElementById('nn-back')!.addEventListener('click', goBack)
  document.getElementById('nn-hear')!.addEventListener('click', () => playNote(current.freq))

  document.querySelectorAll<HTMLButtonElement>('.nn-letter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nn-letter').forEach(b => {
        b.classList.remove('nn-letter--correct', 'nn-letter--wrong')
      })
      handleAnswer(btn.dataset.letter!)
    })
  })

  showNote()
}
