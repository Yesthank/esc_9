// esc_9 아트 일괄 생성 — manifest(룸 배경) + 화면 아트. 2img generate.mjs 순차 호출.
import { readFileSync, existsSync, mkdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const GEN = join(process.env.USERPROFILE, '.claude', 'skills', '2img', 'scripts', 'generate.mjs')
const manifest = JSON.parse(readFileSync(
  'C:/Users/jjh07/Documents/files/games/escape/maker/game-forge/out/twistedhero/manifest.json', 'utf8'))

const jobs = []
for (const item of manifest.items) {
  const out = join(ROOT, 'public', item.targetPath.replace(/^\//, ''))
  jobs.push({ prompt: item.prompt + (item.negativePrompt ? ` Avoid: ${item.negativePrompt}.` : ''), out, size: item.size })
}
const STYLE = '1960s rural Korean elementary school, nostalgic muted watercolor and colored pencil illustration, hand-drawn 2D, no people, no text, vertical composition.'
const extra = [
  ['intro', `${STYLE} Title art: empty classroom at night seen across rows of worn twin wooden desks, green chalkboard with faint chalk writing, one shattered window pane letting in a beam of moonlight, deep blue night with warm amber accents, quiet tension.`],
  ['ending', `${STYLE} The same classroom at dawn: golden morning light pouring through windows and an open back door, dust motes floating, glass shards glinting softly, hopeful stillness.`],
  ['fail', `${STYLE} The classroom at midnight, almost completely dark, cold blue gloom, the chalkboard writing barely visible, moon hidden behind clouds outside the window.`],
  ['stone-1', `${STYLE} Dramatic frozen moment: a fist-sized stone bursting through a school window at night, glass shards scattering in moonlight, dark empty schoolyard and poplar trees outside.`],
  ['stone-2', `${STYLE} Close-up on a wooden classroom floor at night: a stone lying among glass shards, an old silver petrol lighter tied to the stone with twine, a pool of moonlight.`],
]
for (const [name, prompt] of extra) jobs.push({ prompt, out: join(ROOT, 'public', 'art', `${name}.png`), size: '1024x1536' })

mkdirSync(join(ROOT, 'public', 'rooms'), { recursive: true })
mkdirSync(join(ROOT, 'public', 'art'), { recursive: true })

let fail = 0
for (const j of jobs) {
  if (existsSync(j.out)) { console.log('SKIP (exists):', j.out); continue }
  console.log('GEN:', j.out)
  try {
    execFileSync('node', [GEN, '--prompt', j.prompt, '--size', j.size, '--quality', 'medium', '--out', j.out],
      { stdio: 'inherit', timeout: 360000 })
  } catch (e) {
    fail += 1
    console.error('FAIL:', j.out, e.message)
  }
}
console.log(fail ? `DONE with ${fail} failures` : 'ALL DONE')
process.exit(fail ? 1 : 0)
