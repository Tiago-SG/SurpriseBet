# SurpriseBet

Bolão da Copa do Mundo 2026 entre amigos. Os participantes fazem palpites dos jogos e o sistema gera um ranking automático por pontuação.

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + Vite 6 |
| Estilização | Tailwind CSS v3 |
| Banco de dados | Firebase Firestore (realtime) |
| Autenticação | Firebase Auth + bcrypt (celular + senha) |
| Backend | Firebase Cloud Functions (Node 20) |
| API de resultados | football-data.org |
| PWA | vite-plugin-pwa |
| Hospedagem | Firebase Hosting |

## Funcionalidades

- Cadastro restrito a números pré-autorizados pelo admin
- Palpites por jogo com travamento 30 min antes do início
- Ranking em tempo real com pontuação automática
- Importação e sincronização de jogos via API football-data.org (job diário às 4h BRT)
- Bônus de cadastro calculado após a final (campeão + vice)
- Painel admin: partidas, usuários, redefinição de senha, sincronização com API
- PWA instalável no celular

## Configuração

### Variáveis de ambiente

Crie um arquivo `.env` na raiz deste diretório:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

### Instalar e rodar

```bash
npm install
npm run dev
```

### Build e deploy

```bash
npm run build
firebase deploy --only hosting  # na raiz do projeto
```

## Estrutura do projeto

```
src/
  components/       # MatchCard, RankingRow, rotas protegidas
  pages/            # Ranking, Matches, MatchDetail, PlayerPredictions
    admin/          # AdminPanel, AdminMatches, AdminMatchForm, AdminUsers, AdminSync
  services/         # firebase, auth, matches, predictions, scoring
  hooks/            # useAuth, useMatches
  utils/            # flagUrl, phases (48 seleções Copa 2026)
public/
  icon-192.png
  icon-512.png
```

## Sistema de pontuação

| Acerto | Pontos |
|---|---|
| Gols exatos de cada time | +2 |
| Vencedor ou empate | +10 |
| Diferença de gols (com vencedor correto) | +13 |
| Placar exato | +25 |

Multiplicadores por fase: grupos ×1 · oitavas ×3 · quartas ×4 · semis ×5 · final ×10.
Jogos com o Brasil: ×2 se o Brasil avançou.

### Bônus de cadastro (calculado após a final)

| Cenário | Bônus |
|---|---|
| Acertou um finalista | +500 |
| Acertou os dois finalistas | +1.000 |
| Acertou o campeão | +1.000 |
| Acertou tudo (finalistas + campeão) | +1.500 |
