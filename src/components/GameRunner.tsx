import { useEffect, useState } from 'react'
import type { ClueMap, GameConfig, Hotspot } from '../engine/types'
import { useGame } from '../engine/useGame'
import { evalCondition } from '../engine/conditions'
import { useSchoolAmbience, useOrgan } from '../engine/ambience'
import { CLUE_KEY_BY_LABEL } from './Objects'
import { RoomView } from './RoomView'
import { Hud } from './Hud'
import { ShipMap } from './ShipMap'
import { Journal } from './Journal'
import { PuzzleModal } from './PuzzleModal'
import { ExamineModal } from './ExamineModal'
import { DialogModal } from './DialogModal'
import { Interstitial } from './Interstitial'
import { Epilogue } from './Epilogue'
import { TitleScreen, ClearScreen, FailScreen } from './Screens'
import { Effects, useEffects } from './Effects'

// 돌팔매 인터스티셜 — 선거날(R4) → 그 밤(R5) 첫 이동 직전 2비트(설계서 v2 §1).
const NIGHT_ROOM = 'room-night'
const INTERSTITIAL_SEEN = 'inter-stone'
// 구획별 앰비언트 phase — 아침/한낮/봄 = 낮(매미), 복도 = 저녁(바람), 그 밤 = 밤(귀뚜라미·유리 풍경).
const ROOM_PHASE: Record<string, 'day' | 'dusk' | 'night'> = {
  'room-classroom': 'day',
  'room-yard': 'day',
  'room-hallway': 'dusk',
  'room-election': 'day',
  'room-night': 'night',
}

export function GameRunner({ config, clueMap }: { config: GameConfig; clueMap: ClueMap }) {
  const { state, room, facts, actions, visibleHotspots } = useGame(config)
  const [showJournal, setShowJournal] = useState(false)
  const [interTo, setInterTo] = useState<string | null>(null)
  const [epilogueDone, setEpilogueDone] = useState(false)
  const { fx, fire, clear, stageClass } = useEffects()

  // 구획 앰비언트 — 낮 매미 / 저녁 바람 / 밤 귀뚜라미·유리 풍경(설계서 v2 §4-6).
  useSchoolAmbience(state.status === 'playing', ROOM_PHASE[state.roomId] ?? 'day')
  // 풍금 — 성긴 화음 배경(전 구획) + 해정 순간 화음(sting).
  const organ = useOrgan(state.status === 'playing')

  // 방 진입 특수효과(config.rooms[].entryEffect)
  useEffect(() => {
    if (state.status !== 'playing') return
    fire(room?.entryEffect)
  }, [state.status, state.roomId, room, fire])

  useEffect(() => {
    if (state.status !== 'playing') return
    const id = setInterval(() => actions.tick(), 1000)
    return () => clearInterval(id)
  }, [state.status, actions])

  useEffect(() => {
    if (state.status !== 'playing' || state.modal || interTo) return
    if (room?.entryDialog && !state.seenDialogs.includes(room.entryDialog)) {
      actions.open({ kind: 'dialog', dialogId: room.entryDialog })
    }
  }, [state.status, state.modal, room, state.seenDialogs, actions, interTo])

  useEffect(() => {
    if (!state.toast) return
    const id = setTimeout(() => actions.toast(null), 5200)
    return () => clearTimeout(id)
  }, [state.toast, actions])

  if (state.status === 'title') return <TitleScreen config={config} onStart={actions.start} onResume={actions.resume} />
  if (state.status === 'cleared') {
    // 사이퍼 해정 후 — 엄석대 몰락 에필로그(3비트)를 먼저 보이고, 끝나면 클리어 화면.
    if (!epilogueDone) return <Epilogue onDone={() => setEpilogueDone(true)} />
    return (
      <ClearScreen
        config={config}
        remaining={state.remaining}
        hintsUsed={state.hintsUsed}
        onRestart={actions.restart}
      />
    )
  }
  if (state.status === 'failed') return <FailScreen onRestart={actions.restart} />
  if (!room) return null

  const onHotspot = (h: Hotspot) => {
    if (!evalCondition(h.activeWhen, facts)) {
      const t = h.action.type
      actions.toast(
        h.failMessage ??
          (t === 'move'
            ? '🔒 굳게 잠겨 있다. 이 방의 자물쇠를 먼저 풀어야 한다.'
            : t === 'puzzle'
              ? '🔒 아직은 돌아가지 않는다. 먼저 다른 자물쇠를 풀어야 할 것 같다.'
              : '아직은 아무 일도 일어나지 않는다.'),
      )
      return
    }
    const a = h.action
    if (a.type === 'examine') {
      const key = h.label ? CLUE_KEY_BY_LABEL[h.label] : undefined
      if (key) actions.discover(key) // 단서 수첩에 기록
      actions.open({ kind: 'examine', text: a.text, image: a.image, label: h.label })
    } else if (a.type === 'puzzle') {
      // 풀린 자물쇠는 비활성 — 닫힌 입력 모달을 다시 띄우지 않는다.
      if (state.solved.includes(a.puzzleId)) {
        actions.toast('🔓 이미 풀린 자물쇠다 — 걸쇠가 열려 있다.')
        return
      }
      actions.open({ kind: 'puzzle', puzzleId: a.puzzleId, title: h.label })
    } else if (a.type === 'move') {
      // 감영 북문 → 대궐 앞뜰: 첫 이동은 압송 인터스티셜(2비트)을 거친다.
      if (a.roomId === NIGHT_ROOM && !state.seenDialogs.includes(INTERSTITIAL_SEEN)) {
        setInterTo(a.roomId)
        return
      }
      actions.move(a.roomId)
    } else if (a.type === 'dialog') actions.open({ kind: 'dialog', dialogId: a.dialogId })
    else if (a.type === 'trigger') actions.setFlag(a.flagId, a.value, a.text)
  }

  const hintsFor = (puzzleId: string): string[] =>
    config.hints?.find((h) => h.forPuzzle === puzzleId)?.steps ?? []

  return (
    <div className={`stage${stageClass}`}>
      <Hud
        roomName={room.name}
        remaining={state.remaining}
        solved={state.solved.length}
        total={config.puzzles.length}
        onExit={actions.restart}
      />
      <RoomView room={room} facts={facts} hotspots={visibleHotspots()} solved={state.solved} onHotspot={onHotspot} />
      <Effects fx={fx} onDone={clear} />

      {/* 하단 바: 수첩 + 여정 지도 */}
      <footer className="deckbar">
        <button className="deckbar__journal" onClick={() => setShowJournal(true)}>
          <span className="deckbar__icon">✎</span> 수첩
          {state.discovered.length > 0 && <em className="deckbar__count">{state.discovered.length}</em>}
        </button>
        <ShipMap config={config} current={state.roomId} visited={state.visited} onMove={actions.move} />
      </footer>

      {state.toast && (
        <div className="toast" onClick={() => actions.toast(null)} role="status">
          {state.toast}
        </div>
      )}

      {showJournal && (
        <Journal discovered={state.discovered} clueMap={clueMap} onClose={() => setShowJournal(false)} />
      )}

      {interTo && (
        <Interstitial
          onDone={() => {
            actions.seenDialog(INTERSTITIAL_SEEN)
            actions.move(interTo)
            setInterTo(null)
          }}
        />
      )}

      {state.modal?.kind === 'examine' &&
        (() => {
          const m = state.modal
          const key = m.label ? CLUE_KEY_BY_LABEL[m.label] : undefined
          const clue = key ? clueMap[key] : undefined
          return (
            <ExamineModal
              label={m.label}
              text={m.text}
              image={m.image}
              clue={clue}
              discovered={state.discovered}
              onClose={actions.close}
            />
          )
        })()}

      {state.modal?.kind === 'puzzle' &&
        (() => {
          const m = state.modal
          const pz = config.puzzles.find((p) => p.id === m.puzzleId)
          if (!pz) return null
          // 사이퍼 자물쇠: 시 전문(book-cipher clue)을 모달에 함께 띄운다(라벨→clue 키).
          const clueKey = m.title ? CLUE_KEY_BY_LABEL[m.title] : undefined
          const clue = clueKey ? clueMap[clueKey] : undefined
          return (
            <PuzzleModal
              puzzle={pz}
              title={m.title}
              clue={clue}
              hints={hintsFor(pz.id)}
              revealed={state.hintsRevealed[pz.id] ?? 0}
              onReveal={() => actions.revealHint(pz.id)}
              onSolve={() => {
                fire(pz.reward?.effect) // 해제 특수효과(reward.effect)
                organ.sting() // 해정 화음 — 자물쇠가 풀리는 소리의 보상
                actions.solve(pz.id)
              }}
              onClose={actions.close}
            />
          )
        })()}

      {state.modal?.kind === 'dialog' &&
        (() => {
          const did = (state.modal as { dialogId: string }).dialogId
          const dlg = config.dialogs?.find((d) => d.id === did)
          if (!dlg) return null
          return (
            <DialogModal
              dialog={dlg}
              onSetFlag={(f, v) => actions.setFlag(f, v)}
              onDone={() => {
                actions.seenDialog(did)
                actions.close()
              }}
            />
          )
        })()}
    </div>
  )
}
