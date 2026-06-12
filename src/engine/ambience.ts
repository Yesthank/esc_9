import { useEffect, useRef } from 'react'

// esc_9 「만장일치」 — WebAudio 합성(에셋 불요, 외부 음원 0). 시작 제스처 이후에만 생성.
// 신규 DSP 패치 4종(설계서 v2 Fe4): 매미 버즈(낮) · 저녁 바람 · 귀뚜라미+유리 풍경(밤) · 풍금 화음.
// 실패해도 게임에 영향 없도록 전부 try/catch. 테스트는 오디오에 비의존.

type Phase = 'day' | 'dusk' | 'night'

// 매미 — 톱니파 + 진폭 트레몰로(맴맴), 멀리서 한 마리.
function cicada(ctx: AudioContext, at: number, dest: GainNode) {
  const o = ctx.createOscillator()
  o.type = 'sawtooth'
  o.frequency.setValueAtTime(4200, at)
  const band = ctx.createBiquadFilter()
  band.type = 'bandpass'
  band.frequency.value = 4400
  band.Q.value = 9
  const g = ctx.createGain()
  const trem = ctx.createOscillator()
  trem.type = 'sine'
  trem.frequency.value = 22 // 맴맴 떨림
  const tg = ctx.createGain()
  tg.gain.value = 0.5
  trem.connect(tg)
  tg.connect(g.gain)
  const dur = 2.6 + Math.random() * 1.6
  g.gain.setValueAtTime(0.0001, at)
  g.gain.linearRampToValueAtTime(0.5, at + 0.5)
  g.gain.setValueAtTime(0.5, at + dur - 0.7)
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur)
  o.connect(band)
  band.connect(g)
  g.connect(dest)
  o.start(at)
  o.stop(at + dur + 0.05)
  trem.start(at)
  trem.stop(at + dur + 0.05)
}

// 귀뚜라미 — 고음 사인 3펄스 찌르르(esc_7 chirp 핏치 하향 변주).
function cricket(ctx: AudioContext, at: number, dest: GainNode) {
  for (let i = 0; i < 3; i++) {
    const t = at + i * 0.08
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'sine'
    o.frequency.setValueAtTime(3700, t)
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.14, t + 0.008)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.055)
    o.connect(g)
    g.connect(dest)
    o.start(t)
    o.stop(t + 0.08)
  }
}

// 유리 풍경 — 깨진 유리 조각이 바람에 스치는 미세한 차임(고음 사인 + 빠른 감쇠).
function glassChime(ctx: AudioContext, at: number, dest: GainNode) {
  const freqs = [2093, 2637, 3136]
  const n = 1 + Math.floor(Math.random() * 2)
  for (let i = 0; i < n; i++) {
    const t = at + i * (0.09 + Math.random() * 0.12)
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'sine'
    o.frequency.value = freqs[Math.floor(Math.random() * freqs.length)]!
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.1, t + 0.004)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.7)
    o.connect(g)
    g.connect(dest)
    o.start(t)
    o.stop(t + 0.75)
  }
}

/** 구획 앰비언트 — phase 별 배경(낮 매미 / 저녁 바람 / 밤 귀뚜라미+유리 풍경). */
export function useSchoolAmbience(active: boolean, phase: Phase) {
  const ctxRef = useRef<AudioContext | null>(null)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    if (!active) return
    let disposed = false
    try {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!Ctor) return
      const ctx = ctxRef.current ?? new Ctor()
      ctxRef.current = ctx
      const master = ctx.createGain()
      master.gain.value = 0.05 // 아주 멀리서
      master.connect(ctx.destination)

      // 바람 — 저역 노이즈 루프(전 phase 공통 바닥, 저녁엔 조금 세게).
      const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate)
      const ch = buf.getChannelData(0)
      for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1
      const wind = ctx.createBufferSource()
      wind.buffer = buf
      wind.loop = true
      const lp = ctx.createBiquadFilter()
      lp.type = 'lowpass'
      lp.frequency.value = phase === 'dusk' ? 300 : 200
      const wg = ctx.createGain()
      wg.gain.value = phase === 'dusk' ? 0.7 : 0.45
      wind.connect(lp)
      lp.connect(wg)
      wg.connect(master)
      try { wind.start() } catch { /* ignore */ }

      const playOnce = () => {
        if (disposed) return
        try {
          if (ctx.state === 'suspended') void ctx.resume()
          const t = ctx.currentTime + 0.05 + Math.random() * 2
          if (phase === 'day') {
            cicada(ctx, t, master)
            if (Math.random() < 0.5) cicada(ctx, t + 4 + Math.random() * 3, master)
          } else if (phase === 'night') {
            cricket(ctx, t, master)
            cricket(ctx, t + 1.9, master)
            if (Math.random() < 0.7) glassChime(ctx, t + 3.2, master)
          }
          // dusk 는 바람만 — 백열등 아래의 적막.
        } catch { /* ignore */ }
      }
      playOnce()
      timerRef.current = window.setInterval(playOnce, phase === 'day' ? 11000 : 9000)
      return () => {
        disposed = true
        if (timerRef.current !== null) window.clearInterval(timerRef.current)
        try { wind.stop() } catch { /* ignore */ }
        try { master.disconnect() } catch { /* ignore */ }
        try { void ctx.close() } catch { /* ignore */ }
        ctxRef.current = null
      }
    } catch {
      return
    }
  }, [active, phase])
}

// ── 풍금 — 단순 가산 합성(기음+배음 2) 오르간 패드. 성긴 화음 배경 + 해정 sting. ──
const ORGAN = { C3: 130.81, E3: 164.81, G3: 196.0, A3: 220.0, C4: 261.63, D4: 293.66, E4: 329.63 }
// 짧은 화음들 — 동요풍 장조, 낮고 성기게.
const CHORDS: number[][] = [
  [ORGAN.C3, ORGAN.E3, ORGAN.G3],
  [ORGAN.A3, ORGAN.C4, ORGAN.E4],
  [ORGAN.G3, ORGAN.C4, ORGAN.D4],
  [ORGAN.C3, ORGAN.G3, ORGAN.C4],
]

function organTone(ctx: AudioContext, dest: GainNode, freq: number, at: number, dur: number, vel: number) {
  // 풍금(리드 오르간) 흉내: 기음 + 2·3배음, 풀무 바람 같은 느린 어택.
  const partials = [1, 2, 3]
  const amps = [1, 0.35, 0.12]
  for (let i = 0; i < partials.length; i++) {
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'sine'
    o.frequency.value = freq * partials[i]!
    g.gain.setValueAtTime(0.0001, at)
    g.gain.linearRampToValueAtTime(vel * amps[i]!, at + 0.18)
    g.gain.setValueAtTime(vel * amps[i]!, at + dur - 0.3)
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur)
    o.connect(g)
    g.connect(dest)
    o.start(at)
    o.stop(at + dur + 0.05)
  }
}

/** 인게임 풍금 — 성긴 화음 배경 + 해정 sting(두 화음). active 동안만 산다. */
export function useOrgan(active: boolean): { sting: () => void } {
  const ctxRef = useRef<AudioContext | null>(null)
  const masterRef = useRef<GainNode | null>(null)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    if (!active) return
    let disposed = false
    try {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!Ctor) return
      const ctx = ctxRef.current ?? new Ctor()
      ctxRef.current = ctx
      const master = ctx.createGain()
      master.gain.value = 0.07
      master.connect(ctx.destination)
      masterRef.current = master

      const playChord = () => {
        if (disposed) return
        try {
          if (ctx.state === 'suspended') void ctx.resume()
          const chord = CHORDS[Math.floor(Math.random() * CHORDS.length)]!
          const t = ctx.currentTime + 0.05 + Math.random() * 6
          chord.forEach((f) => organTone(ctx, master, f, t, 2.4, 0.32))
        } catch { /* ignore */ }
      }
      const first = window.setTimeout(playChord, 4000)
      timerRef.current = window.setInterval(playChord, 26000)
      return () => {
        disposed = true
        window.clearTimeout(first)
        if (timerRef.current !== null) window.clearInterval(timerRef.current)
        try { master.disconnect() } catch { /* ignore */ }
        try { void ctx.close() } catch { /* ignore */ }
        ctxRef.current = null
        masterRef.current = null
      }
    } catch {
      return
    }
  }, [active])

  const sting = () => {
    try {
      const ctx = ctxRef.current
      const master = masterRef.current
      if (!ctx || !master) return
      if (ctx.state === 'suspended') void ctx.resume()
      const t = ctx.currentTime + 0.02
      // 해정 보상 — 도미솔 한 번, 반 박 뒤 한 옥타브 위 으뜸음.
      ;[ORGAN.C3, ORGAN.E3, ORGAN.G3].forEach((f) => organTone(ctx, master, f, t, 1.1, 0.5))
      organTone(ctx, master, ORGAN.C4, t + 0.45, 1.4, 0.55)
    } catch { /* ignore */ }
  }
  return { sting }
}
