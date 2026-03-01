import { navigate, goBack, getApp } from '../../nav'
import { renderTyping }      from './typing'
import { renderABC }         from './abc'
import { renderAnimals }     from './animals'
import { renderWords }       from './words'
import { renderBubbles }     from './bubbles'
import { renderShapes }      from './shapes'
import { renderCounting }    from './counting'
import { renderNumberHunt }  from './number-hunt'
import { renderDoodle }      from './doodle'
import { renderMusic }       from './music'

interface Activity {
  emoji: string
  label: string
  color: string
  bg: string
  handler: () => void
}

const activities: Activity[] = [
  { emoji: '⌨️', label: 'Typing Play',    color: '#E03131', bg: '#FFF5F5', handler: () => navigate(renderTyping)      },
  { emoji: '🔤', label: 'ABC Explorer',   color: '#9C36B5', bg: '#F8F0FC', handler: () => navigate(renderABC)         },
  { emoji: '🐾', label: 'Animals',        color: '#2F9E44', bg: '#EBFBEE', handler: () => navigate(renderAnimals)      },
  { emoji: '🔡', label: 'Word Builder',   color: '#5C7CFA', bg: '#EDF2FF', handler: () => navigate(renderWords)        },
  { emoji: '🫧', label: 'Bubble Pop',     color: '#1C7ED6', bg: '#E7F5FF', handler: () => navigate(renderBubbles)      },
  { emoji: '⭐', label: 'Shape Game',     color: '#F59F00', bg: '#FFF3BF', handler: () => navigate(renderShapes)       },
  { emoji: '🔢', label: 'Count Along',    color: '#4C6EF5', bg: '#EDF2FF', handler: () => navigate(renderCounting)     },
  { emoji: '🎯', label: 'Number Hunt',    color: '#E67700', bg: '#FFF4E6', handler: () => navigate(renderNumberHunt)   },
  { emoji: '✏️', label: 'Doodle Pad',    color: '#20C997', bg: '#E6FCF5', handler: () => navigate(renderDoodle)       },
  { emoji: '🎵', label: 'Music Buttons',  color: '#E64980', bg: '#FFF0F6', handler: () => navigate(renderMusic)        },
]

export function renderEarlyLearningHub() {
  const cardHtml = activities.map((a, i) => {
    const delay = (i * 0.07).toFixed(3)
    return `
      <button class="el-activity-card"
              style="--ac:${a.color};--abg:${a.bg};--ad:${delay}s"
              data-idx="${i}">
        <span class="el-activity-emoji">${a.emoji}</span>
        <span class="el-activity-label">${a.label}</span>
      </button>`
  }).join('')

  getApp().innerHTML = `
    <div class="page el-hub-page">
      <header class="el-hub-header">
        <button class="back-btn" id="el-back">← Back</button>
        <div class="el-hub-title">⭐ Early Learning ⭐</div>
        <div class="el-hub-sub">Ages 1 – 3 · Pick an activity!</div>
      </header>
      <div class="el-activities-grid">${cardHtml}</div>
    </div>`

  document.getElementById('el-back')!.addEventListener('click', goBack)

  document.querySelectorAll<HTMLButtonElement>('.el-activity-card').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.idx)
      activities[idx].handler()
    })
  })
}
