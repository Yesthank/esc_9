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
      {/* 맨 아랫줄(도) 살짝 도톰 — 앵커 암시(숫자·글자 비표기 계약) */}
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
function Keys({ clue: _clue }: { clue: TokensClue }) {
  // 흰 건반 7개, 검은 건반 배치(도레미파솔라시 기준)
  const wW = 14, wH = 64
  const bW = 9, bH = 38
  // 검은 건반 위치: 도#(0.5), 레#(1.5), 파#(3.5), 솔#(4.5), 라#(5.5)
  const blackOffsets = [0.65, 1.65, 3.65, 4.65, 5.65]
  return (
    <Scene vb="0 0 120 96">
      {/* 풍금 몸체 */}
      <rect x="4" y="16" width="112" height="76" rx="4" fill={MARU} stroke="#5a4030" strokeWidth="1.2" />
      {/* 흰 건반 7개 */}
      {Array.from({ length: 7 }).map((_, i) => {
        const x = 8 + i * wW
        return (
          <rect key={i} x={x} y="22" width={wW - 1} height={wH}
            rx="2" fill={HANJI} stroke="#c0b090" strokeWidth="0.8" />
        )
      })}
      {/* 검은 건반 */}
      {blackOffsets.map((off, i) => (
        <rect key={i} x={8 + off * wW} y="22" width={bW} height={bH}
          rx="1.5" fill={INK} />
      ))}
      {/* 첫째 건반(도) — 빨간 단추 */}
      <circle cx={8 + wW / 2} cy={22 + wH - 10} r="4.5" fill={RED} stroke="#7a1a0a" strokeWidth="1" />
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

/** 양동이 줄: 우물(좌상)에서 지그재그로 양동이 4개. text=표찰 번호, tag=걸음수. */
function Buckets({ clue }: { clue: TokensClue }) {
  // 양동이 위치 — 우물에서 지그재그
  const positions: [number, number][] = [
    [22, 30], [60, 55], [26, 80], [70, 105],
  ]
  return (
    <Scene vb="0 0 110 140">
      <rect x="0" y="0" width="110" height="140" rx="3" fill="#e8f0e4" />
      {/* 우물 */}
      <rect x="4" y="4" width="26" height="22" rx="2" fill={MARU} stroke="#5a3a18" strokeWidth="1.2" />
      <ellipse cx="17" cy="8" rx="10" ry="4" fill="#8a6a48" stroke="#5a3a18" strokeWidth="1" />
      <text x="17" y="22" textAnchor="middle" fontSize="8" fontFamily="serif" fill={HANJI}>우물</text>
      {/* 우물~첫 양동이 점선 */}
      <line x1="17" y1="26" x2={positions[0]![0]} y2={positions[0]![1] - 12}
        stroke={MARU} strokeWidth="1" strokeDasharray="3 3" />
      {/* 양동이 사이 점선 */}
      {positions.slice(0, -1).map((p, i) => {
        const q = positions[i + 1]!
        return (
          <line key={i} x1={p[0]} y1={p[1] + 12} x2={q[0]} y2={q[1] - 12}
            stroke={MARU} strokeWidth="1" strokeDasharray="3 3" />
        )
      })}
      {/* 양동이 4개 */}
      {clue.tokens.map((t, i) => {
        const pos = positions[i % positions.length]!
        const [cx, cy] = pos
        return (
          <g key={i}>
            {/* 양동이 몸체(사다리꼴) */}
            <path d={`M${cx - 9} ${cy - 10} L${cx + 9} ${cy - 10} L${cx + 7} ${cy + 10} L${cx - 7} ${cy + 10} Z`}
              fill="#6090a8" stroke="#3a6070" strokeWidth="1.2" />
            {/* 손잡이 */}
            <path d={`M${cx - 7} ${cy - 10} Q${cx} ${cy - 20} ${cx + 7} ${cy - 10}`}
              fill="none" stroke="#3a6070" strokeWidth="1.2" />
            {/* 표찰 번호 */}
            <text x={cx} y={cy + 3} textAnchor="middle" fontSize="10" fontFamily="serif" fontWeight="700" fill={HANJI}>{t.text}</text>
            {/* 발치 걸음수 */}
            <text x={cx} y={cy + 22} textAnchor="middle" fontSize="7" fill="#4a6070">{t.tag}</text>
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

/** 完成 正 한 글자 SVG — 다섯 획을 모두 완전히 그림. */
function FullJeong({ x, y, size, color }: { x: number; y: number; size: number; color: string }) {
  const s = size / 28
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} stroke={color} strokeWidth="3.2" strokeLinecap="round" fill="none">
      {/* 正 획순: 1=맨 위 가로, 2=세로, 3=중간 짧은 가로, 4=왼 세로, 5=맨 아래 가로 */}
      <line x1="-11" y1="-12" x2="11" y2="-12" />   {/* 1 — 맨 위 가로 */}
      <line x1="0" y1="-12" x2="0" y2="2" />          {/* 2 — 중심 세로 */}
      <line x1="-8" y1="-3" x2="8" y2="-3" />         {/* 3 — 중간 짧은 가로 */}
      <line x1="-8" y1="-3" x2="-8" y2="12" />        {/* 4 — 왼 세로 */}
      <line x1="-11" y1="12" x2="11" y2="12" />       {/* 5 — 맨 아래 가로 */}
    </g>
  )
}

/** 미완성 正 — 획순 1~n 획만 그림(n=1~4). */
function PartialJeong({ x, y, size, color, strokes }: {
  x: number; y: number; size: number; color: string; strokes: number
}) {
  const s = size / 28
  // 획 정의: [x1, y1, x2, y2]
  const lines: [number, number, number, number][] = [
    [-11, -12, 11, -12],   // 1
    [0, -12, 0, 2],         // 2
    [-8, -3, 8, -3],        // 3
    [-8, -3, -8, 12],       // 4
  ]
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} stroke={color} strokeWidth="3.2" strokeLinecap="round" fill="none">
      {lines.slice(0, strokes).map((l, i) => (
        <line key={i} x1={l[0]} y1={l[1]} x2={l[2]} y2={l[3]} />
      ))}
    </g>
  )
}

/** 개표 칠판 — 위 클러스터(이름 패 겹침 사슬 = 순서축) + 아래 표(칸 차례 그대로 = 값축).
 *  칸은 **원래 차례**로 그린다(겹침 순으로 줄 세우면 직독=정답 누설 — 설계서 v2 L8).
 *  겹침은 물리 페인터 알고리즘: 먼저 쓴(pos 작은) 패가 아래 깔리고, 나중 패의 불투명 면이
 *  깔린 패의 분필 테두리를 끊는다 — "덧쓴 쪽이 위다". */
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
  // 이름 패 클러스터 배치 — 겹침이 정확히 사슬 3쌍만 생기게(인접쌍: pos1-2, 2-3, 3-4).
  // 칸 차례(items 순서)와 무관하게 pos 로 자리를 정한다: 어디에 쓰였는지가 아니라
  // "어느 패가 어느 패를 덮었는지"가 관측물이다.
  const PAD_XY: Record<number, { x: number; y: number }> = {
    1: { x: 5, y: 8 },   // 맨 먼저 — 맨 아래 깔림
    2: { x: 49, y: 14 },
    3: { x: 23, y: 27 },
    4: { x: 67, y: 33 },
  }
  const PAD_W = 52, PAD_H = 17
  const byPos = [...items].sort((a, b) => a.pos - b.pos)

  return (
    <Scene vb="0 0 132 152">
      {/* 칠판 */}
      <rect x="0" y="0" width="132" height="152" rx="4" fill={BOARD} />
      {/* ── 위: 이름 패 클러스터 — 먼저 쓴 패부터 그리면 나중 패가 모서리를 덮는다 ── */}
      {byPos.map((it) => {
        const p = PAD_XY[it.pos] ?? { x: 5, y: 8 }
        return (
          <g key={it.pos}>
            {/* 불투명 면 — 아래 깔린 패의 분필 테두리를 물리적으로 끊는다 */}
            <rect x={p.x} y={p.y} width={PAD_W} height={PAD_H} rx="2.5" fill="#27433a" />
            <rect x={p.x} y={p.y} width={PAD_W} height={PAD_H} rx="2.5"
              fill="none" stroke={HANJI} strokeWidth="1.6" opacity="0.9" />
            <text x={p.x + PAD_W / 2} y={p.y + 12} textAnchor="middle" fontSize="9"
              fill={HANJI} opacity="0.95">{it.name}</text>
          </g>
        )
      })}
      {/* ── 아래: 개표 표 — 칸 차례 그대로(값축). 한 칸 = 이름 + 完成 正들 + 미완성 ── */}
      <line x1="6" y1="58" x2="126" y2="58" stroke={HANJI} strokeWidth="0.6" opacity="0.3" />
      {items.map((it, k) => {
        const x = 4 + k * 32
        const cx = x + 15
        return (
          <g key={k}>
            <line x1={x + 31} y1="60" x2={x + 31} y2="146" stroke={HANJI} strokeWidth="0.5" opacity="0.2" />
            <text x={cx} y="70" textAnchor="middle" fontSize="7.5" fill={HANJI} opacity="0.85">{it.name}</text>
            {/* 完成 正 — 두 개씩 가로로 */}
            {Array.from({ length: it.full }).map((_, ji) => {
              const jx = cx + (ji % 2 === 0 ? -7 : 7)
              const jy = 84 + Math.floor(ji / 2) * 18
              return <FullJeong key={ji} x={jx} y={jy} size={13} color={HANJI} />
            })}
            {/* 미완성 正 — 마지막 묶음 다음 자리 */}
            {it.partial > 0 && (
              <PartialJeong
                x={cx + (it.full % 2 === 0 ? -7 : 7)}
                y={84 + Math.floor(it.full / 2) * 18}
                size={13} color={HANJI} strokes={it.partial} />
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

/** 답안지 여덟 장: 상단 고정 띠(학급일지 필적 기준 ㅅ) + 2×4 그리드(이름 칸 크롭). */
function Exams({ clue }: { clue: TokensClue }) {
  return (
    <Scene vb="0 0 120 240">
      <rect x="0" y="0" width="120" height="240" rx="3" fill="#e8e0d0" />
      {/* 상단 고정 띠 — 학급일지 ㅅ 필적 기준 */}
      <rect x="0" y="0" width="120" height="36" rx="3" fill={BOARD} />
      <text x="12" y="12" fontSize="7" fill={HANJI} opacity="0.7">필적 기준 — 학급일지</text>
      {/* 기준 ㅅ — 긴 첫 획 */}
      <g stroke={HANJI} strokeWidth="3" strokeLinecap="round" fill="none">
        <line x1="38" y1="34" x2="58" y2="14" />
        <line x1="58" y1="14" x2="72" y2="34" />
      </g>
      <text x="57" y="34" textAnchor="middle" fontSize="6" fill={HANJI} opacity="0.6">긴 첫 획 기준</text>
      {/* 2×4 그리드 — 관측축은 글이 아니라 그림이다(설계서 v2 L9):
          ① 이름 밑 지우개 번짐(있음/없음) ② 확대경 속 'ㅅ' 첫 획(길다/짧다 — 라이터 불빛 확대). */}
      {clue.tokens.map((t, i) => {
        const col = i % 2, row = Math.floor(i / 2)
        const x = 6 + col * 57, y = 42 + row * 48
        const hasErase = (t.tag ?? '').includes('지운 자국')
        const sameHabit = (t.tag ?? '').includes('버릇 같음')
        // 확대경 중심
        const mx = x + 42, my = y + 33
        return (
          <g key={i}>
            {/* 답안지 이름 칸 크롭 */}
            <rect x={x} y={y} width="52" height="40" rx="2" fill={HANJI} stroke="#c4b890" strokeWidth="0.8" />
            {/* 이름 칸 경계 */}
            <rect x={x + 2} y={y + 2} width="48" height="24" rx="1.5" fill={HANJI} stroke="#d0c0a0" strokeWidth="0.6" />
            {/* 지운 자국 — 이름 밑 거뭇한 번짐(관측축 ①) */}
            {hasErase && (
              <>
                <rect x={x + 5} y={y + 15} width="42" height="9" rx="2" fill="#8a7860" opacity="0.4" />
                <rect x={x + 9} y={y + 17} width="30" height="5" rx="2" fill="#6a5a48" opacity="0.35" />
              </>
            )}
            {/* 이름 「엄석대」 */}
            <text x={x + 24} y={y + 20} textAnchor="middle" fontSize="10.5" fontFamily="serif" fontWeight="700" fill={INK}>엄석대</text>
            {/* 점수 칸 — 잉크 얼룩으로 가림(해정 후 공개 — 비표시 계약) */}
            <rect x={x + 2} y={y + 27} width="32" height="10" rx="1" fill="#6a5a40" opacity="0.6" />
            <ellipse cx={x + 14} cy={y + 32} rx="8" ry="4" fill="#4a3a28" opacity="0.55" />
            {/* 확대경 — 라이터 불빛에 비춘 'ㅅ' 첫 획(관측축 ②): 길면 학급일지 버릇과 같다 */}
            <circle cx={mx} cy={my} r="8.5" fill="#fbf4df" stroke="#9a8870" strokeWidth="1" />
            <g stroke={INK} strokeWidth="1.9" strokeLinecap="round" fill="none">
              {sameHabit ? (
                <>
                  {/* 긴 첫 획 — 왼 삐침이 원을 가로지를 만큼 길다 */}
                  <line x1={mx - 6.5} y1={my + 5.5} x2={mx + 2.5} y2={my - 5.5} />
                  <line x1={mx + 2.5} y1={my - 5.5} x2={mx + 6} y2={my + 4} />
                </>
              ) : (
                <>
                  {/* 보통 ㅅ — 짧고 균형 잡힘 */}
                  <line x1={mx - 3} y1={my + 4} x2={mx + 0.5} y2={my - 4.5} />
                  <line x1={mx + 0.5} y1={my - 4.5} x2={mx + 4} y2={my + 4} />
                </>
              )}
            </g>
            {/* 장 번호 */}
            <text x={x + 4} y={y + 37.5} fontSize="6" fill="#9a8870">{t.text}</text>
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
