/** config 의 절대 경로(/rooms/x.png)를 Vite base(/esc_2/) 기준 URL 로 변환. */
export function assetUrl(path: string): string {
  const base = import.meta.env.BASE_URL // '/esc_2/'
  return base.replace(/\/$/, '') + '/' + path.replace(/^\//, '')
}

export function formatTime(seconds: number): string {
  const s = Math.max(0, seconds)
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`
}
