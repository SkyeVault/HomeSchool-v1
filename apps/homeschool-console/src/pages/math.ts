import { goBack, getApp } from '../nav'

interface Problem {
  a: number
  b: number
  op: '+' | '-'
  answer: number
}

function makeProblem(): Problem {
  const op: '+' | '-' = Math.random() > 0.5 ? '+' : '-'
  const a = Math.floor(Math.random() * 10) + 1
  const b = op === '+'
    ? Math.floor(Math.random() * 10) + 1
    : Math.floor(Math.random() * a) + 1
  const answer = op === '+' ? a + b : a - b
  return { a, b, op, answer }
}

function makeChoices(answer: number): number[] {
  const choices = new Set<number>([answer])
  while (choices.size < 4) {
    const offset = Math.floor(Math.random() * 5) + 1
    const wrong = Math.random() > 0.5 ? answer + offset : Math.max(0, answer - offset)
    if (wrong !== answer && wrong >= 0) choices.add(wrong)
  }
  return [...choices].sort(() => Math.random() - 0.5)
}

let problem: Problem
let score = 0
let locked = false

function renderProblem() {
  locked = false
  const probEl = document.getElementById('mt-problem')
  if (probEl) {
    probEl.innerHTML = `
      <span class="mt-num">${problem.a}</span>
      <span class="mt-op">${problem.op}</span>
      <span class="mt-num">${problem.b}</span>
      <span class="mt-op">=</span>
      <span class="mt-qmark">?</span>`
  }
  const choicesEl = document.getElementById('mt-choices')
  if (choicesEl) {
    const choices = makeChoices(problem.answer)
    choicesEl.innerHTML = choices.map(c =>
      `<button class="mt-choice" data-val="${c}">${c}</button>`
    ).join('')
    choicesEl.querySelectorAll<HTMLButtonElement>('.mt-choice').forEach(btn => {
      btn.addEventListener('click', () => handleAnswer(Number(btn.dataset.val), btn))
    })
  }
  const fb = document.getElementById('mt-feedback')
  if (fb) { fb.textContent = ''; fb.className = 'mt-feedback' }
}

function handleAnswer(val: number, btn: HTMLButtonElement) {
  if (locked) return
  locked = true
  document.querySelectorAll<HTMLButtonElement>('.mt-choice').forEach(b => b.disabled = true)

  const fb = document.getElementById('mt-feedback')!
  if (val === problem.answer) {
    score++
    document.getElementById('mt-score')!.textContent = String(score)
    btn.classList.add('mt-choice--correct')
    fb.textContent = '✨ Correct! Great job! ✨'
    fb.className = 'mt-feedback mt-feedback--good'
  } else {
    btn.classList.add('mt-choice--wrong')
    document.querySelectorAll<HTMLButtonElement>('.mt-choice').forEach(b => {
      if (Number(b.dataset.val) === problem.answer) b.classList.add('mt-choice--correct')
    })
    fb.textContent = `The answer was ${problem.answer} — you got this! 💪`
    fb.className = 'mt-feedback mt-feedback--try'
  }

  setTimeout(() => {
    problem = makeProblem()
    renderProblem()
  }, 1800)
}

export function renderMath() {
  problem = makeProblem()
  score = 0
  locked = false

  getApp().innerHTML = `
    <div class="page mt-page">
      <header class="mt-header">
        <button class="back-btn" id="mt-back">← Back</button>
        <div class="mt-title">🔢 Math Practice</div>
        <div class="mt-score-badge">⭐ <span id="mt-score">0</span></div>
      </header>
      <div class="mt-body">
        <div class="mt-card">
          <div class="mt-label">Solve it! 🧮</div>
          <div class="mt-problem" id="mt-problem"></div>
          <div class="mt-choices" id="mt-choices"></div>
          <div class="mt-feedback" id="mt-feedback"></div>
        </div>
      </div>
    </div>`

  document.getElementById('mt-back')!.addEventListener('click', goBack)
  renderProblem()
}
