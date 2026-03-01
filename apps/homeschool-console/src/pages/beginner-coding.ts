import { goBack, getApp } from '../nav'

interface FileNode {
  name: string
  emoji: string
  path: string
}

interface FolderNode {
  name: string
  emoji: string
  files: FileNode[]
}

const TREE: FolderNode[] = [
  {
    name: 'pets', emoji: '🐾',
    files: [
      { name: 'cat.txt',    emoji: '🐱', path: 'home/pets/cat.txt'    },
      { name: 'dog.txt',    emoji: '🐶', path: 'home/pets/dog.txt'    },
      { name: 'fish.txt',   emoji: '🐟', path: 'home/pets/fish.txt'   },
      { name: 'rabbit.txt', emoji: '🐰', path: 'home/pets/rabbit.txt' },
    ],
  },
  {
    name: 'colors', emoji: '🎨',
    files: [
      { name: 'red.txt',    emoji: '🔴', path: 'home/colors/red.txt'    },
      { name: 'blue.txt',   emoji: '🔵', path: 'home/colors/blue.txt'   },
      { name: 'yellow.txt', emoji: '🟡', path: 'home/colors/yellow.txt' },
      { name: 'green.txt',  emoji: '🟢', path: 'home/colors/green.txt'  },
    ],
  },
  {
    name: 'games', emoji: '🎮',
    files: [
      { name: 'blocks.txt', emoji: '🧱', path: 'home/games/blocks.txt' },
      { name: 'ball.txt',   emoji: '⚽', path: 'home/games/ball.txt'   },
      { name: 'jump.txt',   emoji: '🦘', path: 'home/games/jump.txt'   },
      { name: 'cards.txt',  emoji: '🃏', path: 'home/games/cards.txt'  },
    ],
  },
  {
    name: 'food', emoji: '🍕',
    files: [
      { name: 'pizza.txt',  emoji: '🍕', path: 'home/food/pizza.txt'  },
      { name: 'apple.txt',  emoji: '🍎', path: 'home/food/apple.txt'  },
      { name: 'cake.txt',   emoji: '🎂', path: 'home/food/cake.txt'   },
      { name: 'banana.txt', emoji: '🍌', path: 'home/food/banana.txt' },
    ],
  },
]

const ALL_FILES: FileNode[] = TREE.flatMap(f => f.files)

let openFolders = new Set<string>()
let currentChallenge: FileNode
let score = 0
let lines: string[] = []

function pickChallenge(): FileNode {
  return ALL_FILES[Math.floor(Math.random() * ALL_FILES.length)]
}

function renderTree(): string {
  return TREE.map(folder => {
    const isOpen = openFolders.has(folder.name)
    const filesHtml = isOpen
      ? folder.files.map(f => `
          <div class="bc-file ${currentChallenge?.name === f.name ? 'bc-file--target' : ''}"
               data-file="${f.name}">
            <span class="bc-file-icon">📄</span>
            <span>${f.emoji} ${f.name}</span>
          </div>`).join('')
      : ''

    return `
      <div class="bc-folder" data-folder="${folder.name}">
        <div class="bc-folder-row">
          <span class="bc-arrow">${isOpen ? '▼' : '▶'}</span>
          <span class="bc-folder-icon">${folder.emoji}</span>
          <span class="bc-folder-name">${folder.name}</span>
        </div>
        <div class="bc-folder-files">${filesHtml}</div>
      </div>`
  }).join('')
}

function renderLines(): string {
  return lines.map(l => `<div class="bc-line">${l}</div>`).join('')
}

function renderChallenge(): string {
  const folder = TREE.find(f => f.files.some(fi => fi.path === currentChallenge.path))
  return `
    <div class="bc-find-label">🔍 Where is this file hiding?</div>
    <div class="bc-find-file">${currentChallenge.emoji} ${currentChallenge.name}</div>
    <div class="bc-path-template">
      <span class="bc-path-seg bc-path-seg--fixed">home</span>
      <span class="bc-path-slash">/</span>
      <span class="bc-path-seg bc-path-seg--blank">${openFolders.has(folder?.name ?? '') ? folder!.name : '?'}</span>
      <span class="bc-path-slash">/</span>
      <span class="bc-path-seg bc-path-seg--fixed">${currentChallenge.name}</span>
    </div>
    <div class="bc-find-hint">👈 Open the folders · then type the full address</div>`
}

function refreshAll() {
  const treeEl = document.getElementById('bc-tree')
  const linesEl = document.getElementById('bc-lines')
  const challengeEl = document.getElementById('bc-challenge')

  if (treeEl) treeEl.innerHTML = renderTree()
  if (linesEl) linesEl.innerHTML = renderLines()
  if (challengeEl) challengeEl.innerHTML = renderChallenge()

  // Scroll terminal to bottom
  const terminal = document.getElementById('bc-terminal')
  if (terminal) terminal.scrollTop = terminal.scrollHeight

  // Re-attach folder toggles
  document.querySelectorAll<HTMLDivElement>('.bc-folder-row').forEach(row => {
    row.addEventListener('click', () => {
      const folder = (row.closest('.bc-folder') as HTMLElement)?.dataset.folder ?? ''
      if (openFolders.has(folder)) {
        openFolders.delete(folder)
      } else {
        openFolders.add(folder)
      }
      refreshAll()
    })
  })
}

function showReward() {
  const overlay = document.getElementById('bc-reward')!
  const scoreEl = document.getElementById('bc-score')!

  score++
  scoreEl.textContent = String(score)
  overlay.classList.remove('hidden')
  overlay.classList.add('bc-reward--show')

  setTimeout(() => {
    overlay.classList.remove('bc-reward--show')
    overlay.classList.add('hidden')

    // New challenge
    currentChallenge = pickChallenge()
    lines.push(`<span class="bc-ok">✓ Correct! Great job! 🎉</span>`)
    lines.push(`<span class="bc-prompt-text">📂 home &gt;</span> _`)
    refreshAll()

    const input = document.getElementById('bc-input') as HTMLInputElement
    if (input) { input.value = ''; input.focus() }
  }, 2200)
}

function handleSubmit() {
  const input = document.getElementById('bc-input') as HTMLInputElement
  const typed = input.value.trim()
  if (!typed) return

  // Replace trailing _ placeholder in last line with the actual typed command
  if (lines.length > 0) lines[lines.length - 1] = `<span class="bc-prompt-text">📂 home &gt;</span> ${escHtml(typed)}`

  if (typed === currentChallenge.path) {
    lines.push(`<span class="bc-ok">Opening ${currentChallenge.emoji} ${currentChallenge.name}...</span>`)
    refreshAll()
    input.value = ''
    setTimeout(showReward, 500)
  } else {
    lines.push(`<span class="bc-err">❌ Hmm, not quite. Try again!</span>`)
    lines.push(`<span class="bc-prompt-text">📂 home &gt;</span> _`)
    refreshAll()
    input.value = ''
    input.focus()

    // Shake the input
    input.classList.add('bc-input--shake')
    input.addEventListener('animationend', () => input.classList.remove('bc-input--shake'), { once: true })
  }
}

function escHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function renderBeginnerCoding() {
  currentChallenge = pickChallenge()
  score = 0
  lines = [`<span class="bc-prompt-text">📂 home &gt;</span> _`]
  openFolders = new Set()

  getApp().innerHTML = `
    <div class="page bc-page">

      <!-- Header -->
      <header class="bc-header">
        <button class="back-btn bc-back" id="bc-back">← Back</button>
        <div class="bc-header-title">🐢 Beginner Coding</div>
        <div class="bc-score-badge">⭐ <span id="bc-score">0</span></div>
      </header>

      <!-- Challenge bar -->
      <div class="bc-challenge-bar" id="bc-challenge"></div>

      <!-- Main layout -->
      <div class="bc-layout">

        <!-- File tree -->
        <div class="bc-sidebar">
          <div class="bc-sidebar-title">📁 home</div>
          <div id="bc-tree"></div>
        </div>

        <!-- Terminal -->
        <div class="bc-terminal" id="bc-terminal">
          <div class="bc-terminal-topbar">
            <span class="bc-dot bc-dot--red"></span>
            <span class="bc-dot bc-dot--yellow"></span>
            <span class="bc-dot bc-dot--green"></span>
            <span class="bc-terminal-title">terminal</span>
          </div>
          <div class="bc-output" id="bc-lines"></div>
          <div class="bc-input-row">
            <input class="bc-input" id="bc-input"
                   placeholder="home/folder/file.txt"
                   autocomplete="off" spellcheck="false" />
            <button class="bc-submit" id="bc-submit">Enter ↵</button>
          </div>
        </div>

      </div>

      <!-- Reward overlay -->
      <div class="bc-reward hidden" id="bc-reward">
        <div class="bc-reward-box">
          <div class="bc-reward-stars">⭐🌟✨💫⭐</div>
          <div class="bc-reward-msg">Amazing!</div>
          <div class="bc-reward-sub">You found the file! 🎉</div>
        </div>
      </div>

    </div>`

  document.getElementById('bc-back')!.addEventListener('click', goBack)

  const input = document.getElementById('bc-input') as HTMLInputElement
  const submitBtn = document.getElementById('bc-submit')!

  submitBtn.addEventListener('click', handleSubmit)
  input.addEventListener('keydown', e => { if (e.key === 'Enter') handleSubmit() })

  // Update input placeholder live to show typing in terminal
  input.addEventListener('input', () => {
    if (lines.length > 0) {
      lines[lines.length - 1] =
        `<span class="bc-prompt-text">📂 home &gt;</span> ${escHtml(input.value) || '_'}`
      const linesEl = document.getElementById('bc-lines')
      if (linesEl) linesEl.innerHTML = renderLines()
      const terminal = document.getElementById('bc-terminal')
      if (terminal) terminal.scrollTop = terminal.scrollHeight
    }
  })

  refreshAll()
  input.focus()
}
