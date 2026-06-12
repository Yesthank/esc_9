import { useMemo, useRef, useState } from 'react'
import type { Puzzle } from '../engine/types'

// 자물쇠에는 단서·풀이법이 없다 — 입력만. (기본 노출 기준 — 힌트는 접힌 드로어 뒤에)
// 숫자: 기계식 다이얼 컬럼(▲/▼). 한글 정답: 음절 후보 슬레이트(IME 회피, 설계서 §4-6).
// 라틴 문자: 황동 슬레이트 자유 입력(이번 게임엔 미사용 경로 — 불변 유지).
// 힌트 드로어 "몰래 속삭임": 클릭당 1단계 공개(2단계), hintsUsed 에 집계·세이브.
export function PuzzleModal({
  puzzle,
  title,
  hints = [],
  revealed = 0,
  onReveal,
  onSolve,
  onClose,
}: {
  puzzle: Puzzle
  title?: string
  hints?: string[]
  revealed?: number
  onReveal?: () => void
  onSolve: () => void
  onClose: () => void
}) {
  const shown = Math.min(revealed, hints.length)
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--lock" onClick={(e) => e.stopPropagation()}>
        <button className="modal__close" onClick={onClose} aria-label="닫기">✕</button>
        <h3 className="modal__title">{title ?? puzzle.title ?? '자물쇠'}</h3>
        <p className="lock__hint">기록한 단서를 떠올려 자물쇠를 풀어라.</p>
        {puzzle.type === 'keypad' ? (
          <DialLock answer={puzzle.answer} digits={puzzle.digits} onSolve={onSolve} />
        ) : puzzle.type === 'toggle' ? (
          <ToggleLock count={puzzle.count} answer={puzzle.answer} onSolve={onSolve} />
        ) : /[가-힣]/.test(puzzle.answer) ? (
          <KoreanSlate
            puzzleId={puzzle.id}
            answer={puzzle.answer}
            placeholder={puzzle.placeholder}
            onSolve={onSolve}
          />
        ) : (
          <SlateInput answer={puzzle.answer} placeholder={puzzle.placeholder} onSolve={onSolve} />
        )}
        {hints.length > 0 && (
          <div className="whisper">
            {shown > 0 && (
              <ul className="whisper__list">
                {hints.slice(0, shown).map((h, i) => (
                  <li key={i}><em>속삭임 {i + 1}</em> {h}</li>
                ))}
              </ul>
            )}
            {shown < hints.length && (
              <button className="whisper__btn" onClick={onReveal}>
                🤫 바람결의 속삭임을 듣는다 {shown > 0 ? '(한 번 더)' : ''}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/** 릴(reel) 한 자리 — ▼(아래)=+1 · ▲(위)=−1, 창을 위아래로 드래그해도 돌아간다.
 *  드래그 방향은 릴 표면을 손끝으로 끄는 물리 직관: 아래로 끌면 윗숫자가 내려온다(−1). */
function DialColumn({ v, onTurn }: { v: number; onTurn: (d: number) => void }) {
  const drag = useRef<{ y: number } | null>(null)
  const STEP = 22 // px 당 1눈금

  return (
    <div className="dial__col">
      <button className="dial__btn" onClick={() => onTurn(-1)} aria-label="감소">▲</button>
      <div
        className="dial__window"
        onPointerDown={(e) => {
          drag.current = { y: e.clientY }
          ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
        }}
        onPointerMove={(e) => {
          if (!drag.current) return
          const dy = e.clientY - drag.current.y
          const steps = Math.trunc(dy / STEP)
          if (steps !== 0) {
            onTurn(-steps) // 아래로 끌면(+dy) 감소 — 릴을 끌어내리는 방향
            drag.current.y += steps * STEP
          }
        }}
        onPointerUp={() => { drag.current = null }}
        onPointerCancel={() => { drag.current = null }}
      >
        <span className="dial__ghost">{(v + 9) % 10}</span>
        <span className="dial__digit">{v}</span>
        <span className="dial__ghost">{(v + 1) % 10}</span>
      </div>
      <button className="dial__btn" onClick={() => onTurn(1)} aria-label="증가">▼</button>
    </div>
  )
}

/** 기계식 다이얼 — 클릭(▼=+1·▲=−1)과 상하 드래그 모두 지원, 레버로 확정. */
function DialLock({ answer, digits, onSolve }: { answer: string; digits: number; onSolve: () => void }) {
  const [vals, setVals] = useState<number[]>(Array(digits).fill(0))
  const [shake, setShake] = useState(false)

  const turn = (i: number, d: number) =>
    setVals((v) => v.map((x, k) => (k === i ? (((x + d) % 10) + 10) % 10 : x)))

  const submit = () => {
    if (vals.join('') === answer) onSolve()
    else { setShake(true); setTimeout(() => setShake(false), 480) }
  }

  return (
    <div className="dial">
      <div className={`dial__row${shake ? ' shake' : ''}`}>
        {vals.map((v, i) => (
          <DialColumn key={i} v={v} onTurn={(d) => turn(i, d)} />
        ))}
      </div>
      <button className="btn btn--primary dial__lever" onClick={submit}>레버를 당긴다</button>
    </div>
  )
}

// ───────────────────── 토글 자물쇠 (esc_9 L9 — 1~count 버튼, 순서 무관 부분집합) ─────────────────────
// 답안지 여덟 장 중 '제 손으로 친 진짜'를 모두 누른다. 누르면 들어가고(선택), 다시 누르면 나온다(해제).
// 선택 집합을 오름차순 정렬해 answer 와 비교. data-toggle="N" (headless verify 계약).
function ToggleLock({ count, answer, onSolve }: { count: number; answer: string; onSolve: () => void }) {
  const [on, setOn] = useState<Set<number>>(new Set())
  const [shake, setShake] = useState(false)
  const toggle = (n: number) =>
    setOn((s) => {
      const next = new Set(s)
      if (next.has(n)) next.delete(n)
      else next.add(n)
      return next
    })
  const submit = () => {
    const picked = [...on].sort((a, b) => a - b).join('')
    if (picked === answer) onSolve()
    else { setShake(true); setTimeout(() => setShake(false), 480) }
  }
  return (
    <div className="toggle">
      <div className={`toggle__grid${shake ? ' shake' : ''}`}>
        {Array.from({ length: count }).map((_, i) => {
          const n = i + 1
          const active = on.has(n)
          return (
            <button
              key={n}
              className={`toggle__btn${active ? ' on' : ''}`}
              data-toggle={n}
              aria-pressed={active}
              onClick={() => toggle(n)}
            >
              {n}
            </button>
          )
        })}
      </div>
      <button className="btn btn--primary toggle__submit" onClick={submit}>걸쇠를 채운다</button>
    </div>
  )
}

// ───────────────────── 음절 후보 슬레이트 (한글 정답 — IME 자체 회피, §4-6 / §7-D6) ─────────────────────
// 자유 타이핑 대신 음절 버튼 격자: 정답 음절 + 테마 풀 미끼를 puzzle id 기반 결정론으로
// 선택·셔플해 제시. 탭하면 입력란에 쌓이고(×=한 칸, 비움=전체), 제출 버튼으로만 판정(Enter 의존 금지).
// 각 후보 버튼에 data-syl="음절" (headless verify 계약).

/** esc_9 「만장일치」 테마 미끼 음절 풀 — 퍼즐별 분리(설계서 v2 D7).
 *  금칙 안전(Fe7): 봉인어 음절 '아'·'니'·'다' 는 전 풀에서 제외(정답 음절은 런타임이 자동 주입).
 *  C11 방어: '오'·'요' 도 제외 — 사이퍼 슬레이트에서 「아니오/아니요」 오답 혼선 차단. */
const THEME_SYLLABLES_DEFAULT: readonly string[] = [
  '교', '실', '풍', '금', '칠', '판', '분', '필', '유', '리',
  '창', '책', '상', '걸', '레', '종', '주', '번', '운', '동',
]
const THEME_SYLLABLES_BY_PUZZLE: Record<string, readonly string[]> = {
  // L4 신발장 — 신발·당번 소품 미끼(정답 「급장선거」 음절은 자동 주입).
  'th-shoes': ['신', '발', '주', '번', '문', '수', '고', '무', '현', '관', '운', '동', '흙', '먼', '지', '걸'],
  // L7 연습지 — 선거 소품 미끼(정답 「만장일치」 음절은 자동 주입).
  'th-stack': ['표', '함', '개', '붓', '투', '기', '호', '참', '관', '교', '탁', '칠', '판', '분', '필', '종'],
  // 사이퍼 — 그 밤의 교실 소품 미끼(정답 「아니다」 음절은 자동 주입).
  'twistedhero-cipher': ['칠', '판', '분', '필', '달', '빛', '유', '리', '창', '교', '실', '밤', '돌', '책', '상', '종'],
}

const SLATE_SIZE = 12 // 4×3 격자

/** FNV-1a 32bit — puzzle id → 시드 */
function fnv1a(s: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/** mulberry32 — 결정론 PRNG */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** 정답 음절 + 미끼를 결정론 선택·셔플. 정답이 격자에서 연속으로 읽히면 재셔플(노출 금칙 가드). */
function buildSlate(puzzleId: string, answer: string): string[] {
  const rng = mulberry32(fnv1a(puzzleId))
  const answerSyls = Array.from(new Set(answer.split('')))
  const theme = THEME_SYLLABLES_BY_PUZZLE[puzzleId] ?? THEME_SYLLABLES_DEFAULT
  const pool = [...new Set(theme)].filter((s) => !answerSyls.includes(s))
  const decoys: string[] = []
  while (decoys.length < Math.max(SLATE_SIZE - answerSyls.length, 0) && pool.length > 0) {
    decoys.push(pool.splice(Math.floor(rng() * pool.length), 1)[0])
  }
  let keys = [...answerSyls, ...decoys]
  for (let attempt = 0; attempt < 8; attempt++) {
    for (let i = keys.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1))
      ;[keys[i], keys[j]] = [keys[j], keys[i]]
    }
    if (!keys.join('').includes(answer)) break
  }
  return keys
}

/** 음절 슬레이트 — 한글 정답 입력기. NFC 비교 유지, 제출 버튼으로만 판정. */
function KoreanSlate({
  puzzleId,
  answer,
  placeholder,
  onSolve,
}: {
  puzzleId: string
  answer: string
  placeholder?: string
  onSolve: () => void
}) {
  const target = useMemo(() => answer.trim().normalize('NFC'), [answer])
  const keys = useMemo(() => buildSlate(puzzleId, target), [puzzleId, target])
  const [input, setInput] = useState('')
  const [shake, setShake] = useState(false)
  const MAX = Math.max(target.length + 3, 8)

  const submit = () => {
    if (input.normalize('NFC') === target) onSolve()
    else { setShake(true); setTimeout(() => setShake(false), 480) }
  }

  return (
    <div className="kslate">
      <div className={`kslate__entry${shake ? ' shake' : ''}`}>
        <div className="kslate__display" aria-label="고른 글자">
          {input !== '' ? input : <span className="kslate__ghost">{placeholder ?? '글자를 골라 끼운다'}</span>}
        </div>
        <button
          className="kslate__del"
          onClick={() => setInput((v) => v.slice(0, -1))}
          aria-label="한 칸 지움"
        >×</button>
        <button
          className="kslate__clear"
          onClick={() => setInput('')}
          aria-label="전체 지움"
        >비움</button>
      </div>
      <div className="kslate__grid">
        {keys.map((s) => (
          <button
            key={s}
            className="kslate__key"
            data-syl={s}
            onClick={() => setInput((v) => (v + s).slice(0, MAX))}
          >{s}</button>
        ))}
      </div>
      <button className="btn btn--primary kslate__submit" onClick={submit}>맞춰 넣는다</button>
    </div>
  )
}

/** 황동 슬레이트 — 라틴 문자 자유 입력(이번 게임 미사용 경로, 불변 유지). */
function SlateInput({ answer, placeholder, onSolve }: { answer: string; placeholder?: string; onSolve: () => void }) {
  const [input, setInput] = useState('')
  const [shake, setShake] = useState(false)

  const submit = () => {
    // NFC 정규화: 플랫폼별 자모 분해 입력(NFD)을 합성형으로 통일.
    const norm = (s: string) => s.trim().normalize('NFC').toLowerCase()
    if (norm(input) === norm(answer)) onSolve()
    else { setShake(true); setTimeout(() => setShake(false), 480) }
  }

  return (
    <div className="slate">
      <div className={`slate__field${shake ? ' shake' : ''}`}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder={placeholder ?? '각인 입력'}
          autoFocus
          autoComplete="off"
          spellCheck={false}
        />
        <button onClick={submit}>돌린다</button>
      </div>
    </div>
  )
}
