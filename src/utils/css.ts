import _resolveTailwindConfig from 'tailwindcss/resolveConfig'
import tailwindExtendConfig from '@@/tailwind.config.js'

export const resolveTailwindConfig = () => {
  return _resolveTailwindConfig(tailwindExtendConfig)
}

export const parseToPx = (style: string): number|null => {
  const pxs = parsePxStyle(style)
  if (pxs !== null) {
    return pxs
  }

  const rems = parseRemStyle(style)
  if (rems !== null) {
    return convertRemToPx(rems)
  }

  return null
}

export const parsePxStyle = (remValue: string): number|null => {
  const [, pxs] = remValue.match(/(\d*\.{0,1}\d*)px/) || []

  return pxs !== undefined ? Number(pxs) : null
}

export const parseRemStyle = (remValue: string): number|null => {
  const [, rems] = remValue.match(/(\d*\.{0,1}\d*)rem/) || []

  return rems !== undefined ? Number(rems) : null
}

export const convertRemToPx = (rems: number): number => {
  return rems * parseFloat(getComputedStyle(document.documentElement).fontSize)
}
