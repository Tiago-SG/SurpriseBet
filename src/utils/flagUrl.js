// Retorna a URL da bandeira dado um código ISO 3166-1 alpha-2 (ex: 'br', 'ar')
export function flagUrl(code) {
  if (!code) return ''
  return `https://flagcdn.com/w40/${code.toLowerCase()}.png`
}
