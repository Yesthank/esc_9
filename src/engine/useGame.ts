import { useCallback, useEffect, useMemo, useReducer } from 'react'
import type { GameConfig } from './types'
import { evalCondition, type GameFacts } from './conditions'

export type Status = 'title' | 'playing' | 'cleared' | 'failed'

export type Modal =
  | { kind: 'examine'; text: string; image?: string; label?: string }
  | { kind: 'puzzle'; puzzleId: string; title?: string }
  | { kind: 'dialog'; dialogId: string }

export interface State {
  status: Status
  roomId: string
  flags: Record<string, string | boolean>
  solved: string[]
  seenDialogs: string[]
  modal: Modal | null
  toast: string | null
  remaining: number
  hintsUsed: number
  /** 퍼즐별 공개된 힌트 단계(0~2) — 간수 몰래 속삭임 드로어. */
  hintsRevealed: Record<string, number>
  /** 단서 수첩 — 발견(열람)한 단서 키. */
  discovered: string[]
  /** 지도 이동용 — 방문한 구획. */
  visited: string[]
}

// ── 세이브/이어하기 (esc_6 신설) ───────────────────────────────
// persist 대상: 진행 상태 전부(모달 제외). 타이머는 탭이 닫히면 멈춘다(무페널티 일시정지, 수용).
const SAVE_KEY = 'esc9-save-v1'

interface SaveData {
  v: 1
  roomId: string
  flags: Record<string, string | boolean>
  solved: string[]
  seenDialogs: string[]
  remaining: number
  hintsUsed: number
  hintsRevealed: Record<string, number>
  discovered: string[]
  visited: string[]
}

export function loadSave(): SaveData | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    const d = JSON.parse(raw) as SaveData
    if (d.v !== 1 || typeof d.roomId !== 'string' || !Array.isArray(d.solved)) return null
    return d
  } catch {
    return null
  }
}

function writeSave(s: State) {
  try {
    const d: SaveData = {
      v: 1, roomId: s.roomId, flags: s.flags, solved: s.solved, seenDialogs: s.seenDialogs,
      remaining: s.remaining, hintsUsed: s.hintsUsed, hintsRevealed: s.hintsRevealed,
      discovered: s.discovered, visited: s.visited,
    }
    localStorage.setItem(SAVE_KEY, JSON.stringify(d))
  } catch { /* 저장 불가 환경(시크릿 등) — 조용히 무시 */ }
}

export function clearSave() {
  try { localStorage.removeItem(SAVE_KEY) } catch { /* ignore */ }
}

type Action =
  | { t: 'start' }
  | { t: 'resume'; save: SaveData }
  | { t: 'restart' }
  | { t: 'move'; roomId: string }
  | { t: 'open'; modal: Modal }
  | { t: 'close' }
  | { t: 'solve'; puzzleId: string }
  | { t: 'set-flag'; flagId: string; value: string | boolean; text?: string }
  | { t: 'seen-dialog'; dialogId: string }
  | { t: 'tick' }
  | { t: 'toast'; text: string | null }
  | { t: 'discover'; key: string }
  | { t: 'reveal-hint'; puzzleId: string }

function initial(cfg: GameConfig): State {
  return {
    status: 'title',
    roomId: cfg.startRoom,
    flags: {},
    solved: [],
    seenDialogs: [],
    modal: null,
    toast: null,
    remaining: cfg.timeLimit,
    hintsUsed: 0,
    hintsRevealed: {},
    discovered: [],
    visited: [cfg.startRoom],
  }
}

function isCleared(cfg: GameConfig, flags: Record<string, string | boolean>): boolean {
  const facts: GameFacts = { flags, inventory: [] }
  return evalCondition(cfg.clearCondition, facts)
}

function makeReducer(cfg: GameConfig) {
  return (s: State, a: Action): State => {
    switch (a.t) {
      case 'start':
        return { ...initial(cfg), status: 'playing' }
      case 'resume':
        return {
          ...initial(cfg),
          status: 'playing',
          roomId: cfg.rooms.some((r) => r.id === a.save.roomId) ? a.save.roomId : cfg.startRoom,
          flags: a.save.flags,
          solved: a.save.solved,
          seenDialogs: a.save.seenDialogs,
          remaining: Math.max(1, Math.min(cfg.timeLimit, a.save.remaining)),
          hintsUsed: a.save.hintsUsed,
          hintsRevealed: a.save.hintsRevealed ?? {},
          discovered: a.save.discovered,
          visited: a.save.visited.length ? a.save.visited : [cfg.startRoom],
        }
      case 'restart':
        return initial(cfg)
      case 'move':
        return {
          ...s,
          roomId: a.roomId,
          modal: null,
          visited: s.visited.includes(a.roomId) ? s.visited : [...s.visited, a.roomId],
        }
      case 'open':
        return { ...s, modal: a.modal }
      case 'close':
        return { ...s, modal: null }
      case 'seen-dialog':
        return s.seenDialogs.includes(a.dialogId)
          ? s
          : { ...s, seenDialogs: [...s.seenDialogs, a.dialogId] }
      case 'solve': {
        const puzzle = cfg.puzzles.find((p) => p.id === a.puzzleId)
        if (!puzzle) return s
        const flags = { ...s.flags }
        const reward = puzzle.reward
        if (puzzle.solvedFlag) flags[puzzle.solvedFlag] = true
        if (reward?.flagId) flags[reward.flagId] = reward.flagValue ?? true
        const solved = s.solved.includes(a.puzzleId) ? s.solved : [...s.solved, a.puzzleId]
        const cleared = isCleared(cfg, flags)
        return {
          ...s,
          flags,
          solved,
          modal: null,
          toast: reward?.text ?? null,
          status: cleared ? 'cleared' : s.status,
        }
      }
      case 'set-flag': {
        const flags = { ...s.flags, [a.flagId]: a.value }
        const cleared = isCleared(cfg, flags)
        return { ...s, flags, toast: a.text ?? s.toast, status: cleared ? 'cleared' : s.status }
      }
      case 'tick': {
        if (s.status !== 'playing') return s
        const remaining = s.remaining - 1
        if (remaining <= 0) return { ...s, remaining: 0, status: 'failed', modal: null }
        return { ...s, remaining }
      }
      case 'toast':
        return { ...s, toast: a.text }
      case 'discover':
        return s.discovered.includes(a.key) ? s : { ...s, discovered: [...s.discovered, a.key] }
      case 'reveal-hint': {
        const cur = s.hintsRevealed[a.puzzleId] ?? 0
        return {
          ...s,
          hintsUsed: s.hintsUsed + 1,
          hintsRevealed: { ...s.hintsRevealed, [a.puzzleId]: cur + 1 },
        }
      }
      default:
        return s
    }
  }
}

export function useGame(cfg: GameConfig) {
  const reducer = useMemo(() => makeReducer(cfg), [cfg])
  const [state, dispatch] = useReducer(reducer, cfg, initial)

  const facts: GameFacts = useMemo(() => ({ flags: state.flags, inventory: [] }), [state.flags])

  const room = useMemo(
    () => cfg.rooms.find((r) => r.id === state.roomId) ?? cfg.rooms[0],
    [cfg, state.roomId],
  )

  // ── 세이브: 진행 변화 시 즉시 + tick 은 10초 간격. 클리어/실패 시 삭제. ──
  useEffect(() => {
    if (state.status === 'playing') {
      if (state.remaining % 10 === 0) writeSave(state)
    } else if (state.status === 'cleared' || state.status === 'failed') {
      clearSave()
    }
    // remaining 의 10초 경계에서만 동작 — 그 외 상태 변화 저장은 아래 효과가 담당.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status, state.remaining])
  useEffect(() => {
    if (state.status !== 'playing') return
    writeSave(state)
    // 진행 상태(아래 의존성)가 바뀔 때만 저장.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    state.status, state.roomId, state.solved.length, state.discovered.length,
    state.seenDialogs.length, state.hintsUsed,
  ])

  const actions = useMemo(
    () => ({
      start: () => dispatch({ t: 'start' }),
      resume: () => {
        const save = loadSave()
        if (save) dispatch({ t: 'resume', save })
        else dispatch({ t: 'start' })
      },
      restart: () => {
        clearSave()
        dispatch({ t: 'restart' })
      },
      move: (roomId: string) => dispatch({ t: 'move', roomId }),
      open: (modal: Modal) => dispatch({ t: 'open', modal }),
      close: () => dispatch({ t: 'close' }),
      solve: (puzzleId: string) => dispatch({ t: 'solve', puzzleId }),
      setFlag: (flagId: string, value: string | boolean, text?: string) =>
        dispatch({ t: 'set-flag', flagId, value, text }),
      discover: (key: string) => dispatch({ t: 'discover', key }),
      seenDialog: (dialogId: string) => dispatch({ t: 'seen-dialog', dialogId }),
      tick: () => dispatch({ t: 'tick' }),
      toast: (text: string | null) => dispatch({ t: 'toast', text }),
      revealHint: (puzzleId: string) => dispatch({ t: 'reveal-hint', puzzleId }),
    }),
    [],
  )

  const visibleHotspots = useCallback(
    () => (room?.hotspots ?? []).filter((h) => evalCondition(h.visibleWhen, facts)),
    [room, facts],
  )

  return { state, room, facts, actions, visibleHotspots }
}
