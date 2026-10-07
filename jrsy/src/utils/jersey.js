// Generates a clean, on-brand jersey graphic as a data-URI.
// Used for seed products so the store looks real with zero external images.
// When Firebase Storage is connected, real uploaded photo URLs are used instead.

export function jerseySvg({
  primary = '#0B0B0F',
  secondary = '#C8FF3C',
  number = '10',
  name = 'JRSY',
  pattern = 'plain',
} = {}) {
  const stripes =
    pattern === 'stripes'
      ? Array.from({ length: 6 })
          .map(
            (_, i) =>
              `<rect x="${140 + i * 44}" y="150" width="20" height="360" fill="${secondary}" opacity="0.9"/>`
          )
          .join('')
      : ''
  const hoop =
    pattern === 'hoops'
      ? `<rect x="120" y="300" width="360" height="46" fill="${secondary}" opacity="0.9"/>`
      : ''

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 700" role="img" aria-label="${name} jersey">
    <rect width="600" height="700" fill="#F3F4F6"/>
    <g>
      <path d="M300 120 L210 150 L120 210 L150 320 L210 300 L210 560 Q210 585 235 585 L365 585 Q390 585 390 560 L390 300 L450 320 L480 210 L390 150 Z"
            fill="${primary}" stroke="#0B0B0F" stroke-width="3" stroke-linejoin="round"/>
      <path d="M300 120 L255 138 Q300 178 345 138 Z" fill="#F3F4F6" stroke="#0B0B0F" stroke-width="3"/>
      ${stripes}${hoop}
      <text x="300" y="430" text-anchor="middle" font-family="Archivo, sans-serif" font-weight="900"
            font-size="180" fill="${secondary}" font-style="italic" stroke="#0B0B0F" stroke-width="3">${number}</text>
      <text x="300" y="250" text-anchor="middle" font-family="Archivo, sans-serif" font-weight="800"
            font-size="34" letter-spacing="4" fill="${secondary}">${String(name).toUpperCase().slice(0, 12)}</text>
    </g>
  </svg>`.trim()

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}
