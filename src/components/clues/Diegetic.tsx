import { type JSX, type ReactNode } from 'react'
import type { NoteClue, TokensClue } from '../../engine/types'

// 단서를 "세계 속 장면"으로 렌더한다 — 1960년 시골 국민학교 소품들.
// 원재료만 보여주고, 변환법은 플레이어 몫. 렌더는 clues.json emit 토큰만 신뢰한다.
// 팔레트: 칠판 녹 #2e4e3e · 마루 갈 #8a6a48 · 분필/한지 #efe6d0 · 노을 주황 #c9762b
//         · 밤 남색 #1c2430 · 채점 붉음 #b5392b. 수채+색연필, 단순·가독 우선.

const HANJI = '#efe6d0'   // 분필·한지
const BOARD = '#2e4e3e'   // 칠판 녹
const MARU = '#8a6a48'    // 마루 갈
const AMBER = '#c9762b'   // 노을 주황
const NIGHT = '#1c2430'   // 밤 남색
const RED = '#b5392b'     // 채점 붉음
const INK = '#2a2418'     // 먹

/** viewBox 기반 SVG 래퍼 — height:auto 환경에서 높이 0 함정을 막는 aspect-ratio 명시. */
function Scene({ vb, children }: { vb: string; children: ReactNode }) {
  const parts = vb.split(/\s+/).map(Number)
  const w = parts[2] ?? 1, h = parts[3] ?? 1
  return (
    <svg className="dieg" viewBox={vb} style={{ aspectRatio: `${w} / ${h}` }} aria-hidden="true">
      {children}
    </svg>
  )
}

// ── R1 교실 — 알림장·시간표·악보·풍금 ──────────────────────────────────

/** 알림장: 공책 낱장에 줄 4개 — tag = 줄 내용 설명, text = 준비물 과목. */
function Notice({ clue }: { clue: TokensClue }) {
  return (
    <Scene vb="0 0 120 160">
      {/* 공책 낱장 배경 */}
      <rect x="4" y="4" width="112" height="152" rx="3" fill={HANJI} stroke="#c4b896" strokeWidth="1.2" />
      {/* 철 구멍 두 개 */}
      <circle cx="14" cy="28" r="3.5" fill="none" stroke="#c4b896" strokeWidth="1" />
      <circle cx="14" cy="52" r="3.5" fill="none" stroke="#c4b896" strokeWidth="1" />
      {/* 왼쪽 여백선 */}
      <line x1="22" y1="12" x2="22" y2="150" stroke="#e0c8c0" strokeWidth="0.9" />
      {/* 줄 4개 + 내용 */}
      {clue.tokens.map((t, i) => {
        const y = 38 + i * 28
        return (
          <g key={i}>
            {/* 가로 줄 */}
            <line x1="8" y1={y + 14} x2="112" y2={y + 14} stroke="#c8d8e8" strokeWidth="0.7" />
            {/* 줄 번호 */}
            <text x="17" y={y + 10} textAnchor="middle" fontSize="7" fill="#a08878">{i + 1}</text>
            {/* 태그(줄 설명 — 흐린 연필 낙서체) */}
            <text x="27" y={y + 7} fontSize="7" fill="#9a9080" fontStyle="italic">{t.tag}</text>
            {/* 본문(과목 — 굵은 연필 글씨) */}
            <text x="27" y={y + 19} fontSize="13" fontFamily="serif" fontWeight="700" fill={INK}>{t.text}</text>
          </g>
        )
      })}
    </Scene>
  )
}

/** 내일 시간표: '화요일' 머리 + 6행 표. tag='N교시', text=과목. */
function Timetable({ clue }: { clue: TokensClue }) {
  return (
    <Scene vb="0 0 120 210">
      {/* 칠판 배경 */}
      <rect x="0" y="0" width="120" height="210" rx="3" fill={BOARD} />
      {/* 분필 제목 */}
      <text x="60" y="20" textAnchor="middle" fontSize="12" fontFamily="serif" fontWeight="700" fill={HANJI}>화요일</text>
      <line x1="10" y1="26" x2="110" y2="26" stroke={HANJI} strokeWidth="0.8" opacity="0.5" />
      {/* 표 테두리 */}
      <rect x="10" y="32" width="100" height={clue.tokens.length * 28} rx="2" fill="none" stroke={HANJI} strokeWidth="0.8" opacity="0.4" />
      {clue.tokens.map((t, i) => {
        const y = 32 + i * 28
        return (
          <g key={i}>
            {/* 행 구분선 */}
            {i > 0 && <line x1="10" y1={y} x2="110" y2={y} stroke={HANJI} strokeWidth="0.6" opacity="0.3" />}
            {/* 교시 칸 */}
            <rect x="10" y={y} width="36" height="28" fill={HANJI} opacity="0.1" />
            <text x="28" y={y + 18} textAnchor="middle" fontSize="10" fill={HANJI} opacity="0.8">{t.tag}</text>
            {/* 과목 칸 */}
            <text x="75" y={y + 19} textAnchor="middle" fontSize="14" fontFamily="serif" fontWeight="700" fill={HANJI}>{t.text}</text>
          </g>
        )
      })}
    </Scene>
  )
}

/** 악보: 오선 5줄 위 콩나물 4개. tag='i:p'(i=차례, p=오선 자리 1~7). 숫자·글자 비표기. */
function Staff({ clue }: { clue: TokensClue }) {
  // 오선 자리 1~7 → y. 한 자리 = 반 칸(줄→칸→줄 …): 1=맨 아랫줄(80) · 2=첫 칸(75) ·
  // 3=둘째 줄(70) · … · 7=넷째 줄(50). "맨 아랫줄이 도" 앵커에서 한 자리씩 세면 걸음 수.
  const posToY = (p: number) => 80 - (p - 1) * 5
  const n = clue.tokens.length
  const noteXs = n > 0
    ? clue.tokens.map((_, i) => 26 + i * (84 / Math.max(n, 1)))
    : [24, 50, 76]

  return (
    <Scene vb="0 0 120 110">
      {/* 배경 — 한지 색 */}
      <rect x="0" y="0" width="120" height="110" rx="3" fill="#f4edd8" />
      {/* 보표 세로 시작 선 */}
      <line x1="10" y1="40" x2="10" y2="80" stroke={INK} strokeWidth="2" />
      {/* 오선 5줄 */}
      {[80, 70, 60, 50, 40].map((y, li) => (
        <line key={li} x1="10" y1={y} x2="112" y2={y} stroke={INK} strokeWidth="0.9" />
      ))}
      {/* 높은음자리표 — 트레블 클레프 암시(맨 아랫줄=미). 단순 G-clef 곡선 */}
      <path d="M16 78 q-5 -3 -5 -9 q0 -7 6 -7 q5 0 5 6 q0 9 -9 13 q-5 2 -5 -2"
        fill="none" stroke={INK} strokeWidth="1.3" strokeLinecap="round" opacity="0.85" />
      {/* 맨 아랫줄(미) 살짝 도톰 — 기준선(숫자·계이름 비표기 계약, 괘도가 대응을 준다) */}
      <line x1="10" y1="80" x2="112" y2="80" stroke={INK} strokeWidth="1.4" />
      {/* 음표 — 콩나물: 머리(타원) + 기둥(세로선). 순서는 왼→오른 */}
      {clue.tokens.map((t, i) => {
        const raw = (t.tag ?? '').split(':')
        const pos = Number(raw[1] ?? 4)
        const cy = posToY(pos)
        const x = noteXs[i] ?? 24 + i * 22
        // 기둥 방향: 낮은 자리(1~4)는 위로, 높은 자리(5~7)는 아래로
        const stemUp = pos <= 4
        return (
          <g key={i}>
            {/* 음표 머리 */}
            <ellipse cx={x} cy={cy} rx="5" ry="3.6" fill={INK} transform={`rotate(-15 ${x} ${cy})`} />
            {/* 기둥 */}
            {stemUp
              ? <line x1={x + 4.6} y1={cy} x2={x + 4.6} y2={cy - 20} stroke={INK} strokeWidth="1.4" />
              : <line x1={x - 4.6} y1={cy} x2={x - 4.6} y2={cy + 20} stroke={INK} strokeWidth="1.4" />}
          </g>
        )
      })}
    </Scene>
  )
}

/** 풍금 건반: 흰 건반 7개 + 검은 건반, 첫 건반(도)에 빨간 단추. */
function Keys({ clue }: { clue: TokensClue }) {
  // 흰 건반 7개(도레미파솔라시), 각 건반에 계이름 + 번호(도1 레2 미3 …) — 괘도 대응.
  const wW = 14, wH = 64
  const bW = 9, bH = 38
  // 검은 건반 위치: 도#·레#(0.65,1.65), 파#·솔#·라#(3.65,4.65,5.65)
  const blackOffsets = [0.65, 1.65, 3.65, 4.65, 5.65]
  const labels = clue.tokens.length >= 7
    ? clue.tokens
    : ['도', '레', '미', '파', '솔', '라', '시'].map((n, i) => ({ text: n, tag: String(i + 1) }))
  return (
    <Scene vb="0 0 120 102">
      {/* 풍금 몸체 */}
      <rect x="4" y="14" width="112" height="84" rx="4" fill={MARU} stroke="#5a4030" strokeWidth="1.2" />
      {/* 흰 건반 7개 */}
      {Array.from({ length: 7 }).map((_, i) => {
        const x = 8 + i * wW
        return (
          <rect key={i} x={x} y="20" width={wW - 1} height={wH}
            rx="2" fill={HANJI} stroke="#c0b090" strokeWidth="0.8" />
        )
      })}
      {/* 검은 건반 */}
      {blackOffsets.map((off, i) => (
        <rect key={i} x={8 + off * wW} y="20" width={bW} height={bH}
          rx="1.5" fill={INK} />
      ))}
      {/* 흰 건반 아래에 계이름 + 번호 */}
      {labels.slice(0, 7).map((t, i) => {
        const cx = 8 + i * wW + wW / 2 - 0.5
        return (
          <g key={i}>
            <text x={cx} y={20 + wH - 14} textAnchor="middle" fontSize="8" fontFamily="serif" fill={INK}>{t.text}</text>
            <text x={cx} y={20 + wH - 4} textAnchor="middle" fontSize="9" fontWeight="700" fill={RED}>{t.tag}</text>
          </g>
        )
      })}
    </Scene>
  )
}

// ── R2 교실 — 일기장·양동이·고무신 ──────────────────────────────────────

/** 일기장 갈피: 세로 찢긴 갈피 종이에 좌표쌍 낙서체 배지. text='13:1' 식. */
function Diary({ clue }: { clue: TokensClue }) {
  return (
    <Scene vb="0 0 120 60">
      {/* 갈피 종이 — 세로 찢긴 왼쪽 톱니 */}
      <path d="M18 4 l-3 5 l4 5 l-3 5 l4 5 l-3 5 l4 5 l-3 5 l4 5 l-3 5 L18 52 L112 52 L112 4 Z"
        fill={HANJI} stroke="#c8b898" strokeWidth="0.9" />
      {/* 연필 줄 */}
      {[18, 30, 42].map((y) => (
        <line key={y} x1="22" y1={y} x2="108" y2={y} stroke="#c8d0d8" strokeWidth="0.6" />
      ))}
      {/* 좌표쌍 낙서체 */}
      {clue.tokens.map((t, i) => {
        const x = 30 + i * 32
        return (
          <g key={i}>
            <rect x={x - 12} y="26" width="26" height="16" rx="3" fill={AMBER} opacity="0.18" />
            <text x={x} y="38" textAnchor="middle" fontSize="11" fontFamily="serif" fontWeight="700"
              fill={INK} letterSpacing="0.5">{t.text}</text>
          </g>
        )
      })}
    </Scene>
  )
}

/** 양동이 줄: 우물에서 각 양동이로 점선 — 점선 길이(우물 거리) = 걸음수.
 *  화면 세로 위치는 거리순과 섞여(지그재그), "위에서 아래로 읽기" 미끼와 "우물 가까운 순"(정답)을 분리한다. */
function Buckets({ clue }: { clue: TokensClue }) {
  // "열두 걸음" → 12. 한글 수사 파싱.
  const KO: Record<string, number> = {
    한: 1, 두: 2, 세: 3, 네: 4, 다섯: 5, 여섯: 6, 일곱: 7, 여덟: 8, 아홉: 9,
    열: 10, 열한: 11, 열두: 12, 열셋: 13, 열넷: 14,
  }
  const steps = (tag?: string) => KO[(tag ?? '').replace(/\s*걸음\s*/g, '').trim()] ?? 99
  // 우물에서 가까운→먼 자리(거리 오름차순). y는 비단조(36·80·54·108)라 거리순≠세로순.
  const slots: [number, number][] = [[40, 36], [24, 80], [82, 54], [84, 108]]
  const WELL: [number, number] = [18, 26]
  // 토큰을 걸음수 오름차순 → 가까운 자리부터(걸음 적은 양동이가 우물에 가깝게).
  const ordered = clue.tokens.map((t) => ({ t, s: steps(t.tag) })).sort((a, b) => a.s - b.s)
  return (
    <Scene vb="0 0 110 140">
      <rect x="0" y="0" width="110" height="140" rx="3" fill="#e8f0e4" />
      {/* 우물 */}
      <rect x="5" y="6" width="26" height="20" rx="2" fill={MARU} stroke="#5a3a18" strokeWidth="1.2" />
      <ellipse cx="18" cy="10" rx="10" ry="4" fill="#3a5a68" stroke="#5a3a18" strokeWidth="1" />
      <text x="18" y="22" textAnchor="middle" fontSize="7" fontFamily="serif" fill={HANJI}>우물</text>
      {/* 우물 → 각 양동이 개별 점선 — 길이가 곧 걸음수(거리) */}
      {ordered.map((_, k) => {
        const [cx, cy] = slots[k]!
        return (
          <line key={`l${k}`} x1={WELL[0]} y1={WELL[1]} x2={cx} y2={cy - 11}
            stroke="#7a9088" strokeWidth="1" strokeDasharray="3 3" />
        )
      })}
      {/* 양동이 4개 */}
      {ordered.map(({ t }, k) => {
        const [cx, cy] = slots[k]!
        return (
          <g key={k}>
            {/* 양동이 몸체(사다리꼴) */}
            <path d={`M${cx - 9} ${cy - 10} L${cx + 9} ${cy - 10} L${cx + 7} ${cy + 10} L${cx - 7} ${cy + 10} Z`}
              fill="#6090a8" stroke="#3a6070" strokeWidth="1.2" />
            <path d={`M${cx - 7} ${cy - 10} Q${cx} ${cy - 19} ${cx + 7} ${cy - 10}`}
              fill="none" stroke="#3a6070" strokeWidth="1.2" />
            {/* 표찰 번호 */}
            <text x={cx} y={cy + 3} textAnchor="middle" fontSize="10" fontFamily="serif" fontWeight="700" fill={HANJI}>{t.text}</text>
            {/* 발치 걸음수 라벨 */}
            <text x={cx} y={cy + 21} textAnchor="middle" fontSize="7" fill="#3a5060">{t.tag}</text>
          </g>
        )
      })}
    </Scene>
  )
}

/** 고무신: 4켤레 검정 고무신. 발등에 문수(tag), 안창에 글자(text). */
function Shoes({ clue }: { clue: TokensClue }) {
  return (
    <Scene vb="0 0 120 120">
      <rect x="0" y="0" width="120" height="120" rx="3" fill="#e0d8cc" />
      {clue.tokens.map((t, i) => {
        const col = i % 2, row = Math.floor(i / 2)
        const cx = 30 + col * 60, cy = 30 + row * 60
        return (
          <g key={i}>
            {/* 고무신 외형 — 검정 */}
            <path d={`M${cx - 20} ${cy + 8} Q${cx - 22} ${cy - 6} ${cx} ${cy - 10} Q${cx + 22} ${cy - 14} ${cx + 22} ${cy + 2} Q${cx + 22} ${cy + 14} ${cx - 4} ${cy + 14} Q${cx - 20} ${cy + 14} ${cx - 20} ${cy + 8} Z`}
              fill="#1c1c1c" stroke="#000" strokeWidth="1" />
            {/* 고무신 안창 — 살짝 밝은 면 */}
            <path d={`M${cx - 14} ${cy + 6} Q${cx - 6} ${cy - 6} ${cx + 16} ${cy + 1} Q${cx + 20} ${cy + 7} ${cx - 2} ${cy + 11} Z`}
              fill="#3a3028" />
            {/* 발등 문수 */}
            <text x={cx + 8} y={cy - 2} textAnchor="middle" fontSize="8" fill={HANJI} opacity="0.85">{t.tag}</text>
            {/* 안창 글자 */}
            <text x={cx + 4} y={cy + 8} textAnchor="middle" fontSize="9" fontFamily="serif" fontWeight="700" fill={AMBER}>{t.text}</text>
          </g>
        )
      })}
    </Scene>
  )
}

// ── R3 교무실 — 결재 서류·도장·보관함 ──────────────────────────────────

/** 흠집 노치 방향 파싱 — '흠집 위/아래/왼/오른' → 각도(deg). */
function notchAngle(tag: string): number {
  if (tag.includes('위')) return 270    // 위 = 12시
  if (tag.includes('아래')) return 90   // 아래 = 6시
  if (tag.includes('왼')) return 180    // 왼 = 9시
  if (tag.includes('오른')) return 0    // 오른 = 3시
  return 0
}

/** 결재 서류: 가로 결재란 4칸, 붉은 원형 인영 + 노치(태그 파싱) + 부수 숫자(text). */
function Docket({ clue }: { clue: TokensClue }) {
  return (
    <Scene vb="0 0 130 60">
      <rect x="0" y="0" width="130" height="60" rx="3" fill="#f4edd8" stroke="#c4b890" strokeWidth="1" />
      {/* '결재' 제목 */}
      <text x="8" y="14" fontSize="8" fontFamily="serif" fill="#8a7050">결재</text>
      {/* 결재란 4칸 */}
      {clue.tokens.map((t, i) => {
        const x = 12 + i * 28
        const cy = 36
        const ang = notchAngle(t.tag ?? '')
        // 노치 — 인영 가장자리에서 방위 방향으로 굵은 이 빠짐
        const rad = (ang * Math.PI) / 180
        const nx = x + 11 + Math.cos(rad) * 10.5
        const ny = cy + Math.sin(rad) * 10.5
        return (
          <g key={i}>
            {/* 칸 테두리 */}
            <rect x={x} y="20" width="26" height="32" rx="1.5" fill="none" stroke="#b09060" strokeWidth="0.8" />
            {/* 붉은 인영 원 */}
            <circle cx={x + 11} cy={cy} r="10.5" fill="none" stroke={RED} strokeWidth="2" opacity="0.85" />
            {/* 가장자리 노치 — 굵은 흰 이 빠짐 */}
            <circle cx={nx} cy={ny} r="2.8" fill="#f4edd8" />
            {/* 부수 숫자 */}
            <text x={x + 11} y={cy + 4} textAnchor="middle" fontSize="10" fontFamily="serif" fontWeight="700" fill={RED}>{t.text}</text>
          </g>
        )
      })}
    </Scene>
  )
}

/** 도장 4개: 나무 도장 측면+인면. 흠집은 **그림으로만**(이 빠진 쐐기 — 글자 비표기:
 *  "이름은 닳아 안 보인다"가 디제시스다. 방위 글자는 보관함(tray)의 몫). text='위'|'아래'|'왼'|'오른'. */
function Seals({ clue }: { clue: TokensClue }) {
  return (
    <Scene vb="0 0 130 84">
      <rect x="0" y="0" width="130" height="84" rx="3" fill={NIGHT} />
      {clue.tokens.map((t, i) => {
        const cx = 17 + i * 32
        const ang = notchAngle(t.text ?? '')
        const rad = (ang * Math.PI) / 180
        const nx = cx + Math.cos(rad) * 11
        const ny = 56 + Math.sin(rad) * 9.5
        return (
          <g key={i}>
            {/* 도장 측면(나무 몸통) — 손잡이 이름 자리는 닳아 비었다 */}
            <rect x={cx - 9} y="10" width="18" height="30" rx="2" fill={MARU} stroke="#5a3a18" strokeWidth="1" />
            <rect x={cx - 9} y="10" width="18" height="8" rx="2" fill="#a07848" />
            <rect x={cx - 6} y="24" width="12" height="12" rx="1" fill="#7a5430" opacity="0.6" />
            {/* 인면 — 붉은 면 */}
            <ellipse cx={cx} cy="56" rx="12.5" ry="10.5" fill={RED} opacity="0.9" stroke="#7a1a0a" strokeWidth="1" />
            <ellipse cx={cx} cy="56" rx="8" ry="6.4" fill="none" stroke="#f0d8c8" strokeWidth="1" opacity="0.5" />
            {/* 이 빠진 흠집 — 굵은 쐐기(관측물): 위/아래/왼/오른 한 방위 */}
            <circle cx={nx} cy={ny} r="4" fill={NIGHT} />
            <circle cx={nx} cy={ny} r="4" fill="none" stroke="#7a1a0a" strokeWidth="0.8" opacity="0.6" />
          </g>
        )
      })}
    </Scene>
  )
}

/** 도장 보관함: 홈 4개(첫째~넷째 tag), 각 홈에 방위 글자(text). */
function Tray({ clue }: { clue: TokensClue }) {
  return (
    <Scene vb="0 0 130 70">
      <rect x="0" y="0" width="130" height="70" rx="3" fill={MARU} stroke="#5a3a18" strokeWidth="1.2" />
      {/* 상자 안 어두운 면 */}
      <rect x="6" y="6" width="118" height="58" rx="2" fill="#6a4a28" />
      {clue.tokens.map((t, i) => {
        const x = 12 + i * 28
        return (
          <g key={i}>
            {/* 홈 — 원통 오목 */}
            <ellipse cx={x + 9} cy="35" rx="10" ry="26" fill="#3a2010" stroke="#5a3018" strokeWidth="1" />
            <ellipse cx={x + 9} cy="35" rx="8" ry="22" fill="#241808" />
            {/* 홈 순번 */}
            <text x={x + 9} y="14" textAnchor="middle" fontSize="7" fill={HANJI} opacity="0.6">{t.tag}</text>
            {/* 방위 글자 */}
            <text x={x + 9} y="38" textAnchor="middle" fontSize="11" fontFamily="serif" fontWeight="700" fill={HANJI}>{t.text}</text>
          </g>
        )
      })}
    </Scene>
  )
}

// ── R4 교실 — 채점 답안지·석차 일람표 ──────────────────────────────────

/** 채점 답안지 4장: 장마다 이름(tag)과 문항 1~9 ○× 행. × 는 붉고 크게. */
function Papers({ clue }: { clue: TokensClue }) {
  const n = clue.tokens.length
  const cardH = 36
  const totalH = 24 + n * (cardH + 8)
  return (
    <Scene vb={`0 0 120 ${totalH}`}>
      <rect x="0" y="0" width="120" height={totalH} rx="3" fill="#ece4d0" />
      {clue.tokens.map((t, i) => {
        const y = 10 + i * (cardH + 8)
        const marks = (t.text ?? '').split('')
        return (
          <g key={i}>
            {/* 답안지 낱장 */}
            <rect x="6" y={y} width="108" height={cardH} rx="2" fill={HANJI} stroke="#c4b890" strokeWidth="0.8" />
            {/* 이름 */}
            <text x="18" y={y + 14} textAnchor="middle" fontSize="9" fontFamily="serif" fontWeight="700" fill={INK}>{t.tag}</text>
            <line x1="34" y1={y + 4} x2="34" y2={y + cardH - 4} stroke="#c4b890" strokeWidth="0.7" />
            {/* 문항 ○× */}
            {marks.slice(0, 9).map((m, k) => {
              const mx = 38 + k * 8.5
              const isX = m === '×'
              return (
                <text key={k} x={mx} y={y + 22} textAnchor="middle"
                  fontSize={isX ? 13 : 11} fontFamily="serif" fontWeight={isX ? '700' : '400'}
                  fill={isX ? RED : '#3a7050'}>{m}</text>
              )
            })}
          </g>
        )
      })}
    </Scene>
  )
}

/** 석차 일람표: 표 형식. text=이름, tag='一등'~'四등'. */
function Ranks({ clue }: { clue: TokensClue }) {
  return (
    <Scene vb="0 0 120 120">
      <rect x="0" y="0" width="120" height="120" rx="3" fill={HANJI} stroke="#c4b890" strokeWidth="1" />
      <text x="60" y="16" textAnchor="middle" fontSize="10" fontFamily="serif" fontWeight="700" fill={INK}>석차 일람표</text>
      <line x1="8" y1="22" x2="112" y2="22" stroke="#b0a080" strokeWidth="0.8" />
      {clue.tokens.map((t, i) => {
        const y = 30 + i * 22
        return (
          <g key={i}>
            {/* 행 구분 */}
            {i > 0 && <line x1="8" y1={y - 4} x2="112" y2={y - 4} stroke="#c8bca0" strokeWidth="0.5" />}
            {/* 석차 */}
            <text x="28" y={y + 12} textAnchor="middle" fontSize="13" fontFamily="serif" fontWeight="700" fill={AMBER}>{t.tag}</text>
            {/* 이름 */}
            <text x="80" y={y + 12} textAnchor="middle" fontSize="13" fontFamily="serif" fontWeight="700" fill={INK}>{t.text}</text>
          </g>
        )
      })}
    </Scene>
  )
}

// ── R5 교실 — 기표 연습지·개표 칠판 ────────────────────────────────────

/** 연습지 더미: 모서리 어긋난 5장 겹침. tag에 위치+찢김 여부, text=글자. */
function Ballots({ clue }: { clue: TokensClue }) {
  // 위치 태그 → z 순서(맨 아래가 먼저 쌓인 것 — 아래 = 0)
  const posOrder = (tag: string): number => {
    if (tag.includes('맨 위')) return clue.tokens.length
    if (tag.includes('맨 아래')) return 1
    const m = tag.match(/위에서\s*(\d+)째/)
    if (m) return clue.tokens.length + 1 - Number(m[1])
    return 2
  }
  // 계단 부채꼴 — 다섯 장 전부의 글자가 보여야 풀 수 있다("들춰 보면 아래 장들이 차례로 보인다").
  // 맨 위 장이 화면 위, 아래 깔린 장일수록 아래로 내려가며 노출 띠(글자·작대기)가 드러난다.
  const n = clue.tokens.length
  const sheets = clue.tokens
    .map((t, i) => ({ t, i, z: posOrder(t.tag ?? '') })) // z: 1=맨 아래(먼저 낸 표) … n=맨 위
    .sort((a, b) => a.z - b.z)
  const SHEET_H = 58
  const STEP = 19
  const yOf = (z: number) => 12 + (n - z) * STEP // 맨 위(z=n)가 화면 맨 위

  return (
    <Scene vb={`0 0 120 ${24 + SHEET_H + (n - 1) * STEP}`}>
      <rect x="0" y="0" width="120" height={24 + SHEET_H + (n - 1) * STEP} rx="3" fill="#ddd8c8" />
      {/* 아래 깔린 장부터… 이 아니라, 화면상 아래(z 작은)부터 그리고 위 장이 그 윗부분을 덮는다 */}
      {sheets.map(({ t, z }) => {
        const torn = (t.tag ?? '').includes('찢김')
        const px = 13 + ((z % 2) * 3 - 1.5) // 살짝 어긋난 좌우 지터
        const py = yOf(z)
        return (
          <g key={z}>
            {torn ? (
              // 찢긴 장 — 톱니 아랫변(반으로 찢겨 아래쪽이 없다)
              <path d={`M${px} ${py} h94 v${SHEET_H - 16} l-6 6 l-7 -5 l-7 6 l-7 -5 l-8 6 l-7 -5 l-7 6 l-8 -5 l-7 6 l-7 -5 l-7 6 l-7 -5 l-9 5 Z`}
                fill={HANJI} stroke="#c4b890" strokeWidth="0.8" />
            ) : (
              <rect x={px} y={py} width="94" height={SHEET_H} rx="2" fill={HANJI} stroke="#c4b890" strokeWidth="0.8" />
            )}
            {/* 노출 띠(각 장의 아랫부분)에 등사된 글자 + 작대기 기호 소품 */}
            <text x={px + 22} y={py + SHEET_H - 7} textAnchor="middle"
              fontSize="17" fontFamily="serif" fontWeight="700" fill={INK}>{t.text}</text>
            <g stroke="#9a8870" strokeWidth="1.2" strokeLinecap="round" opacity="0.55">
              {Array.from({ length: Math.max(1, ((z + 1) % 4) + 1) }).map((_, s) => (
                <line key={s} x1={px + 44 + s * 4.5} y1={py + SHEET_H - 17} x2={px + 44 + s * 4.5} y2={py + SHEET_H - 7} />
              ))}
            </g>
            {/* 위치 메모(관측 보조 — 더미에서 읽히는 사실의 라벨) */}
            <text x={px + 90} y={py + SHEET_H - 8} textAnchor="end" fontSize="5.5" fill="#9a8870">{t.tag}</text>
          </g>
        )
      })}
    </Scene>
  )
}

/** 完成 tally 한 묶음 — 막대 4개 + 사선(||||＼), 다섯을 묶는 서양식 작대기 셈. */
function FullTally({ x, y, size, color }: { x: number; y: number; size: number; color: string }) {
  const s = size / 24
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} stroke={color} strokeWidth="2.6" strokeLinecap="round" fill="none">
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1={-9 + i * 5} y1="-11" x2={-9 + i * 5} y2="11" />
      ))}
      {/* 다섯째 — 사선으로 네 막대를 묶는다(왼아래→오른위) */}
      <line x1="-13" y1="11" x2="10" y2="-11" />
    </g>
  )
}

/** 미완성 tally — 막대 n개만(n=1~4), 아직 사선이 없다(다섯 미만). */
function PartialTally({ x, y, size, color, strokes }: {
  x: number; y: number; size: number; color: string; strokes: number
}) {
  const s = size / 24
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} stroke={color} strokeWidth="2.6" strokeLinecap="round" fill="none">
      {Array.from({ length: Math.max(0, Math.min(4, strokes)) }).map((_, i) => (
        <line key={i} x1={-9 + i * 5} y1="-11" x2={-9 + i * 5} y2="11" />
      ))}
    </g>
  )
}

/** 개표 칠판 — 위 '개표 차례' 띠(순서축, 명확화) + 아래 표(칸 차례 그대로 = 값축).
 *  칸은 **원래 차례**로 그린다(겹침 순으로 줄 세우면 직독=정답 누설 — 설계서 v2 L8).
 *  순서축은 좌→우 대각 계단 + 명도 단계 + 겹침으로 "먼저 → 나중"을 한눈에 읽히게 한다.
 *  값축은 서양식 작대기 셈: 完成 묶음(||||＼)은 다섯, 끝의 미완성 막대 수(1~4)가 답. */
function Tallyboard({ clue }: { clue: TokensClue }) {
  const items = clue.tokens.map((t, i) => {
    const tagParts = (t.tag ?? '').split(' · ')
    const jeongMatch = (tagParts[1] ?? '').match(/正×(\d+)/)
    return {
      name: tagParts[0] ?? '',
      full: jeongMatch ? Number(jeongMatch[1]) : 0,
      partial: Number(t.text ?? '0'),
      pos: (t as { pos?: number }).pos ?? i + 1,
    }
  })
  const byPos = [...items].sort((a, b) => a.pos - b.pos) // pos 1=맨 먼저 적힘
  const PAD_W = 40, PAD_H = 16
  // 좌→우 대각 계단(먼저=왼아래·흐림 → 나중=오른위·선명). 인접 패끼리만 모서리 겹침.
  const padX = (i: number) => 6 + i * 26
  const padY = (i: number) => 40 - i * 9

  return (
    <Scene vb="0 0 132 158">
      {/* 칠판 */}
      <rect x="0" y="0" width="132" height="158" rx="4" fill={BOARD} />
      {/* ── 위: 개표 차례 띠 ── */}
      <text x="6" y="9" fontSize="6.5" fill={HANJI} opacity="0.6">개표 차례</text>
      {/* 먼저 → 나중 방향 화살표 */}
      <g stroke={HANJI} strokeWidth="0.9" opacity="0.5" fill="none">
        <line x1="20" y1="12" x2="118" y2="12" />
        <path d="M118 12 l-4 -2 m4 2 l-4 2" />
      </g>
      <text x="20" y="9" fontSize="5.5" fill={HANJI} opacity="0.55">먼저</text>
      <text x="118" y="9" textAnchor="end" fontSize="5.5" fill={HANJI} opacity="0.55">나중</text>
      {/* 먼저 쓴 패부터 그리면 나중(오른위) 패가 모서리를 덮는다 — 겹침이 곧 차례 */}
      {byPos.map((it, i) => {
        const x = padX(i), y = padY(i)
        const fade = 0.45 + i * 0.18 // 먼저=흐림 → 나중=선명
        return (
          <g key={it.pos}>
            {/* 불투명 면 — 아래 깔린(먼저 쓴) 패의 분필을 덮어 끊는다 */}
            <rect x={x} y={y} width={PAD_W} height={PAD_H} rx="2.5" fill="#243f37" opacity={fade} />
            <rect x={x} y={y} width={PAD_W} height={PAD_H} rx="2.5"
              fill="none" stroke={HANJI} strokeWidth="1.5" opacity={fade} />
            <text x={x + PAD_W / 2} y={y + 11} textAnchor="middle" fontSize="8.5"
              fill={HANJI} opacity={Math.min(1, fade + 0.2)}>{it.name}</text>
          </g>
        )
      })}
      {/* ── 아래: 개표 표 — 칸 차례 그대로(값축). 한 칸 = 이름 + 完成 묶음들 + 미완성 ── */}
      <line x1="6" y1="62" x2="126" y2="62" stroke={HANJI} strokeWidth="0.6" opacity="0.3" />
      {items.map((it, k) => {
        const x = 4 + k * 32
        const cx = x + 15
        return (
          <g key={k}>
            <line x1={x + 31} y1="64" x2={x + 31} y2="152" stroke={HANJI} strokeWidth="0.5" opacity="0.2" />
            <text x={cx} y="74" textAnchor="middle" fontSize="7.5" fill={HANJI} opacity="0.85">{it.name}</text>
            {/* 完成 묶음(||||＼ = 다섯) — 한 행에 하나씩 세로로 */}
            {Array.from({ length: it.full }).map((_, ji) => (
              <FullTally key={ji} x={cx} y={88 + ji * 17} size={15} color={HANJI} />
            ))}
            {/* 미완성 막대 — 마지막 묶음 다음 줄(붉게 강조 — '끝나지 않은 글자') */}
            {it.partial > 0 && (
              <PartialTally x={cx} y={88 + it.full * 17} size={15} color="#e0b070" strokes={it.partial} />
            )}
          </g>
        )
      })}
    </Scene>
  )
}

// ── R6 교실 — 학급일지·답안지 ──────────────────────────────────────────

/** 학급일지: 공책 펼침. 'ㅅ' 크게 — 첫 획(왼 삐침) 과장되게 길게 + 보통 ㅅ 비교. */
function Daybook({ clue: _clue }: { clue: TokensClue }) {
  return (
    <Scene vb="0 0 130 120">
      {/* 공책 펼침 */}
      <rect x="2" y="4" width="126" height="112" rx="3" fill={HANJI} stroke="#c4b890" strokeWidth="1" />
      {/* 가운데 철선 */}
      <line x1="65" y1="4" x2="65" y2="116" stroke="#c4b890" strokeWidth="1.4" />
      {/* 줄 */}
      {[28, 44, 60, 76, 92, 108].map((y) => (
        <line key={y} x1="4" y1={y} x2="126" y2={y} stroke="#d0c8b4" strokeWidth="0.6" />
      ))}
      {/* 제목 */}
      <text x="32" y="20" textAnchor="middle" fontSize="8" fill="#9a8870">학급일지</text>
      {/* 왼쪽 페이지: 버릇 있는 ㅅ — 왼 삐침 과장되게 길게 */}
      {/* ㅅ SVG 직접: 왼 삐침이 훨씬 길다 */}
      <g stroke={INK} strokeWidth="3.5" strokeLinecap="round" fill="none">
        {/* 왼 삐침 — 과장되게 길게 */}
        <line x1="14" y1="90" x2="38" y2="42" />
        {/* 오른 삐침 — 보통 */}
        <line x1="38" y1="42" x2="56" y2="90" />
      </g>
      <text x="35" y="106" textAnchor="middle" fontSize="7" fill="#8a7858" fontStyle="italic">긴 첫 획</text>
      {/* 오른쪽 페이지: 보통 ㅅ — 균형 */}
      <g stroke={INK} strokeWidth="3.5" strokeLinecap="round" fill="none" opacity="0.55">
        <line x1="74" y1="90" x2="90" y2="50" />
        <line x1="90" y1="50" x2="106" y2="90" />
      </g>
      <text x="90" y="106" textAnchor="middle" fontSize="7" fill="#8a7858" fontStyle="italic">보통</text>
    </Scene>
  )
}

/** 답안지 여덟 장: 상단 고정 띠(학급일지 필적 기준 ㅅ) + 2×4 그리드. 각 장에 번호·자국·필적 +
 *  관측 라벨("자국 없음/지운 자국", "버릇 같음/버릇 다름")을 명시 — 자물쇠는 번호만이라 여기서 가린다. */
function Exams({ clue }: { clue: TokensClue }) {
  const ROW = 56
  const vbH = 42 + 4 * ROW + 4
  return (
    <Scene vb={`0 0 120 ${vbH}`}>
      <rect x="0" y="0" width="120" height={vbH} rx="3" fill="#e8e0d0" />
      {/* 상단 고정 띠 — 학급일지 ㅅ 필적 기준 */}
      <rect x="0" y="0" width="120" height="36" rx="3" fill={BOARD} />
      <text x="10" y="13" fontSize="7.5" fill={HANJI} opacity="0.8">진짜 = 자국 없고 버릇 같은 것</text>
      {/* 기준 ㅅ — 긴 첫 획 */}
      <g stroke={HANJI} strokeWidth="3" strokeLinecap="round" fill="none">
        <line x1="88" y1="32" x2="103" y2="14" />
        <line x1="103" y1="14" x2="114" y2="32" />
      </g>
      <text x="100" y="9" textAnchor="middle" fontSize="5.5" fill={HANJI} opacity="0.7">기준 ㅅ</text>
      {clue.tokens.map((t, i) => {
        const col = i % 2, row = Math.floor(i / 2)
        const x = 6 + col * 57, y = 42 + row * ROW
        const hasErase = (t.tag ?? '').includes('지운 자국')
        const sameHabit = (t.tag ?? '').includes('버릇 같음')
        const real = !hasErase && sameHabit
        const mx = x + 42, my = y + 32
        return (
          <g key={i}>
            {/* 답안지 이름 칸 크롭 — 진짜는 한지가 살짝 밝게 */}
            <rect x={x} y={y} width="52" height="40" rx="2" fill={real ? '#f4eedd' : HANJI} stroke="#c4b890" strokeWidth="0.8" />
            <rect x={x + 2} y={y + 2} width="48" height="22" rx="1.5" fill="#f6f0de" stroke="#d0c0a0" strokeWidth="0.6" />
            {/* 지운 자국 — 이름 밑 거뭇한 번짐(관측축 ①) */}
            {hasErase && (
              <>
                <rect x={x + 5} y={y + 14} width="42" height="9" rx="2" fill="#8a7860" opacity="0.5" />
                <rect x={x + 9} y={y + 16} width="30" height="5" rx="2" fill="#5a4a38" opacity="0.45" />
              </>
            )}
            {/* 이름 「엄석대」 */}
            <text x={x + 24} y={y + 18} textAnchor="middle" fontSize="10.5" fontFamily="serif" fontWeight="700" fill={INK}>엄석대</text>
            {/* 점수 칸 — 잉크 얼룩으로 가림 */}
            <rect x={x + 2} y={y + 26} width="30" height="10" rx="1" fill="#6a5a40" opacity="0.6" />
            <ellipse cx={x + 13} cy={y + 31} rx="8" ry="4" fill="#4a3a28" opacity="0.55" />
            {/* 확대경 — 'ㅅ' 첫 획(관측축 ②) */}
            <circle cx={mx} cy={my} r="8.5" fill="#fbf4df" stroke="#9a8870" strokeWidth="1" />
            <g stroke={INK} strokeWidth="1.9" strokeLinecap="round" fill="none">
              {sameHabit ? (
                <>
                  <line x1={mx - 6.5} y1={my + 5.5} x2={mx + 2.5} y2={my - 5.5} />
                  <line x1={mx + 2.5} y1={my - 5.5} x2={mx + 6} y2={my + 4} />
                </>
              ) : (
                <>
                  <line x1={mx - 3} y1={my + 4} x2={mx + 0.5} y2={my - 4.5} />
                  <line x1={mx + 0.5} y1={my - 4.5} x2={mx + 4} y2={my + 4} />
                </>
              )}
            </g>
            {/* 번호(1~8) — 자물쇠가 누르는 번호. 좌상 또렷이 */}
            <circle cx={x + 7} cy={y + 7} r="6.5" fill={real ? '#2e6e4e' : BOARD} stroke={HANJI} strokeWidth="0.9" />
            <text x={x + 7} y={y + 10} textAnchor="middle" fontSize="9" fontWeight="700" fill={HANJI}>{t.text}</text>
            {/* 관측 라벨 — 자국·필적을 글로도 명시(자물쇠 번호만이라 여기서 가린다) */}
            <text x={x + 26} y={y + 47} textAnchor="middle" fontSize="6.5"
              fill={hasErase ? '#9a3020' : '#3a7050'}>{hasErase ? '지운 자국 있음' : '자국 없음'}</text>
            <text x={x + 26} y={y + 54} textAnchor="middle" fontSize="6.5"
              fill={sameHabit ? '#3a7050' : '#9a3020'}>{sameHabit ? '버릇 같음' : '버릇 다름'}</text>
          </g>
        )
      })}
    </Scene>
  )
}

// ── 레지스트리 — clues.json variant 16종과 1:1 ────────────────────────

const BY_VARIANT: Record<string, (p: { clue: TokensClue }) => JSX.Element> = {
  notice: Notice,
  timetable: Timetable,
  staff: Staff,
  keys: Keys,
  diary: Diary,
  buckets: Buckets,
  shoes: Shoes,
  docket: Docket,
  seals: Seals,
  tray: Tray,
  papers: Papers,
  ranks: Ranks,
  ballots: Ballots,
  tallyboard: Tallyboard,
  daybook: Daybook,
  exams: Exams,
}

export function Note({ clue }: { clue: NoteClue }) {
  return (
    <div className="dieg-paper">
      <p className="dieg-note__body">{clue.body}</p>
    </div>
  )
}

export function DiegeticClue({ clue, discovered: _discovered = [] }: { clue: TokensClue; discovered?: string[] }) {
  const C = clue.variant ? BY_VARIANT[clue.variant] : undefined
  if (C) return <C clue={clue} />
  // 폴백: 일반 토큰 칩
  return (
    <div className="tokens">
      {clue.tokens.map((t, i) => (
        <span className="token" key={i}>{t.text}</span>
      ))}
    </div>
  )
}

/** esc_7 호환 별칭 — ExamineModal 이 Diegetic 이름으로 임포트. */
export { DiegeticClue as Diegetic }
