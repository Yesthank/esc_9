import { useState } from 'react'
import type { GameConfig } from '../engine/types'
import { formatTime } from '../engine/asset'
import { loadSave } from '../engine/useGame'

/** /2img 생성 아트 배경 — 파일이 없으면 조용히 생략(폴백: 기존 그라디언트). */
function ScreenArt({ name }: { name: string }) {
  const [ok, setOk] = useState(true)
  if (!ok) return null
  return (
    <>
      <img className="screen__art" src={`${import.meta.env.BASE_URL}art/${name}.png`} alt=""
        draggable={false} onError={() => setOk(false)} />
      <div className="screen__scrim" />
    </>
  )
}

function Emblem() {
  return (
    <svg className="emblem" viewBox="0 0 120 120" aria-hidden="true">
      <circle cx="60" cy="60" r="56" fill="none" stroke="#c9762b" strokeWidth="1" opacity="0.6" />
      <circle cx="60" cy="60" r="50" fill="none" stroke="#c9762b" strokeWidth="0.5" opacity="0.35" />
      {/* 작은 칠판 — 나무 테 + 녹색 면 */}
      <rect x="30" y="34" width="60" height="44" rx="3" fill="#8a6a48" />
      <rect x="34" y="38" width="52" height="36" rx="1.5" fill="#2e4e3e" />
      {/* 개표의 正 — 넉 획만 찬 미완성(다섯째 획이 비어 있다 = 던져지지 않은 한 표) */}
      <g stroke="#efe6d0" strokeWidth="3.2" strokeLinecap="round">
        <path d="M46 46 h28" />
        <path d="M60 46 v22" />
        <path d="M60 57 h13" />
        <path d="M47 50 v18" />
      </g>
      {/* 분필 한 자루 — 칠판 받침에 */}
      <rect x="52" y="80" width="17" height="3.6" rx="1.8" fill="#efe6d0" transform="rotate(-4 60 82)" />
      {/* 깨진 유리 금 — 우상단 */}
      <path d="M84 30 l-6 5 m6 -5 l-2 7 m2 -7 l-8 1" stroke="#9db8e8" strokeWidth="1.2" strokeLinecap="round" opacity="0.85" />
      <circle cx="60" cy="60" r="44" fill="url(#emg)" opacity="0.22" />
      <defs>
        <radialGradient id="emg" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#c9762b" stopOpacity="0.4" /><stop offset="100%" stopColor="#c9762b" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  )
}

export function TitleScreen({
  config,
  onStart,
  onResume,
}: {
  config: GameConfig
  onStart: () => void
  onResume: () => void
}) {
  const [hasSave] = useState(() => loadSave() !== null)
  return (
    <div className="screen screen--title">
      <ScreenArt name="intro" />
      <Emblem />
      <h1 className="title">{config.title}</h1>
      <p className="title__sub">— 손을 들지 않은 것이 아니라, 들지 못했다 —</p>
      {config.description && <p className="title__desc">{config.description}</p>}
      <div className="title__actions">
        <button className="btn btn--primary" onClick={onStart}>교실에 남는다</button>
        {hasSave && (
          <button className="btn btn--resume" onClick={onResume}>이어하기 — 그 교실로</button>
        )}
      </div>
      <p className="title__credit">
        이문열 『우리들의 일그러진 영웅』(1987) 오마주 — 비공식·비상업 팬 메이드, 원작 텍스트 미사용(전 문장 창작)<br />
        <span>사이퍼 원문: 김소월 「진달래꽃」(1925, 퍼블릭도메인) · maker 파이프라인 생성·검증 · 자물쇠 {config.puzzles.length}개 · 제한시간 {Math.floor(config.timeLimit / 60)}분 · 단서는 수첩에 기록된다 · 📱 세로 화면 전용</span>
      </p>
      {/* esc_9: 세로 네이티브 — 회전 안내 없음 */}
    </div>
  )
}

// 그 교실이 가르쳐 준 것 — 늦었지만 늦지 않은 세 가지(창작).
const LESSONS = ['만장일치를 의심할 것', '빌려 온 일등을 부러워하지 말 것', '삼킨 대답은 언젠가 쓸 것']

export function ClearScreen({
  config,
  remaining,
  hintsUsed,
  onRestart,
}: {
  config: GameConfig
  remaining: number
  hintsUsed: number
  onRestart: () => void
}) {
  const used = config.timeLimit - remaining
  return (
    <div className="screen screen--clear">
      <ScreenArt name="ending" />
      <span className="screen__kicker">새벽 — 열린 뒷문</span>
      {/* 풀어낸 세 답이 하나의 대답으로 — 타이틀 드롭 */}
      <div className="assemble" aria-hidden="true">
        <span className="assemble__token assemble__token--1">급장선거</span>
        <span className="assemble__token assemble__token--2">만장일치</span>
        <span className="assemble__token assemble__token--3">①④⑥</span>
      </div>
      <h2 className="assemble__drop">아니다</h2>
      <p className="screen__message">{config.clearMessage}</p>
      <div className="grudge">
        <span className="grudge__head">일기장 마지막 장 — 새로 적힌 문장</span>
        <div className="grudge__names" style={{ flexDirection: 'column', gap: 6, alignItems: 'center' }}>
          <em style={{ animationDelay: '1.2s' }}>늦은 대답이었다.</em>
          <em style={{ animationDelay: '1.8s' }}>그러나 늦은 대답도, 대답이다.</em>
        </div>
        <span className="grudge__vow">{LESSONS.join(' · ')}</span>
      </div>
      <div className="screen__stats">
        <span>그 하루 <b>{formatTime(used)}</b></span>
        <span>남은 시간 <b>{formatTime(remaining)}</b></span>
        <span>속삭임 <b>{hintsUsed}회</b></span>
      </div>
      <p className="screen__mirror">이름을 버린 자(esc_4), 이름을 되찾은 자(esc_6), 부르지 못한 말(esc_7) — 그리고 당신은, 삼킨 대답을 썼다.</p>
      <button className="btn btn--primary" onClick={onRestart}>다시 첫날 아침으로</button>
    </div>
  )
}

export function FailScreen({ onRestart }: { onRestart: () => void }) {
  return (
    <div className="screen screen--fail">
      <ScreenArt name="fail" />
      <span className="screen__kicker">자정 — 어두워진 교실</span>
      <p className="screen__message">
        달이 구름에 가리고, 교실은 다시 어두워졌다.<br />
        칠판의 질문은 지워지지 않은 채 남아 있다 — "모두 찬성이지?"<br />
        <b>대답</b>은, 이번에도 늦고 말았다.
      </p>
      <button className="btn btn--primary" onClick={onRestart}>다시 첫날 아침으로</button>
    </div>
  )
}
