export const textToCamelCase = (text: string) =>
  text
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^./, (m) => m.toLowerCase())
