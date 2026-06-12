import { useState } from 'react'

// 돌팔매의 밤 — 선거날(R4) → 그 밤(R5) 시점 전환, 2비트 전체화면 인터스티셜.
// 창작 비트(원작 결말 변주 — README 표기, 패널 C7). 둘째 비트에 회수물(라이터)을
// 심어 R5 감별의 디제틱 조명과 물리 결속(패널 N8/F3 — esc_7 복주머니 회수 전례).
// 아트(/2img)가 없으면 어두운 그라디언트 폴백. 탭(클릭)으로 진행, seenDialogs 로 1회만.

const BEATS = [
  {
    art: 'stone-1',
    kicker: '그 밤 — 운동장',
    text:
      '쨍 — 어둠 속에서 유리 깨지는 소리가 났다.\n' +
      '닦고 또 닦던 그 유리가, 깨진다.\n' +
      '운동장 끝, 누군가의 그림자가 어둠 속으로 사라졌다.',
  },
  {
    art: 'stone-2',
    kicker: '돌에 묶인 것',
    text:
      '교실 마룻바닥, 유리 조각 사이에 돌이 하나 떨어져 있다.\n' +
      '돌에는 끈으로 은빛 라이터가 묶여 있었다 — 몰수품 상자의 그것.\n' +
      '불빛 하나를 쥐고, 너는 빈 교실로 들어선다.',
  },
]

function BeatArt({ name }: { name: string }) {
  const [ok, setOk] = useState(true)
  if (!ok) return null
  return (
    <img className="inter__art" src={`${import.meta.env.BASE_URL}art/${name}.png`} alt=""
      draggable={false} onError={() => setOk(false)} />
  )
}

export function Interstitial({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0)
  const beat = BEATS[i]!
  const last = i >= BEATS.length - 1
  const next = () => (last ? onDone() : setI((n) => n + 1))
  return (
    <div className="inter" onClick={next} role="dialog" aria-label="장면 전환">
      <BeatArt key={beat.art} name={beat.art} />
      <div className="inter__scrim" />
      <div className="inter__body">
        <span className="inter__kicker">{beat.kicker}</span>
        {beat.text.split('\n').map((line, k) => (
          <p className="inter__text" key={k}>{line}</p>
        ))}
        <span className="inter__next">{last ? '그 밤의 교실로 ▸' : '▸'}</span>
      </div>
    </div>
  )
}
