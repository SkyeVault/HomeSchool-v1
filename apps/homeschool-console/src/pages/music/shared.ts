// ================================================================
// shared.ts — Note data, SVG staff renderer, piano renderer, audio
// ================================================================

export interface Note {
  name: string          // 'C' – 'G'
  octave: number
  clef: 'treble' | 'bass'
  staffY: number        // y position on single-staff SVG (lines at 28,44,60,76,92)
  pianoKey: number      // white-key index C3=0…B4=13, -1 if outside that range
  freq: number          // Hz
  needsLedger: boolean
  ledgerY?: number
}

// ---- SVG constants -----------------------------------------------
export const SV_W    = 340
export const SV_H    = 124
export const LINES   = [28, 44, 60, 76, 92] // top→bottom (line5→line1), step=8px
export const NOTE_X  = 200

// ---- Frequency helper --------------------------------------------
function midi(n: number) { return 440 * Math.pow(2, (n - 69) / 12) }

// ---- Treble clef note pool ---------------------------------------
// Lines (bottom→top): E4 G4 B4 D5 F5
// Spaces (bottom→top): F4 A4 C5 E5
// Above line5: G5 ; Below line1: D4 ; Ledger below: C4(middle C)
export const TREBLE_NOTES: Note[] = [
  { name:'C', octave:4, clef:'treble', staffY:108, pianoKey: 7, freq:midi(60), needsLedger:true,  ledgerY:108 },
  { name:'D', octave:4, clef:'treble', staffY:100, pianoKey: 8, freq:midi(62), needsLedger:false },
  { name:'E', octave:4, clef:'treble', staffY: 92, pianoKey: 9, freq:midi(64), needsLedger:false },
  { name:'F', octave:4, clef:'treble', staffY: 84, pianoKey:10, freq:midi(65), needsLedger:false },
  { name:'G', octave:4, clef:'treble', staffY: 76, pianoKey:11, freq:midi(67), needsLedger:false },
  { name:'A', octave:4, clef:'treble', staffY: 68, pianoKey:12, freq:midi(69), needsLedger:false },
  { name:'B', octave:4, clef:'treble', staffY: 60, pianoKey:13, freq:midi(71), needsLedger:false },
  { name:'C', octave:5, clef:'treble', staffY: 52, pianoKey:14, freq:midi(72), needsLedger:false },
  { name:'D', octave:5, clef:'treble', staffY: 44, pianoKey:15, freq:midi(74), needsLedger:false },
  { name:'E', octave:5, clef:'treble', staffY: 36, pianoKey:16, freq:midi(76), needsLedger:false },
  { name:'F', octave:5, clef:'treble', staffY: 28, pianoKey:17, freq:midi(77), needsLedger:false },
  { name:'G', octave:5, clef:'treble', staffY: 20, pianoKey:18, freq:midi(79), needsLedger:false },
  { name:'A', octave:5, clef:'treble', staffY: 12, pianoKey:19, freq:midi(81), needsLedger:true,  ledgerY:12  },
  { name:'B', octave:5, clef:'treble', staffY:  4, pianoKey:20, freq:midi(83), needsLedger:true,  ledgerY:12  },
]

// ---- Bass clef note pool -----------------------------------------
// Lines (bottom→top): G2 B2 D3 F3 A3
// Spaces (bottom→top): A2 C3 E3 G3
// Above line5: B3 ; Ledger above: C4(middle C)
export const BASS_NOTES: Note[] = [
  { name:'G', octave:2, clef:'bass', staffY: 92, pianoKey:-1, freq:midi(43), needsLedger:false },
  { name:'A', octave:2, clef:'bass', staffY: 84, pianoKey:-1, freq:midi(45), needsLedger:false },
  { name:'B', octave:2, clef:'bass', staffY: 76, pianoKey:-1, freq:midi(47), needsLedger:false },
  { name:'C', octave:3, clef:'bass', staffY: 68, pianoKey: 0, freq:midi(48), needsLedger:false },
  { name:'D', octave:3, clef:'bass', staffY: 60, pianoKey: 1, freq:midi(50), needsLedger:false },
  { name:'E', octave:3, clef:'bass', staffY: 52, pianoKey: 2, freq:midi(52), needsLedger:false },
  { name:'F', octave:3, clef:'bass', staffY: 44, pianoKey: 3, freq:midi(53), needsLedger:false },
  { name:'G', octave:3, clef:'bass', staffY: 36, pianoKey: 4, freq:midi(55), needsLedger:false },
  { name:'A', octave:3, clef:'bass', staffY: 28, pianoKey: 5, freq:midi(57), needsLedger:false },
  { name:'B', octave:3, clef:'bass', staffY: 20, pianoKey: 6, freq:midi(59), needsLedger:false },
  { name:'C', octave:4, clef:'bass', staffY:  8, pianoKey: 7, freq:midi(60), needsLedger:true, ledgerY:8 },
]

export const ALL_NOTES: Note[] = [...TREBLE_NOTES, ...BASS_NOTES]

// Notes that fall on the C3–B5 keyboard (pianoKey 0–20)
export const PIANO_NOTES: Note[] = ALL_NOTES.filter(n => n.pianoKey >= 0)

// ---- SVG Staff renderer ------------------------------------------
// Returns an SVG string showing a staff with clef and optional note.
export function drawStaff(clef: 'treble' | 'bass', note?: Note): string {
  const sx = 68   // staff x start (after clef)
  const ex = 328  // staff x end
  const nx = NOTE_X
  const MIDDLE = LINES[2] // y=60, middle line

  const staffLines = LINES.map(y =>
    `<line x1="${sx}" y1="${y}" x2="${ex}" y2="${y}" stroke="#4a4060" stroke-width="1.5"/>`
  ).join('')

  // Clef glyph — unicode characters sized+positioned to sit on the staff
  const clefGlyph = clef === 'treble'
    ? `<text x="6" y="100" font-size="72" font-family="serif" fill="#2d1f4e">𝄞</text>`
    : `<text x="10" y="62" font-size="44" font-family="serif" fill="#2d1f4e">𝄢</text>`

  let noteGlyph = ''
  if (note) {
    const ny = note.staffY

    // Filled notehead (tilted oval — standard music notation style)
    noteGlyph += `<ellipse cx="${nx}" cy="${ny}" rx="9" ry="7"
      fill="#2d1f4e" stroke="#2d1f4e" stroke-width="1.5"
      transform="rotate(-18 ${nx} ${ny})"/>`

    // Stem direction: up when note is on/below middle line, down when above
    if (ny >= MIDDLE) {
      noteGlyph += `<line x1="${nx+8}" y1="${ny-5}" x2="${nx+8}" y2="${ny-44}"
        stroke="#2d1f4e" stroke-width="2.5"/>`
    } else {
      noteGlyph += `<line x1="${nx-8}" y1="${ny+5}" x2="${nx-8}" y2="${ny+44}"
        stroke="#2d1f4e" stroke-width="2.5"/>`
    }

    // Ledger line
    if (note.needsLedger && note.ledgerY !== undefined) {
      noteGlyph += `<line x1="${nx-16}" y1="${note.ledgerY}" x2="${nx+16}" y2="${note.ledgerY}"
        stroke="#4a4060" stroke-width="1.5"/>`
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -10 ${SV_W} ${SV_H + 10}"
    width="${SV_W}" height="${SV_H}">
    ${clefGlyph}
    ${staffLines}
    ${noteGlyph}
  </svg>`
}

// ---- Note-value shape renderer -----------------------------------
export type NoteValue = 'whole' | 'half' | 'quarter' | 'eighth'

export function drawNoteShape(type: NoteValue): string {
  const W = 200, H = 120
  const cx = 100, cy = 68
  const stemX = cx + 9
  const stemTop = cy - 50

  const open  = `<ellipse cx="${cx}" cy="${cy}" rx="11" ry="8" fill="white" stroke="#2d1f4e" stroke-width="3" transform="rotate(-18 ${cx} ${cy})"/>`
  const filled= `<ellipse cx="${cx}" cy="${cy}" rx="11" ry="8" fill="#2d1f4e" stroke="#2d1f4e" stroke-width="1.5" transform="rotate(-18 ${cx} ${cy})"/>`
  const stem  = `<line x1="${stemX}" y1="${cy-6}" x2="${stemX}" y2="${stemTop}" stroke="#2d1f4e" stroke-width="2.5"/>`
  const flag  = `<path d="M ${stemX} ${stemTop} C ${stemX+20} ${stemTop+12}, ${stemX+20} ${stemTop+28}, ${stemX+2} ${stemTop+38}"
    stroke="#2d1f4e" stroke-width="2.5" fill="none"/>`

  // Three reference staff lines for context
  const staffLines = [55, 63, 71].map(y =>
    `<line x1="40" y1="${y}" x2="160" y2="${y}" stroke="#c0b8d0" stroke-width="1.2"/>`
  ).join('')

  let noteEl = ''
  if (type === 'whole')   noteEl = open
  if (type === 'half')    noteEl = open + stem
  if (type === 'quarter') noteEl = filled + stem
  if (type === 'eighth')  noteEl = filled + stem + flag

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
    ${staffLines}
    ${noteEl}
  </svg>`
}

// ---- Piano keyboard HTML -----------------------------------------
// 14 white keys: C3(0)…B4(13). Black keys are visual only.
const WHITE_KEYS = ['C','D','E','F','G','A','B','C','D','E','F','G','A','B']
const WHITE_W = 34, WHITE_H = 90, BLACK_W = 22, BLACK_H = 56

// Black key left offsets (relative to piano container)
const BLACK_POSITIONS: {left: number}[] = [
  {left: 21},  // C#3
  {left: 55},  // D#3
  {left: 123}, // F#3
  {left: 157}, // G#3
  {left: 191}, // A#3
  {left: 259}, // C#4
  {left: 293}, // D#4
  {left: 361}, // F#4
  {left: 395}, // G#4
  {left: 429}, // A#4
]

export function drawPiano(
  highlightKey: number = -1,
  wrongKey:     number = -1,
): string {
  const whites = WHITE_KEYS.map((label, i) => {
    let cls = 'ms-key-white'
    if (i === highlightKey) cls += ' ms-key--correct'
    if (i === wrongKey)     cls += ' ms-key--wrong'
    const octave = i < 7 ? 3 : 4
    return `<div class="${cls}" data-key="${i}"
      style="left:${i * WHITE_W}px;width:${WHITE_W}px;height:${WHITE_H}px;">
      <span class="ms-key-label">${label}${octave}</span>
    </div>`
  }).join('')

  const blacks = BLACK_POSITIONS.map((pos, _i) =>
    `<div class="ms-key-black" style="left:${pos.left}px;width:${BLACK_W}px;height:${BLACK_H}px;"></div>`
  ).join('')

  const totalW = 14 * WHITE_W
  return `<div class="ms-piano" style="width:${totalW}px">
    ${whites}
    ${blacks}
  </div>`
}

// ---- Web Audio ---------------------------------------------------
let _ctx: AudioContext | null = null
export function getAudioCtx(): AudioContext {
  if (!_ctx) _ctx = new AudioContext()
  return _ctx
}
function getCtx() { return getAudioCtx() }

export function playNote(freq: number, duration = 0.6): void {
  const ctx = getCtx()
  const osc  = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.type = 'sine'
  osc.frequency.value = freq
  gain.gain.setValueAtTime(0.4, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + duration)
}
