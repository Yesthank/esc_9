import type { JSX } from 'react'

// 물체 = 히트박스. 배경 위에 얹히는 소품.
// 만장일치(esc_9) 테마: 1960년 시골 국민학교 — 칠판 녹 + 마루 갈 + 분필 한지 + 노을 주황 + 밤 남색 + 채점 붉음.
// 수채+색연필 느낌, 단순·가독 우선, 인물 미등장.
// (그라디언트 id 는 th- 프리픽스 고정)
const HANJI = '#efe6d0', HANJI_D = '#cbbd9a'
const BOARD = '#2e4e3e'   // 칠판 녹
const FLOOR = '#8a6a48'   // 마루 갈
const CHALK = '#efe6d0'   // 분필/한지
const AMBER = '#c9762b'   // 노을 주황
const NIGHT = '#1c2430'   // 밤 남색
const RED   = '#b5392b'   // 채점 붉음
const WOOD  = '#7a5a38', WOOD_D = '#4e3820'
const INK   = '#2a2218'
const IRON  = '#5a5a5a', IRON_D = '#3a3a3a'

type Kind =
  // R1 교실
  | 'timetable' | 'window' | 'notice' | 'drawerlock'
  | 'staffsheet' | 'musicchart' | 'organlock' | 'diary'
  | 'confiscated' | 'backgate'
  // R2 운동장
  | 'wellnote' | 'weeklog' | 'buckets' | 'welllock'
  | 'shoes' | 'shoelock' | 'frontgate'
  // R3 복도
  | 'ranks' | 'sealtray' | 'docket' | 'sealpencil'
  | 'filelock' | 'papers' | 'baglock' | 'classdoor'
  // R4 선거날
  | 'tallyboard' | 'rulesnote' | 'ballots' | 'watchlock'
  | 'podiumlock' | 'frontdoor'
  // R5 그 밤
  | 'chalktext' | 'award' | 'daybook' | 'brokenwindow'
  | 'exams' | 'dialdoor' | 'leftdiary' | 'poemprint'

const KIND_BY_LABEL: Record<string, Kind> = {
  // R1 교실
  '칠판 구석 내일 시간표': 'timetable',
  '유리창':               'window',
  '서랍의 알림장':        'notice',
  '책상 서랍':            'drawerlock',
  '보면대의 악보':        'staffsheet',
  '벽의 음악 괘도':       'musicchart',
  '풍금 뚜껑':            'organlock',
  '몰수품 상자':          'confiscated',
  '교실 뒷문':            'backgate',
  // R2 운동장
  '도르래의 쪽지':        'wellnote',
  '주번 일지':            'weeklog',
  '양동이 줄':            'buckets',
  '물당번 자물쇠':        'welllock',
  '신발장의 고무신':      'shoes',
  '신발장 자물쇠':        'shoelock',
  '본관 현관문':          'frontgate',
  // R3 복도
  '석차 일람표':          'ranks',
  '도장 보관함':          'sealtray',
  '결재 서류':            'docket',
  '필통의 도장 네 개':    'sealpencil',
  '서류함 자물쇠':        'filelock',
  '채점 답안지 넉 장':    'papers',
  '서류 가방 자물쇠':     'baglock',
  '6학년 교실 문':        'classdoor',
  // R4 선거날
  '개표 칠판':            'tallyboard',
  '개표 규칙 두 줄':      'rulesnote',
  '기표 연습지 더미':     'ballots',
  '참관 책상 서랍':       'watchlock',
  '교탁 자물쇠':          'podiumlock',
  '교실 앞문':            'frontdoor',
  // R5 그 밤
  '칠판의 글씨':          'chalktext',
  '게시판의 상장':        'award',
  '학급일지':             'daybook',
  '깨진 유리창과 라이터': 'brokenwindow',
  '답안지 여덟 장':       'exams',
  '답안지 자물쇠':        'dialdoor',
  '두고 간 일기장':       'leftdiary',
  '칠판의 시':            'poemprint',
}

export const CLUE_KEY_BY_LABEL: Record<string, string> = {
  '칠판 구석 내일 시간표': 'th-timetable',
  '유리창':               'th-window',
  '서랍의 알림장':        'th-notice',
  '보면대의 악보':        'th-staffsheet',
  '벽의 음악 괘도':       'th-anchor',
  '몰수품 상자':          'th-confiscated',
  '도르래의 쪽지':        'th-well',
  '주번 일지':            'th-weeklog',
  '양동이 줄':            'th-buckets',
  '신발장의 고무신':      'th-shoes',
  '석차 일람표':          'th-ranks',
  '도장 보관함':          'th-tray',
  '결재 서류':            'th-docket',
  '필통의 도장 네 개':    'th-seals',
  '채점 답안지 넉 장':    'th-papers',
  '개표 칠판':            'th-board',
  '개표 규칙 두 줄':      'th-rules',
  '기표 연습지 더미':     'th-ballots',
  '칠판의 글씨':          'th-question',
  '게시판의 상장':        'th-award',
  '학급일지':             'th-daybook',
  '깨진 유리창과 라이터': 'th-glass',
  '답안지 여덟 장':       'th-exams',
  '두고 간 일기장':       'th-diary',
}

type P = { open?: boolean; solved?: boolean }

/** SVG 래퍼 */
const S = (vb: string, c: JSX.Element) => (
  <svg className="object-art" viewBox={vb} preserveAspectRatio="xMidYMid meet" aria-hidden="true">{c}</svg>
)

/** 공용 그라디언트 정의 — id 접두사 th- */
const Defs = () => (
  <defs>
    <linearGradient id="thWood" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#9a7a52" /><stop offset="55%" stopColor={WOOD} /><stop offset="100%" stopColor={WOOD_D} />
    </linearGradient>
    <linearGradient id="thHanji" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor={HANJI} /><stop offset="100%" stopColor={HANJI_D} />
    </linearGradient>
    <linearGradient id="thBoard" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#3a6050" /><stop offset="60%" stopColor={BOARD} /><stop offset="100%" stopColor="#1e3428" />
    </linearGradient>
    <linearGradient id="thIron" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#7a7a7a" /><stop offset="60%" stopColor={IRON} /><stop offset="100%" stopColor={IRON_D} />
    </linearGradient>
    <linearGradient id="thFloor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#a07858" /><stop offset="60%" stopColor={FLOOR} /><stop offset="100%" stopColor="#5e4830" />
    </linearGradient>
    <radialGradient id="thGlow" cx="50%" cy="50%" r="60%">
      <stop offset="0%" stopColor="#ffd9a0" stopOpacity="0.5" /><stop offset="100%" stopColor="#ffd9a0" stopOpacity="0" />
    </radialGradient>
  </defs>
)

/** 해정 체크 표 */
const Check = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <path d={`M${x - 6 * s} ${y} l${4.6 * s} ${5.4 * s} l${8 * s} -${10 * s}`} fill="none"
    stroke="#9fd49a" strokeWidth={2.6 * s} strokeLinecap="round" strokeLinejoin="round" opacity="0.95" />
)

/** 자물쇠 U자 걸쇠 — solved: 옆으로 젖혀짐 */
const Shackle = ({ cx, top, solved }: { cx: number; top: number; solved?: boolean }) => (
  <g transform={solved ? `rotate(40 ${cx + 16} ${top + 12})` : undefined}>
    <path d={`M${cx - 16} ${top + 12} q0 -12 16 -12 q16 0 16 12`} fill="none" stroke="#6a6a6a" strokeWidth="5.5" />
    <path d={`M${cx - 16} ${top + 12} q0 -12 16 -12`} fill="none" stroke="#c0c0b0" strokeWidth="1.4" opacity="0.55" />
  </g>
)

/** 다이얼 창 — solved: 주황빛 채움 */
const Windows = ({ xs, y, w = 12, h = 18, solved, glyphs }: {
  xs: number[]; y: number; w?: number; h?: number; solved?: boolean; glyphs?: string[]
}) => (
  <g>
    {xs.map((x, i) => (
      <g key={i}>
        <rect x={x} y={y} width={w} height={h} rx="2" fill={NIGHT} stroke={IRON} strokeWidth="1" />
        <rect x={x + 1.2} y={y + 1.2} width={w - 2.4} height={h * 0.26} rx="1.2" fill="#cfe0ff" opacity="0.06" />
        {solved && <rect x={x + 1.2} y={y + 1.2} width={w - 2.4} height={h - 2.4} rx="1.4" fill={AMBER} opacity="0.28" />}
        {solved && glyphs?.[i] && (
          <text x={x + w / 2} y={y + h / 2 + h * 0.18} textAnchor="middle" fontSize={h * 0.52}
            fontFamily="serif" fill="#efd9a0">{glyphs[i]}</text>
        )}
      </g>
    ))}
  </g>
)

/* ─────────────── R1 교실 ─────────────── */

/** 시간표 — 칠판 귀퉁이 분필 격자 6칸 */
const Timetable = (_: P) => S('0 0 96 76', (
  <g transform="rotate(-1.5 48 38)">
    <Defs />
    {/* 칠판 배경 조각 */}
    <rect x="5" y="5" width="86" height="66" rx="3" fill="url(#thBoard)" stroke="#1a3022" strokeWidth="1.4" />
    {/* 분필 격자 — 6행 1열 */}
    {['체육', '음악', '산수', '미술', '자연', '국어'].map((sub, i) => (
      <g key={sub}>
        <line x1="14" y1={13 + i * 9} x2="82" y2={13 + i * 9} stroke={CHALK} strokeWidth="0.6" opacity="0.4" />
        <text x="18" y={20 + i * 9} fontSize="7.2" fontFamily="serif" fill={CHALK} opacity="0.88">{i + 1}교시</text>
        <text x="50" y={20 + i * 9} fontSize="7.8" fontFamily="serif" fill={CHALK} opacity="0.95">{sub}</text>
      </g>
    ))}
    <line x1="44" y1="11" x2="44" y2="67" stroke={CHALK} strokeWidth="0.7" opacity="0.35" />
  </g>
))

/** 유리창 — 왜곡 격자 4분할 */
const Window = (_: P) => S('0 0 96 80', (
  <g>
    <Defs />
    {/* 창틀 */}
    <rect x="7" y="7" width="82" height="66" rx="2" fill="#d8e8f0" stroke={WOOD_D} strokeWidth="2.4" />
    {/* 유리 4분할 — 약간 왜곡 */}
    <line x1="48" y1="7" x2="48" y2="73" stroke={WOOD_D} strokeWidth="2.4" />
    <line x1="7" y1="40" x2="89" y2="40" stroke={WOOD_D} strokeWidth="2.4" />
    {/* 유리 반사 굴곡 — 수채 느낌 */}
    <path d="M12 14 q6 3 10 -2 q4 -3 8 1" stroke="#c0d8e8" strokeWidth="1" fill="none" opacity="0.7" />
    <path d="M52 14 q5 4 9 -1 q3 -3 7 2" stroke="#c0d8e8" strokeWidth="1" fill="none" opacity="0.7" />
    <path d="M12 48 q7 3 12 -2" stroke="#c0d8e8" strokeWidth="1" fill="none" opacity="0.65" />
    {/* 손자국 흔적 */}
    <path d="M30 22 q2 3 0 6" stroke="#aac0d0" strokeWidth="1.4" fill="none" opacity="0.5" strokeLinecap="round" />
    <path d="M33 20 q2 4 0 7" stroke="#aac0d0" strokeWidth="1.2" fill="none" opacity="0.45" strokeLinecap="round" />
    <path d="M36 21 q2 4 0 7" stroke="#aac0d0" strokeWidth="1.2" fill="none" opacity="0.45" strokeLinecap="round" />
  </g>
))

/** 알림장 — 공책 낱장, 네 줄 준비물 */
const Notice = (_: P) => S('0 0 88 76', (
  <g transform="rotate(2 44 38)">
    <Defs />
    <path d="M13 9 h62 v58 h-62 z" fill="#1a1210" opacity="0.35" transform="translate(1.4 1.4)" />
    <rect x="12" y="8" width="62" height="58" rx="2" fill="url(#thHanji)" stroke="#a8946a" strokeWidth="1.2" />
    {/* 줄칸 왼쪽 붉은 세로선 */}
    <line x1="22" y1="10" x2="22" y2="64" stroke={RED} strokeWidth="1" opacity="0.7" />
    {/* 준비물 네 줄 */}
    {['산수 책', '자연 채집통', '음악 풍금 보표', '국어 받아쓰기 공책'].map((t, i) => (
      <g key={i}>
        <line x1="14" y1={21 + i * 11} x2="70" y2={21 + i * 11} stroke="#b4a47e" strokeWidth="0.7" opacity="0.55" />
        <text x="26" y={19 + i * 11} fontSize="6.2" fontFamily="serif" fill={INK} opacity="0.92">{t}</text>
      </g>
    ))}
  </g>
))

/** 책상 서랍 — 노끈으로 묶인 자물쇠, solved: 노끈 풀림 */
const DrawerLock = ({ solved }: P) => S('0 0 96 80', (
  <g>
    <Defs />
    {/* 서랍 본체 */}
    <rect x="8" y="16" width="80" height="56" rx="3" fill="url(#thWood)" stroke={WOOD_D} strokeWidth="1.6" />
    <rect x="8" y="16" width="80" height="8" rx="3" fill={WOOD_D} opacity="0.5" />
    {/* 손잡이 */}
    <ellipse cx="48" cy="44" rx="14" ry="5" fill="none" stroke={IRON} strokeWidth="2.4" />
    {solved ? (
      /* 노끈 풀림 — 양 끝 흩어짐 */
      <g>
        <path d="M24 44 q-4 -6 -8 -4" stroke="#b8a060" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M72 44 q4 -5 8 -3" stroke="#b8a060" strokeWidth="2" fill="none" strokeLinecap="round" />
        <Check x={48} y={60} s={0.85} />
      </g>
    ) : (
      /* 노끈 묶임 — 가로로 두 번 감아 매듭 */
      <g>
        <path d="M24 44 h48" stroke="#b8a060" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <path d="M24 48 h48" stroke="#b8a060" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <circle cx="48" cy="46" r="4" fill="none" stroke="#b8a060" strokeWidth="2.2" />
        <path d="M46 43 l4 6 M50 43 l-4 6" stroke="#b8a060" strokeWidth="1.4" strokeLinecap="round" />
      </g>
    )}
  </g>
))

/** 악보 — 보면대 위, 오선 + 콩나물 4개 */
const StaffSheet = (_: P) => S('0 0 96 72', (
  <g transform="rotate(-1 48 36)">
    <Defs />
    <path d="M11 9 h74 v54 h-74 z" fill="#1a1210" opacity="0.3" transform="translate(1.4 1.4)" />
    <rect x="10" y="8" width="74" height="54" rx="2" fill="url(#thHanji)" stroke="#a8946a" strokeWidth="1.2" />
    {/* 오선 5줄 */}
    {[0, 1, 2, 3, 4].map((i) => (
      <line key={i} x1="14" y1={22 + i * 6} x2="80" y2={22 + i * 6} stroke="#8a7a5a" strokeWidth="0.9" opacity="0.8" />
    ))}
    {/* 콩나물 4개 — 높이 다름: 위(5)·아래(2)·더위(7)·중간(3) */}
    {[
      { x: 24, line: 5 }, { x: 40, line: 2 }, { x: 56, line: 7 }, { x: 72, line: 3 },
    ].map(({ x, line }, i) => {
      // line=1이 맨위, line=9이 맨아래 기준 — 오선 위아래 포함
      const cy = 22 + (9 - line) * 3
      return (
        <g key={i}>
          {/* 음표 머리 */}
          <ellipse cx={x} cy={cy} rx="4" ry="3" fill={INK} transform={`rotate(-15 ${x} ${cy})`} />
          {/* 기둥 */}
          <line x1={x + 3.5} y1={cy} x2={x + 3.5} y2={cy - 12} stroke={INK} strokeWidth="1.2" />
        </g>
      )
    })}
    {/* 보표 시작 세로선 */}
    <line x1="14" y1="22" x2="14" y2="46" stroke="#5a4a2a" strokeWidth="1.6" />
  </g>
))

/** 음악 괘도 — 벽걸이 차트, 건반 그림 + 붉은 단추 */
const MusicChart = (_: P) => S('0 0 100 72', (
  <g>
    <Defs />
    {/* 종이 배경 */}
    <rect x="8" y="6" width="84" height="58" rx="2" fill="url(#thHanji)" stroke="#a8946a" strokeWidth="1.2" />
    <rect x="8" y="6" width="84" height="5" fill={WOOD} opacity="0.5" />
    {/* 제목 줄 */}
    <text x="50" y="19" textAnchor="middle" fontSize="7" fontFamily="serif" fill={INK} opacity="0.9">음 악 괘 도</text>
    <line x1="14" y1="22" x2="86" y2="22" stroke="#a8946a" strokeWidth="0.8" opacity="0.6" />
    {/* 건반 그림 — 8개 흰건반, 5개 검은건반 */}
    {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
      <rect key={i} x={14 + i * 9} y="28" width="8" height="22" rx="1" fill={HANJI} stroke="#8a7a5a" strokeWidth="0.8" />
    ))}
    {[0, 1, 3, 4, 5].map((i) => (
      <rect key={i} x={19 + i * 9} y="28" width="5.5" height="14" rx="1" fill={INK} />
    ))}
    {/* 맨 왼쪽(도) 건반에 붉은 단추 */}
    <circle cx="18" cy="46" r="3.2" fill={RED} opacity="0.9" />
    {/* 설명 줄 */}
    <text x="50" y="60" textAnchor="middle" fontSize="5.8" fontFamily="serif" fill="#5a4a2a" opacity="0.85">맨 아랫줄이 도(do)다</text>
  </g>
))

/** 풍금 뚜껑 — 자물쇠 걸쇠, solved: 열림 */
const OrganLock = ({ solved }: P) => S('0 0 100 84', (
  <g>
    <Defs />
    {/* 풍금 본체 */}
    <rect x="6" y="28" width="88" height="52" rx="3" fill="url(#thWood)" stroke={WOOD_D} strokeWidth="1.6" />
    {/* 뚜껑 — solved 면 살짝 들림 */}
    <g transform={solved ? 'rotate(-9 8 28)' : undefined}>
      <rect x="6" y="16" width="88" height="14" rx="2.6" fill="url(#thWood)" stroke={WOOD_D} strokeWidth="1.4" />
      <path d="M18 23 q6 -3 10 0 M58 23 q6 -3 10 0" stroke={WOOD_D} strokeWidth="1" fill="none" opacity="0.5" />
    </g>
    {/* 건반 줄임 표현 */}
    {[0, 1, 2, 3, 4, 5, 6].map((i) => (
      <rect key={i} x={14 + i * 10} y="34" width="9" height="16" rx="0.8" fill={HANJI} stroke="#8a7a5a" strokeWidth="0.7" />
    ))}
    {/* 걸쇠 자물쇠 */}
    <Shackle cx={50} top={6} solved={solved} />
    <rect x="36" y="18" width="28" height="14" rx="3" fill="url(#thIron)" stroke={IRON_D} strokeWidth="1" />
    {solved && <Check x={50} y={26} s={0.75} />}
    {!solved && <rect x="48.8" y="22" width="2.4" height="6" rx="1" fill={IRON_D} />}
  </g>
))

/** 일기장 — 풍금 의자 밑, 갈피 낙서 보임 */
const Diary = (_: P) => S('0 0 88 68', (
  <g transform="rotate(3 44 34)">
    <Defs />
    <path d="M13 11 h62 v46 h-62 z" fill="#1a1210" opacity="0.3" transform="translate(1.4 1.4)" />
    <rect x="12" y="10" width="62" height="46" rx="2" fill="url(#thHanji)" stroke="#a8946a" strokeWidth="1.2" />
    {/* 표지 색 띠 */}
    <rect x="12" y="10" width="8" height="46" fill={BOARD} opacity="0.7" />
    {/* 펼친 갈피 — 번지 낙서 */}
    {['13:1', '33:2', '14:2'].map((t, i) => (
      <text key={i} x="30" y={24 + i * 11} fontSize="7.4" fontFamily="serif" fontWeight="700" fill={RED} opacity="0.85">{t}</text>
    ))}
    {[32, 43, 54].map((y) => (
      <line key={y} x1="26" y1={y} x2="70" y2={y} stroke="#b4a47e" strokeWidth="0.7" opacity="0.4" />
    ))}
  </g>
))

/** 몰수품 상자 — 나무 상자 + 라이터 은빛 */
const Confiscated = (_: P) => S('0 0 96 72', (
  <g>
    <Defs />
    <rect x="8" y="20" width="80" height="48" rx="3" fill="url(#thWood)" stroke={WOOD_D} strokeWidth="1.6" />
    {/* 상자 테 두 줄 */}
    <line x1="8" y1="34" x2="88" y2="34" stroke={WOOD_D} strokeWidth="2" />
    <line x1="8" y1="56" x2="88" y2="56" stroke={WOOD_D} strokeWidth="2" />
    {/* 구슬 하나 */}
    <circle cx="28" cy="45" r="5" fill="#8ac8e0" opacity="0.85" stroke="#5090a8" strokeWidth="0.8" />
    <circle cx="26.5" cy="43.2" r="1.8" fill="#d8f0f8" opacity="0.6" />
    {/* 딱지 */}
    <rect x="38" y="38" width="14" height="14" rx="1" fill={AMBER} opacity="0.8" stroke="#8a5020" strokeWidth="0.8" />
    <path d="M39 42 h12 M39 46 h12" stroke="#8a5020" strokeWidth="0.7" opacity="0.6" />
    {/* 라이터 — 은빛 직육면체 */}
    <rect x="58" y="36" width="12" height="20" rx="2" fill={IRON} stroke="#3a3a3a" strokeWidth="1" />
    <rect x="59" y="37" width="5" height="6" rx="0.8" fill="#888" />
    <rect x="64" y="37" width="5.5" height="4" rx="0.8" fill="#ccc" opacity="0.8" />
    <line x1="63" y1="43" x2="69" y2="43" stroke="#5a5a5a" strokeWidth="0.8" opacity="0.7" />
  </g>
))

/** 교실 뒷문 — 미닫이 나무문 */
const BackGate = ({ open }: P) => S('0 0 76 110', (
  <g>
    <Defs />
    {open ? (
      <g>
        {/* 문이 옆으로 열림 */}
        <rect x="4" y="8" width="20" height="98" rx="2" fill="url(#thWood)" stroke={WOOD_D} strokeWidth="1.4" />
        <path d="M26 8 h46 v98 h-46 z" fill={NIGHT} opacity="0.85" />
        <ellipse cx="48" cy="58" rx="10" ry="18" fill="#d8e8f8" opacity="0.1" />
      </g>
    ) : (
      <g>
        <rect x="5" y="8" width="66" height="98" rx="2" fill="url(#thWood)" stroke={WOOD_D} strokeWidth="1.6" />
        {[20, 35, 50].map((x) => <line key={x} x1={x} y1="12" x2={x} y2="104" stroke={WOOD_D} strokeWidth="1" opacity="0.65" />)}
        <rect x="4" y="52" width="68" height="6" rx="2" fill={IRON} stroke={IRON_D} strokeWidth="1" />
        <circle cx="38" cy="72" r="5" fill="none" stroke={IRON} strokeWidth="1.6" opacity="0.9" />
        <rect x="36.8" y="72" width="2.4" height="6.4" rx="1" fill={IRON} opacity="0.9" />
      </g>
    )}
  </g>
))

/* ─────────────── R2 운동장 ─────────────── */

/** 도르래 쪽지 — 줄에 묶인 쪽지 */
const WellNote = (_: P) => S('0 0 84 76', (
  <g>
    <Defs />
    {/* 도르래 줄 */}
    <line x1="42" y1="5" x2="42" y2="24" stroke="#9a8a6a" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="42" cy="5" r="3.4" fill={IRON} stroke={IRON_D} strokeWidth="1" />
    {/* 쪽지 */}
    <g transform="rotate(-4 42 44)">
      <path d="M18 24 h48 l3 6 v26 l-4 4 H22 l-4 -5 z" fill="#1a1210" opacity="0.3" transform="translate(1.4 1.4)" />
      <path d="M18 24 h48 l3 6 v26 l-4 4 H22 l-4 -5 z" fill="url(#thHanji)" stroke="#a8946a" strokeWidth="1" />
      {[31, 39, 47].map((y) => <line key={y} x1="24" y1={y} x2="62" y2={y} stroke="#8a7a5a" strokeWidth="0.9" opacity="0.6" />)}
      <text x="42" y="64" textAnchor="middle" fontSize="5.8" fontFamily="serif" fill="#5a4a2a" opacity="0.8">가까운 차례</text>
    </g>
  </g>
))

/** 주번 일지 — 고리에 걸린 공책 */
const Weeklog = (_: P) => S('0 0 88 80', (
  <g transform="rotate(1.5 44 40)">
    <Defs />
    {/* 고리 */}
    <circle cx="44" cy="8" r="5" fill="none" stroke={IRON} strokeWidth="2.4" />
    <rect x="42" y="8" width="4" height="10" fill={WOOD_D} />
    {/* 공책 */}
    <path d="M14 16 h60 v52 h-60 z" fill="#1a1210" opacity="0.3" transform="translate(1.4 1.4)" />
    <rect x="13" y="15" width="60" height="52" rx="2" fill="url(#thHanji)" stroke="#a8946a" strokeWidth="1.2" />
    <rect x="13" y="15" width="7" height="52" fill={BOARD} opacity="0.6" />
    {[25, 34, 43, 52, 61].map((y) => <line key={y} x1="24" y1={y} x2="68" y2={y} stroke="#b4a47e" strokeWidth="0.7" opacity="0.55" />)}
    <text x="44" y="32" textAnchor="middle" fontSize="6.4" fontFamily="serif" fill={INK} opacity="0.9">주번일지</text>
  </g>
))

/** 양동이 줄 — 함석 양동이 4개, 우물 근처 */
const Buckets = (_: P) => S('0 0 120 80', (
  <g>
    <Defs />
    {/* 우물 앞 땅 선 */}
    <line x1="6" y1="64" x2="114" y2="64" stroke="#7a6a4a" strokeWidth="1.4" opacity="0.6" />
    {/* 양동이 4개 — 번호 표찰 + 걸음수 */}
    {[
      { x: 12, num: '②', steps: '10걸음' }, { x: 40, num: '③', steps: '12걸음' },
      { x: 68, num: '①', steps: '7걸음' },  { x: 96, num: '④', steps: '3걸음' },
    ].map(({ x, num, steps }, i) => (
      <g key={i}>
        {/* 양동이 몸통(함석) */}
        <path d={`M${x + 2} 38 l-2 24 h18 l-2 -24 z`} fill={IRON} stroke={IRON_D} strokeWidth="1" />
        <ellipse cx={x + 9} cy="38" rx="9" ry="3.2" fill="#808080" />
        {/* 손잡이 줄 */}
        <path d={`M${x + 1} 38 q-4 -8 8 -8 q12 0 8 8`} fill="none" stroke="#7a7a7a" strokeWidth="1.4" strokeLinecap="round" />
        {/* 번호 */}
        <text x={x + 9} y="54" textAnchor="middle" fontSize="7.6" fontFamily="serif" fill={CHALK} opacity="0.9">{num}</text>
        {/* 걸음수 */}
        <text x={x + 9} y="72" textAnchor="middle" fontSize="5.2" fontFamily="serif" fill="#6a5a3a" opacity="0.8">{steps}</text>
      </g>
    ))}
  </g>
))

/** 물당번 자물쇠 — 우물 뚜껑 맹꽁이 */
const WellLock = ({ solved }: P) => S('0 0 90 96', (
  <g>
    <Defs />
    {/* 우물 뚜껑 */}
    <ellipse cx="45" cy="62" rx="40" ry="14" fill="url(#thWood)" stroke={WOOD_D} strokeWidth="1.6" />
    <ellipse cx="45" cy="60" rx="40" ry="14" fill="url(#thWood)" stroke={WOOD_D} strokeWidth="1.6" />
    {/* 빗장 */}
    <rect x="24" y="56" width="42" height="7" rx="2" fill={IRON} stroke={IRON_D} strokeWidth="1" />
    {/* 걸쇠 */}
    <Shackle cx={45} top={14} solved={solved} />
    <rect x="32" y="26" width="26" height="34" rx="5" fill="url(#thIron)" stroke={IRON_D} strokeWidth="1.4" />
    <Windows xs={[37, 48]} y={34} w={10} h={15} solved={solved} />
    {!solved && [37, 48].map((x) => (
      <text key={x} x={x + 5} y={45.6} textAnchor="middle" fontSize="9" fontFamily="serif" fill={CHALK}>－</text>
    ))}
    {solved && <Check x={45} y={52} s={0.75} />}
  </g>
))

/** 고무신 — 검정 고무신 켤레들, 문수 표시 */
const Shoes = (_: P) => S('0 0 112 72', (
  <g>
    <Defs />
    {/* 신발장 선반 */}
    <rect x="5" y="54" width="102" height="5" rx="1.5" fill={WOOD_D} opacity="0.8" />
    {/* 고무신 4켤레 */}
    {[
      { x: 8,  munsu: '9문',   ch: '거' },
      { x: 34, munsu: '9문반', ch: '선' },
      { x: 60, munsu: '10문',  ch: '장' },
      { x: 84, munsu: '10문반',ch: '급' },
    ].map(({ x, munsu, ch }, i) => (
      <g key={i}>
        {/* 신발 실루엣 — 검정 고무신 */}
        <path d={`M${x + 2} 52 q0 -12 8 -14 q8 -2 12 2 q3 4 2 12 z`}
          fill="#1a1a1a" stroke="#3a3a3a" strokeWidth="0.8" />
        <path d={`M${x + 3} 46 q4 -8 10 -8`} stroke="#4a4a4a" strokeWidth="0.8" fill="none" opacity="0.7" />
        {/* 문수 */}
        <text x={x + 12} y="68" textAnchor="middle" fontSize="5" fontFamily="serif" fill="#6a5a3a" opacity="0.85">{munsu}</text>
        {/* 안창 글자 */}
        <text x={x + 12} y="43" textAnchor="middle" fontSize="7.8" fontFamily="serif" fontWeight="700" fill={RED} opacity="0.9">{ch}</text>
      </g>
    ))}
  </g>
))

/** 신발장 자물쇠 — 맹꽁이 */
const ShoeLock = ({ solved }: P) => S('0 0 80 90', (
  <g>
    <Defs />
    <Shackle cx={40} top={12} solved={solved} />
    <rect x="14" y="24" width="52" height="58" rx="7" fill="url(#thIron)" stroke={IRON_D} strokeWidth="2" />
    <Windows xs={[20, 33, 46]} y={36} w={11} h={17} solved={solved} />
    {!solved && [20, 33, 46].map((x) => (
      <text key={x} x={x + 5.5} y={48.5} textAnchor="middle" fontSize="9" fontFamily="serif" fill={CHALK}>－</text>
    ))}
    <circle cx="40" cy="68" r="4" fill={NIGHT} stroke={IRON_D} strokeWidth="1" />
    {solved && <Check x={40} y={65} s={0.85} />}
  </g>
))

/** 현관문 — 본관 나무문 */
const FrontGate = ({ open }: P) => S('0 0 76 110', (
  <g>
    <Defs />
    {open ? (
      <g>
        <rect x="4" y="8" width="22" height="98" rx="2" fill="url(#thWood)" stroke={WOOD_D} strokeWidth="1.4" />
        <rect x="26" y="8" width="46" height="98" fill={NIGHT} opacity="0.88" />
        <ellipse cx="50" cy="58" rx="8" ry="16" fill="#c8e0f0" opacity="0.1" />
      </g>
    ) : (
      <g>
        <rect x="5" y="8" width="66" height="98" rx="2" fill="url(#thWood)" stroke={WOOD_D} strokeWidth="1.6" />
        {[22, 38, 54].map((x) => <line key={x} x1={x} y1="12" x2={x} y2="104" stroke={WOOD_D} strokeWidth="1" opacity="0.6" />)}
        <rect x="4" y="54" width="68" height="6" rx="2" fill={IRON} stroke={IRON_D} strokeWidth="1" />
        <circle cx="38" cy="76" r="5" fill="none" stroke={IRON} strokeWidth="1.6" opacity="0.9" />
        <rect x="36.8" y="76" width="2.4" height="7" rx="1" fill={IRON} opacity="0.9" />
      </g>
    )}
  </g>
))

/* ─────────────── R3 복도 ─────────────── */

/** 석차 일람표 — 문에 붙은 종이, 석차 네 줄 */
const Ranks = (_: P) => S('0 0 96 80', (
  <g transform="rotate(-1.5 48 40)">
    <Defs />
    <path d="M13 9 h70 v62 h-70 z" fill="#1a1210" opacity="0.3" transform="translate(1.4 1.4)" />
    <rect x="12" y="8" width="70" height="62" rx="2" fill="url(#thHanji)" stroke="#a8946a" strokeWidth="1.2" />
    {/* 제목 */}
    <text x="47" y="20" textAnchor="middle" fontSize="6.8" fontFamily="serif" fill={INK} opacity="0.9">석차 일람표</text>
    <line x1="14" y1="23" x2="78" y2="23" stroke="#a8946a" strokeWidth="0.9" opacity="0.65" />
    {/* 석차 4줄 */}
    {[['一등', '엄석대'], ['二등', '김순길'], ['三등', '이만복'], ['四등', '박정구']].map(([r, n], i) => (
      <g key={i}>
        <text x="22" y={34 + i * 11} fontSize="6.8" fontFamily="serif" fill={RED} opacity="0.9">{r}</text>
        <text x="46" y={34 + i * 11} fontSize="7.2" fontFamily="serif" fill={INK} opacity="0.92">{n}</text>
      </g>
    ))}
  </g>
))

/** 도장 보관함 — 홈 4개, 방위 흠집 표시 */
const SealTray = (_: P) => S('0 0 104 72', (
  <g>
    <Defs />
    <rect x="7" y="14" width="90" height="48" rx="3" fill="url(#thWood)" stroke={WOOD_D} strokeWidth="1.6" />
    {/* 홈 4개 + 방위 흠집 */}
    {[
      { x: 16, dir: '왼' }, { x: 38, dir: '위' }, { x: 60, dir: '오른' }, { x: 82, dir: '아래' },
    ].map(({ x, dir }, i) => (
      <g key={i}>
        {/* 홈 */}
        <ellipse cx={x + 9} cy="38" rx="8" ry="5" fill={WOOD_D} stroke="#2e1e0c" strokeWidth="1" />
        {/* 차례 숫자 */}
        <text x={x + 9} y="24" textAnchor="middle" fontSize="6" fontFamily="serif" fill={HANJI_D} opacity="0.85">{['첫째', '둘째', '셋째', '넷째'][i]}</text>
        {/* 방위 흠집 방향 텍스트 */}
        <text x={x + 9} y="54" textAnchor="middle" fontSize="5.4" fontFamily="serif" fill={RED} opacity="0.8">{dir}</text>
      </g>
    ))}
  </g>
))

/** 결재 서류 — 붉은 인영 4칸 */
const Docket = (_: P) => S('0 0 100 80', (
  <g transform="rotate(1.5 50 40)">
    <Defs />
    <path d="M11 9 h78 v62 h-78 z" fill="#1a1210" opacity="0.3" transform="translate(1.4 1.4)" />
    <rect x="10" y="8" width="78" height="62" rx="2" fill="url(#thHanji)" stroke="#a8946a" strokeWidth="1.2" />
    {/* 결재란 4칸 + 인영 */}
    {[
      { x: 16, n: '7', notch: 'top'   },
      { x: 36, n: '2', notch: 'bot'   },
      { x: 56, n: '5', notch: 'left'  },
      { x: 76, n: '9', notch: 'right' },
    ].map(({ x, n, notch }, i) => (
      <g key={i}>
        <rect x={x - 6} y="24" width="16" height="26" rx="1.2" fill="none" stroke="#a8946a" strokeWidth="0.9" opacity="0.7" />
        {/* 인영 원 */}
        <circle cx={x + 2} cy="37" r="6.4" fill="none" stroke={RED} strokeWidth="1.2" opacity="0.85" />
        {/* 흠집 방향 이빠짐 */}
        {notch === 'top'   && <line x1={x + 2} y1="30.8" x2={x + 2} y2="33" stroke={HANJI} strokeWidth="2.4" />}
        {notch === 'bot'   && <line x1={x + 2} y1="41" x2={x + 2} y2="43.2" stroke={HANJI} strokeWidth="2.4" />}
        {notch === 'left'  && <line x1={x - 4.4} y1="37" x2={x - 2.2} y2="37" stroke={HANJI} strokeWidth="2.4" />}
        {notch === 'right' && <line x1={x + 6.2} y1="37" x2={x + 8.4} y2="37" stroke={HANJI} strokeWidth="2.4" />}
        {/* 부수 */}
        <text x={x + 2} y="59" textAnchor="middle" fontSize="6.2" fontFamily="serif" fill={INK} opacity="0.85">{n}부</text>
      </g>
    ))}
  </g>
))

/** 필통의 도장 네 개 — 인면 흠집 방위 */
const SealPencil = (_: P) => S('0 0 112 72', (
  <g>
    <Defs />
    {/* 필통 바닥 */}
    <rect x="6" y="44" width="100" height="20" rx="3" fill="url(#thWood)" stroke={WOOD_D} strokeWidth="1.4" />
    {/* 도장 4개 */}
    {[
      { x: 14, notch: 'bot'   },
      { x: 38, notch: 'right' },
      { x: 62, notch: 'left'  },
      { x: 86, notch: 'top'   },
    ].map(({ x, notch }, i) => (
      <g key={i}>
        {/* 손잡이 */}
        <rect x={x} y="10" width="14" height="34" rx="2" fill={WOOD} stroke={WOOD_D} strokeWidth="1" />
        {/* 인면 */}
        <rect x={x} y="42" width="14" height="10" rx="1.2" fill="#c8a070" stroke="#8a6030" strokeWidth="0.8" />
        {/* 흠집 */}
        {notch === 'top'   && <line x1={x + 7} y1="10" x2={x + 7} y2="14" stroke={RED} strokeWidth="2.2" strokeLinecap="round" />}
        {notch === 'bot'   && <line x1={x + 7} y1="40" x2={x + 7} y2="44" stroke={RED} strokeWidth="2.2" strokeLinecap="round" />}
        {notch === 'left'  && <line x1={x}     y1="27" x2={x + 4} y2="27" stroke={RED} strokeWidth="2.2" strokeLinecap="round" />}
        {notch === 'right' && <line x1={x + 10} y1="27" x2={x + 14} y2="27" stroke={RED} strokeWidth="2.2" strokeLinecap="round" />}
      </g>
    ))}
  </g>
))

/** 서류함 자물쇠 */
const FileLock = ({ solved }: P) => S('0 0 90 96', (
  <g>
    <Defs />
    <Shackle cx={45} top={12} solved={solved} />
    <rect x="14" y="24" width="62" height="64" rx="5" fill="url(#thIron)" stroke={IRON_D} strokeWidth="1.6" />
    <Windows xs={[20, 32, 44, 56]} y={38} w={11} h={17} solved={solved} />
    {!solved && [20, 32, 44, 56].map((x) => (
      <text key={x} x={x + 5.5} y={50.5} textAnchor="middle" fontSize="9" fontFamily="serif" fill={CHALK}>－</text>
    ))}
    <circle cx="45" cy="72" r="4.4" fill={NIGHT} stroke={IRON_D} strokeWidth="1" />
    {solved && <Check x={45} y={69} s={0.9} />}
  </g>
))

/** 채점 답안지 넉 장 — 붉은 ○× */
const Papers = (_: P) => S('0 0 112 80', (
  <g>
    <Defs />
    {/* 답안지 4장 약간 겹침 */}
    {[
      { x: 4,  rot: -4, marks: '○○○○×○○○○', name: '이만복' },
      { x: 22, rot:  2, marks: '○○○○○○○×○', name: '엄석대' },
      { x: 42, rot: -2, marks: '×○○○○○○○○', name: '박정구' },
      { x: 62, rot:  3, marks: '○○×○○○○○○', name: '김순길' },
    ].map(({ x, rot, marks, name }, i) => (
      <g key={i} transform={`rotate(${rot} ${x + 22} 40)`}>
        <rect x={x} y="12" width="44" height="62" rx="2" fill="url(#thHanji)" stroke="#a8946a" strokeWidth="1" />
        <text x={x + 22} y="22" textAnchor="middle" fontSize="5.8" fontFamily="serif" fill={INK} opacity="0.85">{name}</text>
        <text x={x + 22} y="44" textAnchor="middle" fontSize="5.2" fontFamily="serif" fill={RED} opacity="0.88">{marks}</text>
      </g>
    ))}
  </g>
))

/** 서류 가방 자물쇠 */
const BagLock = ({ solved }: P) => S('0 0 90 90', (
  <g>
    <Defs />
    {/* 가방 손잡이 */}
    <path d="M28 20 q17 -12 34 0" fill="none" stroke={WOOD} strokeWidth="4.4" strokeLinecap="round" />
    <rect x="10" y="22" width="70" height="60" rx="5" fill="url(#thWood)" stroke={WOOD_D} strokeWidth="1.6" />
    <rect x="10" y="22" width="70" height="8" rx="3" fill={WOOD_D} opacity="0.5" />
    {/* 잠금쇠 */}
    <rect x="34" y="46" width="22" height="18" rx="3" fill="url(#thIron)" stroke={IRON_D} strokeWidth="1.2" />
    <Windows xs={[37, 46]} y={50} w={10} h={11} solved={solved} />
    {!solved && [37, 46].map((x) => (
      <text key={x} x={x + 5} y={59.5} textAnchor="middle" fontSize="8" fontFamily="serif" fill={CHALK}>－</text>
    ))}
    {solved && <Check x={45} y={64} s={0.75} />}
  </g>
))

/** 6학년 교실 문 */
const ClassDoor = ({ open }: P) => S('0 0 76 110', (
  <g>
    <Defs />
    {open ? (
      <g>
        <rect x="4" y="8" width="22" height="98" rx="2" fill="url(#thWood)" stroke={WOOD_D} strokeWidth="1.4" />
        <rect x="26" y="8" width="46" height="98" fill={NIGHT} opacity="0.85" />
      </g>
    ) : (
      <g>
        <rect x="5" y="8" width="66" height="98" rx="2" fill="url(#thWood)" stroke={WOOD_D} strokeWidth="1.6" />
        <rect x="16" y="24" width="44" height="32" rx="2" fill={WOOD_D} opacity="0.35" />
        <rect x="16" y="64" width="44" height="32" rx="2" fill={WOOD_D} opacity="0.35" />
        <circle cx="56" cy="58" r="4.4" fill="none" stroke={IRON} strokeWidth="1.6" opacity="0.9" />
        <rect x="54.8" y="58" width="2.4" height="6" rx="1" fill={IRON} opacity="0.9" />
        <text x="38" y="20" textAnchor="middle" fontSize="6.2" fontFamily="serif" fill={HANJI_D} opacity="0.7">6학년</text>
      </g>
    )}
  </g>
))

/* ─────────────── R4 선거날 ─────────────── */

/** 개표 칠판 — 正자 칸들 4개 */
const TallyBoard = (_: P) => S('0 0 112 84', (
  <g>
    <Defs />
    <rect x="5" y="5" width="102" height="74" rx="3" fill="url(#thBoard)" stroke="#1a3022" strokeWidth="1.6" />
    {/* 칸 구획 */}
    <line x1="5" y1="24" x2="107" y2="24" stroke={CHALK} strokeWidth="0.8" opacity="0.45" />
    {[30, 57, 84].map((x) => <line key={x} x1={x} y1="5" x2={x} y2="79" stroke={CHALK} strokeWidth="0.8" opacity="0.45" />)}
    {/* 이름 + 正자 묶음 4칸 */}
    {[
      { name: '엄석대', tally: '正正正正', extra: 3 },
      { name: '김순길', tally: '正',       extra: 1 },
      { name: '이만복', tally: '',          extra: 4 },
      { name: '박정구', tally: '正',        extra: 2 },
    ].map(({ name, tally, extra }, i) => {
      const x = 7 + i * 27
      return (
        <g key={i}>
          <text x={x + 11} y="18" textAnchor="middle" fontSize="6.4" fontFamily="serif" fill={CHALK} opacity="0.9">{name}</text>
          {/* 正자 묶음 */}
          <text x={x + 2} y="48" fontSize="9" fontFamily="serif" fontWeight="700" fill={CHALK} opacity="0.85">{tally}</text>
          {/* 미완성 획수 표시 */}
          <text x={x + 11} y="68" textAnchor="middle" fontSize="8.4" fontFamily="serif" fontWeight="700" fill={AMBER} opacity="0.9">{extra}</text>
        </g>
      )
    })}
  </g>
))

/** 규칙 쪽지 — 칠판 구석 분필 글씨 */
const RulesNote = (_: P) => S('0 0 96 60', (
  <g>
    <Defs />
    <rect x="4" y="4" width="88" height="52" rx="2" fill="url(#thBoard)" stroke="#1a3022" strokeWidth="1.4" />
    <text x="48" y="18" textAnchor="middle" fontSize="6.4" fontFamily="serif" fill={CHALK} opacity="0.9">나중에 낸 표가 위에 쌓인다.</text>
    <text x="48" y="30" textAnchor="middle" fontSize="6.4" fontFamily="serif" fill={CHALK} opacity="0.9">찢긴 표는 세지 않는다.</text>
    <text x="48" y="44" textAnchor="middle" fontSize="5.8" fontFamily="serif" fill={AMBER} opacity="0.85">正 한 글자 = 다섯 표.</text>
  </g>
))

/** 연습지 더미 — 어긋난 종이들 5장 */
const Ballots = (_: P) => S('0 0 104 80', (
  <g>
    <Defs />
    {/* 5장 겹침 — 아래서 위 순서 */}
    {[
      { y: 14, rot: -5, ch: '만', note: '맨아래' },
      { y: 12, rot:  3, ch: '일', note: '' },
      { y: 10, rot: -2, ch: '치', note: '' },
      { y: 8,  rot:  4, ch: '장', note: '' },
      { y: 6,  rot: -6, ch: '표', note: '찢김' },
    ].map(({ y, rot, ch, note }, i) => (
      <g key={i} transform={`rotate(${rot} 52 ${y + 38}) translate(${(i - 2) * 3} 0)`}>
        <rect x="18" y={y} width="68" height="58" rx="2"
          fill={note === '찢김' ? '#d8c8a8' : 'url(#thHanji)'}
          stroke="#a8946a" strokeWidth="1"
          opacity={note === '찢김' ? 0.7 : 1} />
        {note === '찢김' && (
          /* 찢긴 선 */
          <path d="M18 37 l12 -4 l10 5 l12 -3 l10 4 l8 -3" stroke="#8a7a5a" strokeWidth="1.4" fill="none" />
        )}
        {/* 등사된 글자 */}
        <text x="52" y={y + 36} textAnchor="middle" fontSize="14" fontFamily="serif" fontWeight="700"
          fill={INK} opacity={0.9 - i * 0.05}>{ch}</text>
        {/* 작대기 기호 */}
        <line x1="52" y1={y + 44} x2="72" y2={y + 44} stroke="#8a7a5a" strokeWidth="1.4" opacity="0.7" />
      </g>
    ))}
  </g>
))

/** 참관 책상 서랍 자물쇠 */
const WatchLock = ({ solved }: P) => S('0 0 90 84', (
  <g>
    <Defs />
    <rect x="8" y="18" width="74" height="58" rx="3" fill="url(#thWood)" stroke={WOOD_D} strokeWidth="1.6" />
    <rect x="8" y="18" width="74" height="8" rx="2" fill={WOOD_D} opacity="0.5" />
    <ellipse cx="45" cy="47" rx="12" ry="4.5" fill="none" stroke={IRON} strokeWidth="2.2" />
    {solved ? (
      <g>
        <path d="M22 47 q-4 -6 -8 -4" stroke="#b8a060" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <path d="M68 47 q4 -5 8 -3" stroke="#b8a060" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <Check x={45} y={62} s={0.85} />
      </g>
    ) : (
      <g>
        <path d="M22 47 h46" stroke="#b8a060" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <path d="M22 51 h46" stroke="#b8a060" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <circle cx="45" cy="49" r="3.8" fill="none" stroke="#b8a060" strokeWidth="2" />
      </g>
    )}
  </g>
))

/** 교탁 자물쇠 — 맹꽁이 4다이얼 */
const PodiumLock = ({ solved }: P) => S('0 0 92 96', (
  <g>
    <Defs />
    <Shackle cx={46} top={10} solved={solved} />
    <rect x="12" y="22" width="68" height="66" rx="6" fill="url(#thIron)" stroke={IRON_D} strokeWidth="1.6" />
    <Windows xs={[18, 30, 42, 54]} y={38} w={11} h={17} solved={solved} />
    {!solved && [18, 30, 42, 54].map((x) => (
      <text key={x} x={x + 5.5} y={50.5} textAnchor="middle" fontSize="9" fontFamily="serif" fill={CHALK}>－</text>
    ))}
    <circle cx="46" cy="72" r="4.4" fill={NIGHT} stroke={IRON_D} strokeWidth="1" />
    {solved && <Check x={46} y={69} s={0.9} />}
  </g>
))

/** 교실 앞문 */
const FrontDoor = ({ open }: P) => S('0 0 76 110', (
  <g>
    <Defs />
    {open ? (
      <g>
        <rect x="4" y="8" width="22" height="98" rx="2" fill="url(#thWood)" stroke={WOOD_D} strokeWidth="1.4" />
        <rect x="26" y="8" width="46" height="98" fill={NIGHT} opacity="0.88" />
        <ellipse cx="52" cy="58" rx="8" ry="18" fill={AMBER} opacity="0.14" />
      </g>
    ) : (
      <g>
        <rect x="5" y="8" width="66" height="98" rx="2" fill="url(#thWood)" stroke={WOOD_D} strokeWidth="1.6" />
        {[22, 38, 54].map((x) => <line key={x} x1={x} y1="12" x2={x} y2="104" stroke={WOOD_D} strokeWidth="1" opacity="0.6" />)}
        <rect x="4" y="52" width="68" height="6" rx="2" fill={IRON} stroke={IRON_D} strokeWidth="1" />
        <circle cx="38" cy="74" r="5" fill="none" stroke={IRON} strokeWidth="1.6" opacity="0.9" />
        <rect x="36.8" y="74" width="2.4" height="6.4" rx="1" fill={IRON} opacity="0.9" />
      </g>
    )}
  </g>
))

/* ─────────────── R5 그 밤 ─────────────── */

/** 칠판의 글씨 — 희미한 분필 문장 */
const ChalkText = (_: P) => S('0 0 110 72', (
  <g>
    <Defs />
    <rect x="5" y="5" width="100" height="62" rx="3" fill="url(#thBoard)" stroke="#1a3022" strokeWidth="1.6" />
    {/* 달빛 표현 — 오른쪽 귀퉁이 희미한 빛 */}
    <ellipse cx="95" cy="15" rx="20" ry="12" fill="#d8e8f8" opacity="0.12" />
    {/* 분필 글씨 */}
    <text x="55" y="30" textAnchor="middle" fontSize="7.4" fontFamily="serif" fill={CHALK} opacity="0.65">엄석대를 다시 급장으로.</text>
    <text x="55" y="44" textAnchor="middle" fontSize="7.4" fontFamily="serif" fill={CHALK} opacity="0.65">모두 찬성이지?</text>
    {/* 손이 없는 침묵 — 들리지 않은 줄 */}
    <line x1="20" y1="56" x2="90" y2="56" stroke={CHALK} strokeWidth="0.5" opacity="0.25" strokeDasharray="3 4" />
  </g>
))

/** 게시판의 상장 — 액자 안 우등상 */
const Award = (_: P) => S('0 0 88 96', (
  <g>
    <Defs />
    {/* 액자 테두리 */}
    <rect x="6" y="8" width="76" height="80" rx="2" fill={WOOD} stroke={WOOD_D} strokeWidth="2.4" />
    <rect x="10" y="12" width="68" height="72" rx="1.5" fill={HANJI} stroke="#c8b888" strokeWidth="1" />
    {/* 상장 내용 */}
    <text x="44" y="34" textAnchor="middle" fontSize="7.8" fontFamily="serif" fill={INK} opacity="0.92">우 등 상</text>
    <line x1="18" y1="38" x2="70" y2="38" stroke="#a8946a" strokeWidth="0.9" opacity="0.6" />
    <text x="44" y="52" textAnchor="middle" fontSize="6.6" fontFamily="serif" fill={INK} opacity="0.88">一 등</text>
    <text x="44" y="64" textAnchor="middle" fontSize="6.2" fontFamily="serif" fill={RED} opacity="0.85">엄석대</text>
    {/* 낙관 */}
    <rect x="60" y="68" width="12" height="12" rx="1.4" fill="none" stroke={RED} strokeWidth="1.2" opacity="0.8" />
    <path d="M62 72 h8 M62 75 h8" stroke={RED} strokeWidth="0.8" opacity="0.8" />
  </g>
))

/** 학급일지 — 펼친 공책, ㅅ 버릇 강조 */
const Daybook = (_: P) => S('0 0 100 76', (
  <g transform="rotate(-1 50 38)">
    <Defs />
    <path d="M11 9 h78 v58 h-78 z" fill="#1a1210" opacity="0.3" transform="translate(1.4 1.4)" />
    <rect x="10" y="8" width="78" height="58" rx="2" fill="url(#thHanji)" stroke="#a8946a" strokeWidth="1.2" />
    {/* 중앙 철 */}
    <line x1="49" y1="8" x2="49" y2="66" stroke="#a8946a" strokeWidth="1.4" />
    {/* 글씨 줄 왼쪽 면 */}
    {[24, 34, 44, 54].map((y) => <line key={y} x1="14" y1={y} x2="44" y2={y} stroke="#b4a47e" strokeWidth="0.7" opacity="0.5" />)}
    {/* ㅅ 첫 획 길게 빠진 강조 글자 */}
    <text x="22" y="20" fontSize="11" fontFamily="serif" fill={INK} opacity="0.92">수업</text>
    {/* ㅅ 획 강조 — 길게 빠진 첫 획 */}
    <path d="M14 17 l6 -8" stroke={RED} strokeWidth="2.4" strokeLinecap="round" opacity="0.85" />
    {/* 오른쪽 면 줄들 */}
    {[24, 34, 44, 54].map((y) => <line key={y} x1="53" y1={y} x2="84" y2={y} stroke="#b4a47e" strokeWidth="0.7" opacity="0.5" />)}
  </g>
))

/** 깨진 유리창 + 라이터 — 달빛, 돌+끈+라이터 */
const BrokenWindow = (_: P) => S('0 0 100 80', (
  <g>
    <Defs />
    {/* 창틀 */}
    <rect x="6" y="6" width="88" height="68" rx="2" fill={NIGHT} stroke={WOOD_D} strokeWidth="2.2" />
    {/* 달빛 */}
    <ellipse cx="80" cy="20" rx="14" ry="12" fill="#d8e8f8" opacity="0.25" />
    {/* 깨진 유리 파편 */}
    <path d="M28 14 l12 20 l-8 6 l-16 -4 z" fill="#c0d8e8" opacity="0.55" stroke="#9ab8c8" strokeWidth="0.7" />
    <path d="M40 34 l10 16 l-10 4 l-6 -12 z" fill="#c0d8e8" opacity="0.5" stroke="#9ab8c8" strokeWidth="0.7" />
    <path d="M50 16 l8 -4 l6 14 l-14 2 z" fill="#c0d8e8" opacity="0.6" stroke="#9ab8c8" strokeWidth="0.7" />
    {/* 구멍 */}
    <path d="M28 14 l22 20 l10 -18 l8 24 l-12 6 l-16 -4 l-4 -8 z" fill={NIGHT} opacity="0.85" />
    {/* 돌 */}
    <ellipse cx="38" cy="62" rx="10" ry="7" fill="#8a8a7a" stroke="#5a5a4a" strokeWidth="1" />
    {/* 끈 */}
    <path d="M46 60 q8 -4 16 0" stroke="#b8a060" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    {/* 라이터 */}
    <rect x="62" y="54" width="12" height="18" rx="2" fill={IRON} stroke="#3a3a3a" strokeWidth="1" />
    <rect x="63" y="55" width="5" height="5" rx="0.8" fill="#888" />
    <rect x="68" y="55" width="5.5" height="4" rx="0.8" fill="#ccc" opacity="0.8" />
  </g>
))

/** 답안지 여덟 장 — 두 줄 부채꼴 */
const Exams = (_: P) => S('0 0 128 84', (
  <g>
    <Defs />
    {/* 8장을 두 줄 4열로 배치 */}
    {[
      { x: 4,  y: 6,  rot: -5, name: '장-1', sub: '자국없음·버릇같음' },
      { x: 28, y: 4,  rot: -2, name: '장-2', sub: '지운자국·버릇같음' },
      { x: 52, y: 6,  rot:  2, name: '장-3', sub: '지운자국·버릇다름' },
      { x: 76, y: 4,  rot: -3, name: '장-4', sub: '자국없음·버릇다름' },
      { x: 4,  y: 48, rot:  3, name: '장-5', sub: '지운자국·버릇다름' },
      { x: 28, y: 46, rot: -1, name: '장-6', sub: '지운자국·버릇같음' },
      { x: 52, y: 48, rot:  4, name: '장-7', sub: '자국없음·버릇다름' },
      { x: 76, y: 46, rot: -4, name: '장-8', sub: '지운자국·버릇다름' },
    ].map(({ x, y, rot, sub }, i) => (
      <g key={i} transform={`rotate(${rot} ${x + 20} ${y + 28})`}>
        <rect x={x} y={y} width="40" height="36" rx="1.5" fill="url(#thHanji)" stroke="#a8946a" strokeWidth="0.9" />
        <text x={x + 20} y={y + 10} textAnchor="middle" fontSize="5.4" fontFamily="serif" fill={INK} opacity="0.85">엄석대</text>
        {/* 지운 자국 — 'sub'에 '지운자국' 포함 시 */}
        {sub.includes('지운자국') && (
          <path d={`M${x + 6} ${y + 14} h28`} stroke="#c0b090" strokeWidth="3.4" opacity="0.5" />
        )}
        {/* ○× 채점 줄 */}
        <text x={x + 20} y={y + 26} textAnchor="middle" fontSize="5.6" fontFamily="serif" fill={RED} opacity="0.8">○×○○○○○○○</text>
      </g>
    ))}
  </g>
))

/** 검인 다이얼 — 4다이얼 자물쇠 */
const DialDoor = ({ solved }: P) => S('0 0 80 100', (
  <g>
    <Defs />
    <rect x="10" y="10" width="60" height="80" rx="5" fill="url(#thIron)" stroke={IRON_D} strokeWidth="1.6" />
    {/* 세로 4창 */}
    <Windows xs={[28]} y={18} w={14} h={16} solved={solved} />
    <Windows xs={[28]} y={36} w={14} h={16} solved={solved} />
    <Windows xs={[28]} y={54} w={14} h={16} solved={solved} />
    <Windows xs={[28]} y={72} w={14} h={16} solved={solved} />
    {!solved && [18, 36, 54, 72].map((y) => (
      <text key={y} x="35" y={y + 12} textAnchor="middle" fontSize="9" fontFamily="serif" fill={CHALK}>－</text>
    ))}
    {solved && <Check x={35} y={92} s={0.75} />}
  </g>
))

/** 두고 간 일기장 */
const LeftDiary = (_: P) => S('0 0 88 68', (
  <g transform="rotate(-2.5 44 34)">
    <Defs />
    <path d="M13 11 h62 v46 h-62 z" fill="#1a1210" opacity="0.3" transform="translate(1.4 1.4)" />
    <rect x="12" y="10" width="62" height="46" rx="2" fill="url(#thHanji)" stroke="#a8946a" strokeWidth="1.2" />
    <rect x="12" y="10" width="8" height="46" fill={AMBER} opacity="0.5" />
    {['13:1', '33:2', '14:2'].map((t, i) => (
      <text key={i} x="30" y={24 + i * 11} fontSize="7.6" fontFamily="serif" fontWeight="700" fill={RED} opacity="0.9">{t}</text>
    ))}
    {[32, 43, 54].map((y) => (
      <line key={y} x1="26" y1={y} x2="70" y2={y} stroke="#b4a47e" strokeWidth="0.7" opacity="0.4" />
    ))}
    <text x="44" y="61" textAnchor="middle" fontSize="5.4" fontFamily="serif" fill="#7a6a4a" opacity="0.7">앞수=어절 · 뒷수=글자</text>
  </g>
))

/** 등사 시 프린트 — 시 한 장, 달빛에 글자 */
const PoemPrint = ({ solved }: P) => S('0 0 100 84', (
  <g>
    <Defs />
    <rect x="12" y="60" width="76" height="14" rx="2" fill={WOOD} stroke={WOOD_D} strokeWidth="1.2" />
    {solved ? (
      <g>
        <path d="M50 28 q-18 -7 -32 0 l3 30 q14 -6 29 0 q15 -6 29 0 l3 -30 q-14 -7 -32 0 z"
          fill="url(#thHanji)" stroke="#a8946a" strokeWidth="1.4" />
        <line x1="50" y1="28" x2="50" y2="58" stroke="#a8946a" strokeWidth="1.2" />
        {[35, 42, 49].map((y) => (
          <g key={y}>
            <line x1="25" y1={y} x2="44" y2={y} stroke="#8a7a5a" strokeWidth="0.9" opacity="0.8" />
            <line x1="56" y1={y} x2="75" y2={y} stroke="#8a7a5a" strokeWidth="0.9" opacity="0.8" />
          </g>
        ))}
        <ellipse cx="50" cy="42" rx="32" ry="16" fill="url(#thGlow)" />
        <Check x={50} y={68} s={0.8} />
      </g>
    ) : (
      <g>
        {/* 잠김 — 인쇄물이 접혀 있음 */}
        <rect x="24" y="26" width="52" height="36" rx="2.4" fill="url(#thHanji)" stroke="#a8946a" strokeWidth="1.4" />
        <rect x="24" y="26" width="7" height="36" fill={RED} opacity="0.65" />
        {[33, 40, 47, 54].map((y) => <line key={y} x1="36" y1={y} x2="70" y2={y} stroke="#8a7a5a" strokeWidth="0.9" opacity="0.55" />)}
        {/* 잠김 느낌 빗금 */}
        <path d="M50 22 v42 M30 43 h44" stroke={RED} strokeWidth="1.8" opacity="0.85" />
        <circle cx="50" cy="43" r="3.2" fill={RED} />
      </g>
    )}
  </g>
))

/* ─────────────── REGISTRY ─────────────── */

const REGISTRY: Record<Kind, (p: P) => JSX.Element> = {
  // R1 교실
  timetable: Timetable, window: Window, notice: Notice, drawerlock: DrawerLock,
  staffsheet: StaffSheet, musicchart: MusicChart, organlock: OrganLock, diary: Diary,
  confiscated: Confiscated, backgate: BackGate,
  // R2 운동장
  wellnote: WellNote, weeklog: Weeklog, buckets: Buckets, welllock: WellLock,
  shoes: Shoes, shoelock: ShoeLock, frontgate: FrontGate,
  // R3 복도
  ranks: Ranks, sealtray: SealTray, docket: Docket, sealpencil: SealPencil,
  filelock: FileLock, papers: Papers, baglock: BagLock, classdoor: ClassDoor,
  // R4 선거날
  tallyboard: TallyBoard, rulesnote: RulesNote, ballots: Ballots, watchlock: WatchLock,
  podiumlock: PodiumLock, frontdoor: FrontDoor,
  // R5 그 밤
  chalktext: ChalkText, award: Award, daybook: Daybook, brokenwindow: BrokenWindow,
  exams: Exams, dialdoor: DialDoor, leftdiary: LeftDiary, poemprint: PoemPrint,
}

export function ObjectArt({ label, active, solved }: { label?: string; active: boolean; solved: boolean }) {
  if (!label) return null
  const kind = KIND_BY_LABEL[label]
  if (!kind) return null
  const C = REGISTRY[kind]
  return C ? <C open={active} solved={solved} /> : null
}
