# Learning World

A desktop homeschool app for kids built with Tauri and TypeScript. No internet required after install, everything runs locally on your machine.

---

## Subjects

### Early Learning
Designed for ages 1–3. A hub of interactive activities:

- **ABC** - explore the alphabet and play a letter matching game
- **Animals** - tap animals to hear their name and sound spoken aloud
- **Bubbles** - sensory bubble-popping activity
- **Colors** - learn color names with visual feedback
- **Counting** - interactive counting practice
- **Doodle** - free-draw doodle canvas
- **Music Buttons** - press Do–Re–Mi scale buttons that play real tones
- **Number Hunt** - find and tap numbers as they appear
- **Shapes** - learn mode and quiz mode for basic shapes
- **Typing** - press any key to see colorful animated letters
- **Words** - early word recognition activity

### Music
A full music education hub:

- **Note Names** - learn note names positioned on the staff
- **Note Values** - whole, half, and quarter note recognition
- **Piano Keys** - identify piano keys in a scored quiz game
- **Staff Explorer** - interactive grand staff with piano keyboard
- **Free Play** - keyboard-mapped piano for open-ended play
- **Drums** - synthesized drum kit

### Beginner Coding
An introduction to programming concepts through a visual file tree explorer and coding challenges with a score tracker.

### Mathematics
Arithmetic practice with randomized problems and a running score.

### Reading
Word recognition and early reading activities.

### Science
Science concept explorer with visual cards.

### History
History quiz with questions and emoji prompts.

### Geography
All 50 US states displayed in a grid with abbreviations and capitals. Click any state to learn more.

### Language Arts
Rhyming word quiz - find the word that rhymes with the prompt. Includes score tracking and feedback.

### Art & Creativity
Color mixing lab - pick two colors from a palette and see what they make together.

### Physical Education
Exercise activity cards with a built-in timer and completion counter to track reps or sets.

### Engineering
Simple machines quiz covering tools and mechanical concepts.

---

## Tech Stack

- **[Tauri v2](https://tauri.app)** - native desktop app shell (Rust)
- **TypeScript + Vite** - frontend
- **Web Audio API** - all music and sound effects generated in-browser, no audio files needed
- **Web Speech API** - text-to-speech for the Animals page

No external services, no accounts, no telemetry.

---

## Installation

Download the latest release for your platform:

| Platform | File |
|----------|------|
| Linux (any distro) | `.AppImage` - mark executable and run |
| Ubuntu / Debian | `.deb` - install with `sudo dpkg -i` |
| Fedora / RHEL | `.rpm` |

After installing the `.deb` or `.rpm`, the app appears in your applications menu.

---

## Building from Source

**Requirements:** [Node.js](https://nodejs.org), [Rust](https://rustup.rs), and [Tauri prerequisites](https://tauri.app/start/prerequisites/)

```bash
git clone https://github.com/SkyeVault/HomeSchool-v1.git
cd HomeSchool-v1/apps/homeschool-console
npm install
npm run tauri build
```

Built installers will be in `src-tauri/target/release/bundle/`.

---

## License

MIT
