import { goBack, getApp } from '../nav'

interface ColorDef {
  name: string
  hex: string
  emoji: string
}

const COLORS: ColorDef[] = [
  { name: 'Red',    hex: '#E03131', emoji: '🔴' },
  { name: 'Yellow', hex: '#FAB005', emoji: '🟡' },
  { name: 'Blue',   hex: '#1C7ED6', emoji: '🔵' },
  { name: 'Orange', hex: '#E67700', emoji: '🟠' },
  { name: 'Green',  hex: '#2F9E44', emoji: '🟢' },
  { name: 'Purple', hex: '#7950F2', emoji: '🟣' },
  { name: 'White',  hex: '#F8F9FA', emoji: '⚪' },
  { name: 'Black',  hex: '#212529', emoji: '⚫' },
  { name: 'Pink',   hex: '#F06595', emoji: '🩷' },
  { name: 'Brown',  hex: '#8B5E3C', emoji: '🟤' },
]

// Mix lookup: "ColorA+ColorB" → result name (order-independent)
const MIX: Record<string, string> = {
  'Red+Yellow':    'Orange',
  'Yellow+Blue':   'Green',
  'Red+Blue':      'Purple',
  'Red+White':     'Pink',
  'Red+Black':     'Dark Red',
  'Blue+White':    'Light Blue',
  'Yellow+White':  'Light Yellow',
  'Orange+Blue':   'Brown',
  'Purple+Yellow': 'Brown',
  'Black+White':   'Gray',
  'Red+Green':     'Brown',
}

function getMix(a: ColorDef, b: ColorDef): { name: string; hex: string } | null {
  const key1 = `${a.name}+${b.name}`
  const key2 = `${b.name}+${a.name}`
  const result = MIX[key1] ?? MIX[key2]
  if (!result) return null
  const found = COLORS.find(c => c.name === result)
  if (found) return { name: found.name, hex: found.hex }
  // Special cases not in COLORS list
  if (result === 'Dark Red') return { name: 'Dark Red', hex: '#8B0000' }
  if (result === 'Light Blue') return { name: 'Light Blue', hex: '#74C0FC' }
  if (result === 'Light Yellow') return { name: 'Light Yellow', hex: '#FFF3BF' }
  if (result === 'Gray') return { name: 'Gray', hex: '#868E96' }
  return null
}

let selected: ColorDef[] = []

function renderPalette() {
  const paletteEl = document.getElementById('art-palette')
  if (!paletteEl) return

  paletteEl.innerHTML = COLORS.map(c =>
    `<button class="art-color-btn ${selected.includes(c) ? 'art-color-btn--selected' : ''}"
      data-name="${c.name}"
      style="background:${c.hex};${c.name === 'White' ? 'border:2px solid #ccc;' : ''}">
      <span class="art-color-label">${c.name}</span>
    </button>`
  ).join('')

  paletteEl.querySelectorAll<HTMLButtonElement>('.art-color-btn').forEach(btn => {
    btn.addEventListener('click', () => handleColorClick(btn.dataset.name!))
  })
}

function handleColorClick(name: string) {
  const color = COLORS.find(c => c.name === name)!

  if (selected.includes(color)) {
    selected = selected.filter(c => c !== color)
    renderPalette()
    updateMixDisplay()
    return
  }

  if (selected.length >= 2) {
    selected = [color]
    renderPalette()
    updateMixDisplay()
    return
  }

  selected.push(color)
  renderPalette()
  updateMixDisplay()
}

function updateMixDisplay() {
  const bucketA = document.getElementById('art-bucket-a')!
  const bucketB = document.getElementById('art-bucket-b')!
  const resultEl = document.getElementById('art-result')!
  const plusEl   = document.getElementById('art-plus')!
  const equalsEl = document.getElementById('art-equals')!
  const hintEl   = document.getElementById('art-hint')!

  if (selected.length === 0) {
    bucketA.style.background = '#E9ECEF'
    bucketA.textContent = '?'
    bucketB.style.background = '#E9ECEF'
    bucketB.textContent = '?'
    resultEl.style.background = '#E9ECEF'
    resultEl.textContent = '?'
    plusEl.style.opacity = '0.3'
    equalsEl.style.opacity = '0.3'
    hintEl.textContent = 'Pick two colors to mix!'
    return
  }

  if (selected.length === 1) {
    bucketA.style.background = selected[0].hex
    bucketA.textContent = selected[0].emoji
    bucketB.style.background = '#E9ECEF'
    bucketB.textContent = '?'
    resultEl.style.background = '#E9ECEF'
    resultEl.textContent = '?'
    plusEl.style.opacity = '1'
    equalsEl.style.opacity = '0.3'
    hintEl.textContent = `${selected[0].name} + ... what?`
    return
  }

  // Two selected — show mix
  bucketA.style.background = selected[0].hex
  bucketA.textContent = selected[0].emoji
  bucketB.style.background = selected[1].hex
  bucketB.textContent = selected[1].emoji
  plusEl.style.opacity = '1'
  equalsEl.style.opacity = '1'

  if (selected[0] === selected[1]) {
    resultEl.style.background = selected[0].hex
    resultEl.textContent = selected[0].emoji
    hintEl.textContent = `${selected[0].name} + ${selected[1].name} = still ${selected[0].name}! 🎨`
  } else {
    const mix = getMix(selected[0], selected[1])
    if (mix) {
      resultEl.style.background = mix.hex
      resultEl.textContent = '🎨'
      hintEl.textContent = `${selected[0].name} + ${selected[1].name} = ${mix.name}! ✨`
    } else {
      resultEl.style.background = '#8B5E3C'
      resultEl.textContent = '🟤'
      hintEl.textContent = `${selected[0].name} + ${selected[1].name} = a muddy mix! 🟤`
    }
  }
}

export function renderArt() {
  selected = []

  getApp().innerHTML = `
    <div class="page art-page">
      <header class="art-header">
        <button class="back-btn" id="art-back">← Back</button>
        <div class="art-title">🎨 Color Mixer</div>
      </header>
      <div class="art-body">
        <div class="art-mixer">
          <div class="art-bucket-wrap">
            <div class="art-bucket" id="art-bucket-a">?</div>
          </div>
          <div class="art-plus" id="art-plus">+</div>
          <div class="art-bucket-wrap">
            <div class="art-bucket" id="art-bucket-b">?</div>
          </div>
          <div class="art-equals" id="art-equals">=</div>
          <div class="art-bucket-wrap">
            <div class="art-bucket art-bucket--result" id="art-result">?</div>
          </div>
        </div>
        <div class="art-hint" id="art-hint">Pick two colors to mix!</div>
        <div class="art-palette" id="art-palette"></div>
      </div>
    </div>`

  document.getElementById('art-back')!.addEventListener('click', goBack)
  renderPalette()
  updateMixDisplay()
}
