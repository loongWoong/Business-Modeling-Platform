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
  
  // 共享属性相关状态
  const [sharedAttributes, setSharedAttributes] = useState([])
  const [isAttrModalOpen, setIsAttrModalOpen] = useState(false)
  const [editingAttr, setEditingAttr] = useState(null)
  const [newAttr, setNewAttr] = useState({ name: '', type: 'string', length: '', precision: '', description: '', valueRange: '' })
  
  // 关系管理相关状态
  const [relations, setRelations] = useState([])
  const [isRelationModalOpen, setIsRelationModalOpen] = useState(false)
  const [editingRelation, setEditingRelation] = useState(null)
  const [newRelation, setNewRelation] = useState({
    name: '',
    sourceModel: '',
    targetModel: '',
    type: 'one-to-many',
    description: '',
    enabled: true
  })
  
  // 语义/指标相关状态
  const [semanticIndicators, setSemanticIndicators] = useState([])
  const [isIndicatorModalOpen, setIsIndicatorModalOpen] = useState(false)
  const [editingIndicator, setEditingIndicator] = useState(null)
  const [newIndicator, setNewIndicator] = useState({
    name: '',
    expression: '',
    returnType: 'number',
    description: '',
    status: 'draft',
    unit: ''
  })
  
  const [hoveredNodeId, setHoveredNodeId] = useState(null)
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
    
    // 模拟获取共享属性数据
    // 实际项目中应该调用API获取
    const mockSharedAttrs = [
      { id: 1, name: '创建时间', type: 'datetime', description: '记录创建时间', referenceCount: 5 },
      { id: 2, name: '更新时间', type: 'datetime', description: '记录更新时间', referenceCount: 5 },
      { id: 3, name: '状态', type: 'string', length: '20', description: '记录状态', referenceCount: 3 },
      { id: 4, name: '备注', type: 'text', description: '备注信息', referenceCount: 2 },
      { id: 5, name: '排序号', type: 'number', precision: '0', description: '排序序号', referenceCount: 4 }
    ]
    setSharedAttributes(mockSharedAttrs)
    
    // 模拟获取关系数据
    // 实际项目中应该调用API获取
    const mockRelations = [
      { id: 1, name: '持有', sourceModel: '车辆', targetModel: '通行介质', type: 'one-to-many', description: '车辆持有多个通行介质', enabled: true },
      { id: 2, name: '关联', sourceModel: '车辆', targetModel: '交易流水', type: 'one-to-many', description: '车辆关联多个交易流水', enabled: true },
      { id: 3, name: '管理', sourceModel: '路段业主', targetModel: '收费公路', type: 'one-to-many', description: '路段业主管理多个收费公路', enabled: true },
      { id: 4, name: '包含', sourceModel: '收费公路', targetModel: '收费站', type: 'one-to-many', description: '收费公路包含多个收费站', enabled: true },
      { id: 5, name: '包含', sourceModel: '收费公路', targetModel: 'ETC门架', type: 'one-to-many', description: '收费公路包含多个ETC门架', enabled: true },
      { id: 6, name: '包含', sourceModel: '收费公路', targetModel: '收费单元', type: 'one-to-many', description: '收费公路包含多个收费单元', enabled: true },
      { id: 7, name: '代收', sourceModel: 'ETC门架', targetModel: '收费单元', type: 'one-to-many', description: 'ETC门架代收多个收费单元', enabled: true },
      { id: 8, name: '包含', sourceModel: '收费站', targetModel: '车道', type: 'one-to-many', description: '收费站包含多个车道', enabled: true },
      { id: 9, name: '继承', sourceModel: 'ETC门架', targetModel: '标识点', type: 'one-to-one', description: 'ETC门架继承标识点', enabled: true },
      { id: 10, name: '继承', sourceModel: '车道', targetModel: '标识点', type: 'one-to-one', description: '车道继承标识点', enabled: true },
      { id: 11, name: '生成', sourceModel: '标识点', targetModel: '交易流水', type: 'one-to-many', description: '标识点生成多个交易流水', enabled: true },
      { id: 12, name: '汇聚为', sourceModel: '交易流水', targetModel: '车辆通行路径', type: 'many-to-one', description: '多个交易流水汇聚为一个车辆通行路径', enabled: true },
      { id: 13, name: '拟合为', sourceModel: '车辆通行路径', targetModel: '通行拟合路径', type: 'one-to-one', description: '车辆通行路径拟合为一个通行拟合路径', enabled: true },
      { id: 14, name: '拆分为', sourceModel: '通行拟合路径', targetModel: '拆分明细', type: 'one-to-many', description: '通行拟合路径拆分为多个拆分明细', enabled: true },
      { id: 15, name: '关联', sourceModel: '收费单元', targetModel: '拆分明细', type: 'one-to-one', description: '收费单元关联一个拆分明细', enabled: true }
    ]
    setRelations(mockRelations)
    
    // 模拟获取语义/指标数据
    // 实际项目中应该调用API获取
    const mockIndicators = [
      { id: 1, name: '平均通行费用', expression: 'SUM(账单金额)/COUNT(通行记录)', returnType: 'number', description: '计算平均通行费用', status: 'published', unit: '元' },
      { id: 2, name: '路段车流量', expression: 'COUNT(通行记录 WHERE 路段ID=?)', returnType: 'number', description: '计算路段车流量', status: 'draft', unit: '辆' },
      { id: 3, name: '车型占比', expression: 'COUNT(车辆信息 WHERE 车型=?)/COUNT(车辆信息)', returnType: 'number', description: '计算车型占比', status: 'published', unit: '%' },
      { id: 4, name: '收费站日均收入', expression: 'SUM(账单金额 WHERE 收费站ID=?)/COUNT(DISTINCT 日期)', returnType: 'number', description: '计算收费站日均收入', status: 'draft', unit: '元' },
      { id: 5, name: '通行时间', expression: '结束时间 - 开始时间', returnType: 'time', description: '计算通行时间', status: 'published', unit: '分钟' }
    ]
    setSemanticIndicators(mockIndicators)
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

    // 准备数据，为不同类型节点添加唯一ID前缀
    let nodes = []
    let links = []

    // 处理模型节点，添加model_前缀
    allData.models.forEach(model => {
      nodes.push({
        ...model,
        originalId: model.id,
        id: `model_${model.id}`,
        type: 'model'
      })
    })

    // 处理模型之间的边
    allData.edges.forEach(edge => {
      links.push({
        source: `model_${edge.source}`,
        target: `model_${edge.target}`
      })
    })

    if (isPropertyExpanded) {
      // 展开到属性级别，为属性节点添加property_前缀
      const properties = allData.properties.filter(p => allData.models.some(m => m.id === p.modelId))
      properties.forEach(property => {
        nodes.push({
          ...property,
          originalId: property.id,
          id: `property_${property.id}`,
          type: 'property'
        })
        
        // 添加模型到属性的边
        links.push({
          source: `model_${property.modelId}`,
          target: `property_${property.id}`
        })
      })
    }

    // 创建力导向模拟
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(isPropertyExpanded ? 80 : 120))
      .force('charge', d3.forceManyBody().strength(isPropertyExpanded ? -200 : -400))
      .force('center', d3.forceCenter(width / 2, height / 2))
    
    // 查找相关节点的函数
    const findRelatedNodes = (nodeId) => {
      const relatedNodeIds = new Set()
      relatedNodeIds.add(nodeId)
      
      // 查找直接连接的节点
      links.forEach(link => {
        if (link.source.id === nodeId || link.target.id === nodeId) {
          relatedNodeIds.add(link.source.id)
          relatedNodeIds.add(link.target.id)
        }
      })
      
      return relatedNodeIds
    }

    // 添加渐变定义
    const defs = svg.append('defs')
    
    // 模型渐变
    defs.append('linearGradient')
      .attr('id', 'modelGradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '100%')
      .selectAll('stop')
      .data([
        { offset: '0%', color: '#10b981' },
        { offset: '100%', color: '#059669' }
      ])
      .enter().append('stop')
      .attr('offset', d => d.offset)
      .attr('stop-color', d => d.color)
    
    // 属性渐变
    defs.append('linearGradient')
      .attr('id', 'propertyGradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '100%')
      .selectAll('stop')
      .data([
        { offset: '0%', color: '#f59e0b' },
        { offset: '100%', color: '#d97706' }
      ])
      .enter().append('stop')
      .attr('offset', d => d.offset)
      .attr('stop-color', d => d.color)
    
    // 连线渐变
    defs.append('linearGradient')
      .attr('id', 'linkGradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%')
      .selectAll('stop')
      .data([
        { offset: '0%', color: '#3b82f6', opacity: 0.8 },
        { offset: '100%', color: '#10b981', opacity: 0.8 }
      ])
      .enter().append('stop')
      .attr('offset', d => d.offset)
      .attr('stop-color', d => d.color)
      .attr('stop-opacity', d => d.opacity)

    // 创建边
    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('class', 'sci-fi-link')

    // 创建节点组
    const nodeGroup = svg.append('g')
      .selectAll('g')
      .data(nodes)
      .enter().append('g')
      .attr('class', d => `sci-fi-node ${d.type}-node`)
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended))

    // 添加节点圆圈
    nodeGroup.append('circle')
      .attr('r', d => d.type === 'property' ? 15 : 25) // 属性节点更小

    // 节点文本
    nodeGroup.append('text')
      .text(d => d.name)
      .attr('text-anchor', 'middle')
      .attr('dy', d => d.type === 'property' ? 2 : 3)
      .attr('font-size', d => d.type === 'property' ? 9 : 11)
      .attr('fill', d => d.type === 'property' ? '#f1f5f9' : 'white')

    // 鼠标事件处理
    nodeGroup.on('click', (event, d) => {
      event.stopPropagation()
      setHoveredModel(d)
      setIsDrawerVisible(!isDrawerVisible)
    })

    nodeGroup.on('dblclick', (event, d) => {
      event.stopPropagation()
      if (d.type === 'model') {
        // 只有模型节点可以双击进入详情页
        window.location.href = `/model/${d.originalId}`
      }
    })
    
    // 鼠标悬停事件 - 高亮相关节点
    nodeGroup.on('mouseover', (event, d) => {
      const relatedNodeIds = findRelatedNodes(d.id)
      
      // 高亮当前节点和相关节点，其他节点置灰
      nodeGroup.style('opacity', node => {
        return relatedNodeIds.has(node.id) ? 1 : 0.2
      })
      
      // 高亮当前节点和相关节点的圆圈和文本
      nodeGroup.select('circle').style('opacity', node => {
        return relatedNodeIds.has(node.id) ? 1 : 0.2
      })
      
      nodeGroup.select('text').style('opacity', node => {
        return relatedNodeIds.has(node.id) ? 1 : 0.2
      })
      
      // 高亮相关边，其他边置灰
      link.style('opacity', edge => {
        return relatedNodeIds.has(edge.source.id) && relatedNodeIds.has(edge.target.id) ? 0.8 : 0.1
      })
    })
    
    // 鼠标移出事件 - 恢复所有节点和边的透明度
    nodeGroup.on('mouseout', () => {
      nodeGroup.style('opacity', 1)
      nodeGroup.select('circle').style('opacity', 1)
      nodeGroup.select('text').style('opacity', 1)
      link.style('opacity', 0.8)
    })
    
    // 添加画布点击事件，点击空白处收起信息窗
    svg.on('click', () => {
      setIsDrawerVisible(false)
    })

    // 力导向模拟更新
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y)

      nodeGroup
        .attr('transform', d => `translate(${d.x}, ${d.y})`)
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
  
  // 共享属性处理函数
  const handleCreateAttr = () => {
    // 实际项目中应该调用API
    const attr = {
      id: sharedAttributes.length + 1,
      ...newAttr,
      referenceCount: 0
    }
    setSharedAttributes([...sharedAttributes, attr])
    setIsAttrModalOpen(false)
    setNewAttr({ name: '', type: 'string', length: '', precision: '', description: '', valueRange: '' })
  }
  
  const handleEditAttr = (attr) => {
    setEditingAttr(attr)
    setNewAttr(attr)
    setIsAttrModalOpen(true)
  }
  
  const handleUpdateAttr = () => {
    // 实际项目中应该调用API
    setSharedAttributes(sharedAttributes.map(attr => 
      attr.id === editingAttr.id ? newAttr : attr
    ))
    setIsAttrModalOpen(false)
    setEditingAttr(null)
    setNewAttr({ name: '', type: 'string', length: '', precision: '', description: '', valueRange: '' })
  }
  
  const handleDeleteAttr = (id) => {
    // 实际项目中应该调用API，这里模拟删除
    setSharedAttributes(sharedAttributes.filter(attr => attr.id !== id))
  }
  
  const handleSaveAttr = () => {
    if (editingAttr) {
      handleUpdateAttr()
    } else {
      handleCreateAttr()
    }
  }
  
  // 关系管理处理函数
  const handleCreateRelation = () => {
    // 实际项目中应该调用API
    const relation = {
      id: relations.length + 1,
      ...newRelation
    }
    setRelations([...relations, relation])
    setIsRelationModalOpen(false)
    setNewRelation({
      name: '',
      sourceModel: '',
      targetModel: '',
      type: 'one-to-many',
      description: '',
      enabled: true
    })
  }
  
  const handleEditRelation = (relation) => {
    setEditingRelation(relation)
    setNewRelation(relation)
    setIsRelationModalOpen(true)
  }
  
  const handleUpdateRelation = () => {
    // 实际项目中应该调用API
    setRelations(relations.map(relation => 
      relation.id === editingRelation.id ? newRelation : relation
    ))
    setIsRelationModalOpen(false)
    setEditingRelation(null)
    setNewRelation({
      name: '',
      sourceModel: '',
      targetModel: '',
      type: 'one-to-many',
      description: '',
      enabled: true
    })
  }
  
  const handleDeleteRelation = (id) => {
    // 实际项目中应该调用API，这里模拟删除
    setRelations(relations.filter(relation => relation.id !== id))
  }
  
  const handleToggleRelation = (id) => {
    // 实际项目中应该调用API
    setRelations(relations.map(relation => 
      relation.id === id ? { ...relation, enabled: !relation.enabled } : relation
    ))
  }
  
  const handleSaveRelation = () => {
    if (editingRelation) {
      handleUpdateRelation()
    } else {
      handleCreateRelation()
    }
  }
  
  // 语义/指标处理函数
  const handleCreateIndicator = () => {
    // 实际项目中应该调用API
    const indicator = {
      id: semanticIndicators.length + 1,
      ...newIndicator
    }
    setSemanticIndicators([...semanticIndicators, indicator])
    setIsIndicatorModalOpen(false)
    setNewIndicator({
      name: '',
      expression: '',
      returnType: 'number',
      description: '',
      status: 'draft',
      unit: ''
    })
  }
  
  const handleEditIndicator = (indicator) => {
    setEditingIndicator(indicator)
    setNewIndicator(indicator)
    setIsIndicatorModalOpen(true)
  }
  
  const handleUpdateIndicator = () => {
    // 实际项目中应该调用API
    setSemanticIndicators(semanticIndicators.map(indicator => 
      indicator.id === editingIndicator.id ? newIndicator : indicator
    ))
    setIsIndicatorModalOpen(false)
    setEditingIndicator(null)
    setNewIndicator({
      name: '',
      expression: '',
      returnType: 'number',
      description: '',
      status: 'draft',
      unit: ''
    })
  }
  
  const handleDeleteIndicator = (id) => {
    // 实际项目中应该调用API，这里模拟删除
    setSemanticIndicators(semanticIndicators.filter(indicator => indicator.id !== id))
  }
  
  const handlePublishIndicator = (id) => {
    // 实际项目中应该调用API
    setSemanticIndicators(semanticIndicators.map(indicator => 
      indicator.id === id ? { ...indicator, status: 'published' } : indicator
    ))
  }
  
  const handleOfflineIndicator = (id) => {
    // 实际项目中应该调用API
    setSemanticIndicators(semanticIndicators.map(indicator => 
      indicator.id === id ? { ...indicator, status: 'offline' } : indicator
    ))
  }
  
  const handleSaveIndicator = () => {
    if (editingIndicator) {
      handleUpdateIndicator()
    } else {
      handleCreateIndicator()
    }
  }
  
  const handleCopyIndicator = (indicator) => {
    // 复制并创建新指标
    const newIndicatorCopy = {
      id: semanticIndicators.length + 1,
      ...indicator,
      name: `${indicator.name} - 副本`,
      status: 'draft',
      expression: indicator.expression
    }
    setSemanticIndicators([...semanticIndicators, newIndicatorCopy])
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
                <div 
                  key={model.id} 
                  className="card"
                  onDoubleClick={() => window.location.href = `/model/${model.id}`}
                  style={{ cursor: 'pointer' }}
                >
                  <h3>{model.name}</h3>
                  <p>描述: {model.description}</p>
                  <p>创建人: {model.creator}</p>
                  <p>更新时间: {model.updatedAt}</p>
                  <div className="card-actions">
                    <button className="edit" onClick={(e) => {
                      e.stopPropagation();
                      console.log('编辑模型', model.id);
                    }}>编辑</button>
                    <button className="delete" onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteModel(model.id);
                    }}>删除</button>
                    <button onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `/model/${model.id}`;
                    }}>详情</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* 共享属性管理 */}
        {activeTab === 'shared-attr' && (
          <>
            <div className="header-toolbar">
              <input
                type="text"
                placeholder="搜索共享属性..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button onClick={() => {
                setEditingAttr(null)
                setNewAttr({ name: '', type: 'string', length: '', precision: '', description: '', valueRange: '' })
                setIsAttrModalOpen(true)
              }}>新建属性</button>
              <button>导入</button>
              <button>导出</button>
            </div>
            <div className="card-list">
              {sharedAttributes.filter(attr => 
                attr.name.toLowerCase().includes(searchTerm.toLowerCase())
              ).map(attr => (
                <div key={attr.id} className="card">
                  <h3>{attr.name}</h3>
                  <p>类型: {attr.type}</p>
                  <p>长度: {attr.length || '-'}</p>
                  <p>精度: {attr.precision || '-'}</p>
                  <p>描述: {attr.description}</p>
                  <p>引用次数: {attr.referenceCount}</p>
                  <div className="card-actions">
                    <button className="edit" onClick={() => handleEditAttr(attr)}>编辑</button>
                    <button className="delete" onClick={() => handleDeleteAttr(attr.id)}>删除</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        
        {/* 关系管理 */}
        {activeTab === 'relation-mgr' && (
          <>
            <div className="header-toolbar">
              <input
                type="text"
                placeholder="搜索关系..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button onClick={() => {
                setEditingRelation(null)
                setNewRelation({
                  name: '',
                  sourceModel: '',
                  targetModel: '',
                  type: 'one-to-many',
                  description: '',
                  enabled: true
                })
                setIsRelationModalOpen(true)
              }}>新建关系</button>
              <button>导入</button>
              <button>导出</button>
            </div>
            <div className="card-list">
              {relations.filter(relation => 
                relation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                relation.sourceModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
                relation.targetModel.toLowerCase().includes(searchTerm.toLowerCase())
              ).map(relation => (
                <div key={relation.id} className="card">
                  <h3>{relation.name}</h3>
                  <p>关系: {relation.sourceModel} → {relation.targetModel}</p>
                  <p>类型: {relation.type}</p>
                  <p>描述: {relation.description}</p>
                  <p>状态: {relation.enabled ? '启用' : '禁用'}</p>
                  <div className="card-actions">
                    <button className="edit" onClick={() => handleEditRelation(relation)}>编辑</button>
                    <button className={relation.enabled ? 'delete' : 'edit'} onClick={() => handleToggleRelation(relation.id)}>
                      {relation.enabled ? '禁用' : '启用'}
                    </button>
                    <button className="delete" onClick={() => handleDeleteRelation(relation.id)}>删除</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        
        {/* 语义/指标管理 */}
        {activeTab === 'semantic-indi' && (
          <>
            <div className="header-toolbar">
              <input
                type="text"
                placeholder="搜索语义/指标..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button onClick={() => {
                setEditingIndicator(null)
                setNewIndicator({
                  name: '',
                  expression: '',
                  returnType: 'number',
                  description: '',
                  status: 'draft',
                  unit: ''
                })
                setIsIndicatorModalOpen(true)
              }}>新建指标</button>
              <button>导入</button>
              <button>导出</button>
            </div>
            <div className="card-list">
              {semanticIndicators.filter(indicator => 
                indicator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                indicator.description.toLowerCase().includes(searchTerm.toLowerCase())
              ).map(indicator => (
                <div key={indicator.id} className="card">
                  <h3>{indicator.name}</h3>
                  <p>表达式: {indicator.expression}</p>
                  <p>返回类型: {indicator.returnType}</p>
                  <p>单位: {indicator.unit || '-'}</p>
                  <p>描述: {indicator.description}</p>
                  <p>状态: {
                    indicator.status === 'published' ? '已发布' : 
                    indicator.status === 'offline' ? '已下线' : '草稿'
                  }</p>
                  <div className="card-actions">
                    <button className="edit" onClick={() => handleEditIndicator(indicator)}>编辑</button>
                    {indicator.status === 'draft' && (
                      <button onClick={() => handlePublishIndicator(indicator.id)}>发布</button>
                    )}
                    {indicator.status === 'published' && (
                      <button onClick={() => handleOfflineIndicator(indicator.id)}>下线</button>
                    )}
                    <button onClick={() => handleCopyIndicator(indicator)}>复制</button>
                    <button className="delete" onClick={() => handleDeleteIndicator(indicator.id)}>删除</button>
                  </div>
                </div>
              ))}
            </div>
          </>
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
      
      {/* 新建/编辑共享属性模态框 */}
      {isAttrModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>{editingAttr ? '编辑共享属性' : '新建共享属性'}</h2>
            <div className="form-group">
              <label>名称</label>
              <input
                type="text"
                value={newAttr.name}
                onChange={(e) => setNewAttr({ ...newAttr, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>数据类型</label>
              <select
                value={newAttr.type}
                onChange={(e) => setNewAttr({ ...newAttr, type: e.target.value })}
              >
                <option value="string">字符串</option>
                <option value="number">数字</option>
                <option value="date">日期</option>
                <option value="datetime">日期时间</option>
                <option value="boolean">布尔值</option>
                <option value="text">文本</option>
              </select>
            </div>
            <div className="form-group">
              <label>长度</label>
              <input
                type="text"
                value={newAttr.length}
                onChange={(e) => setNewAttr({ ...newAttr, length: e.target.value })}
                placeholder="可选，如：255"
              />
            </div>
            <div className="form-group">
              <label>精度</label>
              <input
                type="text"
                value={newAttr.precision}
                onChange={(e) => setNewAttr({ ...newAttr, precision: e.target.value })}
                placeholder="可选，如：0（整数）、2（两位小数）"
              />
            </div>
            <div className="form-group">
              <label>描述</label>
              <textarea
                value={newAttr.description}
                onChange={(e) => setNewAttr({ ...newAttr, description: e.target.value })}
              ></textarea>
            </div>
            <div className="form-group">
              <label>值域（可选）</label>
              <input
                type="text"
                value={newAttr.valueRange}
                onChange={(e) => setNewAttr({ ...newAttr, valueRange: e.target.value })}
                placeholder="如：0,1 或 男,女"
              />
            </div>
            <div className="form-actions">
              <button className="cancel" onClick={() => {
                setIsAttrModalOpen(false)
                setEditingAttr(null)
              }}>取消</button>
              <button className="submit" onClick={handleSaveAttr}>{editingAttr ? '更新' : '创建'}</button>
            </div>
          </div>
        </div>
      )}
      
      {/* 新建/编辑关系模态框 */}
      {isRelationModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>{editingRelation ? '编辑关系' : '新建关系'}</h2>
            <div className="form-group">
              <label>名称</label>
              <input
                type="text"
                value={newRelation.name}
                onChange={(e) => setNewRelation({ ...newRelation, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>源模型</label>
              <select
                value={newRelation.sourceModel}
                onChange={(e) => setNewRelation({ ...newRelation, sourceModel: e.target.value })}
              >
                <option value="">选择源模型</option>
                <option value="车辆">车辆</option>
                <option value="路段业主">路段业主</option>
                <option value="收费公路">收费公路</option>
                <option value="收费站">收费站</option>
                <option value="ETC门架">ETC门架</option>
                <option value="收费单元">收费单元</option>
                <option value="车道">车道</option>
                <option value="标识点">标识点</option>
                <option value="交易流水">交易流水</option>
                <option value="车辆通行路径">车辆通行路径</option>
                <option value="通行拟合路径">通行拟合路径</option>
              </select>
            </div>
            <div className="form-group">
              <label>目标模型</label>
              <select
                value={newRelation.targetModel}
                onChange={(e) => setNewRelation({ ...newRelation, targetModel: e.target.value })}
              >
                <option value="">选择目标模型</option>
                <option value="通行介质">通行介质</option>
                <option value="交易流水">交易流水</option>
                <option value="收费公路">收费公路</option>
                <option value="收费站">收费站</option>
                <option value="ETC门架">ETC门架</option>
                <option value="收费单元">收费单元</option>
                <option value="车道">车道</option>
                <option value="标识点">标识点</option>
                <option value="车辆通行路径">车辆通行路径</option>
                <option value="通行拟合路径">通行拟合路径</option>
                <option value="拆分明细">拆分明细</option>
              </select>
            </div>
            <div className="form-group">
              <label>关系类型</label>
              <select
                value={newRelation.type}
                onChange={(e) => setNewRelation({ ...newRelation, type: e.target.value })}
              >
                <option value="one-to-one">一对一</option>
                <option value="one-to-many">一对多</option>
                <option value="many-to-one">多对一</option>
                <option value="many-to-many">多对多</option>
              </select>
            </div>
            <div className="form-group">
              <label>描述</label>
              <textarea
                value={newRelation.description}
                onChange={(e) => setNewRelation({ ...newRelation, description: e.target.value })}
              ></textarea>
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                id="enabled"
                checked={newRelation.enabled}
                onChange={(e) => setNewRelation({ ...newRelation, enabled: e.target.checked })}
              />
              <label htmlFor="enabled" style={{ marginBottom: 0 }}>启用</label>
            </div>
            <div className="form-actions">
              <button className="cancel" onClick={() => {
                setIsRelationModalOpen(false)
                setEditingRelation(null)
              }}>取消</button>
              <button className="submit" onClick={handleSaveRelation}>{editingRelation ? '更新' : '创建'}</button>
            </div>
          </div>
        </div>
      )}
      
      {/* 新建/编辑语义/指标模态框 */}
      {isIndicatorModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>{editingIndicator ? '编辑指标' : '新建指标'}</h2>
            <div className="form-group">
              <label>名称</label>
              <input
                type="text"
                value={newIndicator.name}
                onChange={(e) => setNewIndicator({ ...newIndicator, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>表达式</label>
              <textarea
                value={newIndicator.expression}
                onChange={(e) => setNewIndicator({ ...newIndicator, expression: e.target.value })}
                placeholder="如：SUM(账单金额)/COUNT(通行记录)"
                rows={4}
              ></textarea>
            </div>
            <div className="form-group">
              <label>返回类型</label>
              <select
                value={newIndicator.returnType}
                onChange={(e) => setNewIndicator({ ...newIndicator, returnType: e.target.value })}
              >
                <option value="number">数字</option>
                <option value="string">字符串</option>
                <option value="date">日期</option>
                <option value="time">时间</option>
                <option value="boolean">布尔值</option>
              </select>
            </div>
            <div className="form-group">
              <label>单位</label>
              <input
                type="text"
                value={newIndicator.unit}
                onChange={(e) => setNewIndicator({ ...newIndicator, unit: e.target.value })}
                placeholder="如：元、辆、%"
              />
            </div>
            <div className="form-group">
              <label>描述</label>
              <textarea
                value={newIndicator.description}
                onChange={(e) => setNewIndicator({ ...newIndicator, description: e.target.value })}
              ></textarea>
            </div>
            <div className="form-group">
              <label>状态</label>
              <select
                value={newIndicator.status}
                onChange={(e) => setNewIndicator({ ...newIndicator, status: e.target.value })}
              >
                <option value="draft">草稿</option>
                <option value="published">已发布</option>
                <option value="offline">已下线</option>
              </select>
            </div>
            <div className="form-actions">
              <button className="cancel" onClick={() => {
                setIsIndicatorModalOpen(false)
                setEditingIndicator(null)
              }}>取消</button>
              <button className="submit" onClick={handleSaveIndicator}>{editingIndicator ? '更新' : '创建'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DomainWorkbench