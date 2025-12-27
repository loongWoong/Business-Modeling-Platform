import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout } from 'antd'
import DomainManager from './pages/DomainManager/DomainManager'
import DomainWorkbench from './pages/DomainWorkbench/DomainWorkbench'
import ModelDetail from './pages/ModelDetail/ModelDetail'
import DatasourceDetail from './pages/DatasourceDetail/DatasourceDetail'
import ETLManager from './pages/ETLManager/ETLManager'
import ModelsPage from './pages/ModelsPage/ModelsPage'
import DatasourcesPage from './pages/DatasourcesPage/DatasourcesPage'
import RelationManager from './pages/RelationManager/RelationManager'
import MappingManager from './pages/MappingManager/MappingManager'
import NavigationMenu from './components/NavigationMenu'

const { Content } = Layout

/**
 * 应用路由结构
 * 
 * 路由层次结构：
 * - 业务域管理：/domains, /domain/:domainId
 * - 模型管理：/models, /model/:modelId
 * - 数据源管理：/datasources, /datasource/:datasourceId
 * - ETL管理：/etl
 * - 关系管理：/relations
 * - 映射管理：/mappings
 */
function App() {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        <NavigationMenu onCollapse={setCollapsed} />
        <Layout style={{ marginLeft: collapsed ? 80 : 240, transition: 'margin-left 0.2s' }}>
          <Content style={{ minHeight: '100vh', background: '#f0f2f5' }}>
            <Routes>
              <Route path="/" element={<DomainManager />} />
              <Route path="/domains" element={<DomainManager />} />
              <Route path="/domain/:domainId" element={<DomainWorkbench />} />
              
              <Route path="/models" element={<ModelsPage />} />
              <Route path="/model/:modelId" element={<ModelDetail />} />
              
              <Route path="/datasources" element={<DatasourcesPage />} />
              <Route path="/datasource/:datasourceId" element={<DatasourceDetail />} />
              
              <Route path="/etl" element={<ETLManager />} />
              
              <Route path="/relations" element={<RelationManager />} />
              <Route path="/mappings" element={<MappingManager />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </Router>
  )
}

export default App
