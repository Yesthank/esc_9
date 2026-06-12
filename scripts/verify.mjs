// ============================================================
// esc_7 headless 전체 완주 검증 (puppeteer-core + Edge)
//  - config.json 을 단일 진실 원천으로 9자물쇠+사이퍼 실입력 → 클리어 화면 도달
//  - 한글 정답(text-input): 음절 후보 슬레이트(.kslate) data-syl 버튼 클릭 → 제출 버튼
//    (page.type 자유 타이핑 경로는 라틴 전용 유지 — IME 회피 계약, 설계서 §4-6)
//  - 단서(examine) 모달 전부 스크린샷(scripts/shots/) → 사람 검수
//    (핫스팟 셀렉터 = button[aria-label="<config 한글 label>"] — 라벨 일치 검증 겸용)
//  - 압송 인터스티셜(2비트, room-daegwol 첫 진입 직전) 클릭스루
//  - 세이브/이어하기: R1 해정 후 리로드 → 이어하기 → 진행·타이머 연속성 확인
//  - 시작 전 localStorage.clear() (세이브 오염 방지)
// 사전: 스크립트가 vite preview 를 4173 에서 직접 띄움
// 보안 노트: page.evaluate/$$eval 은 puppeteer 표준 API — 이 파일에 하드코딩된
// 고정 스니펫만 로컬 headless 브라우저에서 실행한다(외부 입력 없음).
// ============================================================

import { createRequire } from 'node:module'
import { readFileSync, mkdirSync, existsSync } from 'node:fs'
import { spawn } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const puppeteer = require('puppeteer-core')

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const config = JSON.parse(readFileSync(join(ROOT, 'src', 'game', 'config.json'), 'utf8'))
const SHOTS = join(ROOT, 'scripts', 'shots')
mkdirSync(SHOTS, { recursive: true })

const EDGE = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
].find((p) => existsSync(p))
if (!EDGE) { console.error('Edge not found'); process.exit(1) }

const URL = 'http://localhost:4173/esc_9/'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const answers = Object.fromEntries(config.puzzles.map((p) => [p.id, p]))

// ── preview 서버 ──
const preview = spawn('npx', ['vite', 'preview', '--port', '4173', '--strictPort'], {
  cwd: ROOT, shell: true, stdio: 'pipe',
})
await sleep(2500)

let failed = false
const browser = await puppeteer.launch({
  executablePath: EDGE, headless: 'new',
  args: ['--no-sandbox', '--window-size=720,1280', '--autoplay-policy=no-user-gesture-required'],
  defaultViewport: { width: 720, height: 1280 },
})
try {
  const page = await browser.newPage()
  page.on('pageerror', (e) => { console.error('PAGE ERROR:', e.message); failed = true })
  await page.goto(URL, { waitUntil: 'networkidle2', timeout: 30000 })
  await page.evaluate(() => localStorage.clear())
  await page.reload({ waitUntil: 'networkidle2' })

  // 타이틀 → 시작
  await page.waitForSelector('.screen--title .btn--primary', { timeout: 15000 })
  await page.screenshot({ path: join(SHOTS, '00-title.png') })
  await page.click('.screen--title .btn--primary')
  console.log('▶ start')

  const dismissDialog = async () => {
    for (let i = 0; i < 12; i++) {
      const has = await page.$('.dialog-overlay')
      if (!has) return
      await page.click('.dialog').catch(() => {})
      await sleep(250)
    }
  }
  const dismissInterstitial = async () => {
    for (let i = 0; i < 6; i++) {
      const has = await page.$('.inter')
      if (!has) return
      if (i === 0) { await sleep(400); await page.screenshot({ path: join(SHOTS, '50-interstitial.png') }) }
      await page.click('.inter').catch(() => {})
      await sleep(450)
    }
  }
  const fxLog = async (tag) => {
    const fx = await page.evaluate(() => {
      const el = document.querySelector('.fx')
      const quake = document.querySelector('.stage--quake')
      return el ? el.className : quake ? 'stage--quake' : null
    })
    if (fx) console.log(`  ✨ effect@${tag}: ${fx}`)
  }

  let shot = 0
  const openAndShoot = async (label, file) => {
    // config 의 한글 label 이 그대로 aria-label 로 렌더되는지(라벨 일치) 셀렉터로 확인
    await page.waitForSelector(`button[aria-label="${label}"]`, { timeout: 8000 })
    await page.click(`button[aria-label="${label}"]`)
    await page.waitForSelector('.modal--examine', { timeout: 8000 })
    await sleep(450)
    await page.screenshot({ path: join(SHOTS, file) })
    await page.click('.modal__close')
    await sleep(300)
  }

  const solveDial = async (answer) => {
    await page.waitForSelector('.dial__col', { timeout: 8000 })
    const cols = await page.$$('.dial__col')
    for (let i = 0; i < answer.length; i++) {
      const d = Number(answer[i])
      const btns = await cols[i].$$('button') // [▲(-1), ▼(+1)]
      for (let k = 0; k < d; k++) { await btns[1].click(); await sleep(35) }
    }
    await page.click('.dial__lever')
    await sleep(500)
  }
  const solveToggle = async (answer) => {
    // L9 토글 — 정답 번호(부분집합)를 순서 무관 클릭 → 제출.
    await page.waitForSelector('.toggle__grid', { timeout: 8000 })
    for (const ch of answer) {
      const btn = await page.$(`.toggle__grid button[data-toggle="${ch}"]`)
      if (!btn) { console.error(`  ✗ toggle button missing: ${ch}`); failed = true; return }
      await btn.click()
      await sleep(70)
    }
    await page.click('.toggle__submit')
    await sleep(500)
  }
  const solveText = async (answer) => {
    if (/[가-힣]/.test(answer)) {
      // 한글 정답 — 음절 후보 슬레이트: 정답 음절 순서로 data-syl 버튼 클릭 → 제출 버튼(Enter 의존 금지)
      await page.waitForSelector('.kslate__grid', { timeout: 8000 })
      for (const syl of answer.normalize('NFC')) {
        const sel = `.kslate__grid button[data-syl="${syl}"]`
        const btn = await page.$(sel)
        if (!btn) { console.error(`  ✗ kslate syllable missing: "${syl}"`); failed = true; return }
        await btn.click()
        await sleep(60)
      }
      await page.click('.kslate__submit')
    } else {
      // 라틴 정답 — 자유 타이핑 슬레이트(이번 게임엔 미사용 경로, 불변 유지)
      await page.waitForSelector('.slate input', { timeout: 8000 })
      await page.type('.slate input', answer, { delay: 25 })
      await page.click('.slate button')
    }
    await sleep(500)
  }

  // ── 세이브/이어하기 검증(1회): 첫 자물쇠 해정 후 리로드 → 이어하기 ──
  let resumeTested = false
  const testResume = async () => {
    const before = await page.evaluate(() => JSON.parse(localStorage.getItem('esc9-save-v1') ?? 'null'))
    if (!before) { console.error('  ✗ save missing after first solve'); failed = true; return }
    await page.reload({ waitUntil: 'networkidle2' })
    await page.waitForSelector('.btn--resume', { timeout: 8000 })
    await page.click('.btn--resume')
    await sleep(900)
    const st = await page.evaluate(() => JSON.parse(localStorage.getItem('esc9-save-v1') ?? 'null'))
    const ok = st && st.solved.length >= before.solved.length && st.remaining <= before.remaining
    if (ok) console.log(`  💾 resume OK (solved=${st.solved.length}, remaining=${st.remaining}s)`)
    else { console.error('  ✗ resume state mismatch', before, st) }
    failed = failed || !ok
    await dismissDialog()
  }

  // ── 힌트 드로어 검증(1회): 두 번째 자물쇠 모달에서 속삭임 2단계 공개 ──
  let hintTested = false
  const testHints = async () => {
    const btn = await page.$('.whisper__btn')
    if (!btn) { console.error('  ✗ whisper drawer missing'); failed = true; return }
    await btn.click(); await sleep(250)
    await page.click('.whisper__btn').catch(() => {})
    await sleep(250)
    const n = await page.$$eval('.whisper__list li', (els) => els.length)
    if (n === 2) console.log('  🤫 hint drawer OK (2 tiers)')
    else { console.error(`  ✗ hint tiers = ${n}`); failed = true }
  }

  for (const room of config.rooms) {
    await sleep(400)
    await dismissInterstitial()
    await fxLog(`enter:${room.id}`)
    await dismissDialog()
    console.log(`◼ ${room.id} (${room.name})`)

    for (const h of room.hotspots) {
      if (h.action.type === 'examine') {
        // 단계 노출(visibleWhen) — 아직 안 드러난 단서는 DOM 에 없다. 건너뛴다(완주엔 무관, 수첩 기록은
        // 그 단서가 속한 퍼즐 단계에서 자연히 노출될 때 찍힌다).
        const present = await page.$(`button[aria-label="${h.label}"]`)
        if (!present) { console.log(`  ·· hidden (staged): ${h.label}`); continue }
        shot += 1
        await openAndShoot(h.label, `${String(shot + 10)}-${room.id}-${h.id}.png`)
        console.log(`  📷 examine: ${h.label}`)
      } else if (h.action.type === 'puzzle') {
        const pz = answers[h.action.puzzleId]
        // 자물쇠도 단계 노출 — 직전 퍼즐을 풀어야 드러난다. 아직 없으면 건너뛴다(다음 패스 없음 —
        // config 순서가 단계 순서와 일치하므로 이 시점엔 보여야 정상. 안 보이면 게이팅 회귀).
        const lockBtn = await page.$(`button[aria-label="${h.label}"]`)
        if (!lockBtn) { console.error(`  ✗ lock hidden at its turn: ${h.label}`); failed = true; continue }
        await page.click(`button[aria-label="${h.label}"]`)
        await page.waitForSelector('.modal--lock', { timeout: 8000 })
        if (!hintTested && resumeTested) { hintTested = true; await testHints() }
        if (pz.type === 'keypad') await solveDial(pz.answer)
        else if (pz.type === 'toggle') await solveToggle(pz.answer)
        else await solveText(pz.answer)
        const still = await page.$('.modal--lock')
        if (still) { console.error(`  ✗ lock NOT solved: ${pz.id} (${pz.answer})`); failed = true; await page.click('.modal__close') }
        else console.log(`  ✔ solved: ${pz.id} = ${pz.answer}`)
        await fxLog(`solve:${pz.id}`)
        await sleep(700) // toast
        if (!resumeTested) { resumeTested = true; await testResume() }
      } else if (h.action.type === 'move') {
        await sleep(300)
        await page.click(`button[aria-label="${h.label}"]`)
        console.log(`  → move: ${h.label}`)
        await sleep(700)
        await dismissInterstitial()
      }
    }
  }

  // 에필로그(엄석대 몰락 3비트) 클릭스루 → 클리어 화면
  for (let i = 0; i < 6; i++) {
    const ep = await page.$('.inter--epilogue')
    if (!ep) break
    if (i === 0) { await sleep(450); await page.screenshot({ path: join(SHOTS, '90-epilogue.png') }) }
    await page.click('.inter--epilogue').catch(() => {})
    await sleep(480)
  }
  await page.waitForSelector('.screen--clear', { timeout: 12000 })
  await sleep(3600) // 토큰 조립 + 호명(클리어) 연출
  await page.screenshot({ path: join(SHOTS, '99-clear.png') })
  const saveGone = await page.evaluate(() => localStorage.getItem('esc9-save-v1') === null)
  if (!saveGone) { console.error('  ✗ save not cleared on clear'); failed = true }
  console.log('🏁 CLEARED — full playthrough PASS')
} catch (e) {
  console.error('VERIFY FAIL:', e.message)
  failed = true
  try {
    const pages = await browser.pages()
    await pages[pages.length - 1]?.screenshot({ path: join(SHOTS, 'zz-fail.png') })
  } catch { /* ignore */ }
} finally {
  await browser.close()
  preview.kill('SIGTERM')
  try { spawn('taskkill', ['/F', '/T', '/PID', String(preview.pid)], { shell: true }) } catch { /* ignore */ }
}
process.exit(failed ? 1 : 0)
