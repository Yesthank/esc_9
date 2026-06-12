import { useState } from 'react'
import type { Dialog } from '../engine/types'

export function DialogModal({
  dialog,
  onSetFlag,
  onDone,
}: {
  dialog: Dialog
  onSetFlag: (flagId: string, value: string | boolean) => void
  onDone: () => void
}) {
  const [i, setI] = useState(0)
  const line = dialog.lines[i]
  const last = i >= dialog.lines.length - 1

  const next = () => {
    if (line?.setFlag) onSetFlag(line.setFlag.flagId, line.setFlag.value)
    if (last) onDone()
    else setI((n) => n + 1)
  }

  if (!line) return null

  return (
    <div className="modal-overlay dialog-overlay" onClick={next}>
      <div className="dialog" onClick={(e) => { e.stopPropagation(); next() }}>
        {line.speaker && <span className="dialog__speaker">{line.speaker}</span>}
        <p className="dialog__text">{line.text}</p>
        <div className="dialog__footer">
          <span className="dialog__progress">{i + 1} / {dialog.lines.length}</span>
          <span className="dialog__next">{last ? '시작 ▸' : '계속 ▸'}</span>
        </div>
      </div>
    </div>
  )
}
