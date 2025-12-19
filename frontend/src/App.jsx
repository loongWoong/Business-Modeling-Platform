import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import DomainMap from './pages/DomainMap'
import DomainWorkbench from './pages/DomainWorkbench'
import ModelDetail from './pages/ModelDetail'

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<DomainMap />} />
          <Route path="/domain/:domainId" element={<DomainWorkbench />} />
          <Route path="/model/:modelId" element={<ModelDetail />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App