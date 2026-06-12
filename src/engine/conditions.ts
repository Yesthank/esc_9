import type { Condition } from './types'

export interface GameFacts {
  flags: Record<string, string | boolean>
  inventory: string[]
}

/** Condition 트리를 현재 사실(facts)에 대해 평가. undefined 는 항상 참. */
export function evalCondition(c: Condition | undefined, f: GameFacts): boolean {
  if (!c) return true
  switch (c.type) {
    case 'flag':
      return f.flags[c.flagId ?? ''] === (c.value ?? true)
    case 'not-flag':
      return f.flags[c.flagId ?? ''] !== (c.value ?? true)
    case 'item':
      return f.inventory.includes(c.itemId ?? '')
    case 'not-item':
      return !f.inventory.includes(c.itemId ?? '')
    case 'and':
      return (c.conditions ?? []).every((x) => evalCondition(x, f))
    case 'or':
      return (c.conditions ?? []).some((x) => evalCondition(x, f))
    default:
      return true
  }
}
