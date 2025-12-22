import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const ModelDetail = () => {
  const { modelId } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('properties')
  const [model, setModel] = useState(null)
  const [properties, setProperties] = useState([])
  const [relations, setRelations] = useState([])
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false)
  const [editingProperty, setEditingProperty] = useState(null)
  const [newProperty, setNewProperty] = useState({ name: '', type: 'string', required: false, description: '' })
  
  // 操作反馈状态
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  
  // 确认对话框状态
  const [confirmDialog, setConfirmDialog] = useState({ show: false, title: '', message: '', onConfirm: null })
  
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
  
  // 共享属性引用相关状态
  const [isSharedAttrModalOpen, setIsSharedAttrModalOpen] = useState(false)
  const [sharedAttributes, setSharedAttributes] = useState([])
  const [selectedSharedAttrs, setSelectedSharedAttrs] = useState([])
  const [sharedAttrSearchTerm, setSharedAttrSearchTerm] = useState('')
  
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
              const updatedModel = {
                id: parseInt(modelId),
                name: foundModel.name,
                description: foundModel.description,
                domainId: foundModel.domainId,
                domainName: domain?.name || `域ID: ${foundModel.domainId}`
              }
              setCurrentDomain(domain)
              setModel(updatedModel)
              
              // 获取当前业务域的共享属性
              fetch(`/api/shared-attribute?domainId=${updatedModel.domainId}`)
                .then(response => response.json())
                .then(sharedAttrData => {
                  setSharedAttributes(sharedAttrData)
                })
                .catch(error => console.error('Failed to fetch shared attributes:', error))
            })
            .catch(error => {
              console.error('Failed to fetch domains:', error)
              // 即使域数据获取失败，也要设置模型基本信息
              const updatedModel = {
                id: parseInt(modelId),
                name: foundModel.name,
                description: foundModel.description,
                domainId: foundModel.domainId,
                domainName: `域ID: ${foundModel.domainId}`
              }
              setModel(updatedModel)
              
              // 获取当前业务域的共享属性
              fetch(`/api/shared-attribute?domainId=${updatedModel.domainId}`)
                .then(response => response.json())
                .then(sharedAttrData => {
                  setSharedAttributes(sharedAttrData)
                })
                .catch(error => console.error('Failed to fetch shared attributes:', error))
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
    
    // 获取数据源数据
    fetch(`/api/datasource?modelId=${modelId}`)
      .then(response => response.json())
      .then(datasourceData => {
        setDatasources(datasourceData)
      })
      .catch(error => console.error('Failed to fetch datasources:', error))
    
    // 获取模型绑定的指标
    fetch(`/api/model/${modelId}/indicator`)
      .then(response => response.json())
      .then(indicatorData => {
        setBoundIndicators(indicatorData)
      })
      .catch(error => console.error('Failed to fetch bound indicators:', error))
    
    // 获取所有可用指标
    fetch('/api/indicator')
      .then(response => response.json())
      .then(indicatorData => {
        setSemanticIndicators(indicatorData)
      })
      .catch(error => console.error('Failed to fetch indicators:', error))
    
    // 模拟获取数据记录
    const mockDataRecords = [
      { id: 1, licensePlate: '京A12345', vehicleType: '小型客车', entryTime: '2025-12-19 08:00:00', exitTime: '2025-12-19 08:30:00', tollFee: 50.0 },
      { id: 2, licensePlate: '沪B67890', vehicleType: '大型货车', entryTime: '2025-12-19 08:15:00', exitTime: '2025-12-19 09:00:00', tollFee: 120.0 },
      { id: 3, licensePlate: '粤C54321', vehicleType: '小型客车', entryTime: '2025-12-19 08:30:00', exitTime: '2025-12-19 09:15:00', tollFee: 80.0 }
    ]
    setDataRecords(mockDataRecords)
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
        setEditingProperty(null)
        setNewProperty({ name: '', type: 'string', required: false, description: '' })
        showNotification('属性创建成功')
      })
      .catch(error => {
        console.error('Failed to create property:', error)
        showNotification('属性创建失败', 'error')
      })
  }
  
  // 处理编辑属性
  const handleEditProperty = (property) => {
    setEditingProperty(property)
    setNewProperty({
      name: property.name,
      type: property.type,
      required: property.required,
      description: property.description
    })
    setIsPropertyModalOpen(true)
  }
  
  // 处理更新属性
  const handleUpdateProperty = () => {
    fetch(`/api/property/${editingProperty.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProperty)
    })
      .then(response => response.json())
      .then(updatedProperty => {
        setProperties(properties.map(p => p.id === updatedProperty.id ? updatedProperty : p))
        setIsPropertyModalOpen(false)
        setEditingProperty(null)
        setNewProperty({ name: '', type: 'string', required: false, description: '' })
        showNotification('属性更新成功')
      })
      .catch(error => {
        console.error('Failed to update property:', error)
        showNotification('属性更新失败', 'error')
      })
  }
  
  // 保存属性
  const handleSaveProperty = () => {
    if (editingProperty) {
      handleUpdateProperty()
    } else {
      handleCreateProperty()
    }
  }

  // 处理删除属性
  const handleDeleteProperty = (id) => {
    showConfirmDialog(
      '删除确认',
      '确定要删除该属性吗？删除后无法恢复。',
      () => {
        fetch(`/api/property/${id}`, { method: 'DELETE' })
          .then(() => {
            setProperties(properties.filter(property => property.id !== id))
            showNotification('属性删除成功')
            closeConfirmDialog()
          })
          .catch(error => {
            console.error('Failed to delete property:', error)
            showNotification('属性删除失败', 'error')
            closeConfirmDialog()
          })
      }
    )
  }
  
  // 关系处理函数
  const handleCreateRelation = () => {
    fetch('/api/relation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
        setTargetModelSearchTerm('')
        setRelationNameSearchTerm('')
        showNotification('关系创建成功')
      })
      .catch(error => {
        console.error('Failed to create relation:', error)
        showNotification('关系创建失败', 'error')
      })
  }
  
  const handleEditRelation = (relation) => {
    setEditingRelation(relation)
    setNewRelation(relation)
    setTargetModelSearchTerm(relation.targetModel || '')
    setRelationNameSearchTerm(relation.name || '')
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
          relation.id === updatedRelation.id ? updatedRelation : relation
        ))
        setIsRelationModalOpen(false)
        setEditingRelation(null)
        setNewRelation({ name: '', sourceModel: '', targetModel: '', type: 'one-to-many', description: '' })
        setTargetModelSearchTerm('')
        setRelationNameSearchTerm('')
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
    fetch('/api/datasource', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newDatasource, modelId: parseInt(modelId) })
    })
      .then(response => response.json())
      .then(datasource => {
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
        showNotification('数据源创建成功')
      })
      .catch(error => {
        console.error('Failed to create datasource:', error)
        showNotification('数据源创建失败', 'error')
      })
  }
  
  const handleEditDatasource = (datasource) => {
    setEditingDatasource(datasource)
    setNewDatasource(datasource)
    setIsDatasourceModalOpen(true)
  }
  
  const handleUpdateDatasource = () => {
    fetch(`/api/datasource/${editingDatasource.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newDatasource)
    })
      .then(response => response.json())
      .then(updatedDatasource => {
        setDatasources(datasources.map(datasource => 
          datasource.id === editingDatasource.id ? updatedDatasource : datasource
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
        showNotification('数据源更新成功')
      })
      .catch(error => {
        console.error('Failed to update datasource:', error)
        showNotification('数据源更新失败', 'error')
      })
  }
  
  const handleDeleteDatasource = (id) => {
    showConfirmDialog(
      '删除确认',
      '确定要删除该数据源吗？删除后无法恢复。',
      () => {
        fetch(`/api/datasource/${id}`, { method: 'DELETE' })
          .then(() => {
            setDatasources(datasources.filter(datasource => datasource.id !== id))
            showNotification('数据源删除成功')
            closeConfirmDialog()
          })
          .catch(error => {
            console.error('Failed to delete datasource:', error)
            showNotification('数据源删除失败', 'error')
            closeConfirmDialog()
          })
      }
    )
  }
  
  const handleToggleDatasource = (id) => {
    fetch(`/api/datasource/${id}/toggle`, { method: 'PUT' })
      .then(response => response.json())
      .then(updatedDatasource => {
        setDatasources(datasources.map(datasource => 
          datasource.id === id ? updatedDatasource : datasource
        ))
        showNotification(updatedDatasource.status === 'active' ? '数据源已启用' : '数据源已禁用')
      })
      .catch(error => {
        console.error('Failed to toggle datasource:', error)
        showNotification('操作失败', 'error')
      })
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
    fetch(`/api/model/${modelId}/indicator/${indicator.id}`, { method: 'POST' })
      .then(response => response.json())
      .then(() => {
        if (!boundIndicators.find(b => b.id === indicator.id)) {
          setBoundIndicators([...boundIndicators, indicator])
        }
        showNotification('指标绑定成功')
      })
      .catch(error => {
        console.error('Failed to bind indicator:', error)
        showNotification('指标绑定失败', 'error')
      })
  }
  
  const handleUnbindIndicator = (id) => {
    fetch(`/api/model/${modelId}/indicator/${id}`, { method: 'DELETE' })
      .then(() => {
        setBoundIndicators(boundIndicators.filter(indicator => indicator.id !== id))
        showNotification('指标已解绑')
      })
      .catch(error => {
        console.error('Failed to unbind indicator:', error)
        showNotification('指标解绑失败', 'error')
      })
  }
  
  const handleCreateIndicator = () => {
    fetch('/api/indicator', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newIndicator, status: 'draft' })
    })
      .then(response => response.json())
      .then(indicator => {
        setSemanticIndicators([...semanticIndicators, indicator])
        setIsIndicatorModalOpen(false)
        setNewIndicator({
          name: '',
          expression: '',
          returnType: 'number',
          description: ''
        })
        showNotification('指标创建成功')
      })
      .catch(error => {
        console.error('Failed to create indicator:', error)
        showNotification('指标创建失败', 'error')
      })
  }
  
  const handleSaveIndicator = () => {
    handleCreateIndicator()
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
  const handleImport = (callback, type) => {
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
  
  // 属性导出函数
  const handlePropertyExport = () => {
    handleExport(properties, `properties_${modelId}.json`)
  }
  
  // 属性导入函数
  const handlePropertyImport = () => {
    handleImport((data) => {
      // 实际项目中应该调用API导入数据
      data.forEach(prop => {
        // 确保每个属性都有modelId
        prop.modelId = parseInt(modelId)
      })
      
      // 批量创建属性
      const createPromises = data.map(prop => {
        return fetch('/api/property', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(prop)
        })
      })
      
      Promise.all(createPromises)
        .then(() => {
          // 重新获取属性列表
          fetch(`/api/property?modelId=${modelId}`)
            .then(response => response.json())
            .then(propertyData => {
              setProperties(propertyData)
            })
        })
        .catch(error => {
          console.error('Failed to import properties:', error)
          showNotification('属性导入失败', 'error')
        })
    }, 'property')
  }
  
  // 关系导出函数
  const handleRelationExport = () => {
    handleExport(relations, `relations_${modelId}.json`)
  }
  
  // 关系导入函数
  const handleRelationImport = () => {
    handleImport((data) => {
      // 实际项目中应该调用API导入数据
      data.forEach(relation => {
        // 确保每个关系都有sourceModelId
        relation.sourceModelId = parseInt(modelId)
      })
      
      // 批量创建关系
      const createPromises = data.map(relation => {
        return fetch('/api/relation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(relation)
        })
      })
      
      Promise.all(createPromises)
        .then(() => {
          // 重新获取关系列表
          fetch(`/api/relation?modelId=${modelId}`)
            .then(response => response.json())
            .then(relationData => {
              setRelations(relationData)
            })
        })
        .catch(error => {
          console.error('Failed to import relations:', error)
          showNotification('关系导入失败', 'error')
        })
    }, 'relation')
  }
  
  // 数据源导出函数
  const handleDatasourceExport = () => {
    handleExport(datasources, `datasources_${modelId}.json`)
  }
  
  // 数据源导入函数
  const handleDatasourceImport = () => {
    handleImport((data) => {
      // 实际项目中应该调用API导入数据
      setDatasources([...datasources, ...data])
      showNotification('数据源导入成功')
    }, 'datasource')
  }
  
  // 语义指标导出函数
  const handleSemanticExport = () => {
    handleExport(semanticIndicators, `semantic_indicators_${modelId}.json`)
  }
  
  // 语义指标导入函数
  const handleSemanticImport = () => {
    handleImport((data) => {
      // 实际项目中应该调用API导入数据
      const createPromises = data.map(indicator => {
        return fetch('/api/indicator', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(indicator)
        })
      })
      
      Promise.all(createPromises)
        .then(() => {
          // 重新获取语义指标列表
          fetch('/api/indicator')
            .then(response => response.json())
            .then(indicatorData => {
              setSemanticIndicators(indicatorData)
            })
        })
        .catch(error => {
          console.error('Failed to import semantic indicators:', error)
          showNotification('语义指标导入失败', 'error')
        })
    }, 'semantic')
  }
  
  // 共享属性引用功能函数
  const handleOpenSharedAttrModal = () => {
    setIsSharedAttrModalOpen(true)
    setSelectedSharedAttrs([])
    setSharedAttrSearchTerm('')
  }
  
  const handleSharedAttrSearch = (e) => {
    setSharedAttrSearchTerm(e.target.value)
  }
  
  const handleSelectSharedAttr = (attr) => {
    setSelectedSharedAttrs(prev => {
      if (prev.some(a => a.id === attr.id)) {
        return prev.filter(a => a.id !== attr.id)
      } else {
        return [...prev, attr]
      }
    })
  }
  
  const handleReferenceSharedAttrs = () => {
    if (selectedSharedAttrs.length === 0) {
      showNotification('请选择要引用的共享属性', 'error')
      return
    }
    
    // 将选择的共享属性转换为模型属性并创建
    const createPromises = selectedSharedAttrs.map(sharedAttr => {
      return fetch('/api/property', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: sharedAttr.name,
          type: sharedAttr.type,
          required: false,
          description: sharedAttr.description,
          modelId: parseInt(modelId)
        })
      })
    })
    
    Promise.all(createPromises)
      .then(() => {
        // 重新获取属性列表
        fetch(`/api/property?modelId=${modelId}`)
          .then(response => response.json())
          .then(propertyData => {
            setProperties(propertyData)
            setIsSharedAttrModalOpen(false)
            showNotification(`成功引用${selectedSharedAttrs.length}个共享属性`)
          })
      })
      .catch(error => {
        console.error('Failed to reference shared attributes:', error)
        showNotification('引用共享属性失败', 'error')
      })
  }

  return (
    <div className="model-detail">
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
        <span style={{ cursor: 'pointer', color: '#1890ff', marginRight: '8px' }} onClick={() => navigate(`/domain/${model?.domainId}`)}>{model?.domainName}</span>
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
              <button onClick={handleOpenSharedAttrModal}>从共享属性引用</button>
              <button onClick={handlePropertyImport}>导入</button>
              <button onClick={handlePropertyExport}>导出</button>
            </div>
            <div className="card-list">
              {properties.map(property => (
                <div key={property.id} className="card">
                  <h3>{property.name}</h3>
                  <p>类型: {property.type}</p>
                  <p>必填: {property.required ? '是' : '否'}</p>
                  <p>描述: {property.description}</p>
                  <div className="card-actions">
                    <button className="edit" onClick={() => handleEditProperty(property)}>编辑</button>
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
              <button onClick={handleRelationImport}>导入</button>
              <button onClick={handleRelationExport}>导出</button>
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
              <button onClick={handleDatasourceImport}>导入</button>
              <button onClick={handleDatasourceExport}>导出</button>
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
              <button onClick={handleSemanticImport}>导入</button>
              <button onClick={handleSemanticExport}>导出</button>
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

      {/* 新建/编辑属性模态框 */}
      {isPropertyModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>{editingProperty ? '编辑属性' : '新建属性'}</h2>
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
              <button className="cancel" onClick={() => {
                setIsPropertyModalOpen(false)
                setEditingProperty(null)
                setNewProperty({ name: '', type: 'string', required: false, description: '' })
              }}>取消</button>
              <button className="submit" onClick={handleSaveProperty}>{editingProperty ? '更新' : '确定'}</button>
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
      
      {/* 共享属性引用模态框 */}
      {isSharedAttrModalOpen && (
        <div className="modal">
          <div className="modal-content" style={{ color: '#000000', maxHeight: '80vh', overflowY: 'auto' }}>
            <h2>从共享属性引用</h2>
            <div className="form-group">
              <label>搜索共享属性</label>
              <input
                type="text"
                value={sharedAttrSearchTerm}
                onChange={handleSharedAttrSearch}
                placeholder="输入属性名称搜索..."
                style={{ color: '#000000' }}
              />
            </div>
            <div style={{ margin: '20px 0' }}>
              <h3>可选共享属性</h3>
              <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', maxHeight: '400px', overflowY: 'auto' }}>
                {sharedAttributes.filter(attr => 
                  attr.name.toLowerCase().includes(sharedAttrSearchTerm.toLowerCase())
                ).map(attr => (
                  <div 
                    key={attr.id} 
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid #f0f0f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      backgroundColor: selectedSharedAttrs.some(a => a.id === attr.id) ? '#e6f7ff' : 'transparent'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f5ff'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = selectedSharedAttrs.some(a => a.id === attr.id) ? '#e6f7ff' : 'transparent'}
                    onClick={() => handleSelectSharedAttr(attr)}
                  >
                    <div>
                      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{attr.name}</div>
                      <div style={{ fontSize: '14px', color: '#666' }}>类型: {attr.type}</div>
                      <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>{attr.description}</div>
                    </div>
                    <div style={{ marginLeft: '16px' }}>
                      <input
                        type="checkbox"
                        checked={selectedSharedAttrs.some(a => a.id === attr.id)}
                        onChange={() => handleSelectSharedAttr(attr)}
                        style={{ transform: 'scale(1.2)' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="form-actions" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '14px', color: '#666' }}>
                已选择 {selectedSharedAttrs.length} 个属性
              </div>
              <div>
                <button className="cancel" onClick={() => setIsSharedAttrModalOpen(false)}>取消</button>
                <button className="submit" onClick={handleReferenceSharedAttrs}>确认引用</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ModelDetail