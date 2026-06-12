import type { Clue, ClueMap } from '../engine/types'
import { ClueView } from './ExamineModal'

// 단서 수첩 — 발견한 단서를 언제든 다시 본다. 방을 되돌아다닐 필요가 없도록.
// 짝 단서(원고+격자판, 양피지+석판)는 둘 다 발견되면 결합 렌더로 전환된다.
export function Journal({
  discovered,
  clueMap,
  onClose,
}: {
  discovered: string[]
  clueMap: ClueMap
  onClose: () => void
}) {
  const entries = discovered
    .map((k) => [k, clueMap[k]] as [string, Clue | undefined])
    .filter(([, c]) => !!c) as [string, Clue][]

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal journal" onClick={(e) => e.stopPropagation()}>
        <button className="modal__close" onClick={onClose} aria-label="닫기">✕</button>
        <h3 className="modal__title">관찰 수첩</h3>
        {entries.length === 0 ? (
          <p className="journal__empty">아직 기록한 단서가 없다.<br />방을 살펴보면, 본 것이 여기 적힌다.</p>
        ) : (
          <div className="journal__list">
            {entries.map(([k, clue]) => (
              <section className="journal__entry" key={k}>
                <h4 className="journal__label">{clue.label}</h4>
                {clue.epigraph && (
                  <blockquote className="epigraph epigraph--compact">
                    <p>{clue.epigraph.ko}</p>
                  </blockquote>
                )}
                <ClueView clue={clue} discovered={discovered} />
              </section>
            ))}
          </div>
        )}
        <button className="btn btn--ghost" onClick={onClose}>덮기</button>
      </div>
    </div>
  )
}
