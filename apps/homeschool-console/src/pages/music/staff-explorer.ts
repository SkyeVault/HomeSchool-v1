import { goBack, getApp } from '../../nav'
import { LINES, SV_W, playNote, drawPiano } from './shared'

// ---- Grand staff layout ------------------------------------------
// Treble staff: lines at LINES = [28,44,60,76,92] (same as single staff)
// Bass staff shifted down by 144px: [172,188,204,220,236]
// Middle C (C4): ledger below treble at y=108, ledger above bass at y=156
const BASS_OFFSET = 144
const GRAND_H = 260
const STEP = 8

// All note entries for the grand staff, in y order (top=smallest y)
interface GrandNote {
  name: string; octave: number; clef: 'treble'|'bass'
  y: number     // y in grand staff SVG
  pianoKey: number  // white key 0–13 (C3=0..B4=13), -1 if outside
  freq: number
  isLedger: boolean
}

function midi(n: number) { return 440 * Math.pow(2, (n - 69) / 12) }

const TREBLE_GRAND: GrandNote[] = [
  { name:'G', octave:5, clef:'treble', y:20,  pianoKey:-1, freq:midi(79), isLedger:false },
  { name:'F', octave:5, clef:'treble', y:28,  pianoKey:-1, freq:midi(77), isLedger:false },
  { name:'E', octave:5, clef:'treble', y:36,  pianoKey:-1, freq:midi(76), isLedger:false },
  { name:'D', octave:5, clef:'treble', y:44,  pianoKey:-1, freq:midi(74), isLedger:false },
  { name:'C', octave:5, clef:'treble', y:52,  pianoKey:-1, freq:midi(72), isLedger:false },
  { name:'B', octave:4, clef:'treble', y:60,  pianoKey:13, freq:midi(71), isLedger:false },
  { name:'A', octave:4, clef:'treble', y:68,  pianoKey:12, freq:midi(69), isLedger:false },
  { name:'G', octave:4, clef:'treble', y:76,  pianoKey:11, freq:midi(67), isLedger:false },
  { name:'F', octave:4, clef:'treble', y:84,  pianoKey:10, freq:midi(65), isLedger:false },
  { name:'E', octave:4, clef:'treble', y:92,  pianoKey: 9, freq:midi(64), isLedger:false },
  { name:'D', octave:4, clef:'treble', y:100, pianoKey: 8, freq:midi(62), isLedger:false },
  { name:'C', octave:4, clef:'treble', y:108, pianoKey: 7, freq:midi(60), isLedger:true  },
]

const BASS_GRAND: GrandNote[] = [
  { name:'C', octave:4, clef:'bass',   y:156, pianoKey: 7, freq:midi(60), isLedger:true  },
  { name:'B', octave:3, clef:'bass',   y:164, pianoKey: 6, freq:midi(59), isLedger:false },
  { name:'A', octave:3, clef:'bass',   y:172, pianoKey: 5, freq:midi(57), isLedger:false },
  { name:'G', octave:3, clef:'bass',   y:180, pianoKey: 4, freq:midi(55), isLedger:false },
  { name:'F', octave:3, clef:'bass',   y:188, pianoKey: 3, freq:midi(53), isLedger:false },
  { name:'E', octave:3, clef:'bass',   y:196, pianoKey: 2, freq:midi(52), isLedger:false },
  { name:'D', octave:3, clef:'bass',   y:204, pianoKey: 1, freq:midi(50), isLedger:false },
  { name:'C', octave:3, clef:'bass',   y:212, pianoKey: 0, freq:midi(48), isLedger:false },
  { name:'B', octave:2, clef:'bass',   y:220, pianoKey: 6, freq:midi(47), isLedger:false },
  { name:'A', octave:2, clef:'bass',   y:228, pianoKey:-1, freq:midi(45), isLedger:false },
  { name:'G', octave:2, clef:'bass',   y:236, pianoKey:-1, freq:midi(43), isLedger:false },
]

const ALL_GRAND: GrandNote[] = [...TREBLE_GRAND, ...BASS_GRAND]

// ---- Grand staff SVG (no note — for click-only interaction) -------
function drawGrandStaff(activeNote: GrandNote | null): string {
  const W = SV_W
  const sx = 68, ex = 328
  const bLines = LINES.map(y => y + BASS_OFFSET)

  // Treble staff lines
  const tStaff = LINES.map(y =>
    `<line x1="${sx}" y1="${y}" x2="${ex}" y2="${y}" stroke="#4a4060" stroke-width="1.5"/>`)

  // Bass staff lines
  const bStaff = bLines.map(y =>
    `<line x1="${sx}" y1="${y}" x2="${ex}" y2="${y}" stroke="#4a4060" stroke-width="1.5"/>`)

  // Brace (left bar connecting both staves)
  const braceTop  = LINES[0]          // 28
  const braceBot  = bLines[4]         // 236
  const brace = `<line x1="60" y1="${braceTop}" x2="60" y2="${braceBot}" stroke="#2d1f4e" stroke-width="3.5"/>`

  // Clef glyphs
  const trebleClef = `<text x="6" y="104" font-size="72" font-family="serif" fill="#2d1f4e">𝄞</text>`
  const bassClef   = `<text x="10" y="${62 + BASS_OFFSET}" font-size="44" font-family="serif" fill="#2d1f4e">𝄢</text>`

  // Middle C ledger lines (always shown as reference)
  const midCLedgerT = `<line x1="180" y1="108" x2="214" y2="108" stroke="#b0a8c0" stroke-width="1.2" stroke-dasharray="4 2"/>`
  const midCLedgerB = `<line x1="180" y1="156" x2="214" y2="156" stroke="#b0a8c0" stroke-width="1.2" stroke-dasharray="4 2"/>`
  const midCLabel   = `<text x="218" y="113" font-size="10" fill="#b0a8c0" font-family="sans-serif">C4</text>`

  // Active note highlight
  let noteGlyph = ''
  if (activeNote) {
    const ny = activeNote.y
    const nx = 200
    const MIDDLE = LINES[2]                                // treble middle line y=60
    const BMIDDLE = LINES[2] + BASS_OFFSET                 // bass middle line y=204
    const middleRef = activeNote.clef === 'treble' ? MIDDLE : BMIDDLE

    noteGlyph += `<ellipse cx="${nx}" cy="${ny}" rx="9" ry="7"
      fill="#7950F2" stroke="#7950F2" stroke-width="1.5"
      transform="rotate(-18 ${nx} ${ny})"/>`

    if (ny >= middleRef) {
      noteGlyph += `<line x1="${nx+8}" y1="${ny-5}" x2="${nx+8}" y2="${ny-40}" stroke="#7950F2" stroke-width="2.5"/>`
    } else {
      noteGlyph += `<line x1="${nx-8}" y1="${ny+5}" x2="${nx-8}" y2="${ny+40}" stroke="#7950F2" stroke-width="2.5"/>`
    }

    if (activeNote.isLedger) {
      noteGlyph += `<line x1="${nx-16}" y1="${ny}" x2="${nx+16}" y2="${ny}" stroke="#4a4060" stroke-width="1.5"/>`
    }

    // Note label beside note
    noteGlyph += `<text x="${nx+22}" y="${ny+5}" font-size="20" font-weight="bold"
      fill="#7950F2" font-family="sans-serif">${activeNote.name}${activeNote.octave}</text>`
  }

  // Click hit zones (invisible, cover each note's strip)
  const hitZones = ALL_GRAND.map((n, i) =>
    `<rect x="${sx}" y="${n.y - STEP/2}" width="${ex - sx}" height="${STEP}"
      fill="transparent" class="se-zone" data-idx="${i}" style="cursor:pointer"/>`
  ).join('')

  return `<svg xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 ${W} ${GRAND_H}" width="${W}" height="${GRAND_H}"
    id="se-svg">
    ${brace}
    ${tStaff.join('')}
    ${bStaff.join('')}
    ${trebleClef}
    ${bassClef}
    ${midCLedgerT}
    ${midCLedgerB}
    ${midCLabel}
    ${noteGlyph}
    ${hitZones}
  </svg>`
}

// ---- Render activity ---------------------------------------------
let activeNote: GrandNote | null = null

function selectNote(idx: number) {
  activeNote = ALL_GRAND[idx]
  playNote(activeNote.freq)

  // Redraw staff
  document.getElementById('se-staff')!.innerHTML = drawGrandStaff(activeNote)
  attachZoneListeners()

  // Redraw piano
  document.getElementById('se-piano')!.innerHTML = drawPiano(
    activeNote.pianoKey >= 0 ? activeNote.pianoKey : -1
  )

  // Update label
  const lbl = document.getElementById('se-label')!
  lbl.textContent = `${activeNote.name}${activeNote.octave} — ${activeNote.clef === 'treble' ? 'Treble' : 'Bass'} Clef`
  lbl.className = 'se-label se-label--show'
}

function attachZoneListeners() {
  document.querySelectorAll<SVGRectElement>('.se-zone').forEach(zone => {
    zone.addEventListener('click', () => selectNote(Number(zone.dataset.idx)))
  })
}

export function renderStaffExplorer() {
  activeNote = null

  getApp().innerHTML = `
    <div class="page ms-page">
      <header class="el-hub-header">
        <button class="back-btn" id="se-back">← Back</button>
        <div class="el-hub-title">🔭 Staff Explorer</div>
        <div class="el-hub-sub">Click anywhere on the staff!</div>
      </header>

      <div class="se-main">
        <div class="se-hint">👆 Tap a line or space to hear and see the note</div>
        <div class="se-staff-wrap" id="se-staff"></div>
        <div class="se-label hidden" id="se-label"></div>
        <div class="se-piano-scroll">
          <div id="se-piano"></div>
        </div>
      </div>
    </div>`

  document.getElementById('se-back')!.addEventListener('click', goBack)

  document.getElementById('se-staff')!.innerHTML = drawGrandStaff(null)
  document.getElementById('se-piano')!.innerHTML = drawPiano()
  attachZoneListeners()
}
