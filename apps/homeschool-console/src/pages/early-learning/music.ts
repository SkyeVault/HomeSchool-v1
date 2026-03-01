import { goBack, getApp } from '../../nav'
import { speakWord } from './typing'

const BUTTONS = [
  { label: 'Do',  color: '#FF6B6B', note: 261.6 },
  { label: 'Re',  color: '#FF922B', note: 293.7 },
  { label: 'Mi',  color: '#FFD43B', note: 329.6 },
  { label: 'Fa',  color: '#51CF66', note: 349.2 },
  { label: 'Sol', color: '#339AF0', note: 392.0 },
  { label: 'La',  color: '#845EF7', note: 440.0 },
  { label: 'Ti',  color: '#F783AC', note: 493.9 },
  { label: 'Do²', color: '#20C997', note: 523.3 },
]

export function renderMusic() {
  const btns = BUTTONS.map((b, i) => `
    <button class="music-btn" data-idx="${i}"
            style="--mc:${b.color};--ad:${(i * 0.07).toFixed(2)}s">
      <span class="music-note">♪</span>
      <span class="music-label">${b.label}</span>
    </button>`
  ).join('')

  getApp().innerHTML = `
    <div class="page music-page">
      <header class="el-hub-header">
        <button class="back-btn" id="music-back">← Back</button>
        <div class="el-hub-title">🎵 Music Buttons 🎵</div>
        <div class="el-hub-sub">Press the buttons and make music!</div>
      </header>
      <div class="music-grid">${btns}</div>
      <div class="music-ripple-field" id="music-ripples"></div>
    </div>`

  document.getElementById('music-back')!.addEventListener('click', goBack)

  // Web Audio API for actual tones
  let audioCtx: AudioContext | null = null
  function ensureAudio() {
    if (!audioCtx) audioCtx = new AudioContext()
    return audioCtx
  }

  function playNote(freq: number) {
    try {
      const ctx = ensureAudio()
      const osc  = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, ctx.currentTime)
      gain.gain.setValueAtTime(0.5, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2)
      osc.start()
      osc.stop(ctx.currentTime + 1.2)
    } catch (_) { /* audio not available */ }
  }

  function spawnRipple(color: string, x: number, y: number) {
    const field = document.getElementById('music-ripples')!
    const el = document.createElement('div')
    el.className = 'music-ripple'
    el.style.cssText = `left:${x}px;top:${y}px;border-color:${color};`
    field.appendChild(el)
    el.addEventListener('animationend', () => el.remove(), { once: true })
  }

  document.querySelectorAll<HTMLButtonElement>('.music-btn').forEach(btn => {
    const handler = (_e: MouseEvent | TouchEvent) => {
      const b = BUTTONS[Number(btn.dataset.idx)]
      btn.classList.add('music-btn--press')
      btn.addEventListener('animationend', () => btn.classList.remove('music-btn--press'), { once: true })
      playNote(b.note)
      speakWord(b.label)

      const rect = btn.getBoundingClientRect()
      const fieldRect = document.getElementById('music-ripples')!.getBoundingClientRect()
      spawnRipple(b.color, rect.left - fieldRect.left + rect.width / 2, rect.top - fieldRect.top + rect.height / 2)
    }
    btn.addEventListener('click', handler)
    btn.addEventListener('touchstart', e => { e.preventDefault(); handler(e) }, { passive: false })
  })
}
