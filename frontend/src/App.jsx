import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout } from 'antd'
import DomainMap from './pages/DomainMap/DomainMap'
import DomainWorkbench from './pages/DomainWorkbench/DomainWorkbench'
import ModelDetail from './pages/ModelDetail/ModelDetail'
import DatasourceDetail from './pages/DatasourceDetail/DatasourceDetail'
import ETLManager from './pages/ETLManager/ETLManager'
import ModelsPage from './pages/ModelsPage/ModelsPage'
import DatasourcesPage from './pages/DatasourcesPage/DatasourcesPage'
import NavigationMenu from './components/NavigationMenu'

const { Content } = Layout

/**
 * 应用路由结构（基于DDD聚合边界）
 * 
 * 路由组织原则：
 * 1. Domain作为分类维度，不是聚合根
 * 2. 每个聚合有独立的详情页面
 * 3. DomainWorkbench作为Domain的概览页面，展示该Domain下的资源
 * 
 * 路由结构：
 * / - DomainMap（业务域地图，展示所有Domain）
 * /domain/:domainId - DomainWorkbench（Domain概览，展示该Domain下的Models和Datasources）
 * /models - ModelsPage（Model聚合列表，跨Domain查看所有Model）
 * /model/:modelId - ModelDetail（Model聚合管理：Model + Properties + Relations）
 * /datasources - DatasourcesPage（Datasource聚合列表，跨Domain查看所有Datasource）
 * /datasource/:datasourceId - DatasourceDetail（Datasource聚合管理：Datasource + Mappings + Associations）
 * /etl - ETLManager（ETL聚合管理：ETLTask + ETLLog）
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
              <Route path="/" element={<DomainMap />} />
              <Route path="/domain/:domainId" element={<DomainWorkbench />} />
              <Route path="/models" element={<ModelsPage />} />
              <Route path="/model/:modelId" element={<ModelDetail />} />
              <Route path="/datasources" element={<DatasourcesPage />} />
              <Route path="/datasource/:datasourceId" element={<DatasourceDetail />} />
              <Route path="/etl" element={<ETLManager />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </Router>
  )
}

export default App