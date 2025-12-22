import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import * as d3 from 'd3'

const DomainWorkbench = () => {
  const { domainId } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('model-map')
  const [models, setModels] = useState([])
  const [modelEdges, setModelEdges] = useState([])
  const [hoveredModel, setHoveredModel] = useState(null)
  const [isDrawerVisible, setIsDrawerVisible] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingModel, setEditingModel] = useState(null)
  const [newModel, setNewModel] = useState({ name: '', description: '', parentId: '', tags: '' })
  const [searchTerm, setSearchTerm] = useState('')
  const [currentDomain, setCurrentDomain] = useState(null)
  const [isPropertyExpanded, setIsPropertyExpanded] = useState(false)
  const [allData, setAllData] = useState({ models: [], properties: [], edges: [] })
  
  // 操作反馈状态
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  
  // 确认对话框状态
  const [confirmDialog, setConfirmDialog] = useState({ show: false, title: '', message: '', onConfirm: null })
  
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
    sourceModelId: '',
    targetModelId: '',
    type: 'one-to-many',
    description: '',
    enabled: true
  })
  
  // 显示关系相关状态
  const [showRelations, setShowRelations] = useState(false)
  
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
  
  // 显示通知
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000)
  }
  
  // 显示确认对话框
  const showConfirmDialog = (title, message, onConfirm) => {
    setConfirmDialog({ show: true, title, message, onConfirm })
  }
  
  // 关闭确认对话框
  const closeConfirmDialog = () => {
    setConfirmDialog({ show: false, title: '', message: '', onConfirm: null })
  }

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
    
    // 从后端API获取共享属性数据
    fetch(`/api/shared-attribute?domainId=${domainId}`)
      .then(response => response.json())
      .then(attrData => {
        setSharedAttributes(attrData)
      })
      .catch(error => console.error('Failed to fetch shared attributes:', error))
    
    // 从后端API获取关系数据
    fetch(`/api/relation?domainId=${domainId}`)
      .then(response => response.json())
      .then(relationData => {
        setRelations(relationData)
      })
      .catch(error => console.error('Failed to fetch relations:', error))
    
    // 从后端API获取语义/指标数据
    fetch(`/api/indicator?domainId=${domainId}`)
      .then(response => response.json())
      .then(indicatorData => {
        setSemanticIndicators(indicatorData)
      })
      .catch(error => console.error('Failed to fetch indicators:', error))
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
      // 根据搜索词过滤模型
      if (model.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        nodes.push({
          ...model,
          originalId: model.id,
          id: `model_${model.id}`,
          type: 'model'
        })
      }
    })

    // 处理模型之间的边，只保留存在的节点之间的边
    const modelIds = new Set(nodes.map(n => n.originalId))
    
    // 创建模型ID到模型名称的映射
    const modelIdToName = {};
    allData.models.forEach(model => {
      modelIdToName[model.id] = model.name;
    });
    
    allData.edges.forEach(edge => {
      if (modelIds.has(edge.source) && modelIds.has(edge.target)) {
        // 查找对应的关系名称
        const relation = relations.find(r => 
          r.sourceModel === modelIdToName[edge.source] && 
          r.targetModel === modelIdToName[edge.target]
        );
        
        links.push({
          source: `model_${edge.source}`,
          target: `model_${edge.target}`,
          relationName: relation ? relation.name : '关联'
        })
      }
    })

    if (isPropertyExpanded) {
      // 展开到属性级别，为属性节点添加property_前缀
      const properties = allData.properties.filter(p => modelIds.has(p.modelId))
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

    // 为边添加箭头标记
    svg.append('defs').selectAll('marker')
      .data(['arrow'])
      .enter().append('marker')
      .attr('id', d => d)
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 25)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#94a3b8')

    // 创建边组
    const linkGroup = svg.append('g')
      .attr('class', 'link-group')

    // 创建边
    const link = linkGroup.append('g')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('class', 'sci-fi-link')
      .attr('marker-end', showRelations ? 'url(#arrow)' : null)

    // 创建关系标签
    const linkLabels = linkGroup.append('g')
      .selectAll('text')
      .data(links)
      .enter().append('text')
      .attr('class', 'link-label')
      .style('display', showRelations ? 'block' : 'none')
      .style('font-size', '10px')
      .style('fill', '#94a3b8')
      .style('text-anchor', 'middle')
      .style('pointer-events', 'none')
      .text(d => d.relationName)

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

      // 更新关系标签位置
      linkLabels
        .attr('x', d => (d.source.x + d.target.x) / 2)
        .attr('y', d => (d.source.y + d.target.y) / 2 - 5)

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
  }, [allData, isPropertyExpanded, activeTab, searchTerm, showRelations])

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
        setEditingModel(null)
        setNewModel({ name: '', description: '', parentId: '', tags: '' })
        showNotification('模型创建成功')
      })
      .catch(error => {
        console.error('Failed to create model:', error)
        showNotification('模型创建失败', 'error')
      })
  }
  
  // 处理编辑模型
  const handleEditModel = (model) => {
    setEditingModel(model)
    setNewModel({
      name: model.name,
      description: model.description,
      parentId: model.parentId || '',
      tags: model.tags || ''
    })
    setIsModalOpen(true)
  }
  
  // 处理更新模型
  const handleUpdateModel = () => {
    fetch(`/api/model/${editingModel.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newModel)
    })
      .then(response => response.json())
      .then(updatedModel => {
        setModels(models.map(m => m.id === updatedModel.id ? updatedModel : m))
        setIsModalOpen(false)
        setEditingModel(null)
        setNewModel({ name: '', description: '', parentId: '', tags: '' })
        showNotification('模型更新成功')
      })
      .catch(error => {
        console.error('Failed to update model:', error)
        showNotification('模型更新失败', 'error')
      })
  }
  
  // 保存模型（创建或更新）
  const handleSaveModel = () => {
    if (editingModel) {
      handleUpdateModel()
    } else {
      handleCreateModel()
    }
  }

  // 处理删除模型
  const handleDeleteModel = (id) => {
    showConfirmDialog(
      '删除确认',
      '确定要删除该模型吗？删除后无法恢复，且会同时删除关联的属性和关系。',
      () => {
        fetch(`/api/model/${id}`, {
          method: 'DELETE'
        })
          .then(() => {
            setModels(models.filter(model => model.id !== id))
            showNotification('模型删除成功')
            closeConfirmDialog()
          })
          .catch(error => {
            console.error('Failed to delete model:', error)
            showNotification('模型删除失败', 'error')
            closeConfirmDialog()
          })
      }
    )
  }
  
  // 共享属性处理函数
  const handleCreateAttr = () => {
    fetch('/api/shared-attribute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newAttr, domainId: parseInt(domainId) })
    })
      .then(response => response.json())
      .then(attr => {
        setSharedAttributes([...sharedAttributes, attr])
        setIsAttrModalOpen(false)
        setNewAttr({ name: '', type: 'string', length: '', precision: '', description: '', valueRange: '' })
        showNotification('共享属性创建成功')
      })
      .catch(error => {
        console.error('Failed to create shared attribute:', error)
        showNotification('共享属性创建失败', 'error')
      })
  }
  
  const handleEditAttr = (attr) => {
    setEditingAttr(attr)
    setNewAttr(attr)
    setIsAttrModalOpen(true)
  }
  
  const handleUpdateAttr = () => {
    fetch(`/api/shared-attribute/${editingAttr.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAttr)
    })
      .then(response => response.json())
      .then(updatedAttr => {
        setSharedAttributes(sharedAttributes.map(attr => 
          attr.id === editingAttr.id ? updatedAttr : attr
        ))
        setIsAttrModalOpen(false)
        setEditingAttr(null)
        setNewAttr({ name: '', type: 'string', length: '', precision: '', description: '', valueRange: '' })
        showNotification('共享属性更新成功')
      })
      .catch(error => {
        console.error('Failed to update shared attribute:', error)
        showNotification('共享属性更新失败', 'error')
      })
  }
  
  const handleDeleteAttr = (id) => {
    showConfirmDialog(
      '删除确认',
      '确定要删除该共享属性吗？删除后无法恢复。',
      () => {
        fetch(`/api/shared-attribute/${id}`, { method: 'DELETE' })
          .then(() => {
            setSharedAttributes(sharedAttributes.filter(attr => attr.id !== id))
            showNotification('共享属性删除成功')
            closeConfirmDialog()
          })
          .catch(error => {
            console.error('Failed to delete shared attribute:', error)
            showNotification('共享属性删除失败', 'error')
            closeConfirmDialog()
          })
      }
    )
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
    fetch('/api/relation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRelation)
    })
      .then(response => response.json())
      .then(relation => {
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
        showNotification('关系创建成功')
      })
      .catch(error => {
        console.error('Failed to create relation:', error)
        showNotification('关系创建失败', 'error')
      })
  }
  
  const handleEditRelation = (relation) => {
    setEditingRelation(relation)
    // 将关系对象转换为使用modelId的格式
    setNewRelation({
      id: relation.id,
      name: relation.name,
      sourceModelId: relation.sourceModelId || relation.sourceModel,
      targetModelId: relation.targetModelId || relation.targetModel,
      type: relation.type,
      description: relation.description,
      enabled: relation.enabled
    })
    setIsRelationModalOpen(true)
  }
  
  const handleUpdateRelation = () => {
    fetch(`/api/relation/${editingRelation.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRelation)
    })
      .then(response => response.json())
      .then(updatedRelation => {
        setRelations(relations.map(relation => 
          relation.id === editingRelation.id ? updatedRelation : relation
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
        showNotification('关系更新成功')
      })
      .catch(error => {
        console.error('Failed to update relation:', error)
        showNotification('关系更新失败', 'error')
      })
  }
  
  const handleDeleteRelation = (id) => {
    showConfirmDialog(
      '删除确认',
      '确定要删除该关系吗？删除后无法恢复。',
      () => {
        fetch(`/api/relation/${id}`, { method: 'DELETE' })
          .then(() => {
            setRelations(relations.filter(relation => relation.id !== id))
            showNotification('关系删除成功')
            closeConfirmDialog()
          })
          .catch(error => {
            console.error('Failed to delete relation:', error)
            showNotification('关系删除失败', 'error')
            closeConfirmDialog()
          })
      }
    )
  }
  
  const handleToggleRelation = (id) => {
    fetch(`/api/relation/${id}/toggle`, { method: 'PUT' })
      .then(response => response.json())
      .then(updatedRelation => {
        setRelations(relations.map(relation => 
          relation.id === id ? updatedRelation : relation
        ))
        showNotification(updatedRelation.enabled ? '关系已启用' : '关系已禁用')
      })
      .catch(error => {
        console.error('Failed to toggle relation:', error)
        showNotification('操作失败', 'error')
      })
  }
  
  const handleSaveRelation = () => {
    if (editingRelation) {
      handleUpdateRelation()
    } else {
      handleCreateRelation()
    }
  }
  
  // 通用导出函数
  const handleExport = (data, filename) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    showNotification('导出成功')
  }
  
  // 通用导入函数
  const handleImport = (callback) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target.result)
            callback(data)
            showNotification('导入成功')
          } catch (error) {
            console.error('Failed to parse import data:', error)
            showNotification('导入失败，文件格式错误', 'error')
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }
  
  // 模型导出函数
  const handleModelExport = () => {
    handleExport(allData.models, `models_${domainId}.json`)
  }
  
  // 模型导入函数
  const handleModelImport = () => {
    handleImport((data) => {
      // 实际项目中应该调用API导入数据
      console.log('Imported models:', data)
      // 这里只是模拟，实际应该调用API后刷新数据
    })
  }
  
  // 共享属性导出函数
  const handleAttrExport = () => {
    handleExport(sharedAttributes, `shared_attributes_${domainId}.json`)
  }
  
  // 共享属性导入函数
  const handleAttrImport = () => {
    handleImport((data) => {
      // 实际项目中应该调用API导入数据
      console.log('Imported attributes:', data)
      // 这里只是模拟，实际应该调用API后刷新数据
    })
  }
  
  // 关系导出函数
  const handleRelationExport = () => {
    handleExport(relations, `relations_${domainId}.json`)
  }
  
  // 关系导入函数
  const handleRelationImport = () => {
    handleImport((data) => {
      // 实际项目中应该调用API导入数据
      console.log('Imported relations:', data)
      // 这里只是模拟，实际应该调用API后刷新数据
    })
  }
  
  // 语义/指标导出函数
  const handleIndicatorExport = () => {
    handleExport(semanticIndicators, `indicators_${domainId}.json`)
  }
  
  // 语义/指标导入函数
  const handleIndicatorImport = () => {
    handleImport((data) => {
      // 实际项目中应该调用API导入数据
      console.log('Imported indicators:', data)
      // 这里只是模拟，实际应该调用API后刷新数据
    })
  }
  
  // 语义/指标处理函数
  const handleCreateIndicator = () => {
    fetch('/api/indicator', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newIndicator, domainId: parseInt(domainId) })
    })
      .then(response => response.json())
      .then(indicator => {
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
        showNotification('指标创建成功')
      })
      .catch(error => {
        console.error('Failed to create indicator:', error)
        showNotification('指标创建失败', 'error')
      })
  }
  
  const handleEditIndicator = (indicator) => {
    setEditingIndicator(indicator)
    setNewIndicator(indicator)
    setIsIndicatorModalOpen(true)
  }
  
  const handleUpdateIndicator = () => {
    fetch(`/api/indicator/${editingIndicator.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newIndicator)
    })
      .then(response => response.json())
      .then(updatedIndicator => {
        setSemanticIndicators(semanticIndicators.map(indicator => 
          indicator.id === editingIndicator.id ? updatedIndicator : indicator
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
        showNotification('指标更新成功')
      })
      .catch(error => {
        console.error('Failed to update indicator:', error)
        showNotification('指标更新失败', 'error')
      })
  }
  
  const handleDeleteIndicator = (id) => {
    showConfirmDialog(
      '删除确认',
      '确定要删除该指标吗？删除后无法恢复。',
      () => {
        fetch(`/api/indicator/${id}`, { method: 'DELETE' })
          .then(() => {
            setSemanticIndicators(semanticIndicators.filter(indicator => indicator.id !== id))
            showNotification('指标删除成功')
            closeConfirmDialog()
          })
          .catch(error => {
            console.error('Failed to delete indicator:', error)
            showNotification('指标删除失败', 'error')
            closeConfirmDialog()
          })
      }
    )
  }
  
  const handlePublishIndicator = (id) => {
    fetch(`/api/indicator/${id}/publish`, { method: 'PUT' })
      .then(response => response.json())
      .then(updatedIndicator => {
        setSemanticIndicators(semanticIndicators.map(indicator => 
          indicator.id === id ? updatedIndicator : indicator
        ))
        showNotification('指标发布成功')
      })
      .catch(error => {
        console.error('Failed to publish indicator:', error)
        showNotification('指标发布失败', 'error')
      })
  }
  
  const handleOfflineIndicator = (id) => {
    fetch(`/api/indicator/${id}/offline`, { method: 'PUT' })
      .then(response => response.json())
      .then(updatedIndicator => {
        setSemanticIndicators(semanticIndicators.map(indicator => 
          indicator.id === id ? updatedIndicator : indicator
        ))
        showNotification('指标已下线')
      })
      .catch(error => {
        console.error('Failed to offline indicator:', error)
        showNotification('指标下线失败', 'error')
      })
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
    const copyData = {
      ...indicator,
      name: `${indicator.name} - 副本`,
      status: 'draft',
      domainId: parseInt(domainId)
    }
    delete copyData.id
    
    fetch('/api/indicator', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(copyData)
    })
      .then(response => response.json())
      .then(newIndicatorCopy => {
        setSemanticIndicators([...semanticIndicators, newIndicatorCopy])
        showNotification('指标复制成功')
      })
      .catch(error => {
        console.error('Failed to copy indicator:', error)
        showNotification('指标复制失败', 'error')
      })
  }

  // 过滤模型
  const filteredModels = models.filter(model =>
    model.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="domain-workbench">
      {/* 通知提示 */}
      {notification.show && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '12px 24px',
          borderRadius: '8px',
          backgroundColor: notification.type === 'success' ? '#10b981' : '#ef4444',
          color: 'white',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          animation: 'slideIn 0.3s ease'
        }}>
          {notification.message}
        </div>
      )}
      
      {/* 确认对话框 */}
      {confirmDialog.show && (
        <div className="modal">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <h2>{confirmDialog.title}</h2>
            <p style={{ margin: '20px 0', color: '#666' }}>{confirmDialog.message}</p>
            <div className="form-actions">
              <button className="cancel" onClick={closeConfirmDialog}>取消</button>
              <button className="delete" onClick={confirmDialog.onConfirm}>确认删除</button>
            </div>
          </div>
        </div>
      )}
      
      {/* 面包屑 */}
      <div style={{ padding: '12px 16px', backgroundColor: '#f0f2f5', borderBottom: '1px solid #e0e0e0' }}>
        <span style={{ cursor: 'pointer', color: '#1890ff', marginRight: '8px' }} onClick={() => navigate('/')}>业务域地图</span>
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
              <button onClick={() => setShowRelations(!showRelations)}>
                {showRelations ? '隐藏关系' : '展示关系'}
              </button>
              <button onClick={() => navigate('/')}>返回域地图</button>
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
              <button onClick={handleModelImport}>导入</button>
              <button onClick={handleModelExport}>导出</button>
            </div>
            <div className="card-list">
              {filteredModels.map(model => (
                <div 
                  key={model.id} 
                  className="card"
                  onDoubleClick={() => navigate(`/model/${model.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <h3>{model.name}</h3>
                  <p>描述: {model.description}</p>
                  <p>创建人: {model.creator}</p>
                  <p>更新时间: {model.updatedAt}</p>
                  <div className="card-actions">
                    <button className="edit" onClick={(e) => {
                      e.stopPropagation();
                      handleEditModel(model);
                    }}>编辑</button>
                    <button className="delete" onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteModel(model.id);
                    }}>删除</button>
                    <button onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/model/${model.id}`);
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
              <button onClick={handleAttrImport}>导入</button>
              <button onClick={handleAttrExport}>导出</button>
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
                  sourceModelId: '',
                  targetModelId: '',
                  type: 'one-to-many',
                  description: '',
                  enabled: true
                })
                setIsRelationModalOpen(true)
              }}>新建关系</button>
              <button onClick={handleRelationImport}>导入</button>
              <button onClick={handleRelationExport}>导出</button>
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
              <button onClick={handleIndicatorImport}>导入</button>
              <button onClick={handleIndicatorExport}>导出</button>
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
            {/* 模型节点详情 */}
            {hoveredModel.type === 'model' && (
              <>
                <h3>{hoveredModel.name}</h3>
                <p>描述: {hoveredModel.description}</p>
                <p>创建人: {hoveredModel.creator}</p>
                <p>更新时间: {hoveredModel.updatedAt}</p>
                
                {/* 模型属性列表 */}
                <div style={{ marginTop: '16px' }}>
                  <h4 style={{ marginBottom: '8px', color: '#3b82f6' }}>模型属性</h4>
                  {allData.properties.filter(prop => prop.modelId === hoveredModel.originalId).length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #3b82f6', color: '#3b82f6' }}>
                          <th style={{ textAlign: 'left', padding: '4px 8px' }}>名称</th>
                          <th style={{ textAlign: 'left', padding: '4px 8px' }}>类型</th>
                          <th style={{ textAlign: 'left', padding: '4px 8px' }}>必填</th>
                          <th style={{ textAlign: 'left', padding: '4px 8px' }}>主键</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allData.properties
                          .filter(prop => prop.modelId === hoveredModel.originalId)
                          .map(prop => (
                            <tr key={prop.id} style={{ borderBottom: '1px solid rgba(59, 130, 246, 0.2)' }}>
                              <td style={{ padding: '4px 8px', color: '#cbd5e1' }}>{prop.name}</td>
                              <td style={{ padding: '4px 8px', color: '#cbd5e1' }}>{prop.type}</td>
                              <td style={{ padding: '4px 8px', color: '#cbd5e1' }}>{prop.required ? '是' : '否'}</td>
                              <td style={{ padding: '4px 8px', color: '#cbd5e1' }}>{prop.isPrimaryKey ? '是' : '否'}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  ) : (
                    <p style={{ fontSize: '13px', color: '#94a3b8', margin: '8px 0' }}>暂无属性</p>
                  )}
                </div>
                
                {/* 模型关系列表 */}
                <div style={{ marginTop: '16px' }}>
                  <h4 style={{ marginBottom: '8px', color: '#3b82f6' }}>模型关系</h4>
                  {relations.filter(rel => rel.sourceModel === hoveredModel.name || rel.targetModel === hoveredModel.name).length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #3b82f6', color: '#3b82f6' }}>
                          <th style={{ textAlign: 'left', padding: '4px 8px' }}>关系名称</th>
                          <th style={{ textAlign: 'left', padding: '4px 8px' }}>相关模型</th>
                          <th style={{ textAlign: 'left', padding: '4px 8px' }}>关系类型</th>
                          <th style={{ textAlign: 'left', padding: '4px 8px' }}>状态</th>
                        </tr>
                      </thead>
                      <tbody>
                        {relations
                          .filter(rel => rel.sourceModel === hoveredModel.name || rel.targetModel === hoveredModel.name)
                          .map(rel => {
                            const relatedModel = rel.sourceModel === hoveredModel.name ? rel.targetModel : rel.sourceModel;
                            const relationDirection = rel.sourceModel === hoveredModel.name ? '→' : '←';
                            return (
                              <tr key={rel.id} style={{ borderBottom: '1px solid rgba(59, 130, 246, 0.2)' }}>
                                <td style={{ padding: '4px 8px', color: '#cbd5e1' }}>{rel.name}</td>
                                <td style={{ padding: '4px 8px', color: '#cbd5e1' }}>
                                  {rel.sourceModel} {relationDirection} {rel.targetModel}
                                </td>
                                <td style={{ padding: '4px 8px', color: '#cbd5e1' }}>{rel.type}</td>
                                <td style={{ padding: '4px 8px', color: rel.enabled ? '#10b981' : '#ef4444' }}>
                                  {rel.enabled ? '启用' : '禁用'}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  ) : (
                    <p style={{ fontSize: '13px', color: '#94a3b8', margin: '8px 0' }}>暂无关系</p>
                  )}
                </div>
              </>
            )}
            
            {/* 属性节点详情 */}
            {hoveredModel.type === 'property' && (
              <>
                <h3>{hoveredModel.name}</h3>
                <div style={{ fontSize: '13px', color: '#cbd5e1', marginTop: '8px' }}>
                  <p>描述: {hoveredModel.description}</p>
                  <p>类型: {hoveredModel.type}</p>
                  <p>必填: {hoveredModel.required ? '是' : '否'}</p>
                  <p>主键: {hoveredModel.isPrimaryKey ? '是' : '否'}</p>
                  <p>外键: {hoveredModel.isForeignKey ? '是' : '否'}</p>
                  <p>物理字段: {hoveredModel.physicalColumn || '未设置'}</p>
                  <p>敏感级别: {hoveredModel.sensitivityLevel || '公开'}</p>
                  <p>默认值: {hoveredModel.defaultValue !== null ? hoveredModel.defaultValue : '未设置'}</p>
                  <p>脱敏规则: {hoveredModel.maskRule || '无'}</p>
                  {hoveredModel.constraints && hoveredModel.constraints.length > 0 && (
                    <p>约束规则: {hoveredModel.constraints.join(', ')}</p>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* 新建/编辑模型模态框 */}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>{editingModel ? '编辑模型' : '新建模型'}</h2>
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
              <button className="cancel" onClick={() => {
                setIsModalOpen(false)
                setEditingModel(null)
                setNewModel({ name: '', description: '', parentId: '', tags: '' })
              }}>取消</button>
              <button className="submit" onClick={handleSaveModel}>{editingModel ? '更新' : '确定'}</button>
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
                value={newRelation.sourceModelId}
                onChange={(e) => setNewRelation({ ...newRelation, sourceModelId: e.target.value })}
              >
                <option value="">选择源模型</option>
                {models.map(model => (
                  <option key={model.id} value={model.id}>{model.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>目标模型</label>
              <select
                value={newRelation.targetModelId}
                onChange={(e) => setNewRelation({ ...newRelation, targetModelId: e.target.value })}
              >
                <option value="">选择目标模型</option>
                {models.map(model => (
                  <option key={model.id} value={model.id}>{model.name}</option>
                ))}
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