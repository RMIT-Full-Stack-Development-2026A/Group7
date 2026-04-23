const MARKER_TERM_TO_SYMBOL = {
  X: 'X',
  O: 'O',
  Circle: '\u25cf',
  Star: '\u2605',
  Square: '\u25a0',
  Triangle: '\u25b2',
  Moon: '\u263e',
  Sun: '\u2600',
  Cloud: '\u2601',
  Lightning: '\u26a1',
  Heart: '\u2665',
  Spade: '\u2660',
  Diamond: '\u2666',
  Club: '\u2663',
}

export const markerTermToSymbol = (term) => MARKER_TERM_TO_SYMBOL[term] || term || ''

export const normalizeMarkerParts = (marker, expectedCount = 2) => {
  const parts = String(marker || '')
    .split('-')
    .map((part) => part.trim())
    .filter(Boolean)

  const fallbackTerms = ['X', 'O', 'Triangle', 'Square']
  const normalizedParts = parts.slice(0, expectedCount)

  while (normalizedParts.length < expectedCount) {
    normalizedParts.push(fallbackTerms[normalizedParts.length] || `Marker${normalizedParts.length + 1}`)
  }

  return normalizedParts
}

export const getMarkerSymbols = (marker, expectedCount = 2) => (
  normalizeMarkerParts(marker, expectedCount).map(markerTermToSymbol)
)

export const getMarkerLabelsBySymbol = (marker) => {
  const [firstMarker, secondMarker] = getMarkerSymbols(marker, 2)

  return {
    X: firstMarker || 'X',
    O: secondMarker || 'O',
  }
}
