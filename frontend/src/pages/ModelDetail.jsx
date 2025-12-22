import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

const ModelDetail = () => {
  const { modelId } = useParams()
  const [activeTab, setActiveTab] = useState('properties')
  const [model, setModel] = useState(null)
  const [properties, setProperties] = useState([])
  const [relations, setRelations] = useState([])
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false)
  const [newProperty, setNewProperty] = useState({ name: '', type: 'string', required: false, description: '' })
  
  // 关系相关状态
  const [isRelationModalOpen, setIsRelationModalOpen] = useState(false)
  const [editingRelation, setEditingRelation] = useState(null)
  const [newRelation, setNewRelation] = useState({
    name: '',
    sourceModel: '',
    targetModel: '',
    type: 'one-to-many',
    description: ''
  })
  
  // 模型列表状态，用于模糊匹配
  const [allModels, setAllModels] = useState([])
  const [targetModelSearchTerm, setTargetModelSearchTerm] = useState('')
  const [targetModelSuggestions, setTargetModelSuggestions] = useState([])
  const [showTargetSuggestions, setShowTargetSuggestions] = useState(false)
  
  // 关系类型列表状态，用于模糊匹配关系名称
  const [relationTypes, setRelationTypes] = useState([])
  const [relationNameSearchTerm, setRelationNameSearchTerm] = useState('')
  const [relationNameSuggestions, setRelationNameSuggestions] = useState([])
  const [showRelationNameSuggestions, setShowRelationNameSuggestions] = useState(false)
  const [currentDomain, setCurrentDomain] = useState(null)
  const [modelName, setModelName] = useState('')
  
  // 数据源相关状态
  const [datasources, setDatasources] = useState([])
  const [isDatasourceModalOpen, setIsDatasourceModalOpen] = useState(false)
  const [editingDatasource, setEditingDatasource] = useState(null)
  const [newDatasource, setNewDatasource] = useState({
    name: '',
    type: 'mysql',
    url: '',
    tableName: '',
    status: 'inactive',
    description: ''
  })
  
  // 数据相关状态
  const [dataRecords, setDataRecords] = useState([])
  const [isDataModalOpen, setIsDataModalOpen] = useState(false)
  const [editingData, setEditingData] = useState(null)
  const [newData, setNewData] = useState({})
  
  // 语义/指标相关状态
  const [semanticIndicators, setSemanticIndicators] = useState([])
  const [boundIndicators, setBoundIndicators] = useState([])
  const [isIndicatorModalOpen, setIsIndicatorModalOpen] = useState(false)
  const [editingIndicator, setEditingIndicator] = useState(null)
  const [newIndicator, setNewIndicator] = useState({
    name: '',
    expression: '',
    returnType: 'number',
    description: ''
  })

  // 从API获取数据
  useEffect(() => {
    // 首先设置默认模型数据，避免面包屑显示异常
    setModel({
      id: parseInt(modelId),
      name: '加载中...',
      description: '',
      domainId: 0,
      domainName: '加载中...'
    })

    // 获取模型数据
    fetch('/api/model')
      .then(response => response.json())
      .then(data => {
        // 处理API返回的数据格式，兼容数组或包含models和edges的对象
        const models = Array.isArray(data) ? data : data.models || []
        // 保存所有模型，用于目标模型的模糊匹配
        setAllModels(models)
        
        const foundModel = models.find(m => m.id === parseInt(modelId))
        if (foundModel) {
          setModelName(foundModel.name)
          // 获取域数据
          fetch('/api/domain/list')
            .then(response => response.json())
            .then(domainData => {
              const domain = domainData.domains.find(d => d.id === foundModel.domainId)
              setCurrentDomain(domain)
              setModel({
                id: parseInt(modelId),
                name: foundModel.name,
                description: foundModel.description,
                domainId: foundModel.domainId,
                domainName: domain?.name || `域ID: ${foundModel.domainId}`
              })
            })
            .catch(error => {
              console.error('Failed to fetch domains:', error)
              // 即使域数据获取失败，也要设置模型基本信息
              setModel({
                id: parseInt(modelId),
                name: foundModel.name,
                description: foundModel.description,
                domainId: foundModel.domainId,
                domainName: `域ID: ${foundModel.domainId}`
              })
            })
        } else {
          // 模型不存在时的处理
          setModel({
            id: parseInt(modelId),
            name: `模型ID: ${modelId}`,
            description: '模型不存在',
            domainId: 0,
            domainName: '未知域'
          })
        }
      })
      .catch(error => {
        console.error('Failed to fetch models:', error)
        // API调用失败时的处理
        setModel({
          id: parseInt(modelId),
          name: `模型ID: ${modelId}`,
          description: '获取模型失败',
          domainId: 0,
          domainName: '未知域'
        })
      })

    // 获取属性列表
    fetch(`/api/property?modelId=${modelId}`)
      .then(response => response.json())
      .then(propertyData => {
        setProperties(propertyData)
      })
      .catch(error => console.error('Failed to fetch properties:', error))

    // 获取关系列表
    fetch(`/api/relation?modelId=${modelId}`)
      .then(response => response.json())
      .then(relationData => {
        setRelations(relationData)
      })
      .catch(error => console.error('Failed to fetch relations:', error))
    
    // 获取所有关系类型，用于关系名称的模糊匹配
    fetch('/api/relation')
      .then(response => response.json())
      .then(allRelationData => {
        // 提取所有关系名称，去重
        const relationNames = [...new Set(allRelationData.map(r => r.name))]
        setRelationTypes(relationNames)
      })
      .catch(error => console.error('Failed to fetch relation types:', error))
    
    // 模拟获取数据源数据
    const mockDatasources = [
      { id: 1, name: 'MySQL数据库', type: 'mysql', url: 'jdbc:mysql://localhost:3306/expressway', tableName: 't_vehicle', status: 'active', description: '车辆信息表' },
      { id: 2, name: 'Oracle数据库', type: 'oracle', url: 'jdbc:oracle:thin:@localhost:1521:ORCL', tableName: 't_pass_record', status: 'active', description: '通行记录表' },
      { id: 3, name: 'Kafka消息队列', type: 'kafka', url: 'localhost:9092', tableName: 'pass_events', status: 'inactive', description: '通行事件流' }
    ]
    setDatasources(mockDatasources)
    
    // 模拟获取数据记录
    const mockDataRecords = [
      { id: 1, licensePlate: '京A12345', vehicleType: '小型客车', entryTime: '2025-12-19 08:00:00', exitTime: '2025-12-19 08:30:00', tollFee: 50.0 },
      { id: 2, licensePlate: '沪B67890', vehicleType: '大型货车', entryTime: '2025-12-19 08:15:00', exitTime: '2025-12-19 09:00:00', tollFee: 120.0 },
      { id: 3, licensePlate: '粤C54321', vehicleType: '小型客车', entryTime: '2025-12-19 08:30:00', exitTime: '2025-12-19 09:15:00', tollFee: 80.0 }
    ]
    setDataRecords(mockDataRecords)
    
    // 模拟获取语义/指标数据
    const mockSemanticIndicators = [
      { id: 1, name: '平均通行费用', expression: 'SUM(账单金额)/COUNT(通行记录)', returnType: 'number', description: '计算平均通行费用', status: 'published' },
      { id: 2, name: '路段车流量', expression: 'COUNT(通行记录 WHERE 路段ID=?)', returnType: 'number', description: '计算路段车流量', status: 'draft' },
      { id: 3, name: '车型占比', expression: 'COUNT(车辆信息 WHERE 车型=?)/COUNT(车辆信息)', returnType: 'number', description: '计算车型占比', status: 'published' }
    ]
    setSemanticIndicators(mockSemanticIndicators)
    
    // 模拟获取已绑定的指标
    const mockBoundIndicators = [
      { id: 1, name: '平均通行费用', expression: 'SUM(账单金额)/COUNT(通行记录)', returnType: 'number', description: '计算平均通行费用', status: 'published' }
    ]
    setBoundIndicators(mockBoundIndicators)
  }, [modelId])

  // 处理新建属性
  const handleCreateProperty = () => {
    fetch('/api/property', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...newProperty,
        modelId: parseInt(modelId)
      })
    })
      .then(response => response.json())
      .then(property => {
        setProperties([...properties, property])
        setIsPropertyModalOpen(false)
        setNewProperty({ name: '', type: 'string', required: false, description: '' })
      })
      .catch(error => console.error('Failed to create property:', error))
  }

  // 处理删除属性
  const handleDeleteProperty = (id) => {
    fetch(`/api/property/${id}`, { method: 'DELETE' })
      .then(() => {
        setProperties(properties.filter(property => property.id !== id))
      })
      .catch(error => console.error('Failed to delete property:', error))
  }
  
  // 关系处理函数
  const handleCreateRelation = () => {
    fetch('/api/relation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...newRelation,
        sourceModelId: parseInt(modelId)
      })
    })
      .then(response => response.json())
      .then(relation => {
        setRelations([...relations, relation])
        setIsRelationModalOpen(false)
        setNewRelation({ name: '', sourceModel: '', targetModel: '', type: 'one-to-many', description: '' })
      })
      .catch(error => console.error('Failed to create relation:', error))
  }
  
  const handleEditRelation = (relation) => {
    setEditingRelation(relation)
    setNewRelation(relation)
    setIsRelationModalOpen(true)
  }
  
  const handleUpdateRelation = () => {
    fetch(`/api/relation/${editingRelation.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newRelation)
    })
      .then(response => response.json())
      .then(updatedRelation => {
        setRelations(relations.map(relation => 
          relation.id === updatedRelation.id ? updatedRelation : relation
        ))
        setIsRelationModalOpen(false)
        setEditingRelation(null)
        setNewRelation({ name: '', sourceModel: '', targetModel: '', type: 'one-to-many', description: '' })
      })
      .catch(error => console.error('Failed to update relation:', error))
  }
  
  const handleDeleteRelation = (id) => {
    fetch(`/api/relation/${id}`, { method: 'DELETE' })
      .then(() => {
        setRelations(relations.filter(relation => relation.id !== id))
      })
      .catch(error => console.error('Failed to delete relation:', error))
  }
  
  const handleSaveRelation = () => {
    if (editingRelation) {
      handleUpdateRelation()
    } else {
      handleCreateRelation()
    }
  }
  
  // 目标模型搜索处理函数
  const handleTargetModelChange = (e) => {
    const term = e.target.value
    setTargetModelSearchTerm(term)
    setNewRelation({ ...newRelation, targetModel: term })
    
    if (term.trim()) {
      // 根据输入的关键词模糊匹配模型名称
      const filteredModels = allModels.filter(model => 
        model.name.toLowerCase().includes(term.toLowerCase())
      )
      setTargetModelSuggestions(filteredModels)
      setShowTargetSuggestions(true)
    } else {
      setTargetModelSuggestions([])
      setShowTargetSuggestions(false)
    }
  }
  
  // 选择目标模型
  const handleSelectTargetModel = (model) => {
    setNewRelation({ ...newRelation, targetModel: model.name })
    setTargetModelSearchTerm(model.name)
    setShowTargetSuggestions(false)
  }
  
  // 关系名称搜索处理函数
  const handleRelationNameChange = (e) => {
    const term = e.target.value
    setRelationNameSearchTerm(term)
    setNewRelation({ ...newRelation, name: term })
    
    if (term.trim()) {
      // 根据输入的关键词模糊匹配关系名称
      const filteredRelations = relationTypes.filter(relationName => 
        relationName.toLowerCase().includes(term.toLowerCase())
      )
      setRelationNameSuggestions(filteredRelations)
      setShowRelationNameSuggestions(true)
    } else {
      setRelationNameSuggestions([])
      setShowRelationNameSuggestions(false)
    }
  }
  
  // 选择关系名称
  const handleSelectRelationName = (relationName) => {
    setNewRelation({ ...newRelation, name: relationName })
    setRelationNameSearchTerm(relationName)
    setShowRelationNameSuggestions(false)
  }
  
  // 关闭关系模态框时重置状态
  const handleCloseRelationModal = () => {
    setIsRelationModalOpen(false)
    setEditingRelation(null)
    setNewRelation({ name: '', sourceModel: '', targetModel: '', type: 'one-to-many', description: '' })
    setTargetModelSearchTerm('')
    setTargetModelSuggestions([])
    setShowTargetSuggestions(false)
    setRelationNameSearchTerm('')
    setRelationNameSuggestions([])
    setShowRelationNameSuggestions(false)
  }
  
  // 数据源处理函数
  const handleCreateDatasource = () => {
    // 实际项目中应该调用API
    const datasource = {
      id: datasources.length + 1,
      ...newDatasource
    }
    setDatasources([...datasources, datasource])
    setIsDatasourceModalOpen(false)
    setNewDatasource({
      name: '',
      type: 'mysql',
      url: '',
      tableName: '',
      status: 'inactive',
      description: ''
    })
  }
  
  const handleEditDatasource = (datasource) => {
    setEditingDatasource(datasource)
    setNewDatasource(datasource)
    setIsDatasourceModalOpen(true)
  }
  
  const handleUpdateDatasource = () => {
    // 实际项目中应该调用API
    setDatasources(datasources.map(datasource => 
      datasource.id === editingDatasource.id ? newDatasource : datasource
    ))
    setIsDatasourceModalOpen(false)
    setEditingDatasource(null)
    setNewDatasource({
      name: '',
      type: 'mysql',
      url: '',
      tableName: '',
      status: 'inactive',
      description: ''
    })
  }
  
  const handleDeleteDatasource = (id) => {
    // 实际项目中应该调用API
    setDatasources(datasources.filter(datasource => datasource.id !== id))
  }
  
  const handleToggleDatasource = (id) => {
    // 实际项目中应该调用API
    setDatasources(datasources.map(datasource => 
      datasource.id === id ? { ...datasource, status: datasource.status === 'active' ? 'inactive' : 'active' } : datasource
    ))
  }
  
  const handleSaveDatasource = () => {
    if (editingDatasource) {
      handleUpdateDatasource()
    } else {
      handleCreateDatasource()
    }
  }
  
  // 数据处理函数
  const handleCreateData = () => {
    // 实际项目中应该调用API
    const data = {
      id: dataRecords.length + 1,
      ...newData,
      createdAt: new Date().toISOString()
    }
    setDataRecords([...dataRecords, data])
    setIsDataModalOpen(false)
    setNewData({})
  }
  
  const handleEditData = (record) => {
    setEditingData(record)
    setNewData(record)
    setIsDataModalOpen(true)
  }
  
  const handleUpdateData = () => {
    // 实际项目中应该调用API
    setDataRecords(dataRecords.map(record => 
      record.id === editingData.id ? newData : record
    ))
    setIsDataModalOpen(false)
    setEditingData(null)
    setNewData({})
  }
  
  const handleDeleteData = (id) => {
    // 实际项目中应该调用API
    setDataRecords(dataRecords.filter(record => record.id !== id))
  }
  
  const handleSaveData = () => {
    if (editingData) {
      handleUpdateData()
    } else {
      handleCreateData()
    }
  }
  
  // 语义/指标处理函数
  const handleBindIndicator = (indicator) => {
    // 实际项目中应该调用API
    if (!boundIndicators.find(b => b.id === indicator.id)) {
      setBoundIndicators([...boundIndicators, indicator])
    }
  }
  
  const handleUnbindIndicator = (id) => {
    // 实际项目中应该调用API
    setBoundIndicators(boundIndicators.filter(indicator => indicator.id !== id))
  }
  
  const handleCreateIndicator = () => {
    // 实际项目中应该调用API
    const indicator = {
      id: semanticIndicators.length + 1,
      ...newIndicator,
      status: 'draft'
    }
    setSemanticIndicators([...semanticIndicators, indicator])
    setIsIndicatorModalOpen(false)
    setNewIndicator({
      name: '',
      expression: '',
      returnType: 'number',
      description: ''
    })
  }
  
  const handleSaveIndicator = () => {
    handleCreateIndicator()
  }

  return (
    <div className="model-detail">
      {/* 面包屑 */}
      <div style={{ padding: '12px 16px', backgroundColor: '#f0f2f5', borderBottom: '1px solid #e0e0e0' }}>
        <span style={{ cursor: 'pointer', color: '#1890ff', marginRight: '8px' }} onClick={() => window.location.href = '/'}>业务域地图</span>
        <span style={{ marginRight: '8px' }}>&gt;</span>
        <span style={{ cursor: 'pointer', color: '#1890ff', marginRight: '8px' }} onClick={() => window.location.href = `/domain/${model?.domainId}`}>{model?.domainName}</span>
        <span style={{ marginRight: '8px' }}>&gt;</span>
        <span>{model?.name}</span>
      </div>
      
      {/* 顶部标题 */}
      <div style={{ padding: '16px', backgroundColor: 'white', borderBottom: '1px solid #e0e0e0' }}>
        <h2>{model?.name} - 模型详情</h2>
      </div>

      {/* Tab切换 */}
      <div className="tab-nav">
        <button
          className={activeTab === 'properties' ? 'active' : ''}
          onClick={() => setActiveTab('properties')}
        >
          属性
        </button>
        <button
          className={activeTab === 'relations' ? 'active' : ''}
          onClick={() => setActiveTab('relations')}
        >
          关系
        </button>
        <button
          className={activeTab === 'datasource' ? 'active' : ''}
          onClick={() => setActiveTab('datasource')}
        >
          数据源
        </button>
        <button
          className={activeTab === 'data' ? 'active' : ''}
          onClick={() => setActiveTab('data')}
        >
          数据
        </button>
        <button
          className={activeTab === 'semantic' ? 'active' : ''}
          onClick={() => setActiveTab('semantic')}
        >
          语义/指标
        </button>
      </div>

      {/* 内容区域 */}
      <div className="content">
        {/* 属性Tab */}
        {activeTab === 'properties' && (
          <>
            <div className="header-toolbar">
              <input type="text" placeholder="搜索属性名称..." />
              <button onClick={() => setIsPropertyModalOpen(true)}>新建属性</button>
              <button onClick={() => console.log('从共享属性引用')}>从共享属性引用</button>
              <button>导入</button>
              <button>导出</button>
            </div>
            <div className="card-list">
              {properties.map(property => (
                <div key={property.id} className="card">
                  <h3>{property.name}</h3>
                  <p>类型: {property.type}</p>
                  <p>必填: {property.required ? '是' : '否'}</p>
                  <p>描述: {property.description}</p>
                  <div className="card-actions">
                    <button className="edit" onClick={() => console.log('编辑属性', property.id)}>编辑</button>
                    <button className="delete" onClick={() => handleDeleteProperty(property.id)}>删除</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* 关系Tab */}
        {activeTab === 'relations' && (
          <>
            <div className="header-toolbar">
              <input type="text" placeholder="搜索关系名称..." />
              <button onClick={() => setIsRelationModalOpen(true)}>新建关系</button>
              <button>导入</button>
              <button>导出</button>
            </div>
            <div className="card-list">
              {relations.map(relation => (
                <div key={relation.id} className="card">
                  <h3>{relation.name}</h3>
                  <p>目标模型: {relation.targetModel}</p>
                  <p>关系类型: {relation.type}</p>
                  <p>描述: {relation.description}</p>
                  <div className="card-actions">
                    <button className="edit" onClick={() => handleEditRelation(relation)}>编辑</button>
                    <button className="delete" onClick={() => handleDeleteRelation(relation.id)}>删除</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* 数据源Tab */}
        {activeTab === 'datasource' && (
          <>
            <div className="header-toolbar">
              <input type="text" placeholder="搜索数据源名称..." />
              <button onClick={() => setIsDatasourceModalOpen(true)}>新建数据源</button>
              <button>导入</button>
              <button>导出</button>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>名称</th>
                    <th>类型</th>
                    <th>URL</th>
                    <th>表名</th>
                    <th>状态</th>
                    <th>描述</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {datasources.map(datasource => (
                    <tr key={datasource.id}>
                      <td>{datasource.name}</td>
                      <td>{datasource.type}</td>
                      <td>{datasource.url}</td>
                      <td>{datasource.tableName}</td>
                      <td>
                        <span className={`status-badge ${datasource.status}`}>
                          {datasource.status === 'active' ? '已启用' : '已停用'}
                        </span>
                      </td>
                      <td>{datasource.description}</td>
                      <td>
                        <button className="edit" onClick={() => handleEditDatasource(datasource)}>编辑</button>
                        <button className="delete" onClick={() => handleDeleteDatasource(datasource.id)}>删除</button>
                        <button 
                          className={`toggle ${datasource.status}`}
                          onClick={() => handleToggleDatasource(datasource.id)}
                        >
                          {datasource.status === 'active' ? '停用' : '启用'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* 数据Tab */}
        {activeTab === 'data' && (
          <>
            <div className="header-toolbar">
              <input type="text" placeholder="搜索数据..." />
              <button onClick={() => setIsDataModalOpen(true)}>新增数据</button>
              <button>刷新</button>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    {dataRecords.length > 0 && Object.keys(dataRecords[0]).map(key => (
                      <th key={key}>{key}</th>
                    ))}
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {dataRecords.map(record => (
                    <tr key={record.id}>
                      {Object.values(record).map((value, index) => (
                        <td key={index}>{value}</td>
                      ))}
                      <td>
                        <button className="edit" onClick={() => handleEditData(record)}>编辑</button>
                        <button className="delete" onClick={() => handleDeleteData(record.id)}>删除</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* 语义/指标Tab */}
        {activeTab === 'semantic' && (
          <>
            <div className="header-toolbar">
              <input type="text" placeholder="搜索指标名称..." />
              <button onClick={() => setIsIndicatorModalOpen(true)}>新建指标</button>
              <button>导入</button>
              <button>导出</button>
            </div>
            <div style={{ display: 'flex', gap: '24px', padding: '20px' }}>
              {/* 左侧可选指标 */}
              <div style={{ flex: 1, backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', backgroundColor: 'var(--primary-light)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ color: 'var(--primary-color)', margin: 0, fontSize: '18px' }}>可用指标</h3>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{semanticIndicators.length} 个指标</span>
                </div>
                <div style={{ padding: '20px', maxHeight: 'calc(100vh - 260px)', overflowY: 'auto' }}>
                  {semanticIndicators.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '40px 0' }}>
                      <p>暂无可用指标</p>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                      {semanticIndicators.map(indicator => (
                        <div key={indicator.id} className="card" style={{ padding: '16px', margin: 0, border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                            <h4 style={{ margin: 0, fontSize: '16px', color: 'var(--text-primary)' }}>{indicator.name}</h4>
                            <span className={`status-badge ${indicator.status}`}>
                              {indicator.status === 'published' ? '已发布' : '草稿'}
                            </span>
                          </div>
                          <div style={{ marginBottom: '8px', fontSize: '14px' }}>
                            <strong>表达式:</strong> <code>{indicator.expression}</code>
                          </div>
                          <div style={{ marginBottom: '8px', fontSize: '14px' }}>
                            <strong>返回类型:</strong> {indicator.returnType}
                          </div>
                          <div style={{ marginBottom: '12px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                            {indicator.description}
                          </div>
                          <button 
                            onClick={() => handleBindIndicator(indicator)}
                            disabled={boundIndicators.find(b => b.id === indicator.id)}
                            className={boundIndicators.find(b => b.id === indicator.id) ? 'disabled' : 'edit'}
                            style={{ 
                              padding: '6px 14px', 
                              fontSize: '13px',
                              fontWeight: '500',
                              borderRadius: 'var(--radius-sm)',
                              transition: 'all var(--transition-fast)',
                              border: 'none',
                              cursor: 'pointer',
                              background: boundIndicators.find(b => b.id === indicator.id) ? 'var(--bg-tertiary)' : 'var(--success-color)',
                              color: boundIndicators.find(b => b.id === indicator.id) ? 'var(--text-secondary)' : 'white',
                              boxShadow: boundIndicators.find(b => b.id === indicator.id) ? 'none' : '0 2px 4px rgba(16, 185, 129, 0.2)',
                              width: 'auto',
                              alignSelf: 'flex-start'
                            }}
                          >
                            {boundIndicators.find(b => b.id === indicator.id) ? '已绑定' : '绑定'}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 右侧已绑定指标 */}
              <div style={{ flex: 1, backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', backgroundColor: 'var(--success-light)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ color: 'var(--success-color)', margin: 0, fontSize: '18px' }}>已绑定指标</h3>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{boundIndicators.length} 个指标</span>
                </div>
                <div style={{ padding: '20px', maxHeight: 'calc(100vh - 260px)', overflowY: 'auto' }}>
                  {boundIndicators.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '40px 0' }}>
                      <p>暂无绑定的指标</p>
                      <p style={{ fontSize: '14px', marginTop: '8px' }}>从左侧选择指标进行绑定</p>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                      {boundIndicators.map(indicator => (
                        <div key={indicator.id} className="card" style={{ padding: '16px', margin: 0, borderLeft: '4px solid var(--success-color)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                            <h4 style={{ margin: 0, fontSize: '16px', color: 'var(--text-primary)' }}>{indicator.name}</h4>
                            <span className={`status-badge ${indicator.status}`}>
                              {indicator.status === 'published' ? '已发布' : '草稿'}
                            </span>
                          </div>
                          <div style={{ marginBottom: '8px', fontSize: '14px' }}>
                            <strong>表达式:</strong> <code>{indicator.expression}</code>
                          </div>
                          <div style={{ marginBottom: '8px', fontSize: '14px' }}>
                            <strong>返回类型:</strong> {indicator.returnType}
                          </div>
                          <div style={{ marginBottom: '12px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                            {indicator.description}
                          </div>
                          <button 
                            onClick={() => handleUnbindIndicator(indicator.id)}
                            className="delete"
                            style={{ 
                              padding: '6px 14px', 
                              fontSize: '13px',
                              fontWeight: '500',
                              borderRadius: 'var(--radius-sm)',
                              transition: 'all var(--transition-fast)',
                              border: 'none',
                              cursor: 'pointer',
                              background: 'var(--danger-color)',
                              color: 'white',
                              boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)',
                              width: 'auto',
                              alignSelf: 'flex-start'
                            }}
                          >
                            解绑
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 新建属性模态框 */}
      {isPropertyModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>新建属性</h2>
            <div className="form-group">
              <label>名称</label>
              <input
                type="text"
                value={newProperty.name}
                onChange={(e) => setNewProperty({ ...newProperty, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>类型</label>
              <select
                value={newProperty.type}
                onChange={(e) => setNewProperty({ ...newProperty, type: e.target.value })}
              >
                <option value="string">字符串</option>
                <option value="number">数字</option>
                <option value="boolean">布尔值</option>
                <option value="date">日期</option>
                <option value="object">对象</option>
                <option value="array">数组</option>
              </select>
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                id="required"
                checked={newProperty.required}
                onChange={(e) => setNewProperty({ ...newProperty, required: e.target.checked })}
              />
              <label htmlFor="required" style={{ marginBottom: 0 }}>必填</label>
            </div>
            <div className="form-group">
              <label>描述</label>
              <textarea
                value={newProperty.description}
                onChange={(e) => setNewProperty({ ...newProperty, description: e.target.value })}
              ></textarea>
            </div>
            <div className="form-actions">
              <button className="cancel" onClick={() => setIsPropertyModalOpen(false)}>取消</button>
              <button className="submit" onClick={handleCreateProperty}>确定</button>
            </div>
          </div>
        </div>
      )}
      
      {/* 关系模态框 */}
      {isRelationModalOpen && (
        <div className="modal">
          <div className="modal-content" style={{ color: '#000000' }}>
            <h2>{editingRelation ? '编辑关系' : '新建关系'}</h2>
            <div className="form-group">
              <label>名称</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={relationNameSearchTerm}
                  onChange={handleRelationNameChange}
                  onFocus={() => {
                    if (relationNameSearchTerm.trim()) {
                      const filteredRelations = relationTypes.filter(relationName => 
                        relationName.toLowerCase().includes(relationNameSearchTerm.toLowerCase())
                      )
                      setRelationNameSuggestions(filteredRelations)
                      setShowRelationNameSuggestions(true)
                    }
                  }}
                  style={{ color: '#000000' }}
                />
                {showRelationNameSuggestions && relationNameSuggestions.length > 0 && (
                  <div 
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      backgroundColor: '#ffffff',
                      border: '1px solid #e0e0e0',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-md)',
                      zIndex: 10,
                      maxHeight: '200px',
                      overflowY: 'auto'
                    }}
                  >
                    {relationNameSuggestions.map((relationName, index) => (
                      <div
                        key={index}
                        style={{
                          padding: '10px 16px',
                          cursor: 'pointer',
                          borderBottom: '1px solid #f0f0f0',
                          color: '#000000',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#ffffff'}
                        onClick={() => handleSelectRelationName(relationName)}
                      >
                        {relationName}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="form-group">
              <label>源模型</label>
              <input
                type="text"
                value={modelName}
                disabled
                style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed', color: '#000000' }}
              />
            </div>
            <div className="form-group">
              <label>目标模型</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={targetModelSearchTerm}
                  onChange={handleTargetModelChange}
                  onFocus={() => {
                    if (targetModelSearchTerm.trim()) {
                      const filteredModels = allModels.filter(model => 
                        model.name.toLowerCase().includes(targetModelSearchTerm.toLowerCase())
                      )
                      setTargetModelSuggestions(filteredModels)
                      setShowTargetSuggestions(true)
                    }
                  }}
                  style={{ color: '#000000' }}
                />
                {showTargetSuggestions && targetModelSuggestions.length > 0 && (
                  <div 
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      backgroundColor: '#ffffff',
                      border: '1px solid #e0e0e0',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-md)',
                      zIndex: 10,
                      maxHeight: '200px',
                      overflowY: 'auto'
                    }}
                  >
                    {targetModelSuggestions.map(model => (
                      <div
                        key={model.id}
                        style={{
                          padding: '10px 16px',
                          cursor: 'pointer',
                          borderBottom: '1px solid #f0f0f0',
                          color: '#000000',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#ffffff'}
                        onClick={() => handleSelectTargetModel(model)}
                      >
                        {model.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="form-group">
              <label>关系类型</label>
              <select
                value={newRelation.type}
                onChange={(e) => setNewRelation({ ...newRelation, type: e.target.value })}
                style={{ color: '#000000' }}
              >
                <option value="one-to-one" style={{ color: '#000000' }}>一对一</option>
                <option value="one-to-many" style={{ color: '#000000' }}>一对多</option>
                <option value="many-to-one" style={{ color: '#000000' }}>多对一</option>
                <option value="many-to-many" style={{ color: '#000000' }}>多对多</option>
              </select>
            </div>
            <div className="form-group">
              <label>描述</label>
              <textarea
                value={newRelation.description}
                onChange={(e) => setNewRelation({ ...newRelation, description: e.target.value })}
                style={{ color: '#000000' }}
              ></textarea>
            </div>
            <div className="form-actions">
              <button className="cancel" onClick={handleCloseRelationModal}>取消</button>
              <button className="submit" onClick={handleSaveRelation}>{editingRelation ? '更新' : '确定'}</button>
            </div>
          </div>
        </div>
      )}

      {/* 数据源模态框 */}
      {isDatasourceModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>{editingDatasource ? '编辑数据源' : '新建数据源'}</h2>
            <div className="form-group">
              <label>名称</label>
              <input
                type="text"
                value={newDatasource.name}
                onChange={(e) => setNewDatasource({ ...newDatasource, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>类型</label>
              <select
                value={newDatasource.type}
                onChange={(e) => setNewDatasource({ ...newDatasource, type: e.target.value })}
              >
                <option value="mysql">MySQL</option>
                <option value="oracle">Oracle</option>
                <option value="kafka">Kafka</option>
                <option value="api">API</option>
              </select>
            </div>
            <div className="form-group">
              <label>URL</label>
              <input
                type="text"
                value={newDatasource.url}
                onChange={(e) => setNewDatasource({ ...newDatasource, url: e.target.value })}
                placeholder="例如: jdbc:mysql://localhost:3306/expressway"
              />
            </div>
            <div className="form-group">
              <label>表名/主题名</label>
              <input
                type="text"
                value={newDatasource.tableName}
                onChange={(e) => setNewDatasource({ ...newDatasource, tableName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>描述</label>
              <textarea
                value={newDatasource.description}
                onChange={(e) => setNewDatasource({ ...newDatasource, description: e.target.value })}
                placeholder="数据源描述"
              ></textarea>
            </div>
            <div className="form-actions">
              <button className="cancel" onClick={() => {
                setIsDatasourceModalOpen(false);
                setEditingDatasource(null);
                setNewDatasource({ name: '', type: 'mysql', url: '', tableName: '', status: 'inactive', description: '' });
              }}>取消</button>
              <button className="submit" onClick={handleSaveDatasource}>确定</button>
            </div>
          </div>
        </div>
      )}

      {/* 数据模态框 */}
      {isDataModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>{editingData ? '编辑数据' : '新增数据'}</h2>
            {dataRecords.length > 0 && Object.keys(dataRecords[0]).map(key => (
              <div key={key} className="form-group">
                <label>{key}</label>
                <input
                  type="text"
                  value={newData[key] || ''}
                  onChange={(e) => setNewData({ ...newData, [key]: e.target.value })}
                  disabled={key === 'id'}
                />
              </div>
            ))}
            <div className="form-actions">
              <button className="cancel" onClick={() => {
                setIsDataModalOpen(false);
                setEditingData(null);
                setNewData({});
              }}>取消</button>
              <button className="submit" onClick={handleSaveData}>确定</button>
            </div>
          </div>
        </div>
      )}

      {/* 语义/指标模态框 */}
      {isIndicatorModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>新建语义/指标</h2>
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
                placeholder="例如: SUM(账单金额)/COUNT(通行记录)"
                style={{ height: '80px' }}
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
                <option value="boolean">布尔值</option>
                <option value="date">日期</option>
              </select>
            </div>
            <div className="form-group">
              <label>描述</label>
              <textarea
                value={newIndicator.description}
                onChange={(e) => setNewIndicator({ ...newIndicator, description: e.target.value })}
                placeholder="指标描述"
              ></textarea>
            </div>
            <div className="form-actions">
              <button className="cancel" onClick={() => {
                setIsIndicatorModalOpen(false);
                setNewIndicator({ name: '', expression: '', returnType: 'number', description: '' });
              }}>取消</button>
              <button className="submit" onClick={handleSaveIndicator}>确定</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ModelDetail