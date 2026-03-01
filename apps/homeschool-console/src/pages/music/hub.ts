import { navigate, goBack, getApp } from '../../nav'
import { renderNoteNames }     from './note-names'
import { renderNoteValues }    from './note-values'
import { renderPianoKeys }     from './piano-keys'
import { renderStaffExplorer } from './staff-explorer'
import { renderFreePlay }      from './free-play'
import { renderDrums }         from './drums'

interface Activity {
  emoji: string; label: string; sub: string
  color: string; bg: string; handler: () => void
}

const activities: Activity[] = [
  { emoji:'🎹', label:'Free Play',      sub:'Press keys — see & hear notes!',
    color:'#E67700', bg:'#FFF4E6', handler: () => navigate(renderFreePlay)      },
  { emoji:'🥁', label:'Drum Lesson',    sub:'Count 1-2-3-4 with Professor Beat!',
    color:'#C2410C', bg:'#FEF3C7', handler: () => navigate(renderDrums)         },
  { emoji:'🎵', label:'Note Names',     sub:'What letter is this?',
    color:'#7950F2', bg:'#F3F0FF', handler: () => navigate(renderNoteNames)    },
  { emoji:'🎼', label:'Note Values',    sub:'How many beats?',
    color:'#E64980', bg:'#FFF0F6', handler: () => navigate(renderNoteValues)   },
  { emoji:'🎸', label:'Piano Keys',     sub:'Find it on the keyboard!',
    color:'#0CA678', bg:'#DCFCE7', handler: () => navigate(renderPianoKeys)    },
  { emoji:'🔭', label:'Staff Explorer', sub:'Click to hear any note',
    color:'#1C7ED6', bg:'#E7F5FF', handler: () => navigate(renderStaffExplorer) },
]

export function renderMusicHub() {
  const cardHtml = activities.map((a, i) => {
    const delay = (i * 0.08).toFixed(3)
    return `
      <button class="ms-hub-card"
              style="--mc:${a.color};--mbg:${a.bg};--md:${delay}s"
              data-idx="${i}">
        <span class="ms-hub-emoji">${a.emoji}</span>
        <span class="ms-hub-label">${a.label}</span>
        <span class="ms-hub-sub">${a.sub}</span>
      </button>`
  }).join('')

  getApp().innerHTML = `
    <div class="page ms-hub-page">
      <header class="el-hub-header ms-hub-header">
        <button class="back-btn" id="ms-hub-back">← Back</button>
        <div class="el-hub-title">🎵 Music 🎵</div>
        <div class="el-hub-sub">Learn to read music!</div>
      </header>
      <div class="ms-hub-grid">${cardHtml}</div>
    </div>`

  document.getElementById('ms-hub-back')!.addEventListener('click', goBack)
  document.querySelectorAll<HTMLButtonElement>('.ms-hub-card').forEach(btn => {
    btn.addEventListener('click', () => activities[Number(btn.dataset.idx)].handler())
  })
}
