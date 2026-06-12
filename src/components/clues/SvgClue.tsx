import type { SvgClue as SvgClueT } from '../../engine/types'

// 생성기가 그린 SVG 아트를 렌더. maker 가 빌드 타임에 생성해 clues.json 에 구운 신뢰 자산.
// 주의: viewBox 만 있는 SVG 는 모바일 브라우저에서 높이가 0으로 계산될 수 있어,
// viewBox 비율로 aspect-ratio 박스를 만들어 크기를 보장한다.
export function SvgClue({ clue }: { clue: SvgClueT }) {
  const m = clue.svg.match(/viewBox="(-?[\d.]+) (-?[\d.]+) ([\d.]+) ([\d.]+)"/)
  const ratio = m ? Number(m[3]) / Number(m[4]) : 4
  return (
    <div className="clue">
      <div className="svg-clue">
        <div
          className="svg-clue__box"
          style={{ aspectRatio: String(ratio) }}
          dangerouslySetInnerHTML={{ __html: clue.svg }}
        />
      </div>
    </div>
  )
}
