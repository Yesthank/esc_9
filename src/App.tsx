import config from './game/config.json'
import clues from './game/clues.json'
import type { ClueMap, GameConfig } from './engine/types'
import { GameRunner } from './components/GameRunner'

const game = config as unknown as GameConfig
const clueMap = clues as unknown as ClueMap

export default function App() {
  return (
    <div className="app">
      <div className="frame">
        <GameRunner config={game} clueMap={clueMap} />
      </div>
    </div>
  )
}
