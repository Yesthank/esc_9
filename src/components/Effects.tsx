import { useCallback, useEffect, useState } from 'react'
import type { EffectKind } from '../engine/types'

// 전체 화면 몰입 특수효과 레이어 — config(entryEffect / reward.effect)가 선언하고
// GameRunner 가 발화한다. 오버레이 3종(blackout/flicker/lightning)은 이 레이어가,
// shake 는 무대(.stage)에 클래스를 얹는 방식이라 useEffects() 훅이 함께 관리한다.
// prefers-reduced-motion 은 CSS 에서 존중(애니메이션 무력화).

export interface FxState {
  kind: EffectKind
  n: number // 재발화 식별자(같은 효과 연속 발화 시 애니메이션 재시작)
}

export function useEffects() {
  const [fx, setFx] = useState<FxState | null>(null)

  const fire = useCallback((kind?: EffectKind) => {
    if (!kind) return
    setFx((p) => ({ kind, n: (p?.n ?? 0) + 1 }))
  }, [])

  // shake 는 오버레이가 아니라 무대 흔들림 — 시간 경과로 해제한다.
  useEffect(() => {
    if (fx?.kind !== 'shake') return
    const id = setTimeout(() => setFx(null), 720)
    return () => clearTimeout(id)
  }, [fx])

  const clear = useCallback(() => setFx(null), [])
  const stageClass = fx?.kind === 'shake' ? ' stage--quake' : ''
  return { fx, fire, clear, stageClass }
}

export function Effects({ fx, onDone }: { fx: FxState | null; onDone: () => void }) {
  if (!fx || fx.kind === 'shake') return null
  return <div key={fx.n} className={`fx fx--${fx.kind}`} onAnimationEnd={onDone} aria-hidden="true" />
}
