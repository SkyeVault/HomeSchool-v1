import { goBack, getApp } from '../nav'

interface Exercise {
  name: string
  emoji: string
  description: string
  count: number
  unit: string
}

const EXERCISES: Exercise[] = [
  { name: 'Jumping Jacks', emoji: '🤸', description: 'Jump and spread your arms and legs out wide, then back together!', count: 10, unit: 'times' },
  { name: 'Hop on One Foot', emoji: '🦘', description: 'Balance on one foot and hop as high as you can!', count: 5, unit: 'hops each leg' },
  { name: 'Touch Your Toes', emoji: '🙆', description: 'Reach down and try to touch your toes — nice stretch!', count: 5, unit: 'times' },
  { name: 'Spin Around', emoji: '🌀', description: 'Spin around in a circle with arms wide open!', count: 3, unit: 'spins each way' },
  { name: 'Run in Place', emoji: '🏃', description: 'Lift your knees high and run without moving!', count: 20, unit: 'steps' },
  { name: 'Arm Circles', emoji: '💪', description: 'Stretch your arms out and make big circles!', count: 10, unit: 'each direction' },
  { name: 'Frog Jumps', emoji: '🐸', description: 'Squat down low like a frog, then leap up high!', count: 5, unit: 'leaps' },
  { name: 'Star Jumps', emoji: '⭐', description: 'Jump up and make an X shape with your arms and legs!', count: 8, unit: 'jumps' },
  { name: 'Bear Walk', emoji: '🐻', description: 'Get on all fours and walk like a bear across the room!', count: 1, unit: 'lap of the room' },
  { name: 'Clap Overhead', emoji: '👏', description: 'Raise both arms above your head and clap 10 times!', count: 10, unit: 'claps' },
  { name: 'Knee Hugs', emoji: '🫂', description: 'Lift one knee and hug it to your chest, then switch!', count: 5, unit: 'each leg' },
  { name: 'Wiggle Dance', emoji: '💃', description: 'Wiggle your whole body to your favorite song for a few seconds!', count: 10, unit: 'seconds' },
  { name: 'Crab Walk', emoji: '🦀', description: 'Sit down, put hands behind you, lift your bottom, and walk like a crab!', count: 1, unit: 'lap of the room' },
  { name: 'Big Stretch', emoji: '🌟', description: 'Reach as high as you can to the sky, then bend and reach for the floor!', count: 5, unit: 'times' },
  { name: 'Tiptoe Walk', emoji: '🩰', description: 'Rise up on your tiptoes and walk as tall as you can!', count: 1, unit: 'lap of the room' },
]

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

let pool: Exercise[]
let current: Exercise
let completed = 0
let timer: ReturnType<typeof setInterval> | null = null

function nextExercise() {
  if (pool.length === 0) pool = shuffle([...EXERCISES])
  current = pool.pop()!
  if (timer) { clearInterval(timer); timer = null }
}

function renderExercise() {
  nextExercise()

  const emojiEl = document.getElementById('pe-emoji')
  const nameEl  = document.getElementById('pe-name')
  const descEl  = document.getElementById('pe-desc')
  const countEl = document.getElementById('pe-count')
  const doneBtn = document.getElementById('pe-done')
  const fb      = document.getElementById('pe-feedback')

  if (emojiEl) emojiEl.textContent = current.emoji
  if (nameEl)  nameEl.textContent  = current.name
  if (descEl)  descEl.textContent  = current.description
  if (countEl) countEl.textContent = `${current.count} ${current.unit}`
  if (doneBtn) {
    doneBtn.textContent = "✅ I Did It!"
    ;(doneBtn as HTMLButtonElement).disabled = false
  }
  if (fb) { fb.textContent = ''; fb.className = 'pe-feedback' }
}

function handleDone() {
  completed++
  document.getElementById('pe-score')!.textContent = String(completed)

  const doneBtn = document.getElementById('pe-done') as HTMLButtonElement
  const fb = document.getElementById('pe-feedback')!

  doneBtn.disabled = true

  const cheers = ['🌟 Awesome job!', '🔥 You crushed it!', '⭐ Super strong!', '🏆 Champion!', '💪 Way to go!', '🎉 Incredible!']
  fb.textContent = cheers[Math.floor(Math.random() * cheers.length)] + ' Next one coming up...'
  fb.className = 'pe-feedback pe-feedback--good'

  setTimeout(renderExercise, 2000)
}

export function renderPhysicalEducation() {
  pool = shuffle([...EXERCISES])
  completed = 0

  getApp().innerHTML = `
    <div class="page pe-page">
      <header class="pe-header">
        <button class="back-btn" id="pe-back">← Back</button>
        <div class="pe-title">⚽ Move It!</div>
        <div class="pe-score-badge">✅ <span id="pe-score">0</span> done</div>
      </header>
      <div class="pe-body">
        <div class="pe-card">
          <div class="pe-emoji" id="pe-emoji"></div>
          <div class="pe-name" id="pe-name"></div>
          <div class="pe-count" id="pe-count"></div>
          <div class="pe-desc" id="pe-desc"></div>
          <button class="pe-done-btn" id="pe-done">✅ I Did It!</button>
          <div class="pe-feedback" id="pe-feedback"></div>
        </div>
      </div>
    </div>`

  document.getElementById('pe-back')!.addEventListener('click', () => {
    if (timer) clearInterval(timer)
    goBack()
  })
  document.getElementById('pe-done')!.addEventListener('click', handleDone)

  renderExercise()
}
