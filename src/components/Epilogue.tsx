import { useState } from 'react'

// 에필로그 — 마지막 사이퍼(삼킨 대답)를 푼 뒤, 그해 봄 엄석대의 몰락을 회고하는 3비트.
// 원작 결말 정합(새 담임의 부임 → 대리 시험 발각 → 아이들의 등 돌림 → 사라짐)이되 텍스트는 전부 창작.
// /2img 사진(ep-1·2·3)이 없으면 어두운 그라디언트 폴백. 탭(클릭)으로 진행.

const BEATS = [
  {
    art: 'ep-1',
    kicker: '이듬해 봄 — 새 담임',
    text:
      '봄이 오자 새 담임이 왔다. 그는 만장일치를 믿지 않았다.\n' +
      '시험지를 한 장씩 되짚었고, 빌려 온 일등이 드러나는 데는 하루면 충분했다.',
  },
  {
    art: 'ep-2',
    kicker: '교실이 그 애를 비웠다',
    text:
      '어제까지 그 애의 말을 법으로 알던 아이들이, 앞다투어 손을 들었다.\n' +
      '"제가 보았습니다." "저도 보았습니다."\n' +
      '만장일치는, 이번에는 다른 쪽으로 기울었다.',
  },
  {
    art: 'ep-3',
    kicker: '빈 급장 자리',
    text:
      '그 애는 교실을 뛰쳐나갔고, 다시는 돌아오지 않았다.\n' +
      '빈 급장 자리에 봄볕만 들었다.\n' +
      '그리고 나는 — 그날 끝내 삼켰던 대답을, 이제야 종이 위에 적는다.',
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

export function Epilogue({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0)
  const beat = BEATS[i]!
  const last = i >= BEATS.length - 1
  const next = () => (last ? onDone() : setI((n) => n + 1))
  return (
    <div className="inter inter--epilogue" onClick={next} role="dialog" aria-label="에필로그">
      <BeatArt key={beat.art} name={beat.art} />
      <div className="inter__scrim" />
      <div className="inter__body">
        <span className="inter__kicker">{beat.kicker}</span>
        {beat.text.split('\n').map((line, k) => (
          <p className="inter__text" key={k}>{line}</p>
        ))}
        <span className="inter__next">{last ? '그날의 교실로 ▸' : '▸'}</span>
      </div>
    </div>
  )
}
