import type { JSX } from 'react'

// 만장일치(esc_9) 무대 — 세로(9:16) 포트레이트. 1960년 무렵 시골 국민학교.
// 팔레트: 칠판 녹 #2e4e3e · 마루 갈 #8a6a48 · 분필/한지 #efe6d0 · 노을 주황 #c9762b · 밤 남색 #1c2430 · 채점 붉음 #b5392b.
// 수채+색연필 느낌. 세로 3단 구도: 상단(y 0~50) · 중단(y 50~100) · 하단(y 100~160). viewBox 0 0 90 160.

const BOARD = '#2e4e3e'   // 칠판 녹
const FLOOR = '#8a6a48'   // 마루 갈
const CHALK = '#efe6d0'   // 분필/한지
const NIGHT = '#1c2430'   // 밤 남색
const RED   = '#b5392b'   // 채점 붉음

/** 가장자리 비네트 — th 접두사로 id 충돌 방지 */
function Vignette({ id, strength = 0.55 }: { id: string; strength?: number }) {
  return (
    <>
      <radialGradient id={id} cx="45%" cy="45%" r="75%">
        <stop offset="50%" stopColor="#000" stopOpacity="0" />
        <stop offset="100%" stopColor="#060810" stopOpacity={strength} />
      </radialGradient>
      <rect x="0" y="0" width="90" height="160" fill={`url(#${id})`} />
    </>
  )
}

/** 마룻바닥 원근선 — 중단~하단 공유 헬퍼 */
function FloorBoards({ y0, color = FLOOR, lineColor = '#5e4228' }: { y0: number; color?: string; lineColor?: string }) {
  // y0 에서 시작해 160까지 늘어지는 나무 마루
  return (
    <g>
      <linearGradient id="thFloorG" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color} />
        <stop offset="100%" stopColor="#5a4230" />
      </linearGradient>
      <rect x="0" y={y0} width="90" height={160 - y0} fill="url(#thFloorG)" />
      {/* 마루 결 — 수평 줄 */}
      {[y0 + 5, y0 + 12, y0 + 22, y0 + 35, y0 + 52].map((y) => (
        <line key={y} x1="0" y1={y} x2="90" y2={y} stroke={lineColor} strokeWidth="0.5" opacity="0.5" />
      ))}
      {/* 수직 판 이음새 — 원근 */}
      {[15, 30, 45, 60, 75].map((x) => (
        <line key={x} x1={x} y1={y0} x2={x + (x - 45) * 0.18} y2="160" stroke={lineColor} strokeWidth="0.4" opacity="0.4" />
      ))}
    </g>
  )
}

/** R1 교실 — 아침. 녹색 칠판(상단) · 책걸상 줄(중단) · 풍금 실루엣(우중단) · 마룻바닥(하단) */
function Classroom(): JSX.Element {
  return (
    <svg className="scene" viewBox="0 0 90 160" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        {/* 아침 햇살 — 창 쪽(우상)에서 쏟아지는 따뜻한 빛 */}
        <radialGradient id="thCsun" cx="82%" cy="8%" r="65%">
          <stop offset="0%" stopColor="#fff7d0" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#fff7d0" stopOpacity="0" />
        </radialGradient>
        {/* 칠판 그라디언트 */}
        <linearGradient id="thCboard" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a5e4a" />
          <stop offset="100%" stopColor={BOARD} />
        </linearGradient>
        {/* 벽 */}
        <linearGradient id="thCwall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d4c9a8" />
          <stop offset="100%" stopColor="#c8ba94" />
        </linearGradient>
      </defs>

      {/* 벽 배경 */}
      <rect width="90" height="160" fill="url(#thCwall)" />

      {/* 천장 — 어두운 나무 보 */}
      <rect x="0" y="0" width="90" height="10" fill="#a89070" />
      <rect x="0" y="9" width="90" height="1.5" fill="#7a6448" />
      {[22, 44, 66].map((x) => (
        <rect key={x} x={x} y="0" width="4" height="10" fill="#9a8062" opacity="0.7" />
      ))}

      {/* 유리창 — 우상단, 아침 빛이 스며든다 */}
      <g>
        <rect x="56" y="11" width="30" height="32" rx="1" fill="#a8c4d8" opacity="0.55" stroke="#7a6448" strokeWidth="1" />
        {/* 창살 */}
        {[62, 70, 78].map((x) => (
          <line key={x} x1={x} y1="11" x2={x} y2="43" stroke="#7a6448" strokeWidth="0.7" />
        ))}
        {[20, 27, 35].map((y) => (
          <line key={y} x1="56" y1={y} x2="86" y2={y} stroke="#7a6448" strokeWidth="0.7" />
        ))}
        {/* 창밖 — 먼 하늘빛 */}
        <rect x="57" y="12" width="28" height="30" fill="#cde0ee" opacity="0.45" />
        {/* 아침 햇살 사선 — 창에서 교실 안으로 */}
        <polygon points="57,12 86,12 90,50 62,50" fill="#fff7d0" opacity="0.12" />
      </g>

      {/* 칠판 — 상단 좌측 */}
      <rect x="3" y="11" width="48" height="32" rx="1" fill="url(#thCboard)" stroke="#1e3028" strokeWidth="1.2" />
      {/* 칠판 나무 테두리 */}
      <rect x="3" y="11" width="48" height="2" fill="#5a4228" />
      <rect x="3" y="41" width="48" height="2" fill="#5a4228" />
      {/* 분필 가루 흔적 — 지운 자국 */}
      <rect x="7" y="17" width="38" height="8" fill={CHALK} opacity="0.06" />
      {/* 분필 받침대 */}
      <rect x="3" y="43" width="48" height="2.4" rx="0.8" fill="#5a4228" />
      {[8, 18, 28, 38].map((x) => (
        <rect key={x} x={x} y="43.5" width="3.5" height="1.4" rx="0.5" fill={CHALK} opacity="0.8" />
      ))}

      {/* 벽 아랫단 — 교실 앞쪽 */}
      <rect x="0" y="50" width="90" height="3" fill="#9a8462" />

      {/* 마룻바닥 */}
      <FloorBoards y0={53} />

      {/* 햇살 빛 웅덩이 오버레이 */}
      <rect x="0" y="0" width="90" height="160" fill="url(#thCsun)" />

      {/* 책걸상 줄 — 중단 (원근감) */}
      {/* 앞줄 책상 */}
      {[0, 1, 2].map((col) => {
        const bx = 8 + col * 28
        const by = 90
        return (
          <g key={col}>
            {/* 책상 상판 */}
            <rect x={bx} y={by} width="20" height="12" rx="0.8" fill="#b09070" stroke="#7a5a38" strokeWidth="0.8" />
            {/* 책상 다리 */}
            <line x1={bx + 2} y1={by + 12} x2={bx + 2} y2={by + 22} stroke="#7a5a38" strokeWidth="1.2" />
            <line x1={bx + 18} y1={by + 12} x2={bx + 18} y2={by + 22} stroke="#7a5a38" strokeWidth="1.2" />
            {/* 의자 */}
            <rect x={bx + 2} y={by + 24} width="16" height="8" rx="0.8" fill="#a08060" stroke="#7a5a38" strokeWidth="0.7" />
            <line x1={bx + 4} y1={by + 32} x2={bx + 4} y2={by + 40} stroke="#7a5a38" strokeWidth="1" />
            <line x1={bx + 14} y1={by + 32} x2={bx + 14} y2={by + 40} stroke="#7a5a38" strokeWidth="1" />
          </g>
        )
      })}
      {/* 뒷줄 책상 — 원근상 작게 */}
      {[0, 1, 2].map((col) => {
        const bx = 10 + col * 27
        const by = 68
        return (
          <g key={col}>
            <rect x={bx} y={by} width="16" height="9" rx="0.6" fill="#b09070" stroke="#7a5a38" strokeWidth="0.6" opacity="0.85" />
            <line x1={bx + 2} y1={by + 9} x2={bx + 2} y2={by + 16} stroke="#7a5a38" strokeWidth="0.9" opacity="0.85" />
            <line x1={bx + 14} y1={by + 9} x2={bx + 14} y2={by + 16} stroke="#7a5a38" strokeWidth="0.9" opacity="0.85" />
          </g>
        )
      })}

      {/* 풍금 실루엣 — 우중단 */}
      <g>
        {/* 풍금 몸통 */}
        <rect x="62" y="90" width="24" height="36" rx="1" fill="#6a4e30" stroke="#4a3218" strokeWidth="1" />
        {/* 건반 */}
        <rect x="63" y="104" width="22" height="7" fill={CHALK} opacity="0.85" stroke="#4a3218" strokeWidth="0.5" />
        {[65, 67.5, 70, 72.5, 75, 77.5, 80, 82.5].map((x) => (
          <line key={x} x1={x} y1="104" x2={x} y2="111" stroke="#9a8470" strokeWidth="0.4" />
        ))}
        {/* 검은 건반 */}
        {[65.8, 68.3, 73.8, 76.3, 78.8].map((x) => (
          <rect key={x} x={x} y="104" width="1.4" height="4.5" fill="#2a1e10" />
        ))}
        {/* 보면대 */}
        <rect x="63" y="92" width="22" height="11" fill="#7a5e3a" stroke="#4a3218" strokeWidth="0.6" />
        {/* 페달 */}
        <line x1="68" y1="126" x2="68" y2="132" stroke="#4a3218" strokeWidth="1.2" />
        <line x1="78" y1="126" x2="78" y2="132" stroke="#4a3218" strokeWidth="1.2" />
        <rect x="65" y="131" width="14" height="2" rx="0.5" fill="#4a3218" />
      </g>

      {/* 분필 가루 입자 — 빛 속에 떠다니는 느낌(정적) */}
      {[14, 26, 38, 50, 34, 20, 42].map((x, i) => (
        <circle key={x} cx={x} cy={48 + (i % 4) * 3} r="0.5" fill={CHALK} opacity={0.3 + (i % 3) * 0.12} />
      ))}

      <Vignette id="thCvig" strength={0.35} />
    </svg>
  )
}

/** R2 운동장 — 한낮. 하늘(상단) · 교사 건물+미루나무(중상) · 돌우물+도르래(중단) · 흙바닥(하단) */
function Yard(): JSX.Element {
  return (
    <svg className="scene" viewBox="0 0 90 160" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="thYsky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7bbfdc" />
          <stop offset="100%" stopColor="#b8daea" />
        </linearGradient>
        <linearGradient id="thYground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b09070" />
          <stop offset="100%" stopColor="#8a6a48" />
        </linearGradient>
        {/* 한낮 태양 */}
        <radialGradient id="thYsun" cx="62%" cy="10%" r="38%">
          <stop offset="0%" stopColor="#fff3c4" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#fff3c4" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* 하늘 */}
      <rect width="90" height="160" fill="url(#thYsky)" />
      {/* 태양 */}
      <circle cx="56" cy="14" r="6" fill="#fff7a0" opacity="0.9" />
      <circle cx="56" cy="14" r="12" fill="#fff7d0" opacity="0.25" />
      <rect x="0" y="0" width="90" height="160" fill="url(#thYsun)" />

      {/* 먼 산 실루엣 */}
      <path d="M0 46 q16 -14 30 -6 q14 -10 26 -4 q12 -8 22 -2 q10 -6 12 2 V60 H0 z" fill="#5a8070" opacity="0.45" />

      {/* 교사(校舍) 단층 건물 — 상단 중앙 */}
      <g>
        {/* 건물 본체 */}
        <rect x="18" y="52" width="58" height="28" fill="#c8b896" stroke="#9a8464" strokeWidth="1" />
        {/* 지붕 */}
        <polygon points="14,52 76,52 80,44 10,44" fill="#8a7a5a" />
        <line x1="10" y1="44" x2="80" y2="44" stroke="#6a5a3a" strokeWidth="0.8" />
        {/* 창문 셋 */}
        {[24, 40, 56].map((x) => (
          <g key={x}>
            <rect x={x} y="57" width="12" height="14" rx="0.5" fill="#a8c4d8" opacity="0.6" stroke="#7a6448" strokeWidth="0.7" />
            <line x1={x + 6} y1="57" x2={x + 6} y2="71" stroke="#7a6448" strokeWidth="0.5" />
            <line x1={x} y1="64" x2={x + 12} y2="64" stroke="#7a6448" strokeWidth="0.5" />
          </g>
        ))}
        {/* 현관문 */}
        <rect x="71" y="63" width="7" height="17" rx="0.5" fill="#7a5a38" stroke="#5a3e1e" strokeWidth="0.8" />
        {/* 현판 */}
        <rect x="22" y="46" width="40" height="5" fill={CHALK} opacity="0.6" />
      </g>

      {/* 미루나무 — 우측, 특유의 가느다란 원추형 */}
      <g>
        {/* 줄기 */}
        <rect x="77" y="38" width="4" height="50" fill="#6a5030" />
        {/* 나뭇잎 — 좁고 긴 타원 여러 층 */}
        {[38, 47, 56, 65, 72].map((y, i) => (
          <ellipse key={y} cx="79" cy={y} rx={4 + (i % 2)} ry={10 - i} fill="#4a7848" opacity="0.85" />
        ))}
      </g>
      {/* 미루나무 둘째(더 작게, 멀리) */}
      <g>
        <rect x="10" y="50" width="3" height="34" fill="#6a5030" opacity="0.7" />
        {[50, 58, 65].map((y, i) => (
          <ellipse key={y} cx="11.5" cy={y} rx={3 + (i % 2)} ry={7 - i} fill="#4a7848" opacity="0.65" />
        ))}
      </g>

      {/* 흙 운동장 — 중하단 */}
      <rect x="0" y="88" width="90" height="72" fill="url(#thYground)" />
      <path d="M0 88 h90" stroke="#8a6a40" strokeWidth="0.8" />
      {/* 운동장 흙 질감 — 가로 흔적 */}
      {[95, 105, 118, 134, 150].map((y) => (
        <line key={y} x1="0" y1={y} x2="90" y2={y} stroke="#7a5a38" strokeWidth="0.4" opacity="0.45" />
      ))}

      {/* 돌우물 + 도르래 — 좌중단 */}
      <g>
        {/* 우물 기둥 틀 — 나무 두 기둥 */}
        <line x1="14" y1="88" x2="14" y2="70" stroke="#5a3e1e" strokeWidth="2" />
        <line x1="30" y1="88" x2="30" y2="70" stroke="#5a3e1e" strokeWidth="2" />
        {/* 도르래 가로대 */}
        <line x1="12" y1="70" x2="32" y2="70" stroke="#5a3e1e" strokeWidth="2.5" />
        {/* 도르래 바퀴 */}
        <circle cx="22" cy="70" r="3.5" fill="#7a6040" stroke="#5a3e1e" strokeWidth="1" />
        <circle cx="22" cy="70" r="1.5" fill="#4a3018" />
        {/* 도르래 줄 */}
        <line x1="22" y1="73.5" x2="22" y2="92" stroke="#7a5030" strokeWidth="0.8" />
        {/* 우물 돌담 */}
        <ellipse cx="22" cy="92" rx="12" ry="4" fill="#9a9080" stroke="#6a6056" strokeWidth="1" />
        <rect x="10" y="90" width="24" height="10" rx="1" fill="#8a8070" stroke="#6a6056" strokeWidth="1" />
        <ellipse cx="22" cy="90" rx="12" ry="4" fill="#7a7060" stroke="#6a6056" strokeWidth="1" />
        {/* 돌담 줄눈 */}
        {[92, 95, 98].map((y) => (
          <line key={y} x1="10" y1={y} x2="34" y2={y} stroke="#5a5040" strokeWidth="0.5" opacity="0.6" />
        ))}
      </g>

      {/* 현관 입구 — 하단 중앙 */}
      <g>
        {/* 계단 */}
        <rect x="32" y="148" width="26" height="4" fill="#c8b896" stroke="#9a8464" strokeWidth="0.7" />
        <rect x="34" y="144" width="22" height="4" fill="#baa882" stroke="#9a8464" strokeWidth="0.7" />
        {/* 신발장 */}
        <rect x="30" y="130" width="30" height="14" fill="#8a6a48" stroke="#5a3e1e" strokeWidth="0.8" />
        {[35, 42, 49, 56].map((x) => (
          <line key={x} x1={x} y1="130" x2={x} y2="144" stroke="#5a3e1e" strokeWidth="0.5" />
        ))}
        {/* 검정 고무신 한 켤레 암시 */}
        <ellipse cx="37" cy="140" rx="3.5" ry="2" fill="#1a1612" opacity="0.75" />
        <ellipse cx="50" cy="140" rx="3.5" ry="2" fill="#1a1612" opacity="0.75" />
      </g>

      <Vignette id="thYvig" strength={0.28} />
    </svg>
  )
}

/** R3 복도 — 저녁. 백열전구(상단) · 긴 복도 원근(중단~하단) · 교무실 미닫이문 · 게시판 */
function Hallway(): JSX.Element {
  return (
    <svg className="scene" viewBox="0 0 90 160" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        {/* 저녁 복도 — 남색+주황 대비 */}
        <linearGradient id="thHwall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a2e3a" />
          <stop offset="100%" stopColor="#1c2030" />
        </linearGradient>
        <linearGradient id="thHfloor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6a5030" />
          <stop offset="100%" stopColor="#4a3418" />
        </linearGradient>
        {/* 전구 따뜻한 빛 웅덩이 */}
        <radialGradient id="thHbulb" cx="50%" cy="16%" r="60%">
          <stop offset="0%" stopColor="#ffd590" stopOpacity="0.38" />
          <stop offset="55%" stopColor="#ffd590" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#ffd590" stopOpacity="0" />
        </radialGradient>
        {/* 하단 어둠 */}
        <linearGradient id="thHdark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.55" />
        </linearGradient>
      </defs>

      {/* 복도 벽 배경 */}
      <rect width="90" height="160" fill="url(#thHwall)" />

      {/* 천장 */}
      <rect x="0" y="0" width="90" height="12" fill="#1e1e2a" />

      {/* 백열전구 — 상단 중앙 */}
      <g>
        {/* 전선 */}
        <line x1="45" y1="0" x2="45" y2="14" stroke="#2a2a3a" strokeWidth="1.2" />
        {/* 소켓 */}
        <rect x="42" y="13" width="6" height="3" rx="1.2" fill="#3a3428" />
        {/* 전구 유리 */}
        <ellipse cx="45" cy="20" rx="5" ry="7" fill="#fff7d0" opacity="0.92" />
        <ellipse cx="45" cy="19" rx="3" ry="4.5" fill="#ffffff" opacity="0.6" />
        {/* 빛 아우라 */}
        <circle cx="45" cy="20" r="16" fill="#ffd590" opacity="0.22" />
      </g>
      {/* 빛 웅덩이 오버레이 */}
      <rect x="0" y="0" width="90" height="160" fill="url(#thHbulb)" />

      {/* 복도 좌벽 — 원근 소실점 방향 */}
      <polygon points="0,12 28,38 28,160 0,160" fill="#222636" />
      {/* 복도 우벽 — 원근 소실점 방향 */}
      <polygon points="90,12 62,38 62,160 90,160" fill="#1e2230" />
      {/* 복도 천장면 원근 */}
      <polygon points="0,12 90,12 62,38 28,38" fill="#191d28" />
      {/* 마룻바닥 원근 */}
      <polygon points="0,160 90,160 62,38 28,38" fill="url(#thHfloor)" />
      {/* 마루 결 */}
      {[50, 68, 88, 112, 140].map((y) => (
        <line key={y} x1={28 + (y - 38) * (0 / 122)} y1={y} x2={62 - (y - 38) * (0 / 122)} y2={y}
          stroke="#3a2810" strokeWidth="0.5" opacity="0.5" />
      ))}

      {/* 중앙선 소실점 */}
      <line x1="45" y1="38" x2="45" y2="160" stroke="#2a1e0e" strokeWidth="0.5" opacity="0.5" />

      {/* 교무실 미닫이문 — 우중단 */}
      <g>
        {/* 문틀 */}
        <rect x="55" y="68" width="20" height="50" fill="#4a3820" stroke="#2e2010" strokeWidth="1" />
        {/* 유리 창 */}
        <rect x="57" y="70" width="16" height="22" fill="#6a8098" opacity="0.4" stroke="#2e2010" strokeWidth="0.5" />
        {/* 유리 나뉨 */}
        <line x1="65" y1="70" x2="65" y2="92" stroke="#2e2010" strokeWidth="0.5" />
        <line x1="57" y1="81" x2="73" y2="81" stroke="#2e2010" strokeWidth="0.5" />
        {/* 문 손잡이 */}
        <circle cx="56.5" cy="95" r="1.4" fill="#9a8040" />
        {/* 교무실 문패 */}
        <rect x="58" y="95" width="12" height="5" rx="0.5" fill={CHALK} opacity="0.7" />
        <text x="64" y="99.5" fontSize="2.8" textAnchor="middle" fill="#2a2010" fontFamily="serif" opacity="0.8">교무실</text>
      </g>

      {/* 게시판 — 좌중단 벽 */}
      <g>
        {/* 게시판 틀 */}
        <rect x="6" y="56" width="20" height="36" rx="0.5" fill="#7a6040" stroke="#4a3820" strokeWidth="0.8" />
        {/* 게시판 면 */}
        <rect x="7.5" y="57.5" width="17" height="33" fill="#b0a07a" opacity="0.8" />
        {/* 게시물 — 한지 종이 */}
        <rect x="8.5" y="59" width="14" height="10" fill={CHALK} opacity="0.88" transform="rotate(-1 15 64)" />
        <rect x="9" y="71" width="13" height="9" fill={CHALK} opacity="0.8" transform="rotate(1 15 76)" />
        <rect x="8.5" y="82" width="8" height="6" fill={CHALK} opacity="0.75" />
        {/* 핀 */}
        {[[9, 59], [22, 59], [9, 71], [21, 71]].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="0.8" fill={RED} opacity="0.8" />
        ))}
      </g>

      {/* 석차 일람표 — 우상단 벽 (작게) */}
      <g>
        <rect x="66" y="40" width="18" height="22" fill={CHALK} opacity="0.75" stroke="#4a3820" strokeWidth="0.5" />
        {['一등 엄석대', '二등 김순길', '三등 이만복', '四등 박정구'].map((txt, i) => (
          <text key={i} x="75" y={45.5 + i * 4.2} fontSize="2.2" textAnchor="middle" fill="#2a1e10" fontFamily="serif">{txt}</text>
        ))}
      </g>

      {/* 하단 어둠 점층 */}
      <rect x="0" y="0" width="90" height="160" fill="url(#thHdark)" />

      <Vignette id="thHvig" strength={0.68} />
    </svg>
  )
}

/** R4 선거날 교실 — 새 봄 오후. 밝고 따뜻한 빛 · 개표판 칠판 암시 · 열린 창과 꽃가지 · 교탁 */
function Election(): JSX.Element {
  return (
    <svg className="scene" viewBox="0 0 90 160" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        {/* 봄 오후 따뜻한 벽 */}
        <linearGradient id="thEwall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d8ccaa" />
          <stop offset="100%" stopColor="#c8b896" />
        </linearGradient>
        {/* 오후 햇살 — 창 쪽(우) */}
        <radialGradient id="thEsun" cx="88%" cy="15%" r="70%">
          <stop offset="0%" stopColor="#fff3a0" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#fff3a0" stopOpacity="0" />
        </radialGradient>
        {/* 칠판 */}
        <linearGradient id="thEboard" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a6048" />
          <stop offset="100%" stopColor={BOARD} />
        </linearGradient>
      </defs>

      {/* 벽 */}
      <rect width="90" height="160" fill="url(#thEwall)" />

      {/* 천장 보 */}
      <rect x="0" y="0" width="90" height="10" fill="#a89070" />
      {[22, 44, 66].map((x) => (
        <rect key={x} x={x} y="0" width="4" height="10" fill="#9a8062" opacity="0.7" />
      ))}

      {/* 칠판 — 개표판 암시(빈 칸들). 좌상단 */}
      <rect x="3" y="11" width="50" height="32" rx="1" fill="url(#thEboard)" stroke="#1e3028" strokeWidth="1.2" />
      <rect x="3" y="11" width="50" height="2" fill="#5a4228" />
      <rect x="3" y="41" width="50" height="2.4" rx="0.5" fill="#5a4228" />
      {/* 개표판 — 이름 칸 4개(빈 칸, 디테일은 Objects.tsx) */}
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={6 + i * 12} y="14" width="10" height="26" rx="0.5"
          fill={BOARD} stroke={CHALK} strokeWidth="0.4" opacity="0.7" />
      ))}
      {/* 가로 구분선 */}
      <line x1="5" y1="20" x2="53" y2="20" stroke={CHALK} strokeWidth="0.4" opacity="0.5" />
      {/* 분필 받침대 */}
      <rect x="3" y="43" width="50" height="2.4" rx="0.8" fill="#5a4228" />
      {[8, 20, 32, 44].map((x) => (
        <rect key={x} x={x} y="43.5" width="3.5" height="1.4" rx="0.5" fill={CHALK} opacity="0.75" />
      ))}

      {/* 열린 창문 + 꽃가지 — 우상단 */}
      <g>
        {/* 창 틀 */}
        <rect x="58" y="11" width="28" height="34" rx="1" fill="#a8c4d8" opacity="0.3" stroke="#7a6448" strokeWidth="1" />
        {/* 열린 창짝 */}
        <rect x="58" y="11" width="13" height="34" rx="0.5" fill="#b0ccde" opacity="0.5" stroke="#7a6448" strokeWidth="0.7" />
        <rect x="73" y="11" width="13" height="34" rx="0.5" fill="#90aec4" opacity="0.5" stroke="#7a6448" strokeWidth="0.7" transform="rotate(-8 73 28)" />
        {/* 창밖 봄 하늘 */}
        <rect x="59" y="12" width="26" height="32" fill="#aad4ee" opacity="0.45" />
        {/* 꽃가지 — 창틀 넘어 실루엣 */}
        <path d="M72 12 q-4 6 -6 14 q-2 8 0 18" stroke="#5a3820" strokeWidth="1.4" fill="none" />
        {/* 꽃 — 벚꽃 느낌 */}
        {[[70, 16], [66, 22], [68, 28], [72, 33]].map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="2.2" fill="#f0c0c8" opacity="0.85" />
            <circle cx={x} cy={y} r="1" fill="#e89098" opacity="0.7" />
          </g>
        ))}
        {/* 햇살 사선 */}
        <polygon points="58,11 86,11 90,55 58,55" fill="#fff7c0" opacity="0.12" />
      </g>

      {/* 봄 햇살 오버레이 */}
      <rect x="0" y="0" width="90" height="160" fill="url(#thEsun)" />

      {/* 마룻바닥 */}
      <rect x="0" y="50" width="90" height="3" fill="#9a8462" />
      <FloorBoards y0={53} color="#9a7a56" />

      {/* 책걸상 줄 — 선거날, 비교적 앞쪽에 밀림 */}
      {[0, 1, 2].map((col) => {
        const bx = 8 + col * 28
        return (
          <g key={col}>
            <rect x={bx} y={80} width="20" height="12" rx="0.8" fill="#b09070" stroke="#7a5a38" strokeWidth="0.8" />
            <line x1={bx + 2} y1={92} x2={bx + 2} y2={102} stroke="#7a5a38" strokeWidth="1.2" />
            <line x1={bx + 18} y1={92} x2={bx + 18} y2={102} stroke="#7a5a38" strokeWidth="1.2" />
            {/* 기표 연습지 한 장 */}
            <rect x={bx + 3} y={76} width="13" height="8" rx="0.5" fill={CHALK} opacity="0.8" transform={`rotate(${col * 3 - 3} ${bx + 9} 80)`} />
          </g>
        )
      })}

      {/* 교탁 — 하단 중앙 */}
      <g>
        {/* 교탁 상판 */}
        <rect x="20" y="126" width="50" height="14" rx="1" fill="#8a6a40" stroke="#5a3e1e" strokeWidth="1.2" />
        {/* 교탁 몸통 */}
        <rect x="22" y="140" width="46" height="18" fill="#7a5e32" stroke="#5a3e1e" strokeWidth="1" />
        {/* 서랍 */}
        <rect x="26" y="143" width="18" height="10" rx="0.5" fill="#6a5028" stroke="#4a3018" strokeWidth="0.6" />
        <circle cx="35" cy="148" r="1.2" fill="#9a8040" />
        {/* 교탁 위 종이 */}
        <rect x="30" y="122" width="18" height="8" rx="0.5" fill={CHALK} opacity="0.85" transform="rotate(-2 39 126)" />
        {/* 잉크병 */}
        <rect x="55" y="122" width="5" height="7" rx="1" fill="#1a1e2a" stroke="#0e1016" strokeWidth="0.6" />
        <ellipse cx="57.5" cy="122" rx="3" ry="1.2" fill="#2a2e3a" />
      </g>

      {/* 참관 책상(우중단) */}
      <g>
        <rect x="66" y="100" width="20" height="12" rx="0.8" fill="#b09070" stroke="#7a5a38" strokeWidth="0.8" />
        <line x1="68" y1="112" x2="68" y2="122" stroke="#7a5a38" strokeWidth="1.2" />
        <line x1="84" y1="112" x2="84" y2="122" stroke="#7a5a38" strokeWidth="1.2" />
        {/* 서랍 열쇠 */}
        <rect x="70" y="96" width="14" height="8" rx="0.5" fill={CHALK} opacity="0.8" />
      </g>

      <Vignette id="thEvig" strength={0.28} />
    </svg>
  )
}

/** R5 그 밤의 교실 — 짙은 어둠 · 깨진 창 달빛 사선 · 마루 유리 반짝임 · 교탁 종이 실루엣 */
function NightClass(): JSX.Element {
  return (
    <svg className="scene" viewBox="0 0 90 160" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="thNwall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10141e" />
          <stop offset="100%" stopColor={NIGHT} />
        </linearGradient>
        {/* 달빛 사선 — 깨진 창에서 쏟아짐 */}
        <linearGradient id="thNmoon" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c8d8f0" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#c8d8f0" stopOpacity="0" />
        </linearGradient>
        {/* 마루 */}
        <linearGradient id="thNfloor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a2a18" />
          <stop offset="100%" stopColor="#1e1408" />
        </linearGradient>
        {/* 중앙 약한 빛 — 칠판 쪽 */}
        <radialGradient id="thNglow" cx="50%" cy="28%" r="50%">
          <stop offset="0%" stopColor="#c8d8f0" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#c8d8f0" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* 전체 어두운 배경 */}
      <rect width="90" height="160" fill="url(#thNwall)" />

      {/* 천장 */}
      <rect x="0" y="0" width="90" height="10" fill="#0c0e14" />

      {/* 칠판 — 달빛에 희미하게 */}
      <rect x="3" y="11" width="50" height="32" rx="1" fill="#1e3228" stroke="#0e1e14" strokeWidth="1" opacity="0.9" />
      {/* 칠판 분필 글씨 — 달빛에 희미 */}
      <text x="28" y="24" fontSize="2.8" textAnchor="middle" fill={CHALK} fontFamily="serif" opacity="0.22">엄석대를 다시 급장으로.</text>
      <text x="28" y="29" fontSize="2.8" textAnchor="middle" fill={CHALK} fontFamily="serif" opacity="0.18">모두 찬성이지?</text>
      {/* 분필 받침 실루엣 */}
      <rect x="3" y="43" width="50" height="2.4" rx="0.8" fill="#1a1208" />

      {/* 깨진 유리창 — 우상단. 달빛이 쏟아진다 */}
      <g>
        {/* 창 틀 */}
        <rect x="58" y="11" width="28" height="34" rx="1" fill="#1a2030" stroke="#0a0e18" strokeWidth="1" />
        {/* 달빛 창 안쪽 */}
        <rect x="59" y="12" width="26" height="32" fill="#8090b0" opacity="0.3" />
        {/* 창살 */}
        {[65, 72, 79].map((x) => (
          <line key={x} x1={x} y1="12" x2={x} y2="44" stroke="#0a0e18" strokeWidth="0.7" />
        ))}
        <line x1="59" y1="28" x2="85" y2="28" stroke="#0a0e18" strokeWidth="0.7" />
        {/* 깨진 유리 균열 — 특정 칸 */}
        <path d="M72 14 l5 6 l-3 4 l4 6 M74 14 l-2 5 l3 3 l-2 5" stroke="#c8d8f0" strokeWidth="0.6" fill="none" opacity="0.7" />
        {/* 뚫린 구멍 가장자리 */}
        <polygon points="71,19 76,16 80,21 77,26 72,24" fill="#10141e" opacity="0.9" />
        {[71, 76, 80, 77, 72].map((x, i) => {
          const ys = [19, 16, 21, 26, 24]
          return <line key={i} x1={x} y1={ys[i]} x2={[76, 80, 77, 72, 71][i]} y2={[16, 21, 26, 24, 19][i]}
            stroke="#c8d8f0" strokeWidth="0.7" opacity="0.6" />
        })}
      </g>

      {/* 달빛 사선 — 깨진 창에서 바닥까지 */}
      <polygon points="70,14 82,14 90,160 48,160" fill="url(#thNmoon)" opacity="0.7" />
      {/* 달빛 사선 중심 밝은 줄 */}
      <line x1="76" y1="14" x2="69" y2="160" stroke="#c8d8f0" strokeWidth="1.5" opacity="0.18" />

      {/* 약한 칠판 쪽 빛 */}
      <rect x="0" y="0" width="90" height="160" fill="url(#thNglow)" />

      {/* 마룻바닥 */}
      <rect x="0" y="50" width="90" height="3" fill="#1e1208" />
      <rect x="0" y="53" width="90" height="107" fill="url(#thNfloor)" />
      {/* 마루 결 */}
      {[58, 72, 88, 108, 130, 152].map((y) => (
        <line key={y} x1="0" y1={y} x2="90" y2={y} stroke="#0e0a04" strokeWidth="0.4" opacity="0.6" />
      ))}

      {/* 유리 조각 반짝임 — 달빛 사선 위 */}
      {[[68, 58], [72, 68], [66, 80], [76, 72], [80, 92], [64, 95]].map(([x, y], i) => (
        <polygon key={i}
          points={`${x},${y} ${x + 2},${y + 1} ${x + 1},${y + 3} ${x - 1},${y + 1}`}
          fill="#c8d8f0" opacity={0.5 + (i % 3) * 0.15}
        />
      ))}

      {/* 교탁 — 하단 중앙. 달빛에 실루엣 */}
      <g>
        <rect x="18" y="120" width="54" height="14" rx="1" fill="#1e150a" stroke="#0a0804" strokeWidth="1" />
        <rect x="20" y="134" width="50" height="20" fill="#180e06" stroke="#0a0804" strokeWidth="0.8" />
        {/* 답안지 더미 — 교탁 위, 달빛에 희게 보임 */}
        {[22, 34, 46, 58].map((x, i) => (
          <rect key={x} x={x} y={114 + (i % 2) * 2} width="12" height="8" rx="0.3"
            fill={CHALK} opacity={0.12 + (i % 2) * 0.05}
            transform={`rotate(${i * 3 - 4} ${x + 6} 118)`} />
        ))}
        {/* 잉크병 실루엣 */}
        <rect x="62" y="116" width="5" height="6" rx="1" fill="#10141e" />
      </g>

      {/* 학급일지 — 교탁 우상단 */}
      <g>
        <rect x="60" y="108" width="12" height="14" rx="0.5" fill="#2a2010" stroke="#0e0c06" strokeWidth="0.5" />
        {/* 학급일지 안 글자 흔적 */}
        {[111, 114, 117].map((y) => (
          <line key={y} x1="62" y1={y} x2="70" y2={y} stroke="#c8b890" strokeWidth="0.4" opacity="0.3" />
        ))}
        {/* ㅅ 획 버릇 — 특징적인 긴 첫 획 암시 */}
        <path d="M63 110.5 l3 3 l3 -3" stroke="#c8b890" strokeWidth="0.6" fill="none" opacity="0.5" strokeLinecap="round" />
      </g>

      {/* 게시판 상장 — 우중단 희미 */}
      <g opacity="0.35">
        <rect x="62" y="58" width="22" height="30" rx="0.5" fill="#2a2418" stroke="#1a1408" strokeWidth="0.5" />
        <rect x="63" y="59" width="20" height="28" fill="#3a3020" opacity="0.7" />
        <text x="73" y="70" fontSize="3" textAnchor="middle" fill={CHALK} fontFamily="serif" opacity="0.5">우등 一등</text>
      </g>

      <Vignette id="thNvig" strength={0.78} />
    </svg>
  )
}

// 방 id → 컴포넌트 레지스트리 (config.json rooms.id 와 일치)
const REGISTRY: Record<string, () => JSX.Element> = {
  'room-classroom': Classroom,
  'room-yard':      Yard,
  'room-hallway':   Hallway,
  'room-election':  Election,
  'room-night':     NightClass,
}

export function Scene({ roomId }: { roomId: string }) {
  const C = REGISTRY[roomId] ?? Classroom
  return (
    <>
      <C />
      {/* 떠다니는 분필 가루·먼지 입자 */}
      <div className="bubbles" aria-hidden="true">
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} style={{ left: `${6 + i * 12}%`, animationDelay: `${i * 1.9}s`, animationDuration: `${10 + (i % 4) * 3}s` }} />
        ))}
      </div>
    </>
  )
}
