export const PHASES = [
  { id: 'group', label: 'Fase de Grupos' },
  { id: 'pre-round-of-16', label: 'Pré-oitavas' },
  { id: 'round-of-16', label: 'Oitavas de Final' },
  { id: 'quarters', label: 'Quartas de Final' },
  { id: 'semis', label: 'Semifinais' },
  { id: 'third', label: 'Disputa de 3º Lugar' },
  { id: 'final', label: 'Final' },
]

export const PHASE_MAP = Object.fromEntries(PHASES.map(p => [p.id, p.label]))

export const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']

// 48 seleções da Copa do Mundo 2026
export const TEAMS = [
  // Grupo A
  { code: 'MEX', name: 'México', flag: 'mx', group: 'A' },
  { code: 'KOR', name: 'Coreia do Sul', flag: 'kr', group: 'A' },
  { code: 'RSA', name: 'África do Sul', flag: 'za', group: 'A' },
  { code: 'CZE', name: 'República Tcheca', flag: 'cz', group: 'A' },

  // Grupo B
  { code: 'CAN', name: 'Canadá', flag: 'ca', group: 'B' },
  { code: 'SUI', name: 'Suíça', flag: 'ch', group: 'B' },
  { code: 'QAT', name: 'Catar', flag: 'qa', group: 'B' },
  { code: 'BIH', name: 'Bósnia', flag: 'ba', group: 'B' },

  // Grupo C
  { code: 'BRA', name: 'Brasil', flag: 'br', group: 'C' },
  { code: 'MAR', name: 'Marrocos', flag: 'ma', group: 'C' },
  { code: 'SCO', name: 'Escócia', flag: 'gb-sct', group: 'C' },
  { code: 'HAI', name: 'Haiti', flag: 'ht', group: 'C' },

  // Grupo D
  { code: 'USA', name: 'Estados Unidos', flag: 'us', group: 'D' },
  { code: 'AUS', name: 'Austrália', flag: 'au', group: 'D' },
  { code: 'PAR', name: 'Paraguai', flag: 'py', group: 'D' },
  { code: 'TUR', name: 'Turquia', flag: 'tr', group: 'D' },

  // Grupo E
  { code: 'GER', name: 'Alemanha', flag: 'de', group: 'E' },
  { code: 'ECU', name: 'Equador', flag: 'ec', group: 'E' },
  { code: 'CIV', name: 'Costa do Marfim', flag: 'ci', group: 'E' },
  { code: 'CUW', name: 'Curaçao', flag: 'cw', group: 'E' },

  // Grupo F
  { code: 'NED', name: 'Holanda', flag: 'nl', group: 'F' },
  { code: 'JPN', name: 'Japão', flag: 'jp', group: 'F' },
  { code: 'TUN', name: 'Tunísia', flag: 'tn', group: 'F' },
  { code: 'SWE', name: 'Suécia', flag: 'se', group: 'F' },

  // Grupo G
  { code: 'BEL', name: 'Bélgica', flag: 'be', group: 'G' },
  { code: 'IRN', name: 'Irã', flag: 'ir', group: 'G' },
  { code: 'EGY', name: 'Egito', flag: 'eg', group: 'G' },
  { code: 'NZL', name: 'Nova Zelândia', flag: 'nz', group: 'G' },

  // Grupo H
  { code: 'ESP', name: 'Espanha', flag: 'es', group: 'H' },
  { code: 'URU', name: 'Uruguai', flag: 'uy', group: 'H' },
  { code: 'KSA', name: 'Arábia Saudita', flag: 'sa', group: 'H' },
  { code: 'CPV', name: 'Cabo Verde', flag: 'cv', group: 'H' },

  // Grupo I
  { code: 'FRA', name: 'França', flag: 'fr', group: 'I' },
  { code: 'SEN', name: 'Senegal', flag: 'sn', group: 'I' },
  { code: 'NOR', name: 'Noruega', flag: 'no', group: 'I' },
  { code: 'IRQ', name: 'Iraque', flag: 'iq', group: 'I' },

  // Grupo J
  { code: 'ARG', name: 'Argentina', flag: 'ar', group: 'J' },
  { code: 'AUT', name: 'Áustria', flag: 'at', group: 'J' },
  { code: 'ALG', name: 'Argélia', flag: 'dz', group: 'J' },
  { code: 'JOR', name: 'Jordânia', flag: 'jo', group: 'J' },

  // Grupo K
  { code: 'POR', name: 'Portugal', flag: 'pt', group: 'K' },
  { code: 'COL', name: 'Colômbia', flag: 'co', group: 'K' },
  { code: 'UZB', name: 'Uzbequistão', flag: 'uz', group: 'K' },
  { code: 'COD', name: 'Congo DR', flag: 'cd', group: 'K' },

  // Grupo L
  { code: 'ENG', name: 'Inglaterra', flag: 'gb-eng', group: 'L' },
  { code: 'CRO', name: 'Croácia', flag: 'hr', group: 'L' },
  { code: 'PAN', name: 'Panamá', flag: 'pa', group: 'L' },
  { code: 'GHA', name: 'Gana', flag: 'gh', group: 'L' },
]

export const TEAM_MAP = Object.fromEntries(TEAMS.map(t => [t.code, t]))
