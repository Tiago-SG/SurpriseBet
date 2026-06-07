import { useNavigate } from 'react-router-dom'

const MEDALS = {
  1: { bg: 'bg-yellow-500/20', border: 'border-yellow-500/40', text: 'text-yellow-400', label: '1' },
  2: { bg: 'bg-gray-400/20', border: 'border-gray-400/40', text: 'text-gray-300', label: '2' },
  3: { bg: 'bg-orange-600/20', border: 'border-orange-600/40', text: 'text-orange-400', label: '3' },
}

export default function RankingRow({ user, position, isCurrentUser }) {
  const navigate = useNavigate()
  const medal = MEDALS[position]

  return (
    <div
      onClick={() => navigate(`/player/${user.uid}`)}
      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all
        ${isCurrentUser ? 'bg-blue-600/20 border-blue-500/40' : 'bg-white/5 border-white/10 hover:bg-white/10'}
      `}
    >
      <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm
        ${medal ? `${medal.bg} border ${medal.border} ${medal.text}` : 'text-gray-400'}
      `}>
        {position}
      </div>

      <span className={`flex-1 font-medium ${isCurrentUser ? 'text-blue-300 font-bold' : 'text-white'}`}>
        {user.name}
        {isCurrentUser && <span className="text-xs text-blue-400 ml-1">(você)</span>}
      </span>

      <span className="text-white font-bold tabular-nums">
        {user.totalPoints ?? 0} pts
      </span>
    </div>
  )
}
