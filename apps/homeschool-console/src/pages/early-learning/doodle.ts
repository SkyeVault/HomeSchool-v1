import { goBack, getApp } from '../../nav'

const PALETTE = [
  '#FF4444','#FF8C00','#FFD700','#44BB44',
  '#4488FF','#9944CC','#FF69B4','#000000',
  '#FFFFFF','#00BFAE',
]
const SIZES = [8, 16, 28, 44]
const BAR_H = 60
const TOOL_H = 64
const UI_H   = BAR_H + TOOL_H   // 124px total top UI

export function renderDoodle() {
  const swatches = PALETTE.map((c, i) => `
    <button id="dswatch-${i}"
      style="width:38px;height:38px;border-radius:50%;background:${c};
             border:4px solid transparent;cursor:pointer;
             box-shadow:0 2px 5px rgba(0,0,0,0.2);flex-shrink:0;"
      data-color="${c}"></button>`
  ).join('')

  const sizeBtns = SIZES.map((s, i) => `
    <button id="dsize-${i}"
      style="border-radius:50%;border:3px solid #c0c0d0;background:#fff;
             width:${s + 16}px;height:${s + 16}px;cursor:pointer;
             display:flex;align-items:center;justify-content:center;
             font-size:${s}px;color:#555;flex-shrink:0;"
      data-size="${s}">●</button>`
  ).join('')

  getApp().innerHTML = `
    <div id="doodle-topbar"
      style="position:fixed;top:0;left:0;right:0;height:${BAR_H}px;z-index:10;
             display:flex;align-items:center;gap:12px;padding:0 16px;
             background:#fff;border-bottom:3px solid #e0e0e8;
             box-shadow:0 2px 6px rgba(0,0,0,0.06);">
      <button id="doodle-back" class="back-btn">← Back</button>
      <div style="flex:1;text-align:center;font-size:20px;font-weight:900;color:#4a3580;">✏️ Doodle Pad</div>
      <button id="doodle-clear" class="count-btn count-btn--clear">Clear</button>
    </div>
    <div id="doodle-toolbar"
      style="position:fixed;top:${BAR_H}px;left:0;right:0;height:${TOOL_H}px;z-index:10;
             display:flex;align-items:center;gap:10px;padding:0 16px;
             background:#fafafa;border-bottom:3px solid #e0e0e8;">
      ${swatches}
      <div style="width:2px;height:40px;background:#e0e0e0;flex-shrink:0;"></div>
      ${sizeBtns}
    </div>
    <canvas id="doodle-canvas"
      style="position:fixed;top:${UI_H}px;left:0;cursor:crosshair;z-index:1;display:block;"></canvas>`

  const canvas = document.getElementById('doodle-canvas') as HTMLCanvasElement
  const ctx    = canvas.getContext('2d')!

  let initialized = false
  let drawing = false
  let lastX = 0, lastY = 0

  function resize() {
    const snap = initialized ? ctx.getImageData(0, 0, canvas.width, canvas.height) : null
    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight - UI_H
    canvas.style.width  = window.innerWidth  + 'px'
    canvas.style.height = (window.innerHeight - UI_H) + 'px'
    ctx.fillStyle = '#FAFAFA'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    if (snap) ctx.putImageData(snap, 0, 0)
    initialized = true
  }
  resize()
  window.addEventListener('resize', resize)

  // Toolbar state
  let color = '#FF4444'
  let size  = 16

  function setActiveSwatch(idx: number) {
    PALETTE.forEach((_, i) => {
      const s = document.getElementById(`dswatch-${i}`) as HTMLButtonElement
      if (s) s.style.border = i === idx ? '4px solid #333' : '4px solid transparent'
    })
  }
  function setActiveSize(idx: number) {
    SIZES.forEach((_, i) => {
      const s = document.getElementById(`dsize-${i}`) as HTMLButtonElement
      if (s) s.style.borderColor = i === idx ? '#4C6EF5' : '#c0c0d0'
    })
  }
  setActiveSwatch(0)
  setActiveSize(1)

  PALETTE.forEach((c, i) => {
    document.getElementById(`dswatch-${i}`)!.addEventListener('click', () => { color = c; setActiveSwatch(i) })
  })
  SIZES.forEach((s, i) => {
    document.getElementById(`dsize-${i}`)!.addEventListener('click', () => { size = s; setActiveSize(i) })
  })

  document.getElementById('doodle-back')!.addEventListener('click', () => {
    window.removeEventListener('resize', resize)
    goBack()
  })
  document.getElementById('doodle-clear')!.addEventListener('click', () => {
    ctx.fillStyle = '#FAFAFA'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  })

  // Draw directly on canvas — canvas is top element in the paint area (below toolbars)
  function getPos(e: MouseEvent | TouchEvent) {
    const cx = e instanceof TouchEvent ? e.touches[0].clientX : (e as MouseEvent).clientX
    const cy = e instanceof TouchEvent ? e.touches[0].clientY : (e as MouseEvent).clientY
    return { x: cx, y: cy - UI_H }
  }

  function startDraw(e: MouseEvent | TouchEvent) {
    drawing = true
    const p = getPos(e)
    lastX = p.x; lastY = p.y
    ctx.beginPath()
    ctx.arc(lastX, lastY, size / 2, 0, Math.PI * 2)
    ctx.fillStyle = color
    ctx.fill()
  }

  function draw(e: MouseEvent | TouchEvent) {
    if (!drawing) return
    const { x, y } = getPos(e)
    ctx.beginPath()
    ctx.moveTo(lastX, lastY)
    ctx.lineTo(x, y)
    ctx.strokeStyle = color
    ctx.lineWidth   = size
    ctx.lineCap     = 'round'
    ctx.lineJoin    = 'round'
    ctx.stroke()
    lastX = x; lastY = y
  }

  canvas.addEventListener('mousedown',  e => startDraw(e))
  canvas.addEventListener('mousemove',  e => draw(e))
  canvas.addEventListener('mouseup',    () => { drawing = false })
  canvas.addEventListener('mouseleave', () => { drawing = false })
  canvas.addEventListener('touchstart', e => { e.preventDefault(); startDraw(e) }, { passive: false })
  canvas.addEventListener('touchmove',  e => { e.preventDefault(); draw(e) },      { passive: false })
  canvas.addEventListener('touchend',   () => { drawing = false })
}
