// Native element.scrollIntoView() is not supported on Safari.

import { parseToPx } from './css'

export const scrollIntoView = (element: Element, { offsetTop = 0 }: { offsetTop?: number } = {}): void => {
  const scrollPosition = window.scrollY
  const elementPosition = element.getBoundingClientRect().top
  const marginTop = parseToPx(getComputedStyle(element).marginTop) ?? 0

  window.scrollTo({
    top: Math.round(elementPosition + scrollPosition - marginTop + offsetTop),
    behavior: 'smooth',
  })
}
