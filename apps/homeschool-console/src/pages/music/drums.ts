import { goBack, getApp } from '../../nav'
import { getAudioCtx } from './shared'

// ---- Drum synthesis --------------------------------------------------
function makeNoise(ctx: AudioContext, secs: number): AudioBufferSourceNode {
  const len = Math.ceil(ctx.sampleRate * secs)
  const buf = ctx.createBuffer(1, len, ctx.sampleRate)
  const d   = buf.getChannelData(0)
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
  const src = ctx.createBufferSource()
  src.buffer = buf
  return src
}

function playDrum(id: string): void {
  const ctx = getAudioCtx()
  const t   = ctx.currentTime

  const noise = (dur: number, hp: number, vol: number, release: number) => {
    const src = makeNoise(ctx, dur)
    const f   = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp
    const g   = ctx.createGain()
    g.gain.setValueAtTime(vol, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + release)
    src.connect(f); f.connect(g); g.connect(ctx.destination); src.start(t)
  }

  const tone = (freq: number, freqEnd: number, vol: number, release: number) => {
    const osc = ctx.createOscillator()
    const g   = ctx.createGain()
    osc.frequency.setValueAtTime(freq, t)
    if (freqEnd > 0) osc.frequency.exponentialRampToValueAtTime(freqEnd, t + release)
    g.gain.setValueAtTime(vol, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + release)
    osc.connect(g); g.connect(ctx.destination)
    osc.start(t); osc.stop(t + release + 0.05)
  }

  switch (id) {
    case 'kick':
      tone(150, 0.001, 1.0, 0.45)
      noise(0.05, 80, 0.3, 0.04)
      break
    case 'snare':
      noise(0.22, 1200, 0.7, 0.18)
      tone(185, -1, 0.4, 0.07)
      break
    case 'hihat':
      noise(0.06, 7000, 0.35, 0.05)
      break
    case 'crash':
      noise(2.0, 3500, 0.5, 1.7)
      break
  }
}

// ---- Lesson data -----------------------------------------------------
interface Lesson {
  icon: string
  title: string
  speech: string
  beatDrums: Record<string, number[]>   // drumId → beats (1–4) where it plays
  spotBeats: number[]                    // beat boxes that get the gold highlight
}

const LESSONS: Lesson[] = [
  {
    icon: '🥁',
    title: 'Count to FOUR!',
    speech: "Hi, I'm Professor Beat! 🎵 In music, beats come in groups of 4 — that's called 4/4 time! Listen to the hi-hat tap each beat and say them out loud: ONE! TWO! THREE! FOUR!",
    beatDrums: { hihat: [1, 2, 3, 4] },
    spotBeats: [1, 2, 3, 4],
  },
  {
    icon: '💣',
    title: 'KICK — Beats 1 & 3',
    speech: "Now hear the BIG kick drum go BOOM on beats ONE and THREE! It's the heaviest beat — you can feel it in the floor! Count along: BOOM! - two - BOOM! - four 🦶",
    beatDrums: { hihat: [1, 2, 3, 4], kick: [1, 3] },
    spotBeats: [1, 3],
  },
  {
    icon: '🪘',
    title: 'SNARE — Beats 2 & 4',
    speech: "The snare drum goes CRACK on beats TWO and FOUR — that's the backbeat! It makes rock music exciting! Count: one - CRACK! - three - CRACK! 🎸",
    beatDrums: { hihat: [1, 2, 3, 4], kick: [1, 3], snare: [2, 4] },
    spotBeats: [2, 4],
  },
  {
    icon: '🎸',
    title: "You've Got a Rock Beat! 🎉",
    speech: "Amazing — you learned a real rock drum beat! Kick on ONE & THREE 🦶, Snare on TWO & FOUR 🥁, Hi-Hat on every beat! Now YOU try it — tap the big pads below and count along!",
    beatDrums: { hihat: [1, 2, 3, 4], kick: [1, 3], snare: [2, 4] },
    spotBeats: [1, 2, 3, 4],
  },
]

const BEAT_WORDS = ['ONE!', 'TWO!', 'THREE!', 'FOUR!']

// ---- State -----------------------------------------------------------
let currentStep = 0
let isPlaying   = false
let loopId: ReturnType<typeof setInterval> | null = null
let beatIdx = 3   // starts at 3 so first tick → 0 → beat 1

// ---- Beat loop -------------------------------------------------------
function tickBeat() {
  if (!document.querySelector('.dt-beat')) { stopLoop(); return }

  beatIdx = (beatIdx + 1) % 4
  const beatNum = beatIdx + 1   // 1–4
  const lesson  = LESSONS[currentStep]

  // Light up beat box
  document.querySelectorAll<HTMLDivElement>('.dt-beat').forEach(b => {
    const bn = Number(b.dataset.beat)
    b.classList.toggle('dt-beat--active', bn === beatNum)
  })

  // Count label
  const lbl = document.getElementById('dt-count-label')
  if (lbl) {
    lbl.textContent = BEAT_WORDS[beatIdx]
    lbl.classList.remove('dt-count-pop')
    void lbl.offsetWidth
    lbl.classList.add('dt-count-pop')
  }

  // Play drums for this beat
  for (const [drumId, beats] of Object.entries(lesson.beatDrums)) {
    if ((beats as number[]).includes(beatNum)) playDrum(drumId)
  }
}

function startLoop() {
  if (loopId) clearInterval(loopId)
  beatIdx   = 3
  isPlaying = true
  loopId    = setInterval(tickBeat, 500)
  tickBeat()
  updatePlayBtn()
}

function stopLoop() {
  if (loopId) { clearInterval(loopId); loopId = null }
  isPlaying = false
  beatIdx   = 3
  document.querySelectorAll<HTMLDivElement>('.dt-beat').forEach(b =>
    b.classList.remove('dt-beat--active'))
  const lbl = document.getElementById('dt-count-label')
  if (lbl) { lbl.textContent = ''; lbl.classList.remove('dt-count-pop') }
  updatePlayBtn()
}

function updatePlayBtn() {
  const btn = document.getElementById('dt-play') as HTMLButtonElement | null
  if (btn) btn.textContent = isPlaying ? '⏹ Stop' : '▶ Play'
}

// ---- Render helpers --------------------------------------------------
function renderBeatRow(): string {
  const lesson = LESSONS[currentStep]
  return [1, 2, 3, 4].map(n =>
    `<div class="dt-beat ${lesson.spotBeats.includes(n) ? 'dt-beat--spot' : ''}"
          data-beat="${n}">${n}</div>`
  ).join('')
}

function renderStepDots(): string {
  return LESSONS.map((_, i) =>
    `<div class="dt-dot ${i === currentStep ? 'dt-dot--active' : ''}"></div>`
  ).join('')
}

function updateLesson() {
  const lesson = LESSONS[currentStep]
  const el = (id: string) => document.getElementById(id)!

  el('dt-title').textContent    = lesson.title
  el('dt-speech').textContent   = lesson.speech
  el('dt-prof-icon').textContent = lesson.icon
  el('dt-beat-row').innerHTML   = renderBeatRow()
  el('dt-dots').innerHTML       = renderStepDots()

  ;(el('dt-prev') as HTMLButtonElement).disabled = currentStep === 0
  const nextBtn = el('dt-next') as HTMLButtonElement
  nextBtn.disabled    = currentStep === LESSONS.length - 1
  nextBtn.textContent = currentStep === LESSONS.length - 1 ? '🎉 Done!' : 'Next ►'
}

// ---- Main render -----------------------------------------------------
export function renderDrums() {
  currentStep = 0
  stopLoop()

  const lesson = LESSONS[0]

  getApp().innerHTML = `
    <div class="page dt-page">
      <header class="el-hub-header dt-header">
        <button class="back-btn" id="dt-back">← Back</button>
        <div class="el-hub-title">🥁 Counting Beats</div>
        <div class="el-hub-sub">Learn to count 1 · 2 · 3 · 4!</div>
      </header>

      <div class="dt-main">

        <!-- Teacher -->
        <div class="dt-teacher">
          <div class="dt-prof">
            <div class="dt-prof-icon" id="dt-prof-icon">${lesson.icon}</div>
            <div class="dt-prof-name">Professor Beat</div>
          </div>
          <div class="dt-bubble">
            <div class="dt-step-title" id="dt-title">${lesson.title}</div>
            <div class="dt-speech" id="dt-speech">${lesson.speech}</div>
          </div>
        </div>

        <!-- Beat counter -->
        <div class="dt-beat-section">
          <div class="dt-beat-row" id="dt-beat-row">${renderBeatRow()}</div>
          <div class="dt-count-label" id="dt-count-label"></div>
        </div>

        <!-- Play / stop -->
        <div class="dt-controls">
          <button class="dt-play-btn" id="dt-play">▶ Play</button>
        </div>

        <!-- Step navigation -->
        <div class="dt-steps">
          <button class="dt-step-btn" id="dt-prev" disabled>◄ Prev</button>
          <div class="dt-step-dots" id="dt-dots">${renderStepDots()}</div>
          <button class="dt-step-btn" id="dt-next">Next ►</button>
        </div>

        <!-- Practice pads -->
        <div class="dt-pads-section">
          <div class="dt-pads-label">🎯 Now you try! Tap the drums:</div>
          <div class="dt-pads">
            <button class="dt-pad" data-drum="kick"  style="--pc:#e74c3c"><span class="dt-pad-emoji">💣</span><span class="dt-pad-name">KICK</span></button>
            <button class="dt-pad" data-drum="snare" style="--pc:#9b59b6"><span class="dt-pad-emoji">🥁</span><span class="dt-pad-name">SNARE</span></button>
            <button class="dt-pad" data-drum="hihat" style="--pc:#f39c12"><span class="dt-pad-emoji">🎩</span><span class="dt-pad-name">HI-HAT</span></button>
            <button class="dt-pad" data-drum="crash" style="--pc:#1abc9c"><span class="dt-pad-emoji">💥</span><span class="dt-pad-name">CRASH</span></button>
          </div>
        </div>

      </div>
    </div>`

  document.getElementById('dt-back')!.addEventListener('click', () => { stopLoop(); goBack() })

  document.getElementById('dt-play')!.addEventListener('click', () => {
    if (isPlaying) stopLoop(); else startLoop()
  })

  document.getElementById('dt-next')!.addEventListener('click', () => {
    if (currentStep < LESSONS.length - 1) { stopLoop(); currentStep++; updateLesson() }
  })

  document.getElementById('dt-prev')!.addEventListener('click', () => {
    if (currentStep > 0) { stopLoop(); currentStep--; updateLesson() }
  })

  document.querySelectorAll<HTMLButtonElement>('.dt-pad').forEach(btn => {
    btn.addEventListener('click', () => {
      playDrum(btn.dataset.drum!)
      btn.classList.remove('dt-pad--hit')
      void btn.offsetWidth
      btn.classList.add('dt-pad--hit')
      btn.addEventListener('animationend', () => btn.classList.remove('dt-pad--hit'), { once: true })
    })
  })
}
