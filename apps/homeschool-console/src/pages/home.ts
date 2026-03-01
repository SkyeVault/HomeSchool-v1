import { navigate, getApp } from '../nav'
import { renderEarlyLearningHub } from './early-learning/hub'
import { renderBeginnerCoding } from './beginner-coding'
import { renderMusicHub } from './music/hub'
import { renderMath } from './math'
import { renderReading } from './reading'
import { renderGeography } from './geography'
import { renderScience } from './science'
import { renderHistory } from './history'
import { renderLanguageArts } from './language-arts'
import { renderArt } from './art'
import { renderPhysicalEducation } from './physical-education'
import { renderEngineering } from './engineering'

interface Subject {
  name: string
  emoji: string
  color: string
  bg: string
  handler?: () => void
}

const subjects: Subject[] = [
  { name: 'Early Learning',     emoji: '⭐', color: '#F59F00', bg: '#FFF3BF', handler: () => navigate(renderEarlyLearningHub) },
  { name: 'Music',               emoji: '🎵', color: '#7950F2', bg: '#F3F0FF', handler: () => navigate(renderMusicHub) },
  { name: 'Beginner Coding',    emoji: '🐢', color: '#0CA678', bg: '#DCFCE7', handler: () => navigate(renderBeginnerCoding) },
  { name: 'Mathematics',        emoji: '🔢', color: '#4C6EF5', bg: '#EDF2FF', handler: () => navigate(renderMath) },
  { name: 'Reading',            emoji: '📚', color: '#E03131', bg: '#FFF5F5', handler: () => navigate(renderReading) },
  { name: 'Science',            emoji: '🔬', color: '#1C7ED6', bg: '#E7F5FF', handler: () => navigate(renderScience) },
  { name: 'History',            emoji: '🏺', color: '#C2410C', bg: '#FEF3C7', handler: () => navigate(renderHistory) },
  { name: 'Geography',          emoji: '🌍', color: '#2F9E44', bg: '#EBFBEE', handler: () => navigate(renderGeography) },
  { name: 'Language Arts',      emoji: '📝', color: '#E64980', bg: '#FFF0F6', handler: () => navigate(renderLanguageArts) },
  { name: 'Art & Creativity',   emoji: '🎨', color: '#9C36B5', bg: '#F8F0FC', handler: () => navigate(renderArt) },
  { name: 'Physical Education', emoji: '⚽', color: '#1971C2', bg: '#DBEAFE', handler: () => navigate(renderPhysicalEducation) },
  { name: 'Engineering',        emoji: '🔧', color: '#E67700', bg: '#FFF4E6', handler: () => navigate(renderEngineering) },
]

const letterColors = ['#FF6B6B', '#FF922B', '#FFD43B', '#51CF66', '#339AF0', '#845EF7', '#F783AC']
const shapeColors  = ['#FF6B6B', '#FFD43B', '#51CF66', '#74C0FC', '#DA77F2', '#F783AC', '#FF922B', '#63E6BE']
const icons = ['⭐','💫','✨','🌸','💕','🦋','🌈','🎈','🍀','🌻']

export function renderHome() {
  const titleLetters = "Learning"
    .split('')
    .map((char, i) => {
      const color = letterColors[i % letterColors.length]
      const delay = (i * 0.12).toFixed(2)
      return `<span style="color:${color};--letter-delay:${delay}s">${char}</span>`
    })
    .join('')

  const floatingShapes = Array.from({ length: 20 }, (_, i) => {
    const x = (Math.random() * 92).toFixed(1)
    const y = (Math.random() * 92).toFixed(1)
    const duration = (Math.random() * 4 + 3).toFixed(1)
    const delay = (Math.random() * 4).toFixed(1)
    const color = shapeColors[i % shapeColors.length]
    if (Math.random() > 0.38) {
      const size = (Math.random() * 48 + 18).toFixed(0)
      return `<div class="shape circle" style="width:${size}px;height:${size}px;left:${x}%;top:${y}%;background:${color};--duration:${duration}s;--delay:${delay}s;"></div>`
    } else {
      const size = (Math.random() * 18 + 20).toFixed(0)
      const icon = icons[i % icons.length]
      return `<div class="shape star" style="left:${x}%;top:${y}%;color:${color};--size:${size}px;--duration:${duration}s;--delay:${delay}s;">${icon}</div>`
    }
  }).join('')

  const cardHtml = subjects
    .map((s, i) => {
      const delay = (i * 0.055).toFixed(3)
      return `
        <div class="subject-card"
             style="--card-color:${s.color};--card-bg:${s.bg};--card-delay:${delay}s"
             data-subject="${s.name}">
          <span class="subject-emoji">${s.emoji}</span>
          <span class="subject-name">${s.name}</span>
        </div>`
    })
    .join('')

  getApp().innerHTML = `
    <div class="page">
      <div class="bg-shapes">${floatingShapes}</div>
      <header class="header">
        <div class="title-name">${titleLetters}</div>
        <div class="title-sub">World</div>
        <div class="subtitle">✨ What do you want to learn today? ✨</div>
      </header>
      <div class="subjects-grid">${cardHtml}</div>
    </div>`

  document.querySelectorAll<HTMLDivElement>('.subject-card').forEach(card => {
    card.addEventListener('click', () => {
      const name = card.dataset.subject
      const subject = subjects.find(s => s.name === name)
      if (subject?.handler) subject.handler()
    })
  })
}
