export function calculatePoints(match, prediction) {
  const { homeScore: rH, awayScore: rA, phase, brazilAdvanced } = match
  const { homeScore: pH, awayScore: pA } = prediction

  if (rH === null || rA === null || pH === null || pA === null) return 0

  let points = 0

  const realWinner = rH > rA ? 'home' : rA > rH ? 'away' : 'draw'
  const predWinner = pH > pA ? 'home' : pA > pH ? 'away' : 'draw'

  if (pH === rH && pA === rA) {
    // Placar exato: 50 pts fixos, nada mais
    points = 50
  } else {
    // Vencedor ou empate
    if (predWinner === realWinner) points += 10
    // Diferença de gols (só se acertou vencedor e não foi empate)
    if (predWinner === realWinner && realWinner !== 'draw') {
      if ((pH - pA) === (rH - rA)) points += 13
    }
    // Gols exatos por time
    if (pH === rH) points += 2
    if (pA === rA) points += 2
  }

  const phaseMultiplier = {
    'group': 1,
    'pre-round-of-16': 2,
    'round-of-16': 3,
    'quarters': 4,
    'semis': 5,
    'third': 5,
    'final': 10,
  }
  points *= (phaseMultiplier[phase] || 1)

  const involvesBrazil = match.homeTeam === 'BRA' || match.awayTeam === 'BRA'
  if (involvesBrazil && brazilAdvanced === true) {
    points *= 2
  }

  return points
}

export function calculateRegistrationBonus(user, finalMatch) {
  const { homeTeam, awayTeam, homeScore, awayScore } = finalMatch

  const champion = homeScore > awayScore ? homeTeam : awayTeam
  const runnerUp = homeScore > awayScore ? awayTeam : homeTeam
  const finalists = [homeTeam, awayTeam]

  const userChampion = user.championPick
  const userRunnerUp = user.runnerUpPick

  let bonus = 0

  const pickedChampion = userChampion === champion
  const pickedFinalist1 = finalists.includes(userChampion)
  const pickedFinalist2 = finalists.includes(userRunnerUp)

  if (pickedFinalist1) bonus += 500
  if (pickedFinalist2 && userRunnerUp !== userChampion) bonus += 500
  if (pickedChampion) bonus += 500

  return bonus
}
