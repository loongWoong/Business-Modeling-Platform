import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ModelMap from './modules/ModelMap';
import ModelManager from './modules/ModelManager';
import SharedAttributeManager from './modules/SharedAttributeManager';
import RelationManager from './modules/RelationManager';
import SemanticIndicatorManager from './modules/SemanticIndicatorManager';
import Notification from './components/Notification';
import ConfirmDialog from './components/ConfirmDialog';
import HoverDrawer from './components/HoverDrawer';
import ModelModal from './components/ModelModal';
import SharedAttributeModal from './components/SharedAttributeModal';
import RelationModal from './components/RelationModal';
import SemanticIndicatorModal from './components/SemanticIndicatorModal';

const DomainWorkbench = () => {
  const { domainId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('model-map');
  const [models, setModels] = useState([]);
  const [modelEdges, setModelEdges] = useState([]);
  const [hoveredModel, setHoveredModel] = useState(null);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModel, setEditingModel] = useState(null);
  const [newModel, setNewModel] = useState({ name: '', description: '', parentId: '', tags: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentDomain, setCurrentDomain] = useState(null);
  const [isPropertyExpanded, setIsPropertyExpanded] = useState(false);
  const [allData, setAllData] = useState({ models: [], properties: [], edges: [] });
  
  // 操作反馈状态
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  
  // 确认对话框状态
  const [confirmDialog, setConfirmDialog] = useState({ show: false, title: '', message: '', onConfirm: null });
  
  // 共享属性相关状态
  const [sharedAttributes, setSharedAttributes] = useState([]);
  const [isAttrModalOpen, setIsAttrModalOpen] = useState(false);
  const [editingAttr, setEditingAttr] = useState(null);
  const [newAttr, setNewAttr] = useState({ name: '', type: 'string', length: '', precision: '', description: '', valueRange: '' });
  
  // 关系管理相关状态
  const [relations, setRelations] = useState([]);
  const [isRelationModalOpen, setIsRelationModalOpen] = useState(false);
  const [editingRelation, setEditingRelation] = useState(null);
  const [newRelation, setNewRelation] = useState({
    name: '',
    sourceModelId: '',
    targetModelId: '',
    type: 'one-to-many',
    description: '',
    enabled: true
  });
  
  // 显示关系相关状态
  const [showRelations, setShowRelations] = useState(false);
  
  // 语义/指标相关状态
  const [semanticIndicators, setSemanticIndicators] = useState([]);
  const [isIndicatorModalOpen, setIsIndicatorModalOpen] = useState(false);
  const [editingIndicator, setEditingIndicator] = useState(null);
  const [newIndicator, setNewIndicator] = useState({
    name: '',
    expression: '',
    returnType: 'number',
    description: '',
    status: 'draft',
    unit: ''
  });

  // 视图模式状态
  const [modelViewMode, setModelViewMode] = useState('card');
  const [attributeViewMode, setAttributeViewMode] = useState('card');
  const [relationViewMode, setRelationViewMode] = useState('card');
  const [indicatorViewMode, setIndicatorViewMode] = useState('card');

  // 显示通知
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
  };
  
  // 显示确认对话框
  const showConfirmDialog = (title, message, onConfirm) => {
    setConfirmDialog({ show: true, title, message, onConfirm });
  };
  
  // 关闭确认对话框
  const closeConfirmDialog = () => {
    setConfirmDialog({ show: false, title: '', message: '', onConfirm: null });
  };

  // 从API获取数据
  useEffect(() => {
    // 获取模型数据
    fetch(`/api/model?domainId=${domainId}`)
      .then(response => response.json())
      .then(data => {
        setModels(data.models);
        setModelEdges(data.edges);
        
        // 获取所有属性数据
        fetch('/api/property')
          .then(response => response.json())
          .then(propertyData => {
            setAllData({
              models: data.models,
              properties: propertyData,
              edges: data.edges
            });
          })
          .catch(error => console.error('Failed to fetch properties:', error));
      })
      .catch(error => console.error('Failed to fetch models:', error));
    
    // 获取当前域详情
    fetch('/api/domain/list')
      .then(response => response.json())
      .then(data => {
        const domain = data.domains.find(d => d.id === parseInt(domainId));
        setCurrentDomain(domain);
      })
      .catch(error => console.error('Failed to fetch domain:', error));
    
    // 从后端API获取共享属性数据
    fetch(`/api/shared-attribute?domainId=${domainId}`)
      .then(response => response.json())
      .then(attrData => {
        setSharedAttributes(attrData);
      })
      .catch(error => console.error('Failed to fetch shared attributes:', error));
    
    // 从后端API获取关系数据
    fetch(`/api/relation?domainId=${domainId}`)
      .then(response => response.json())
      .then(relationData => {
        setRelations(relationData);
      })
      .catch(error => console.error('Failed to fetch relations:', error));
    
    // 从后端API获取语义/指标数据
    fetch(`/api/indicator?domainId=${domainId}`)
      .then(response => response.json())
      .then(indicatorData => {
        setSemanticIndicators(indicatorData);
      })
      .catch(error => console.error('Failed to fetch indicators:', error));
  }, [domainId]);

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
        setModels([...models, model]);
        setIsModalOpen(false);
        setEditingModel(null);
        setNewModel({ name: '', description: '', parentId: '', tags: '' });
        showNotification('模型创建成功');
      })
      .catch(error => {
        console.error('Failed to create model:', error);
        showNotification('模型创建失败', 'error');
      });
  };
  
  // 处理编辑模型
  const handleEditModel = (model) => {
    setEditingModel(model);
    setNewModel({
      name: model.name,
      description: model.description,
      parentId: model.parentId || '',
      tags: model.tags || ''
    });
    setIsModalOpen(true);
  };
  
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
        setModels(models.map(m => m.id === updatedModel.id ? updatedModel : m));
        setIsModalOpen(false);
        setEditingModel(null);
        setNewModel({ name: '', description: '', parentId: '', tags: '' });
        showNotification('模型更新成功');
      })
      .catch(error => {
        console.error('Failed to update model:', error);
        showNotification('模型更新失败', 'error');
      });
  };
  
  // 保存模型（创建或更新）
  const handleSaveModel = () => {
    if (editingModel) {
      handleUpdateModel();
    } else {
      handleCreateModel();
    }
  };

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
            setModels(models.filter(model => model.id !== id));
            showNotification('模型删除成功');
            closeConfirmDialog();
          })
          .catch(error => {
            console.error('Failed to delete model:', error);
            showNotification('模型删除失败', 'error');
            closeConfirmDialog();
          });
      }
    );
  };
  
  // 共享属性处理函数
  const handleCreateAttr = () => {
    fetch('/api/shared-attribute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newAttr, domainId: parseInt(domainId) })
    })
      .then(response => response.json())
      .then(attr => {
        setSharedAttributes([...sharedAttributes, attr]);
        setIsAttrModalOpen(false);
        setNewAttr({ name: '', type: 'string', length: '', precision: '', description: '', valueRange: '' });
        showNotification('共享属性创建成功');
      })
      .catch(error => {
        console.error('Failed to create shared attribute:', error);
        showNotification('共享属性创建失败', 'error');
      });
  };
  
  const handleEditAttr = (attr) => {
    setEditingAttr(attr);
    setNewAttr(attr);
    setIsAttrModalOpen(true);
  };
  
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
        ));
        setIsAttrModalOpen(false);
        setEditingAttr(null);
        setNewAttr({ name: '', type: 'string', length: '', precision: '', description: '', valueRange: '' });
        showNotification('共享属性更新成功');
      })
      .catch(error => {
        console.error('Failed to update shared attribute:', error);
        showNotification('共享属性更新失败', 'error');
      });
  };
  
  const handleDeleteAttr = (id) => {
    showConfirmDialog(
      '删除确认',
      '确定要删除该共享属性吗？删除后无法恢复。',
      () => {
        fetch(`/api/shared-attribute/${id}`, { method: 'DELETE' })
          .then(() => {
            setSharedAttributes(sharedAttributes.filter(attr => attr.id !== id));
            showNotification('共享属性删除成功');
            closeConfirmDialog();
          })
          .catch(error => {
            console.error('Failed to delete shared attribute:', error);
            showNotification('共享属性删除失败', 'error');
            closeConfirmDialog();
          });
      }
    );
  };
  
  const handleSaveAttr = () => {
    if (editingAttr) {
      handleUpdateAttr();
    } else {
      handleCreateAttr();
    }
  };
  
  // 关系管理处理函数
  const handleCreateRelation = () => {
    fetch('/api/relation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRelation)
    })
      .then(response => response.json())
      .then(relation => {
        setRelations([...relations, relation]);
        setIsRelationModalOpen(false);
        setNewRelation({
          name: '',
          sourceModel: '',
          targetModel: '',
          type: 'one-to-many',
          description: '',
          enabled: true
        });
        showNotification('关系创建成功');
      })
      .catch(error => {
        console.error('Failed to create relation:', error);
        showNotification('关系创建失败', 'error');
      });
  };
  
  const handleEditRelation = (relation) => {
    setEditingRelation(relation);
    // 将关系对象转换为使用modelId的格式
    setNewRelation({
      id: relation.id,
      name: relation.name,
      sourceModelId: relation.sourceModelId || relation.sourceModel,
      targetModelId: relation.targetModelId || relation.targetModel,
      type: relation.type,
      description: relation.description,
      enabled: relation.enabled
    });
    setIsRelationModalOpen(true);
  };
  
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
        ));
        setIsRelationModalOpen(false);
        setEditingRelation(null);
        setNewRelation({
          name: '',
          sourceModel: '',
          targetModel: '',
          type: 'one-to-many',
          description: '',
          enabled: true
        });
        showNotification('关系更新成功');
      })
      .catch(error => {
        console.error('Failed to update relation:', error);
        showNotification('关系更新失败', 'error');
      });
  };
  
  const handleDeleteRelation = (id) => {
    showConfirmDialog(
      '删除确认',
      '确定要删除该关系吗？删除后无法恢复。',
      () => {
        fetch(`/api/relation/${id}`, { method: 'DELETE' })
          .then(() => {
            setRelations(relations.filter(relation => relation.id !== id));
            showNotification('关系删除成功');
            closeConfirmDialog();
          })
          .catch(error => {
            console.error('Failed to delete relation:', error);
            showNotification('关系删除失败', 'error');
            closeConfirmDialog();
          });
      }
    );
  };
  
  const handleToggleRelation = (id) => {
    fetch(`/api/relation/${id}/toggle`, { method: 'PUT' })
      .then(response => response.json())
      .then(updatedRelation => {
        setRelations(relations.map(relation => 
          relation.id === id ? updatedRelation : relation
        ));
        showNotification(updatedRelation.enabled ? '关系已启用' : '关系已禁用');
      })
      .catch(error => {
        console.error('Failed to toggle relation:', error);
        showNotification('操作失败', 'error');
      });
  };
  
  const handleSaveRelation = () => {
    if (editingRelation) {
      handleUpdateRelation();
    } else {
      handleCreateRelation();
    }
  };
  
  // 通用导出函数
  const handleExport = (data, filename) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('导出成功');
  };
  
  // 通用导入函数
  const handleImport = (callback) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target.result);
            callback(data);
            showNotification('导入成功');
          } catch (error) {
            console.error('Failed to parse import data:', error);
            showNotification('导入失败，文件格式错误', 'error');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };
  
  // 模型导出函数
  const handleModelExport = () => {
    handleExport(allData.models, `models_${domainId}.json`);
  };
  
  // 模型导入函数
  const handleModelImport = () => {
    handleImport((data) => {
      // 实际项目中应该调用API导入数据
      console.log('Imported models:', data);
      // 这里只是模拟，实际应该调用API后刷新数据
    });
  };
  
  // 共享属性导出函数
  const handleAttrExport = () => {
    handleExport(sharedAttributes, `shared_attributes_${domainId}.json`);
  };
  
  // 共享属性导入函数
  const handleAttrImport = () => {
    handleImport((data) => {
      // 实际项目中应该调用API导入数据
      console.log('Imported attributes:', data);
      // 这里只是模拟，实际应该调用API后刷新数据
    });
  };
  
  // 关系导出函数
  const handleRelationExport = () => {
    handleExport(relations, `relations_${domainId}.json`);
  };
  
  // 关系导入函数
  const handleRelationImport = () => {
    handleImport((data) => {
      // 实际项目中应该调用API导入数据
      console.log('Imported relations:', data);
      // 这里只是模拟，实际应该调用API后刷新数据
    });
  };
  
  // 语义/指标导出函数
  const handleIndicatorExport = () => {
    handleExport(semanticIndicators, `indicators_${domainId}.json`);
  };
  
  // 语义/指标导入函数
  const handleIndicatorImport = () => {
    handleImport((data) => {
      // 实际项目中应该调用API导入数据
      console.log('Imported indicators:', data);
      // 这里只是模拟，实际应该调用API后刷新数据
    });
  };
  
  // 语义/指标处理函数
  const handleCreateIndicator = () => {
    fetch('/api/indicator', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newIndicator, domainId: parseInt(domainId) })
    })
      .then(response => response.json())
      .then(indicator => {
        setSemanticIndicators([...semanticIndicators, indicator]);
        setIsIndicatorModalOpen(false);
        setNewIndicator({
          name: '',
          expression: '',
          returnType: 'number',
          description: '',
          status: 'draft',
          unit: ''
        });
        showNotification('指标创建成功');
      })
      .catch(error => {
        console.error('Failed to create indicator:', error);
        showNotification('指标创建失败', 'error');
      });
  };
  
  const handleEditIndicator = (indicator) => {
    setEditingIndicator(indicator);
    setNewIndicator(indicator);
    setIsIndicatorModalOpen(true);
  };
  
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
        ));
        setIsIndicatorModalOpen(false);
        setEditingIndicator(null);
        setNewIndicator({
          name: '',
          expression: '',
          returnType: 'number',
          description: '',
          status: 'draft',
          unit: ''
        });
        showNotification('指标更新成功');
      })
      .catch(error => {
        console.error('Failed to update indicator:', error);
        showNotification('指标更新失败', 'error');
      });
  };
  
  const handleDeleteIndicator = (id) => {
    showConfirmDialog(
      '删除确认',
      '确定要删除该指标吗？删除后无法恢复。',
      () => {
        fetch(`/api/indicator/${id}`, { method: 'DELETE' })
          .then(() => {
            setSemanticIndicators(semanticIndicators.filter(indicator => indicator.id !== id));
            showNotification('指标删除成功');
            closeConfirmDialog();
          })
          .catch(error => {
            console.error('Failed to delete indicator:', error);
            showNotification('指标删除失败', 'error');
            closeConfirmDialog();
          });
      }
    );
  };
  
  const handlePublishIndicator = (id) => {
    fetch(`/api/indicator/${id}/publish`, { method: 'PUT' })
      .then(response => response.json())
      .then(updatedIndicator => {
        setSemanticIndicators(semanticIndicators.map(indicator => 
          indicator.id === id ? updatedIndicator : indicator
        ));
        showNotification('指标发布成功');
      })
      .catch(error => {
        console.error('Failed to publish indicator:', error);
        showNotification('指标发布失败', 'error');
      });
  };
  
  const handleOfflineIndicator = (id) => {
    fetch(`/api/indicator/${id}/offline`, { method: 'PUT' })
      .then(response => response.json())
      .then(updatedIndicator => {
        setSemanticIndicators(semanticIndicators.map(indicator => 
          indicator.id === id ? updatedIndicator : indicator
        ));
        showNotification('指标已下线');
      })
      .catch(error => {
        console.error('Failed to offline indicator:', error);
        showNotification('指标下线失败', 'error');
      });
  };
  
  const handleSaveIndicator = () => {
    if (editingIndicator) {
      handleUpdateIndicator();
    } else {
      handleCreateIndicator();
    }
  };
  
  const handleCopyIndicator = (indicator) => {
    // 复制并创建新指标
    const copyData = {
      ...indicator,
      name: `${indicator.name} - 副本`,
      status: 'draft',
      domainId: parseInt(domainId)
    };
    delete copyData.id;
    
    fetch('/api/indicator', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(copyData)
    })
      .then(response => response.json())
      .then(newIndicatorCopy => {
        setSemanticIndicators([...semanticIndicators, newIndicatorCopy]);
        showNotification('指标复制成功');
      })
      .catch(error => {
        console.error('Failed to copy indicator:', error);
        showNotification('指标复制失败', 'error');
      });
  };

  // 过滤模型
  const filteredModels = models.filter(model =>
    model.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="domain-workbench">
      {/* 通知提示 */}
      <Notification notification={notification} />
      
      {/* 确认对话框 */}
      <ConfirmDialog confirmDialog={confirmDialog} closeConfirmDialog={closeConfirmDialog} />
      
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
            <ModelMap 
              allData={allData}
              isPropertyExpanded={isPropertyExpanded}
              activeTab={activeTab}
              searchTerm={searchTerm}
              showRelations={showRelations}
              relations={relations}
              setHoveredModel={setHoveredModel}
              setIsDrawerVisible={setIsDrawerVisible}
              isDrawerVisible={isDrawerVisible}
            />
          </>
        )}

        {/* 模型管理 */}
        {activeTab === 'model-mgr' && (
          <ModelManager 
            filteredModels={filteredModels}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            handleEditModel={handleEditModel}
            handleDeleteModel={handleDeleteModel}
            viewMode={modelViewMode}
            setViewMode={setModelViewMode}
          />
        )}

        {/* 共享属性管理 */}
        {activeTab === 'shared-attr' && (
          <SharedAttributeManager 
            sharedAttributes={sharedAttributes}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            handleEditAttr={handleEditAttr}
            handleDeleteAttr={handleDeleteAttr}
            viewMode={attributeViewMode}
            setViewMode={setAttributeViewMode}
          />
        )}
        
        {/* 关系管理 */}
        {activeTab === 'relation-mgr' && (
          <RelationManager 
            relations={relations}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            handleEditRelation={handleEditRelation}
            handleDeleteRelation={handleDeleteRelation}
            handleToggleRelation={handleToggleRelation}
            viewMode={relationViewMode}
            setViewMode={setRelationViewMode}
          />
        )}
        
        {/* 语义/指标管理 */}
        {activeTab === 'semantic-indi' && (
          <SemanticIndicatorManager 
            semanticIndicators={semanticIndicators}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            handleEditIndicator={handleEditIndicator}
            handleDeleteIndicator={handleDeleteIndicator}
            handlePublishIndicator={handlePublishIndicator}
            handleOfflineIndicator={handleOfflineIndicator}
            handleCopyIndicator={handleCopyIndicator}
            viewMode={indicatorViewMode}
            setViewMode={setIndicatorViewMode}
          />
        )}
      </div>

      {/* 悬停抽屉 */}
      <HoverDrawer 
        isDrawerVisible={isDrawerVisible}
        hoveredModel={hoveredModel}
        allData={allData}
        relations={relations}
        onClose={() => setIsDrawerVisible(false)}
      />

      {/* 新建/编辑模型模态框 */}
      <ModelModal 
        isModalOpen={isModalOpen}
        editingModel={editingModel}
        newModel={newModel}
        setNewModel={setNewModel}
        handleSaveModel={handleSaveModel}
        setIsModalOpen={setIsModalOpen}
        setEditingModel={setEditingModel}
      />
      
      {/* 新建/编辑共享属性模态框 */}
      <SharedAttributeModal 
        isAttrModalOpen={isAttrModalOpen}
        editingAttr={editingAttr}
        newAttr={newAttr}
        setNewAttr={setNewAttr}
        handleSaveAttr={handleSaveAttr}
        setIsAttrModalOpen={setIsAttrModalOpen}
        setEditingAttr={setEditingAttr}
      />
      
      {/* 新建/编辑关系模态框 */}
      <RelationModal 
        isRelationModalOpen={isRelationModalOpen}
        editingRelation={editingRelation}
        newRelation={newRelation}
        setNewRelation={setNewRelation}
        handleSaveRelation={handleSaveRelation}
        setIsRelationModalOpen={setIsRelationModalOpen}
        setEditingRelation={setEditingRelation}
        models={models}
      />
      
      {/* 新建/编辑语义/指标模态框 */}
      <SemanticIndicatorModal 
        isIndicatorModalOpen={isIndicatorModalOpen}
        editingIndicator={editingIndicator}
        newIndicator={newIndicator}
        setNewIndicator={setNewIndicator}
        handleSaveIndicator={handleSaveIndicator}
        setIsIndicatorModalOpen={setIsIndicatorModalOpen}
        setEditingIndicator={setEditingIndicator}
      />
    </div>
  );
};

export default DomainWorkbench;