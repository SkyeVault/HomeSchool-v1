import { goBack, getApp } from '../nav'

interface StateInfo {
  abbr: string
  name: string
  capital: string
  col: number
  row: number
}

// Grid tile map: 12 columns (0–11), 8 rows (0–7)
const STATES: StateInfo[] = [
  // Row 0
  { abbr: 'ME', name: 'Maine',          capital: 'Augusta',        col: 11, row: 0 },
  // Row 1
  { abbr: 'WA', name: 'Washington',     capital: 'Olympia',        col: 0,  row: 1 },
  { abbr: 'MT', name: 'Montana',        capital: 'Helena',         col: 1,  row: 1 },
  { abbr: 'ND', name: 'North Dakota',   capital: 'Bismarck',       col: 2,  row: 1 },
  { abbr: 'MN', name: 'Minnesota',      capital: 'Saint Paul',     col: 3,  row: 1 },
  { abbr: 'VT', name: 'Vermont',        capital: 'Montpelier',     col: 9,  row: 1 },
  { abbr: 'NH', name: 'New Hampshire',  capital: 'Concord',        col: 10, row: 1 },
  // Row 2
  { abbr: 'OR', name: 'Oregon',         capital: 'Salem',          col: 0,  row: 2 },
  { abbr: 'ID', name: 'Idaho',          capital: 'Boise',          col: 1,  row: 2 },
  { abbr: 'WY', name: 'Wyoming',        capital: 'Cheyenne',       col: 2,  row: 2 },
  { abbr: 'SD', name: 'South Dakota',   capital: 'Pierre',         col: 3,  row: 2 },
  { abbr: 'WI', name: 'Wisconsin',      capital: 'Madison',        col: 4,  row: 2 },
  { abbr: 'MI', name: 'Michigan',       capital: 'Lansing',        col: 5,  row: 2 },
  { abbr: 'NY', name: 'New York',       capital: 'Albany',         col: 8,  row: 2 },
  { abbr: 'MA', name: 'Massachusetts',  capital: 'Boston',         col: 9,  row: 2 },
  { abbr: 'CT', name: 'Connecticut',    capital: 'Hartford',       col: 10, row: 2 },
  { abbr: 'RI', name: 'Rhode Island',   capital: 'Providence',     col: 11, row: 2 },
  // Row 3
  { abbr: 'CA', name: 'California',     capital: 'Sacramento',     col: 0,  row: 3 },
  { abbr: 'NV', name: 'Nevada',         capital: 'Carson City',    col: 1,  row: 3 },
  { abbr: 'UT', name: 'Utah',           capital: 'Salt Lake City', col: 2,  row: 3 },
  { abbr: 'CO', name: 'Colorado',       capital: 'Denver',         col: 3,  row: 3 },
  { abbr: 'NE', name: 'Nebraska',       capital: 'Lincoln',        col: 4,  row: 3 },
  { abbr: 'IA', name: 'Iowa',           capital: 'Des Moines',     col: 5,  row: 3 },
  { abbr: 'IL', name: 'Illinois',       capital: 'Springfield',    col: 6,  row: 3 },
  { abbr: 'IN', name: 'Indiana',        capital: 'Indianapolis',   col: 7,  row: 3 },
  { abbr: 'OH', name: 'Ohio',           capital: 'Columbus',       col: 8,  row: 3 },
  { abbr: 'PA', name: 'Pennsylvania',   capital: 'Harrisburg',     col: 9,  row: 3 },
  { abbr: 'NJ', name: 'New Jersey',     capital: 'Trenton',        col: 10, row: 3 },
  // Row 4
  { abbr: 'AZ', name: 'Arizona',        capital: 'Phoenix',        col: 1,  row: 4 },
  { abbr: 'NM', name: 'New Mexico',     capital: 'Santa Fe',       col: 2,  row: 4 },
  { abbr: 'KS', name: 'Kansas',         capital: 'Topeka',         col: 3,  row: 4 },
  { abbr: 'MO', name: 'Missouri',       capital: 'Jefferson City', col: 4,  row: 4 },
  { abbr: 'KY', name: 'Kentucky',       capital: 'Frankfort',      col: 5,  row: 4 },
  { abbr: 'WV', name: 'West Virginia',  capital: 'Charleston',     col: 6,  row: 4 },
  { abbr: 'VA', name: 'Virginia',       capital: 'Richmond',       col: 7,  row: 4 },
  { abbr: 'MD', name: 'Maryland',       capital: 'Annapolis',      col: 8,  row: 4 },
  { abbr: 'DC', name: 'Washington D.C.',capital: 'Washington',     col: 9,  row: 4 },
  { abbr: 'DE', name: 'Delaware',       capital: 'Dover',          col: 10, row: 4 },
  // Row 5
  { abbr: 'TX', name: 'Texas',          capital: 'Austin',         col: 2,  row: 5 },
  { abbr: 'OK', name: 'Oklahoma',       capital: 'Oklahoma City',  col: 3,  row: 5 },
  { abbr: 'AR', name: 'Arkansas',       capital: 'Little Rock',    col: 4,  row: 5 },
  { abbr: 'TN', name: 'Tennessee',      capital: 'Nashville',      col: 5,  row: 5 },
  { abbr: 'NC', name: 'North Carolina', capital: 'Raleigh',        col: 6,  row: 5 },
  { abbr: 'SC', name: 'South Carolina', capital: 'Columbia',       col: 7,  row: 5 },
  { abbr: 'GA', name: 'Georgia',        capital: 'Atlanta',        col: 8,  row: 5 },
  // Row 6
  { abbr: 'LA', name: 'Louisiana',      capital: 'Baton Rouge',    col: 3,  row: 6 },
  { abbr: 'MS', name: 'Mississippi',    capital: 'Jackson',        col: 4,  row: 6 },
  { abbr: 'AL', name: 'Alabama',        capital: 'Montgomery',     col: 5,  row: 6 },
  { abbr: 'FL', name: 'Florida',        capital: 'Tallahassee',    col: 6,  row: 6 },
  // Row 7
  { abbr: 'AK', name: 'Alaska',         capital: 'Juneau',         col: 0,  row: 7 },
  { abbr: 'HI', name: 'Hawaii',         capital: 'Honolulu',       col: 2,  row: 7 },
]

// Region colors for a nice looking map
const REGION_COLORS: Record<string, string> = {
  WA: '#4CAF50', OR: '#4CAF50', CA: '#4CAF50', NV: '#4CAF50', AZ: '#FF9800', NM: '#FF9800',
  MT: '#2196F3', ID: '#2196F3', WY: '#2196F3', UT: '#2196F3', CO: '#2196F3',
  ND: '#9C27B0', SD: '#9C27B0', NE: '#9C27B0', KS: '#9C27B0', MO: '#9C27B0', OK: '#9C27B0', TX: '#9C27B0',
  MN: '#00BCD4', IA: '#00BCD4', WI: '#00BCD4', MI: '#00BCD4', IL: '#00BCD4', IN: '#00BCD4', OH: '#00BCD4',
  AR: '#F44336', LA: '#F44336', MS: '#F44336', AL: '#F44336', TN: '#F44336',
  GA: '#F44336', FL: '#F44336', SC: '#F44336', NC: '#F44336',
  VA: '#E91E63', WV: '#E91E63', KY: '#E91E63', MD: '#E91E63', DE: '#E91E63', DC: '#E91E63',
  PA: '#607D8B', NJ: '#607D8B', NY: '#607D8B', CT: '#607D8B', RI: '#607D8B',
  MA: '#607D8B', VT: '#607D8B', NH: '#607D8B', ME: '#607D8B',
  AK: '#795548', HI: '#795548',
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

let target: StateInfo
let score = 0
let locked = false

function pickTarget(): StateInfo {
  return STATES[Math.floor(Math.random() * STATES.length)]
}

function makeChoices(correct: StateInfo): StateInfo[] {
  const pool = STATES.filter(s => s.abbr !== correct.abbr)
  const wrong = shuffle(pool).slice(0, 3)
  return shuffle([correct, ...wrong])
}

function renderMap(highlightAbbr: string): string {
  const grid: string[][] = Array.from({ length: 8 }, () => Array(12).fill(''))
  for (const s of STATES) {
    grid[s.row][s.col] = s.abbr
  }
  return `
    <div class="geo-grid">
      ${STATES.map(s => {
        const isTarget = s.abbr === highlightAbbr
        const baseColor = REGION_COLORS[s.abbr] ?? '#888'
        return `<div class="geo-tile ${isTarget ? 'geo-tile--target' : ''}"
          style="grid-column:${s.col + 1};grid-row:${s.row + 1};background:${isTarget ? '#FFD700' : baseColor}"
          title="${s.name}">${s.abbr}</div>`
      }).join('')}
    </div>`
}

function renderChoices() {
  const choices = makeChoices(target)
  const el = document.getElementById('geo-choices')
  if (!el) return
  el.innerHTML = choices.map(s =>
    `<button class="geo-choice" data-abbr="${s.abbr}">${s.name}</button>`
  ).join('')
  el.querySelectorAll<HTMLButtonElement>('.geo-choice').forEach(btn => {
    btn.addEventListener('click', () => handleAnswer(btn.dataset.abbr!, btn))
  })
}

function handleAnswer(abbr: string, btn: HTMLButtonElement) {
  if (locked) return
  locked = true
  document.querySelectorAll<HTMLButtonElement>('.geo-choice').forEach(b => b.disabled = true)

  const fb = document.getElementById('geo-feedback')!
  if (abbr === target.abbr) {
    score++
    document.getElementById('geo-score')!.textContent = String(score)
    btn.classList.add('geo-choice--correct')
    fb.innerHTML = `✨ Yes! That's <strong>${target.name}</strong>! Capital: ${target.capital} 🏛️`
    fb.className = 'geo-feedback geo-feedback--good'
  } else {
    btn.classList.add('geo-choice--wrong')
    document.querySelectorAll<HTMLButtonElement>('.geo-choice').forEach(b => {
      if (b.dataset.abbr === target.abbr) b.classList.add('geo-choice--correct')
    })
    fb.innerHTML = `That's <strong>${target.name}</strong>! Capital: ${target.capital} 🏛️`
    fb.className = 'geo-feedback geo-feedback--try'
  }

  setTimeout(() => nextRound(), 2200)
}

function nextRound() {
  locked = false
  target = pickTarget()
  const mapEl = document.getElementById('geo-map')
  if (mapEl) mapEl.innerHTML = renderMap(target.abbr)

  const labelEl = document.getElementById('geo-label')
  if (labelEl) labelEl.textContent = `Which state is highlighted in gold? 🗺️`

  renderChoices()

  const fb = document.getElementById('geo-feedback')
  if (fb) { fb.textContent = ''; fb.className = 'geo-feedback' }
}

export function renderGeography() {
  target = pickTarget()
  score = 0
  locked = false

  getApp().innerHTML = `
    <div class="page geo-page">
      <header class="geo-header">
        <button class="back-btn" id="geo-back">← Back</button>
        <div class="geo-title">🌍 US Map Explorer</div>
        <div class="geo-score-badge">⭐ <span id="geo-score">0</span></div>
      </header>
      <div class="geo-map-wrap" id="geo-map">${renderMap(target.abbr)}</div>
      <div class="geo-bottom">
        <div class="geo-label" id="geo-label">Which state is highlighted in gold? 🗺️</div>
        <div class="geo-choices" id="geo-choices"></div>
        <div class="geo-feedback" id="geo-feedback"></div>
      </div>
    </div>`

  document.getElementById('geo-back')!.addEventListener('click', goBack)
  renderChoices()
}
