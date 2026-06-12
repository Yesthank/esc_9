import type { BookCipherClue } from '../../engine/types'

/**
 * 북 사이퍼 단서: 원문에서 좌표(refs)가 가리키는 단어를 강조하고 "읽는 순서" 배지를 단다.
 *  - first-letter: 각 단어의 첫 글자를 순서대로.
 *  - letter-at  : 쌍 좌표 — 단어 안에서 letterRefs[i]번째 글자에 점이 찍힌다(그 글자를 읽는다).
 * 단어 인덱싱은 scenario-forge tokenizeWords 와 동일(알파벳 연속만 1단어, 1-based).
 */
export function BookCipher({ clue }: { clue: BookCipherClue }) {
  const order = new Map<number, number>()
  clue.refs.forEach((wordIdx, i) => order.set(wordIdx, i + 1))

  const chunks = clue.text.match(/[A-Za-z가-힣]+|[^A-Za-z가-힣]+/g) ?? []
  let wordNo = 0

  return (
    <div className="clue clue--cipher">
      <blockquote className="cipher__excerpt">
        {chunks.map((chunk, i) => {
          if (/^[A-Za-z가-힣]+$/.test(chunk)) {
            wordNo += 1
            const ord = order.get(wordNo)
            if (ord !== undefined) {
              const letterIdx =
                clue.mode === 'letter-at' ? clue.letterRefs?.[ord - 1] : undefined
              return (
                <span className="cipher__word cipher__word--mark" key={i}>
                  <sup className="cipher__ord">{ord}</sup>
                  {letterIdx !== undefined
                    ? [...chunk].map((ch, k) => (
                        <span key={k} className={k === letterIdx - 1 ? 'cipher__letter' : undefined}>{ch}</span>
                      ))
                    : chunk}
                </span>
              )
            }
            return <span className="cipher__word" key={i}>{chunk}</span>
          }
          return <span key={i}>{chunk}</span>
        })}
      </blockquote>
      {clue.korean && <p className="cipher__korean">{clue.korean}</p>}
    </div>
  )
}
