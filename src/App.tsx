import Scene from './components/Scene'
import ConfigPanel from './components/ConfigPanel'
import './App.css'

export default function App() {
  return (
    <div className="app">
      <ConfigPanel />
      <div className="canvas-container">
        <Scene />
      </div>
    </div>
  )
}
