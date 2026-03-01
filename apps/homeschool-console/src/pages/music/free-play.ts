import { goBack, getApp } from '../../nav'
import { PIANO_NOTES, type Note, drawStaff, playNote } from './shared'

// C3–B3 → bass clef;  C4–B5 → treble clef
const KEY_NOTE = new Map<number, Note>()
for (const n of PIANO_NOTES) {
  if (n.clef === 'bass'   && n.pianoKey >= 0 && n.pianoKey <= 6)  KEY_NOTE.set(n.pianoKey, n)
  if (n.clef === 'treble' && n.pianoKey >= 7 && n.pianoKey <= 20) KEY_NOTE.set(n.pianoKey, n)
}

const WHITE_NAMES = ['C','D','E','F','G','A','B','C','D','E','F','G','A','B','C','D','E','F','G','A','B']
const OCTAVES     = [ 3,  3,  3,  3,  3,  3,  3,  4,  4,  4,  4,  4,  4,  4,  5,  5,  5,  5,  5,  5,  5]
const WHITE_W = 58, WHITE_H = 132, BLACK_W = 36, BLACK_H = 84

// Black key left offsets for 58px white keys
// Formula: (i+1)*WHITE_W - BLACK_W/2  for each black key between white keys i and i+1
// Octave 1: C#3(0-1)=40, D#3(1-2)=98, F#3(3-4)=214, G#3(4-5)=272, A#3(5-6)=330
// Octave 2: C#4(7-8)=446, D#4(8-9)=504, F#4(10-11)=620, G#4(11-12)=678, A#4(12-13)=736
// Octave 3: C#5(14-15)=852, D#5(15-16)=910, F#5(17-18)=1026, G#5(18-19)=1084, A#5(19-20)=1142
const BLACK_POS = [40, 98, 214, 272, 330, 446, 504, 620, 678, 736, 852, 910, 1026, 1084, 1142]

// One color per note name for the pressed key glow
const NOTE_COLORS: Record<string, string> = {
  C:'#FF6B6B', D:'#FF922B', E:'#FFD43B', F:'#51CF66',
  G:'#339AF0', A:'#845EF7', B:'#F783AC',
}

function renderPiano(activeKey: number): string {
  const whites = WHITE_NAMES.map((name, i) => {
    const isActive = i === activeKey
    const col = isActive ? NOTE_COLORS[name] : ''
    return `<div class="fp-key-white ${isActive ? 'fp-key--active' : ''}"
      data-key="${i}"
      style="left:${i * WHITE_W}px;width:${WHITE_W}px;height:${WHITE_H}px;
             ${isActive ? `--fkc:${col};` : ''}">
      <span class="fp-key-label">${name}<sub>${OCTAVES[i]}</sub></span>
    </div>`
  }).join('')

  const blacks = BLACK_POS.map(left =>
    `<div class="fp-key-black"
      style="left:${left}px;width:${BLACK_W}px;height:${BLACK_H}px;"></div>`
  ).join('')

  const totalW = 21 * WHITE_W  // 1218px
  return `<div class="fp-piano" style="width:${totalW}px;height:${WHITE_H}px">${whites}${blacks}</div>`
}

function pressKey(keyIdx: number) {
  const note = KEY_NOTE.get(keyIdx)
  if (!note) return

  // Staff
  document.getElementById('fp-staff')!.innerHTML = drawStaff(note.clef, note)
  document.getElementById('fp-clef')!.textContent =
    note.clef === 'treble' ? 'Treble Clef  ·  right hand' : 'Bass Clef  ·  left hand'

  // Big note name badge
  const lbl = document.getElementById('fp-note-name')!
  lbl.textContent = `${note.name}${note.octave}`
  lbl.style.setProperty('--nc', NOTE_COLORS[note.name])
  lbl.classList.remove('hidden', 'fp-name--pop')
  void lbl.offsetWidth  // force reflow so animation restarts
  lbl.classList.add('fp-name--pop')

  // Piano
  document.getElementById('fp-piano-wrap')!.innerHTML = renderPiano(keyIdx)
  attachListeners()

  playNote(note.freq, 0.7)
}

function attachListeners() {
  document.querySelectorAll<HTMLDivElement>('.fp-key-white').forEach(k =>
    k.addEventListener('click', () => pressKey(Number(k.dataset.key)))
  )
}

export function renderFreePlay() {
  getApp().innerHTML = `
    <div class="page ms-page">
      <header class="el-hub-header">
        <button class="back-btn" id="fp-back">← Back</button>
        <div class="el-hub-title">🎹 Free Play</div>
        <div class="el-hub-sub">Press any key to see &amp; hear the note!</div>
      </header>

      <div class="fp-main">
        <div class="fp-top-row">
          <div class="fp-staff-area">
            <div class="nn-clef-label" id="fp-clef">Pick a key below!</div>
            <div class="nn-staff-wrap">
              <div id="fp-staff"></div>
            </div>
          </div>
          <div class="fp-note-name hidden" id="fp-note-name"></div>
        </div>
        <div class="fp-piano-scroll">
          <div id="fp-piano-wrap"></div>
        </div>
      </div>
    </div>`

  document.getElementById('fp-back')!.addEventListener('click', goBack)
  document.getElementById('fp-staff')!.innerHTML = drawStaff('treble')
  document.getElementById('fp-piano-wrap')!.innerHTML = renderPiano(-1)
  attachListeners()
}
