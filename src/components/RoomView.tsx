import { useEffect, useState } from 'react'
import type { Hotspot, Room } from '../engine/types'
import type { GameFacts } from '../engine/conditions'
import { evalCondition } from '../engine/conditions'
import { assetUrl } from '../engine/asset'
import { Scene } from './Scenes'
import { ObjectArt } from './Objects'

// 이동은 문(물체)과 하단 단면 지도로만 — 화살표 내비 없음.
export function RoomView({
  room,
  facts,
  hotspots,
  solved = [],
  onHotspot,
}: {
  room: Room
  facts: GameFacts
  hotspots: Hotspot[]
  /** 풀린 퍼즐 id — 해당 자물쇠는 열린 렌더(✓) + 비활성. */
  solved?: string[]
  onHotspot: (h: Hotspot) => void
}) {
  const [bgOk, setBgOk] = useState(false)
  const bgPath =
    room.backgroundVariants?.find((v) => evalCondition(v.when, facts))?.background ?? room.background

  useEffect(() => {
    setBgOk(false)
    if (!bgPath) return
    const img = new Image()
    img.onload = () => setBgOk(true)
    img.onerror = () => setBgOk(false)
    img.src = assetUrl(bgPath)
  }, [bgPath])

  return (
    <div className="room">
      <Scene roomId={room.id} />
      {bgOk && <img className="room__bg" src={assetUrl(bgPath)} alt="" draggable={false} />}
      <div className="room__shade" />

      {hotspots.map((h) => {
        const [x, y, w, hh] = h.area
        const active = evalCondition(h.activeWhen, facts)
        const isSolved = h.action.type === 'puzzle' && solved.includes(h.action.puzzleId)
        const interactive = h.action.type === 'puzzle' || h.action.type === 'move' || h.action.type === 'pickup'
        return (
          <button
            key={h.id}
            className={`hotspot${interactive ? ' hotspot--key' : ''}${active ? '' : ' hotspot--locked'}${isSolved ? ' hotspot--solved' : ''}`}
            style={{ left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${hh}%` }}
            onClick={() => onHotspot(h)}
            aria-label={h.label}
          >
            <ObjectArt label={h.label} active={active} solved={isSolved} />
            {interactive && active && !isSolved && <span className="hotspot__pulse" />}
            {interactive && !active && <span className="hotspot__lock">🔒</span>}
            {isSolved && <span className="hotspot__done">✓</span>}
            {h.label && <span className="hotspot__label">{h.label}</span>}
          </button>
        )
      })}
    </div>
  )
}
