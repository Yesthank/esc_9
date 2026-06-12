import type { Clue } from '../engine/types'
import { Diegetic, Note } from './clues/Diegetic'
import { SvgClue } from './clues/SvgClue'
import { BookCipher } from './clues/BookCipher'

export function ClueView({ clue, discovered = [] }: { clue: Clue; discovered?: string[] }) {
  return (
    <>
      {clue.type === 'tokens' && <Diegetic clue={clue} discovered={discovered} />}
      {clue.type === 'note' && <Note clue={clue} />}
      {clue.type === 'svg' && <SvgClue clue={clue} />}
      {clue.type === 'book-cipher' && <BookCipher clue={clue} />}
      {clue.type === 'tokens' && clue.footnote && (
        <p className="clue__footnote">{clue.footnote}</p>
      )}
    </>
  )
}

export function ExamineModal({
  label,
  text,
  image,
  clue,
  discovered = [],
  onClose,
}: {
  label?: string
  text: string
  image?: string
  clue?: Clue
  discovered?: string[]
  onClose: () => void
}) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--examine" onClick={(e) => e.stopPropagation()}>
        <button className="modal__close" onClick={onClose} aria-label="닫기">✕</button>
        {label && <h3 className="modal__title">{label}</h3>}
        {image && <img className="examine__image" src={image} alt="" />}
        <p className="examine__text">{text}</p>
        {clue && (
          <div className="examine__clue">
            {clue.epigraph && (
              <blockquote className="epigraph">
                <p>{clue.epigraph.ko}</p>
                <cite>— {clue.epigraph.cite}</cite>
              </blockquote>
            )}
            <ClueView clue={clue} discovered={discovered} />
          </div>
        )}
        <button className="btn btn--ghost" onClick={onClose}>닫기</button>
      </div>
    </div>
  )
}
