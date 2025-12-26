import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage/HomePage'
import DomainsPage from './pages/DomainsPage/DomainsPage'
import ModelsPage from './pages/ModelsPage/ModelsPage'
import DatasourcesPage from './pages/DatasourcesPage/DatasourcesPage'
import ETLPage from './pages/ETLPage/ETLPage'
import DomainWorkbench from './pages/DomainWorkbench/DomainWorkbench'
import ModelDetail from './pages/ModelDetail/ModelDetail'

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/domains" element={<DomainsPage />} />
          <Route path="/models" element={<ModelsPage />} />
          <Route path="/datasources" element={<DatasourcesPage />} />
          <Route path="/etl" element={<ETLPage />} />
          <Route path="/domain/:domainId" element={<DomainWorkbench />} />
          <Route path="/model/:modelId" element={<ModelDetail />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App

