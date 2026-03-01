import { goBack, getApp } from '../../nav'
import { speakWord } from './typing'

const ITEMS = ['🍎','🌟','🐸','🎈','🦋','🍦','🚂','🌸','🐥','🍭']
const MAX   = 10

export function renderCounting() {
  getApp().innerHTML = `
    <div class="page counting-page">
      <header class="el-hub-header">
        <button class="back-btn" id="count-back">← Back</button>
        <div class="el-hub-title">🔢 Count Along! 🔢</div>
        <div class="el-hub-sub">Tap to add, then count together!</div>
      </header>
      <div class="counting-area">
        <div class="counting-objects" id="counting-objects"></div>
        <div class="counting-controls">
          <button class="count-btn count-btn--add"    id="count-add">+ Add One</button>
          <div    class="count-number" id="count-number">0</div>
          <button class="count-btn count-btn--clear"  id="count-clear">Clear</button>
        </div>
        <div class="counting-row" id="counting-row"></div>
      </div>
    </div>`

  document.getElementById('count-back')!.addEventListener('click', goBack)

  const objContainer  = document.getElementById('counting-objects')!
  const numberDisplay = document.getElementById('count-number')!
  const countRow      = document.getElementById('counting-row')!
  let count = 0

  function updateRow() {
    countRow.innerHTML = Array.from({ length: count }, (_, i) => {
      const colors = ['#FF6B6B','#FF922B','#FFD43B','#51CF66','#339AF0','#845EF7','#F783AC','#20C997']
      return `<span style="color:${colors[i % colors.length]}">${i + 1}</span>`
    }).join('')
  }

  document.getElementById('count-add')!.addEventListener('click', () => {
    if (count >= MAX) return
    count++
    const emoji = ITEMS[(count - 1) % ITEMS.length]
    const el = document.createElement('span')
    el.className = 'counting-obj'
    el.textContent = emoji
    el.style.setProperty('--delay', `${Math.random() * 0.15}s`)
    objContainer.appendChild(el)
    numberDisplay.textContent = String(count)
    numberDisplay.classList.add('count-number--pop')
    numberDisplay.addEventListener('animationend', () => numberDisplay.classList.remove('count-number--pop'), { once: true })
    updateRow()
    speakWord(String(count))
  })

  document.getElementById('count-clear')!.addEventListener('click', () => {
    count = 0
    objContainer.innerHTML = ''
    numberDisplay.textContent = '0'
    countRow.innerHTML = ''
    speakWord('zero')
  })
}
