import { formatTime } from '../engine/asset'

export function Hud({
  roomName,
  remaining,
  solved,
  total,
  onExit,
}: {
  roomName: string
  remaining: number
  solved: number
  total: number
  onExit: () => void
}) {
  const low = remaining <= 60
  return (
    <header className="hud">
      <button className="hud__exit" onClick={onExit} aria-label="나가기">‹ 하루를 접는다</button>
      <span className="hud__room">{roomName}</span>
      <div className="hud__right">
        <span className="hud__progress" title="풀어낸 자물쇠">
          {Array.from({ length: total }).map((_, i) => (
            <i key={i} className={i < solved ? 'on' : ''} />
          ))}
        </span>
        <span className={`hud__timer${low ? ' low' : ''}`}>{formatTime(remaining)}</span>
      </div>
    </header>
  )
}
