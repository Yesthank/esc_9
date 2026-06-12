import type { GameConfig } from '../engine/types'

// 하루의 지도 — 교실→운동장→복도→선거날(한 해의 기억) ‖ 그 밤.
// '그 밤'에 들어선 뒤에는 지나온 기억으로 되돌아갈 수 없다 — 픽션 보호(그 밤은 돌이킬 수 없다).
const MEMORY = ['room-classroom', 'room-yard', 'room-hallway', 'room-election']
const NIGHT = 'room-night'
const SHORT: Record<string, string> = {
  'room-classroom': '교실', 'room-yard': '운동장', 'room-hallway': '복도', 'room-election': '선거날',
  'room-night': '그 밤',
}

export function ShipMap({
  config,
  current,
  visited,
  onMove,
}: {
  config: GameConfig
  current: string
  visited: string[]
  onMove: (roomId: string) => void
}) {
  const night = visited.includes(NIGHT) // 그 밤 이후 — 지나온 기억이 어둑하게 잠긴다
  const memoryRooms = MEMORY.filter((id) => config.rooms.some((r) => r.id === id))

  const cell = (id: string, lockedByNight: boolean) => {
    const isHere = id === current
    const seen = visited.includes(id)
    const disabled = !seen || isHere || lockedByNight
    return (
      <button
        key={id}
        className={`shipmap__cell${isHere ? ' here' : ''}${seen ? ' seen' : ''}${lockedByNight ? ' sealocked' : ''}`}
        disabled={disabled}
        onClick={() => !disabled && onMove(id)}
        aria-label={SHORT[id] ?? id}
      >
        <span className="shipmap__dot" />
        <span className="shipmap__name">{SHORT[id] ?? id}</span>
        {!seen && <span className="shipmap__lock">🔒</span>}
      </button>
    )
  }

  return (
    <nav className="shipmap" aria-label="하루의 지도">
      <svg className="shipmap__hull" viewBox="0 0 232 56" aria-hidden="true">
        {/* 한 해의 기억 — 교사(校舍)·우물·복도 창·태극기 게양대 (그 밤 이후 어둑해진다) */}
        <g opacity={night ? 0.45 : 1}>
          {/* 교사 단층 건물(교실) — 박공 지붕 + 창 */}
          <path d="M6 50 v-13 h32 v13" fill="#161f1a" stroke="#c9762b" strokeWidth="1.3" strokeLinejoin="round" />
          <path d="M3 37 l19 -9 l19 9 z" fill="#1c2a24" stroke="#c9762b" strokeWidth="1.2" strokeLinejoin="round" />
          <rect x="11" y="41" width="6" height="5" fill="#2a3c33" stroke="#c9762b" strokeWidth="0.7" />
          <rect x="22" y="41" width="6" height="5" fill="#2a3c33" stroke="#c9762b" strokeWidth="0.7" />
          {/* 우물(운동장) — 돌담 + 도르래 지지대 */}
          <path d="M56 50 v-7 h16 v7" fill="#161f1a" stroke="#8a6a48" strokeWidth="1.3" strokeLinejoin="round" />
          <path d="M58 43 v-8 m12 8 v-8 m-14 1 h16" fill="none" stroke="#8a6a48" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="64" cy="38" r="1.8" fill="none" stroke="#c9762b" strokeWidth="1" />
          {/* 미루나무 */}
          <path d="M84 50 q-1.5 -13 0 -22 m0 22 q1.5 -13 0 -22" fill="none" stroke="#2e6e4e" strokeWidth="1.4" strokeLinecap="round" />
          <ellipse cx="84" cy="31" rx="4.5" ry="8" fill="#1f3a2c" stroke="#2e6e4e" strokeWidth="1" />
          {/* 복도 창 띠(복도) */}
          <path d="M98 50 v-10 h34 v10" fill="#161f1a" stroke="#c9762b" strokeWidth="1.3" strokeLinejoin="round" />
          <path d="M103 44 h5 m4 0 h5 m4 0 h5" stroke="#e8b66a" strokeWidth="2.2" strokeLinecap="round" opacity="0.9" />
          {/* 게양대 + 깃발(선거날) */}
          <path d="M148 50 v-24" stroke="#8a6a48" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M148 26 h11 l-3 3 l3 3 h-11 z" fill="#b5392b" opacity="0.85" />
          {/* 길 — 점선 */}
          <path d="M8 52 q80 -5 164 0" fill="none" stroke="#8a6a48" strokeWidth="1.3" strokeDasharray="5 4" opacity="0.6" />
        </g>
        {/* 멀리 그 밤의 교실 — 달과 깨진 창. 밤이 오기 전엔 흐릿하다 */}
        <g opacity={night ? 1 : 0.55}>
          <circle cx="223" cy="22" r="5" fill="#efe6d0" opacity="0.9" />
          <path d="M186 50 v-12 h40 v12" fill="#10161c" stroke="#5a86cc" strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M183 38 l23 -8 l23 8 z" fill="#141c24" stroke="#5a86cc" strokeWidth="1.1" strokeLinejoin="round" />
          {/* 깨진 창 — 금 간 별 모양 */}
          <rect x="199" y="42" width="7" height="6" fill="#1c2430" stroke="#5a86cc" strokeWidth="0.7" />
          <path d="M202.5 45 l-2.4 -2 m2.4 2 l2.6 -1.4 m-2.6 1.4 l-1.6 2.4 m1.6 -2.4 l2 2.2" stroke="#9db8e8" strokeWidth="0.6" />
        </g>
      </svg>
      <div className="shipmap__cells">
        {memoryRooms.map((id) => cell(id, night))}
        <span className="shipmap__sea" aria-hidden="true" style={{ color: '#c9762b' }}>‖</span>
        {cell(NIGHT, false)}
      </div>
    </nav>
  )
}
