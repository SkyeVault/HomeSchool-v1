type PageFn = () => void

const stack: PageFn[] = []

export function navigate(page: PageFn) {
  stack.push(page)
  page()
}

export function goBack() {
  stack.pop()
  const prev = stack[stack.length - 1]
  if (prev) prev()
}

export function getApp(): HTMLDivElement {
  return document.querySelector<HTMLDivElement>('#app')!
}
