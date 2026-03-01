import { goBack, getApp } from '../../nav'
import { speakWord } from './typing'

const COLORS = [
  { name: 'Red',    hex: '#FF4444' },
  { name: 'Orange', hex: '#FF8C00' },
  { name: 'Yellow', hex: '#FFD700' },
  { name: 'Green',  hex: '#44BB44' },
  { name: 'Blue',   hex: '#4488FF' },
  { name: 'Purple', hex: '#9944CC' },
  { name: 'Pink',   hex: '#FF69B4' },
  { name: 'Teal',   hex: '#00BFAE' },
]

let activeColor = COLORS[0]

export function renderColors() {
  const swatches = COLORS.map((c, i) => `
    <button id="cswatch-${i}"
      style="width:44px;height:44px;border-radius:50%;background:${c.hex};
             border:4px solid transparent;cursor:pointer;
             box-shadow:0 2px 6px rgba(0,0,0,0.25);flex-shrink:0;"
      title="${c.name}"></button>`
  ).join('')

  getApp().innerHTML = `
    <div id="colors-ui"
      style="position:fixed;top:0;left:0;right:0;height:64px;z-index:10;
             display:flex;align-items:center;gap:10px;padding:0 16px;
             background:rgba(255,255,255,0.94);backdrop-filter:blur(6px);
             border-bottom:3px solid #e0e0f0;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
      <button id="colors-back" class="back-btn">← Back</button>
      ${swatches}
      <div id="color-label"
        style="font-size:18px;font-weight:900;letter-spacing:1px;
               color:${COLORS[0].hex};margin-left:4px;white-space:nowrap;">${COLORS[0].name}</div>
    </div>
    <div id="paint-field"
      style="position:fixed;top:64px;left:0;right:0;bottom:0;z-index:1;
             background:#fff;cursor:crosshair;overflow:hidden;"></div>`

  const field = document.getElementById('paint-field')!
  const label = document.getElementById('color-label')!

  // Debug bar
  const dbg = document.createElement('div')
  dbg.style.cssText = 'position:fixed;bottom:8px;left:8px;z-index:99;background:#000;color:#0f0;font-size:13px;padding:4px 8px;border-radius:6px;font-family:monospace;pointer-events:none;'
  dbg.textContent = 'tap to paint'
  document.body.appendChild(dbg)

  // Swatches
  COLORS.forEach((c, i) => {
    document.getElementById(`cswatch-${i}`)!.addEventListener('click', () => {
      activeColor = c
      label.textContent = c.name
      label.style.color = c.hex
      COLORS.forEach((_, j) => {
        const s = document.getElementById(`cswatch-${j}`) as HTMLButtonElement
        s.style.border = j === i ? '4px solid #333' : '4px solid transparent'
      })
      speakWord(c.name)
    })
  })
  ;(document.getElementById('cswatch-0') as HTMLButtonElement).style.border = '4px solid #333'

  document.getElementById('colors-back')!.addEventListener('click', () => {
    dbg.remove()
    goBack()
  })

  // Paint using DOM dots — bypasses canvas compositor issues
  let painting = false
  let dotCount = 0

  function spawnDot(clientX: number, clientY: number) {
    const dot = document.createElement('div')
    dot.style.cssText = `
      position:absolute;
      left:${clientX - 28}px;
      top:${clientY - 64 - 28}px;
      width:56px;height:56px;
      border-radius:50%;
      background:${activeColor.hex};
      pointer-events:none;
    `
    field.appendChild(dot)
    dotCount++
    dbg.textContent = `dot #${dotCount} @ ${Math.round(clientX)},${Math.round(clientY)} ${activeColor.hex}`
  }

  function getXY(e: MouseEvent | TouchEvent) {
    if (e instanceof TouchEvent) return { x: e.touches[0].clientX, y: e.touches[0].clientY }
    return { x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY }
  }

  field.addEventListener('mousedown',  e => { painting = true; const {x,y} = getXY(e); spawnDot(x,y) })
  field.addEventListener('mousemove',  e => { if (painting) { const {x,y} = getXY(e); spawnDot(x,y) } })
  field.addEventListener('mouseup',    () => { painting = false })
  field.addEventListener('mouseleave', () => { painting = false })
  field.addEventListener('touchstart', e => { e.preventDefault(); painting = true; const {x,y} = getXY(e); spawnDot(x,y) }, { passive: false })
  field.addEventListener('touchmove',  e => { e.preventDefault(); if (painting) { const {x,y} = getXY(e); spawnDot(x,y) } }, { passive: false })
  field.addEventListener('touchend',   () => { painting = false })
}
