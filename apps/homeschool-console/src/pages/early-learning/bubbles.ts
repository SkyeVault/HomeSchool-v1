import { goBack, getApp } from '../../nav'

const BUBBLE_COLORS = [
  '#FF6B6B','#FF922B','#FFD43B','#51CF66',
  '#339AF0','#845EF7','#F783AC','#20C997',
]

interface Bubble {
  id: number
  x: number
  y: number
  r: number
  color: string
  speed: number
  wobble: number
  wobbleOffset: number
  el: HTMLDivElement
  popped: boolean
}

let frameId = 0
let bubbles: Bubble[] = []
let nextId = 0
let score = 0
let active = false

export function renderBubbles() {
  active = true
  bubbles = []
  score = 0
  nextId = 0

  getApp().innerHTML = `
    <div class="bubbles-page" id="bubbles-page">
      <header class="el-hub-header" style="position:relative;z-index:10;">
        <button class="back-btn" id="bubbles-back">← Back</button>
        <div class="el-hub-title">🫧 Bubble Pop! 🫧</div>
        <div class="bubble-score">Popped: <span id="bubble-score-val">0</span></div>
      </header>
      <div class="bubbles-field" id="bubbles-field"></div>
    </div>`

  document.getElementById('bubbles-back')!.addEventListener('click', () => {
    active = false
    cancelAnimationFrame(frameId)
    bubbles = []
    goBack()
  })

  const field = document.getElementById('bubbles-field')!
  const scoreEl = document.getElementById('bubble-score-val')!

  function spawnBubble() {
    const r = 30 + Math.random() * 40
    const x = r + Math.random() * (field.clientWidth - r * 2)
    const color = BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)]
    const el = document.createElement('div')
    el.className = 'bubble'
    el.style.cssText = `width:${r * 2}px;height:${r * 2}px;left:${x - r}px;top:${field.clientHeight + r * 2}px;border-color:${color};background:${color}22;`

    const bubble: Bubble = {
      id: nextId++, x, y: field.clientHeight + r * 2,
      r, color, speed: 0.6 + Math.random() * 0.9,
      wobble: Math.random() * Math.PI * 2,
      wobbleOffset: Math.random() * 2 - 1,
      el, popped: false,
    }

    el.addEventListener('click', () => {
      if (bubble.popped) return
      bubble.popped = true
      el.classList.add('bubble--pop')
      score++
      scoreEl.textContent = String(score)
      el.addEventListener('animationend', () => el.remove(), { once: true })
    })

    field.appendChild(el)
    bubbles.push(bubble)
  }

  let lastSpawn = 0
  let spawnInterval = 1200

  function loop(ts: number) {
    if (!active) return

    // Spawn new bubbles
    if (ts - lastSpawn > spawnInterval) {
      spawnBubble()
      lastSpawn = ts
      spawnInterval = Math.max(400, spawnInterval - 5)
    }

    // Move bubbles upward
    bubbles = bubbles.filter(b => {
      if (b.popped) return false
      b.y -= b.speed
      b.wobble += 0.025
      b.x += Math.sin(b.wobble) * b.wobbleOffset * 0.6
      b.el.style.top  = `${b.y - b.r}px`
      b.el.style.left = `${b.x - b.r}px`
      if (b.y < -b.r * 2) {
        b.el.remove()
        return false
      }
      return true
    })

    frameId = requestAnimationFrame(loop)
  }

  frameId = requestAnimationFrame(loop)
}
