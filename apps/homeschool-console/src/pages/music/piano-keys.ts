import { goBack, getApp } from '../../nav'
import { PIANO_NOTES, type Note, drawStaff, drawPiano, playNote } from './shared'

let current: Note
let score = 0
let locked = false

function pick(): Note {
  return PIANO_NOTES[Math.floor(Math.random() * PIANO_NOTES.length)]
}

function showNote() {
  locked = false
  current = pick()

  document.getElementById('pk-staff')!.innerHTML = drawStaff(current.clef, current)
  document.getElementById('pk-piano')!.innerHTML = drawPiano()
  document.getElementById('pk-clef')!.textContent =
    current.clef === 'treble' ? 'Treble Clef' : 'Bass Clef'
  document.getElementById('pk-feedback')!.className = 'pk-feedback hidden'

  // Re-attach key listeners after redraw
  attachKeyListeners()

  playNote(current.freq)
}

function attachKeyListeners() {
  document.querySelectorAll<HTMLDivElement>('.ms-key-white').forEach(key => {
    key.addEventListener('click', () => handleKey(Number(key.dataset.key)))
  })
}

function handleKey(keyIdx: number) {
  if (locked) return

  if (keyIdx === current.pianoKey) {
    locked = true
    score++
    document.getElementById('pk-score')!.textContent = String(score)

    // Redraw piano with green highlight
    document.getElementById('pk-piano')!.innerHTML = drawPiano(keyIdx)
    attachKeyListeners()

    const fb = document.getElementById('pk-feedback')!
    fb.textContent = `⭐ That's ${current.name}${current.octave}!`
    fb.className = 'pk-feedback pk-feedback--correct'

    playNote(current.freq)
    setTimeout(showNote, 1100)
  } else {
    // Flash wrong key red briefly
    document.getElementById('pk-piano')!.innerHTML = drawPiano(-1, keyIdx)
    attachKeyListeners()

    const fb = document.getElementById('pk-feedback')!
    fb.textContent = '❌ Not that one — keep trying!'
    fb.className = 'pk-feedback pk-feedback--wrong'

    const staffEl = document.getElementById('pk-staff')!
    staffEl.classList.add('nn-staff--shake')
    staffEl.addEventListener('animationend', () => staffEl.classList.remove('nn-staff--shake'), { once: true })

    setTimeout(() => {
      document.getElementById('pk-piano')!.innerHTML = drawPiano()
      attachKeyListeners()
    }, 600)
  }
}

export function renderPianoKeys() {
  score = 0
  locked = false
  current = pick()

  getApp().innerHTML = `
    <div class="page ms-page">
      <header class="el-hub-header">
        <button class="back-btn" id="pk-back">← Back</button>
        <div class="el-hub-title">🎹 Piano Keys</div>
        <div class="ms-score-badge">⭐ <span id="pk-score">0</span></div>
      </header>

      <div class="pk-main">
        <div class="nn-clef-label" id="pk-clef"></div>
        <div class="nn-staff-wrap pk-staff-wrap">
          <div id="pk-staff"></div>
        </div>
        <div class="pk-instruction">Click the matching key on the piano!</div>
        <div class="pk-feedback hidden" id="pk-feedback"></div>
        <div class="pk-piano-scroll">
          <div id="pk-piano"></div>
        </div>
        <button class="ms-hear-btn" id="pk-hear">🔊 Hear the note</button>
      </div>
    </div>`

  document.getElementById('pk-back')!.addEventListener('click', goBack)
  document.getElementById('pk-hear')!.addEventListener('click', () => playNote(current.freq))

  showNote()
}
