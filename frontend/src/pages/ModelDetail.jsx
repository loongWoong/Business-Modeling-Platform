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
  const [currentDomain, setCurrentDomain] = useState(null)
  const [modelName, setModelName] = useState('')

  // 从API获取数据
  useEffect(() => {
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

    // 获取模型数据
    fetch('/api/model')
      .then(response => response.json())
      .then(data => {
        const foundModel = data.find(m => m.id === parseInt(modelId))
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
            .catch(error => console.error('Failed to fetch domains:', error))
        }
      })
      .catch(error => console.error('Failed to fetch models:', error))
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
    fetch(`/api/property/${id}`, {
      method: 'DELETE'
    })
      .then(() => {
        setProperties(properties.filter(property => property.id !== id))
      })
      .catch(error => console.error('Failed to delete property:', error))
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
              <button onClick={() => console.log('新建关系')}>新建关系</button>
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
                    <button className="edit" onClick={() => console.log('编辑关系', relation.id)}>编辑</button>
                    <button className="delete" onClick={() => console.log('删除关系', relation.id)}>删除</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* 其他Tab内容（占位） */}
        {(activeTab === 'datasource' || activeTab === 'data' || activeTab === 'semantic') && (
          <div style={{ padding: '16px', textAlign: 'center', color: '#666' }}>
            <h3>{activeTab === 'datasource' ? '数据源' : activeTab === 'data' ? '数据' : '语义/指标'}</h3>
            <p>功能开发中...</p>
          </div>
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
    </div>
  )
}

export default ModelDetail