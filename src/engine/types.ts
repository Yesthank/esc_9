// ============================================================
// esc_2 runtime — game data types
// maker(game-forge)가 emit 하는 GameConfig 스키마. 이 타입에 맞는 config.json 이면
// 코드 수정 없이 어떤 방탈출 게임이든 구동된다. (escape-engine 스키마와 호환)
// + 런타임 전용 Clue 타입(스펙에서 파생된 단서 표현 데이터).
// ============================================================

/** 전체 화면 몰입 특수효과 — maker(game-forge) EffectKind 와 동기 유지. */
export type EffectKind = 'shake' | 'blackout' | 'flicker' | 'lightning'

export interface Condition {
  type: 'flag' | 'item' | 'not-flag' | 'not-item' | 'and' | 'or'
  flagId?: string
  value?: string | boolean
  itemId?: string
  conditions?: Condition[]
}

export type HotspotAction =
  | { type: 'examine'; text: string; image?: string }
  | { type: 'pickup'; itemId: string; text?: string }
  | { type: 'puzzle'; puzzleId: string }
  | { type: 'move'; roomId: string }
  | { type: 'dialog'; dialogId: string }
  | { type: 'trigger'; flagId: string; value: string | boolean; text?: string }

export interface Hotspot {
  id: string
  /** [x%, y%, width%, height%] — 배경 대비 퍼센트 */
  area: [number, number, number, number]
  label?: string
  action: HotspotAction
  visibleWhen?: Condition
  activeWhen?: Condition
  failMessage?: string
}

export interface Room {
  id: string
  name: string
  background: string
  backgroundVariants?: { when: Condition; background: string }[]
  hotspots: Hotspot[]
  entryText?: string
  nav?: { left?: string; right?: string; back?: string }
  entryDialog?: string
  /** 방 진입 순간 발화할 특수효과(선택). */
  entryEffect?: EffectKind
}

export interface PuzzleReward {
  type: 'item' | 'flag' | 'both'
  itemId?: string
  flagId?: string
  flagValue?: string | boolean
  text?: string
  /** 해제 순간 발화할 특수효과(선택). */
  effect?: EffectKind
}

interface PuzzleBase {
  id: string
  title?: string
  reward?: PuzzleReward
  solvedFlag?: string
}

export interface KeypadPuzzle extends PuzzleBase {
  type: 'keypad'
  answer: string
  digits: number
}

export interface TextInputPuzzle extends PuzzleBase {
  type: 'text-input'
  prompt: string
  image?: string
  answer: string
  placeholder?: string
  isKorean?: boolean
}

/** 토글 카드 한 장 — 답안지 미니어처(번호 + 지운 자국 + 필적 버릇). */
export interface ToggleCell {
  n: number          // 번호(1~count)
  name?: string      // 이름 칸 글자(예: '엄석대')
  erase?: boolean    // 이름 밑 지우개 번짐(대리 시험)
  habit?: boolean    // 'ㅅ' 첫 획을 길게 빼는 버릇(학급일지와 일치)
}

/** (esc_9 L9) 토글 자물쇠 — count 칸을 누르면 들어가고 다시 누르면 나온다.
 *  순서 무관. 선택 집합을 오름차순 정렬한 문자열이 answer 와 일치하면 해정.
 *  cells 가 있으면 답안지 그림 카드로 렌더(없으면 단순 번호 버튼). */
export interface TogglePuzzle extends PuzzleBase {
  type: 'toggle'
  count: number
  answer: string // 정답 번호를 오름차순 이어 붙인 문자열 (예: '146')
  prompt?: string
  cells?: ToggleCell[]
}

export type Puzzle = KeypadPuzzle | TextInputPuzzle | TogglePuzzle

export interface DialogLine {
  speaker?: string
  text: string
  setFlag?: { flagId: string; value: string | boolean }
}
export interface Dialog {
  id: string
  lines: DialogLine[]
}

export interface Hint {
  forPuzzle?: string
  steps: string[]
  visibleWhen?: Condition
}

export interface Item {
  id: string
  name: string
  icon: string
  description?: string
}

export interface GameConfig {
  id: string
  title: string
  description?: string
  thumbnail?: string
  timeLimit: number
  startRoom: string
  rooms: Room[]
  puzzles: Puzzle[]
  items: Item[]
  dialogs?: Dialog[]
  hints?: Hint[]
  clearCondition: Condition
  clearMessage?: string
}

// ---- 런타임 단서(clue) 표현 데이터 — maker 스펙에서 파생. 원재료만(풀이법 없음). ----
/** 원작 발췌 에피그래프 — 메커니즘을 문학적으로 넌지시(정답 비노출). */
export interface Epigraph {
  ko: string
  cite: string
}
export interface TokenItem {
  text: string
  color?: string // 색 이름(RED 등)
  hex?: string // 렌더용 색
  tag?: string // 보조 축(벽 방위, 기름 잔량, 야경 회차 등)
  lit?: boolean // 달빛 강조(esc_6 빗금)
  seg?: string // 7세그 세그먼트 id(esc_6 색유리 조각)
}
/** 글자/숫자/기호 토큰을 칩으로 — 대부분의 메커니즘 단서. */
export interface TokensClue {
  type: 'tokens'
  /** 장면 렌더 선택자 — 게임별 Diegetic 레지스트리 키(tally/knocks/wheel …). */
  variant?: string
  label: string
  epigraph?: Epigraph
  /** 기사 끝 주석 등 — 본문 속 넌지시 한 줄. */
  footnote?: string
  tokens: TokenItem[]
  /** (esc_6) 그릴 구멍 위치(1-based, 행우선) — script/grillecard variant. */
  holes?: number[]
  /** (esc_6) 짝 단서 키 — 둘 다 발견되면 결합 렌더(원고+격자판, 양피지+석판). */
  pairKey?: string
  /** (esc_6) 반쪽 양피지의 면. */
  side?: 'left' | 'right'
  /** (esc_6) 반쪽 양피지의 줄(왼/오른 반). */
  lines?: { left: string; right: string }[]
  /** (esc_6) 회전반 어긋남 칸수. */
  shift?: number
  /** (esc_6) 검 문장이 찌르는 대상 단어. */
  word?: string
}
/** 산문 쪽지/소품 — 스토리 레이어(밀고장·추리 메모·끌). */
export interface NoteClue {
  type: 'note'
  label: string
  epigraph?: Epigraph
  body: string
}
/** 생성기가 그린 SVG 아트(7세그 전광판 등). */
export interface SvgClue {
  type: 'svg'
  label: string
  epigraph?: Epigraph
  svg: string
}
/** 북 사이퍼: 원문 + 좌표(읽는 순서 배지). */
export interface BookCipherClue {
  type: 'book-cipher'
  label: string
  epigraph?: Epigraph
  text: string
  refs: number[] // 1-based 단어 좌표
  letterRefs?: number[] // mode='letter-at' 일 때 단어 내 글자 좌표(1-based)
  mode: 'first-letter' | 'whole-word' | 'letter-at'
  /** (esc_6) 한국어 대역 — 제목-사이퍼 결속 가시화. */
  korean?: string
}
export type Clue = TokensClue | SvgClue | BookCipherClue | NoteClue
export type ClueMap = Record<string, Clue>
