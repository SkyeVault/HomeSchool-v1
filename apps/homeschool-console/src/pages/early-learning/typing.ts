import { goBack, getApp } from '../../nav'

// Placeholder hook for voice AI — replace with custom TTS when ready
export function speakWord(_word: string) {
  // TODO: hook up voice AI here
  // e.g. voiceAI.speak(word)
}

const COLORS = [
  '#FF6B6B','#FF922B','#FFD43B','#51CF66','#339AF0',
  '#845EF7','#F783AC','#20C997','#E64980','#74C0FC',
]

let colorIdx = 0
function nextColor() {
  return COLORS[colorIdx++ % COLORS.length]
}

export function renderTyping() {
  getApp().innerHTML = `
    <div class="typing-page" id="typing-page">
      <div class="typing-hint">Press any key!</div>
      <div class="typing-display" id="typing-display"></div>
      <div class="typing-esc-hint">[ ESC to go back ]</div>
    </div>`

  const display = document.getElementById('typing-display')!

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      cleanup()
      goBack()
      return
    }

    if (e.key === 'Backspace') {
      e.preventDefault()
      if (display.lastChild) display.removeChild(display.lastChild)
      return
    }

    if (e.key === 'Enter') {
      e.preventDefault()
      const lineBreak = document.createElement('div')
      lineBreak.style.cssText = 'width:100%;height:0;flex-basis:100%;'
      display.appendChild(lineBreak)
      display.scrollTop = display.scrollHeight
      return
    }

    if (e.key === ' ') {
      e.preventDefault()
      const spacer = document.createElement('span')
      spacer.className = 'typing-letter typing-letter--in'
      spacer.style.cssText = `min-width:clamp(24px,3.5vw,52px);color:transparent;`
      spacer.textContent = '\u00A0'
      display.appendChild(spacer)
      display.scrollTop = display.scrollHeight
      return
    }

    // Only show printable characters
    if (e.key.length !== 1) return

    const span = document.createElement('span')
    span.textContent = e.key.toUpperCase()
    span.className = 'typing-letter'
    span.style.color = nextColor()
    span.style.setProperty('--hue', String(Math.floor(Math.random() * 360)))
    display.appendChild(span)

    // Speak the letter
    speakWord(e.key)

    // Keep scroll pinned to latest
    display.scrollTop = display.scrollHeight

    // Animate in
    requestAnimationFrame(() => span.classList.add('typing-letter--in'))
  }

  function cleanup() {
    window.removeEventListener('keydown', onKey)
  }

  window.addEventListener('keydown', onKey)
}
