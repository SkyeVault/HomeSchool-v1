import { goBack, getApp } from '../../nav'

const ANIMALS = [
  { emoji: '🐶', name: 'Dog',       sound: 'Woof'    },
  { emoji: '🐱', name: 'Cat',       sound: 'Meow'    },
  { emoji: '🐻', name: 'Bear',      sound: 'Growl'   },
  { emoji: '🐸', name: 'Frog',      sound: 'Ribbit'  },
  { emoji: '🦁', name: 'Lion',      sound: 'Roar'    },
  { emoji: '🐘', name: 'Elephant',  sound: 'Trumpet' },
  { emoji: '🐧', name: 'Penguin',   sound: 'Squawk'  },
  { emoji: '🦊', name: 'Fox',       sound: 'Yip'     },
  { emoji: '🐰', name: 'Rabbit',    sound: 'Squeak'  },
  { emoji: '🐮', name: 'Cow',       sound: 'Moo'     },
  { emoji: '🐷', name: 'Pig',       sound: 'Oink'    },
  { emoji: '🦋', name: 'Butterfly', sound: 'Flutter' },
  { emoji: '🐟', name: 'Fish',      sound: 'Splash'  },
  { emoji: '🐢', name: 'Turtle',    sound: 'Hiss'    },
  { emoji: '🐝', name: 'Bee',       sound: 'Buzz'    },
  { emoji: '🦆', name: 'Duck',      sound: 'Quack'   },
  { emoji: '🐓', name: 'Chicken',   sound: 'Cluck'   },
  { emoji: '🦀', name: 'Crab',      sound: 'Click'   },
  { emoji: '🐬', name: 'Dolphin',   sound: 'Squeak'  },
  { emoji: '🦒', name: 'Giraffe',   sound: 'Hum'     },
]

function say(text: string, rate = 0.88, pitch = 1.15) {
  const u = new SpeechSynthesisUtterance(text)
  u.rate  = rate
  u.pitch = pitch
  return u
}

function playAnimal(animal: typeof ANIMALS[number]) {
  speechSynthesis.cancel()
  speechSynthesis.speak(say(animal.name))
  speechSynthesis.speak(say(animal.sound, 0.82, 1.3))
}

export function renderAnimals() {
  // Cards show only the emoji — name is revealed on tap
  const grid = ANIMALS.map((a, i) => `
    <button class="animal-card" data-idx="${i}"
            style="--ad:${(i * 0.04).toFixed(2)}s">
      <span class="animal-emoji">${a.emoji}</span>
    </button>`
  ).join('')

  getApp().innerHTML = `
    <div class="page animals-page">
      <header class="el-hub-header">
        <button class="back-btn" id="animals-back">← Back</button>
        <div class="el-hub-title">🐾 Animals 🐾</div>
        <div class="el-hub-sub">Tap an animal!</div>
      </header>
      <div class="animals-grid">${grid}</div>
      <div class="animal-label-overlay hidden" id="animal-overlay">
        <div class="animal-label-box" id="animal-label-box"></div>
      </div>
    </div>`

  document.getElementById('animals-back')!.addEventListener('click', goBack)

  const overlay  = document.getElementById('animal-overlay')!
  const labelBox = document.getElementById('animal-label-box')!
  let hideTimer  = 0

  document.querySelectorAll<HTMLButtonElement>('.animal-card').forEach(card => {
    card.addEventListener('click', () => {
      const animal = ANIMALS[Number(card.dataset.idx)]

      card.classList.add('animal-card--bounce')
      card.addEventListener('animationend', () => card.classList.remove('animal-card--bounce'), { once: true })

      labelBox.innerHTML = `
        <span class="alb-emoji">${animal.emoji}</span>
        <div class="alb-text">
          <div class="alb-name">${animal.name}</div>
          <div class="alb-sound">says <em>${animal.sound}!</em></div>
        </div>`

      overlay.classList.remove('hidden', 'animal-overlay--show')
      void overlay.offsetWidth
      overlay.classList.add('animal-overlay--show')

      clearTimeout(hideTimer)
      hideTimer = window.setTimeout(() => {
        overlay.classList.remove('animal-overlay--show')
        overlay.classList.add('hidden')
      }, 2800)

      playAnimal(animal)
    })
  })
}
