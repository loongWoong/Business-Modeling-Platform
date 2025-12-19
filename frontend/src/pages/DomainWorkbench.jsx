import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import * as d3 from 'd3'

const DomainWorkbench = () => {
  const { domainId } = useParams()
  const [activeTab, setActiveTab] = useState('model-map')
  const [models, setModels] = useState([])
  const [modelEdges, setModelEdges] = useState([])
  const [hoveredModel, setHoveredModel] = useState(null)
  const [isDrawerVisible, setIsDrawerVisible] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newModel, setNewModel] = useState({ name: '', description: '', parentId: '', tags: '' })
  const [searchTerm, setSearchTerm] = useState('')
  const [currentDomain, setCurrentDomain] = useState(null)
  const [isPropertyExpanded, setIsPropertyExpanded] = useState(false)
  const [allData, setAllData] = useState({ models: [], properties: [], edges: [] })
  const svgRef = useRef(null)
  const containerRef = useRef(null)
  const timerRef = useRef(null)

  // 从API获取数据
  useEffect(() => {
    // 获取模型数据
    fetch(`/api/model?domainId=${domainId}`)
      .then(response => response.json())
      .then(data => {
        setModels(data.models)
        setModelEdges(data.edges)
        
        // 获取所有属性数据
        fetch('/api/property')
          .then(response => response.json())
          .then(propertyData => {
            setAllData({
              models: data.models,
              properties: propertyData,
              edges: data.edges
            })
          })
          .catch(error => console.error('Failed to fetch properties:', error))
      })
      .catch(error => console.error('Failed to fetch models:', error))
    
    // 获取当前域详情
    fetch('/api/domain/list')
      .then(response => response.json())
      .then(data => {
        const domain = data.domains.find(d => d.id === parseInt(domainId))
        setCurrentDomain(domain)
      })
      .catch(error => console.error('Failed to fetch domain:', error))
  }, [domainId])

  // 使用D3渲染模型地图
  useEffect(() => {
    if (activeTab !== 'model-map' || !svgRef.current || allData.models.length === 0) return

    const svg = d3.select(svgRef.current)
    const container = d3.select(containerRef.current)
    const width = container.node().clientWidth
    const height = container.node().clientHeight

    // 清除旧的图形
    svg.selectAll('*').remove()

    // 准备数据
    let nodes = [...allData.models]
    let links = [...allData.edges]

    if (isPropertyExpanded) {
      // 展开到属性级别
      const properties = allData.properties.filter(p => nodes.some(m => m.id === p.modelId))
      nodes = [...nodes, ...properties]
      
      // 添加模型到属性的边
      properties.forEach(property => {
        links.push({
          source: property.modelId,
          target: property.id
        })
      })
    }

    // 创建力导向模拟
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(isPropertyExpanded ? 80 : 120))
      .force('charge', d3.forceManyBody().strength(isPropertyExpanded ? -200 : -400))
      .force('center', d3.forceCenter(width / 2, height / 2))

    // 创建边
    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 1.5)

    // 创建节点
    const node = svg.append('g')
      .selectAll('circle')
      .data(nodes)
      .enter().append('circle')
      .attr('r', d => d.modelId ? 15 : 25) // 属性节点更小
      .attr('fill', d => d.modelId ? '#faad14' : '#52c41a') // 属性节点黄色，模型节点绿色
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended))

    // 节点文本
    const nodeText = svg.append('g')
      .selectAll('text')
      .data(nodes)
      .enter().append('text')
      .text(d => d.name)
      .attr('text-anchor', 'middle')
      .attr('dy', d => d.modelId ? 2 : 3)
      .attr('font-size', d => d.modelId ? 9 : 11)
      .attr('fill', d => d.modelId ? '#333' : 'white') // 属性节点文本黑色，模型节点文本白色
      .style('pointer-events', 'none')

    // 鼠标事件处理
    node.on('click', (event, d) => {
      event.stopPropagation()
      if (d.modelId) {
        // 属性节点，显示详情
        setHoveredModel(d)
        setIsDrawerVisible(!isDrawerVisible)
      } else {
        // 模型节点，显示详情
        setHoveredModel(d)
        setIsDrawerVisible(!isDrawerVisible)
      }
    })

    node.on('dblclick', (event, d) => {
      event.stopPropagation()
      if (!d.modelId) {
        // 只有模型节点可以双击进入详情页
        window.location.href = `/model/${d.id}`
      }
    })

    // 力导向模拟更新
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y)

      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)

      nodeText
        .attr('x', d => d.x)
        .attr('y', d => d.y)
    })

    // 拖拽函数
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart()
      d.fx = d.x
      d.fy = d.y
    }

    function dragged(event, d) {
      d.fx = event.x
      d.fy = event.y
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0)
      d.fx = null
      d.fy = null
    }

    // 窗口大小变化时重新绘制
    const handleResize = () => {
      const newWidth = container.node().clientWidth
      const newHeight = container.node().clientHeight
      svg.attr('width', newWidth).attr('height', newHeight)
      simulation.force('center', d3.forceCenter(newWidth / 2, newHeight / 2))
      simulation.alpha(0.3).restart()
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [allData, isPropertyExpanded, activeTab])

  // 处理新建模型
  const handleCreateModel = () => {
    fetch('/api/model', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...newModel,
        domainId: parseInt(domainId)
      })
    })
      .then(response => response.json())
      .then(model => {
        setModels([...models, model])
        setIsModalOpen(false)
        setNewModel({ name: '', description: '', parentId: '', tags: '' })
      })
      .catch(error => console.error('Failed to create model:', error))
  }

  // 处理删除模型
  const handleDeleteModel = (id) => {
    fetch(`/api/model/${id}`, {
      method: 'DELETE'
    })
      .then(() => {
        setModels(models.filter(model => model.id !== id))
      })
      .catch(error => console.error('Failed to delete model:', error))
  }

  // 过滤模型
  const filteredModels = models.filter(model =>
    model.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="domain-workbench">
      {/* 面包屑 */}
      <div style={{ padding: '12px 16px', backgroundColor: '#f0f2f5', borderBottom: '1px solid #e0e0e0' }}>
        <span style={{ cursor: 'pointer', color: '#1890ff', marginRight: '8px' }} onClick={() => window.location.href = '/'}>业务域地图</span>
        <span style={{ marginRight: '8px' }}>&gt;</span>
        <span>{currentDomain?.name || `域ID: ${domainId}`}</span>
      </div>
      
      {/* 顶部标题 */}
      <div style={{ padding: '16px', backgroundColor: 'white', borderBottom: '1px solid #e0e0e0' }}>
        <h2>业务域工作台</h2>
      </div>

      {/* 左侧Tab导航 */}
      <div className="tab-nav">
        <button
          className={activeTab === 'model-map' ? 'active' : ''}
          onClick={() => setActiveTab('model-map')}
        >
          模型地图
        </button>
        <button
          className={activeTab === 'model-mgr' ? 'active' : ''}
          onClick={() => setActiveTab('model-mgr')}
        >
          模型管理
        </button>
        <button
          className={activeTab === 'shared-attr' ? 'active' : ''}
          onClick={() => setActiveTab('shared-attr')}
        >
          共享属性
        </button>
        <button
          className={activeTab === 'relation-mgr' ? 'active' : ''}
          onClick={() => setActiveTab('relation-mgr')}
        >
          关系管理
        </button>
        <button
          className={activeTab === 'semantic-indi' ? 'active' : ''}
          onClick={() => setActiveTab('semantic-indi')}
        >
          语义/指标
        </button>
      </div>

      {/* 内容区域 */}
      <div className="content">
        {/* 模型地图 */}
        {activeTab === 'model-map' && (
          <>
            <div className="header-toolbar">
              <input
                type="text"
                placeholder="搜索模型名称..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button onClick={() => setIsPropertyExpanded(!isPropertyExpanded)}>
                {isPropertyExpanded ? '收起属性' : '展开到属性级别'}
              </button>
              <button onClick={() => window.location.href = '/'}>返回域地图</button>
            </div>
            <div ref={containerRef} className="canvas-container">
              <svg ref={svgRef} width="100%" height="100%"></svg>
            </div>
          </>
        )}

        {/* 模型管理 */}
        {activeTab === 'model-mgr' && (
          <>
            <div className="header-toolbar">
              <input
                type="text"
                placeholder="搜索模型名称..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button onClick={() => setIsModalOpen(true)}>新建模型</button>
              <button>导入</button>
              <button>导出</button>
            </div>
            <div className="card-list">
              {filteredModels.map(model => (
                <div key={model.id} className="card">
                  <h3>{model.name}</h3>
                  <p>描述: {model.description}</p>
                  <p>创建人: {model.creator}</p>
                  <p>更新时间: {model.updatedAt}</p>
                  <div className="card-actions">
                    <button className="edit" onClick={() => console.log('编辑模型', model.id)}>编辑</button>
                    <button className="delete" onClick={() => handleDeleteModel(model.id)}>删除</button>
                    <button onClick={() => window.location.href = `/model/${model.id}`}>详情</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* 其他Tab内容（占位） */}
        {(activeTab === 'shared-attr' || activeTab === 'relation-mgr' || activeTab === 'semantic-indi') && (
          <div style={{ padding: '16px', textAlign: 'center', color: '#666' }}>
            <h3>{activeTab === 'shared-attr' ? '共享属性' : activeTab === 'relation-mgr' ? '关系管理' : '语义/指标'}</h3>
            <p>功能开发中...</p>
          </div>
        )}
      </div>

      {/* 悬停抽屉 */}
      <div className={`hover-drawer ${isDrawerVisible ? 'visible' : ''}`}>
        {hoveredModel && (
          <div style={{ padding: '16px' }}>
            <h3>{hoveredModel.name}</h3>
            <p>描述: {hoveredModel.description}</p>
            <p>创建人: {hoveredModel.creator}</p>
            <p>更新时间: {hoveredModel.updatedAt}</p>
          </div>
        )}
      </div>

      {/* 新建模型模态框 */}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>新建模型</h2>
            <div className="form-group">
              <label>名称</label>
              <input
                type="text"
                value={newModel.name}
                onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>描述</label>
              <textarea
                value={newModel.description}
                onChange={(e) => setNewModel({ ...newModel, description: e.target.value })}
              ></textarea>
            </div>
            <div className="form-group">
              <label>父模型ID（可选）</label>
              <input
                type="text"
                value={newModel.parentId}
                onChange={(e) => setNewModel({ ...newModel, parentId: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>标签（逗号分隔）</label>
              <input
                type="text"
                value={newModel.tags}
                onChange={(e) => setNewModel({ ...newModel, tags: e.target.value })}
              />
            </div>
            <div className="form-actions">
              <button className="cancel" onClick={() => setIsModalOpen(false)}>取消</button>
              <button className="submit" onClick={handleCreateModel}>确定</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DomainWorkbench