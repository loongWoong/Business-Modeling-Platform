import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { domainAPI, modelAPI, propertyAPI, sharedAttributeAPI, relationAPI, indicatorAPI, datasourceAPI } from '../../services/api';
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
import DatasourceModal from './components/DatasourceModal';
import TableListModal from './components/TableListModal';
import TableDataModal from './components/TableDataModal';
import DatasourceManager from './modules/DatasourceManager';

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
  const [newModel, setNewModel] = useState({ name: '', code: '', description: '', parentId: '', tags: '' });
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
  
  // 数据源管理相关状态
  // 注意：DomainWorkbench作为Domain的概览页面，只展示该Domain下的Datasources
  // 实际的Datasource聚合管理应该在DatasourceDetail页面进行
  const [datasources, setDatasources] = useState([]);
  const [isDatasourceModalOpen, setIsDatasourceModalOpen] = useState(false);
  const [editingDatasource, setEditingDatasource] = useState(null);
  const [newDatasource, setNewDatasource] = useState({
    name: '',
    type: 'mysql',
    url: '',
    tableName: '',
    status: 'inactive',
    description: ''
  });
  // 当前绑定的数据源ID
  const [boundDatasourceId, setBoundDatasourceId] = useState(null);
  
  // 获取当前绑定的数据源ID
  useEffect(() => {
    datasourceAPI.getGlobalTargetId()
      .then(data => {
        if (data.success && data.value) {
          setBoundDatasourceId(parseInt(data.value));
        }
      })
      .catch(error => {
        console.error('Failed to get bound datasource ID:', error);
      });
  }, []);

  // 表列表模态框相关状态
  const [isTableListModalOpen, setIsTableListModalOpen] = useState(false);
  const [currentDatasource, setCurrentDatasource] = useState(null);
  const [tableList, setTableList] = useState([]);
  
  // 表数据模态框相关状态
  const [isTableDataModalOpen, setIsTableDataModalOpen] = useState(false);
  const [currentTable, setCurrentTable] = useState('');
  const [tableData, setTableData] = useState([]);
  const [tableColumns, setTableColumns] = useState([]);
  const [tableDataLoading, setTableDataLoading] = useState(false);

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
    const loadData = async () => {
      try {
        // 获取模型数据
        const modelsData = await modelAPI.getAll(domainId);
        const modelsList = Array.isArray(modelsData) ? modelsData : (modelsData.models || []);
        const edgesList = modelsData.edges || [];
        setModels(modelsList);
        setModelEdges(edgesList);
        
        // 获取所有属性数据
        // 由于属性是模型聚合的一部分，我们需要从每个模型的详情中获取
        // 为了性能，限制并发数量，分批加载
        try {
          // 尝试使用独立的属性API（如果存在）
          const propertyData = await propertyAPI.getAll();
          setAllData({
            models: modelsList,
            properties: Array.isArray(propertyData) ? propertyData : [],
            edges: edgesList
          });
        } catch (error) {
          // 如果独立API不存在，从模型详情中获取属性
          console.warn('Property API not available, loading from model details:', error);
          try {
            const allProperties = [];
            // 限制并发数量，分批加载
            const batchSize = 5;
            for (let i = 0; i < modelsList.length; i += batchSize) {
              const batch = modelsList.slice(i, i + batchSize);
              const batchPromises = batch.map(async (model) => {
                try {
                  const modelDetail = await modelAPI.getById(model.id);
                  return modelDetail.properties || [];
                } catch (err) {
                  console.warn(`Failed to load properties for model ${model.id}:`, err);
                  return [];
                }
              });
              
              const batchResults = await Promise.all(batchPromises);
              batchResults.forEach(props => {
                allProperties.push(...props);
              });
            }
            
            setAllData({
              models: modelsList,
              properties: allProperties,
              edges: edgesList
            });
          } catch (detailError) {
            console.error('Failed to fetch properties from model details:', detailError);
            // 即使获取属性失败，也要设置基本数据
            setAllData({
              models: modelsList,
              properties: [],
              edges: edgesList
            });
          }
        }

        // 获取当前域详情
        try {
          const domainData = await domainAPI.getAll();
          const domains = Array.isArray(domainData) ? domainData : (domainData.domains || []);
          const domain = domains.find(d => d.id === parseInt(domainId));
          setCurrentDomain(domain);
        } catch (error) {
          console.error('Failed to fetch domain:', error);
        }

        // 从后端API获取共享属性数据（如果API不存在，使用空数组）
        // 注意：后端可能没有实现此API，静默处理404错误
        try {
          const attrData = await sharedAttributeAPI.getAll(domainId);
          setSharedAttributes(Array.isArray(attrData) ? attrData : []);
        } catch (error) {
          // API可能不存在（404），静默使用空数组，不阻塞其他数据加载
          // 不记录警告，因为这是预期的行为（API可能未实现）
          if (error.status !== 404 && !error.isEndpointMissing) {
            console.warn('Failed to fetch shared attributes:', error.message);
          }
          setSharedAttributes([]);
        }

        // 从模型详情中收集所有关系数据（关系是Model聚合的一部分）
        // 为了性能，我们只从edges中推断关系，或者按需加载
        try {
          // 方法1：尝试从edges构建基本关系信息（如果不需要详细信息）
          // 方法2：批量加载模型详情获取完整关系信息
          const relationMap = new Map();
          
          // 如果模型数量不多，批量加载详情获取关系
          if (modelsList.length <= 10) {
            const batchSize = 3;
            for (let i = 0; i < modelsList.length; i += batchSize) {
              const batch = modelsList.slice(i, i + batchSize);
              const batchPromises = batch.map(async (model) => {
                try {
                  const modelDetail = await modelAPI.getById(model.id);
                  return modelDetail.relations || [];
                } catch (err) {
                  console.warn(`Failed to load relations for model ${model.id}:`, err);
                  return [];
                }
              });
              
              const batchResults = await Promise.all(batchPromises);
              batchResults.forEach(relations => {
                relations.forEach(relation => {
                  // 使用关系ID作为key去重
                  if (!relationMap.has(relation.id)) {
                    relationMap.set(relation.id, relation);
                  }
                });
              });
            }
          } else {
            // 如果模型太多，只从edges构建基本关系信息
            // 这样可以避免大量API调用
            edgesList.forEach(edge => {
              const relationKey = `${edge.source}_${edge.target}`;
              if (!relationMap.has(relationKey)) {
                relationMap.set(relationKey, {
                  id: relationKey,
                  name: '关联',
                  sourceModelId: edge.source,
                  targetModelId: edge.target,
                  type: 'one-to-many',
                  enabled: true
                });
              }
            });
          }
          
          // 转换为数组
          const relationsArray = Array.from(relationMap.values());
          // 过滤属于当前domain的关系（如果有domainId）
          const filteredRelations = domainId 
            ? relationsArray.filter(r => {
                // 检查关系的源模型或目标模型是否属于当前domain
                const sourceModel = modelsList.find(m => m.id === r.sourceModelId);
                const targetModel = modelsList.find(m => m.id === r.targetModelId);
                return (sourceModel && sourceModel.domainId === parseInt(domainId)) ||
                       (targetModel && targetModel.domainId === parseInt(domainId));
              })
            : relationsArray;
          
          setRelations(filteredRelations);
        } catch (error) {
          console.warn('Failed to fetch relations from models, using empty array:', error.message);
          setRelations([]);
        }

        // 从后端API获取语义/指标数据（如果API不存在，使用空数组）
        // 注意：后端可能没有实现此API，静默处理404错误
        try {
          const indicatorData = await indicatorAPI.getAll(domainId);
          setSemanticIndicators(Array.isArray(indicatorData) ? indicatorData : []);
        } catch (error) {
          // API可能不存在（404），静默使用空数组，不阻塞其他数据加载
          // 不记录警告，因为这是预期的行为（API可能未实现）
          if (error.status !== 404 && !error.isEndpointMissing) {
            console.warn('Failed to fetch indicators:', error.message);
          }
          setSemanticIndicators([]);
        }

        // 从后端API获取数据源数据
        try {
          const datasourceData = await datasourceAPI.getAll();
          setDatasources(Array.isArray(datasourceData) ? datasourceData : []);
        } catch (error) {
          console.error('Failed to fetch datasources:', error);
        }
      } catch (error) {
        console.error('Failed to load domain data:', error);
      }
    };

    if (domainId) {
      loadData();
    }
  }, [domainId]);

  // 处理新建模型
  const handleCreateModel = async () => {
    try {
      const model = await modelAPI.create({
        ...newModel,
        domainId: parseInt(domainId)
      });
      setModels([...models, model]);
      setIsModalOpen(false);
      setEditingModel(null);
      setNewModel({ name: '', code: '', description: '', parentId: '', tags: '' });
      showNotification('模型创建成功');
    } catch (error) {
      console.error('Failed to create model:', error);
      showNotification('模型创建失败', 'error');
    }
  };
  
  // 处理编辑模型
  const handleEditModel = (model) => {
    setEditingModel(model);
    setNewModel({
      name: model.name,
      code: model.code || '',
      description: model.description,
      parentId: model.parentId || '',
      tags: model.tags || ''
    });
    setIsModalOpen(true);
  };
  
  // 处理更新模型
  const handleUpdateModel = async () => {
    try {
      const updatedModel = await modelAPI.update(editingModel.id, newModel);
      setModels(models.map(m => m.id === updatedModel.id ? updatedModel : m));
      setIsModalOpen(false);
      setEditingModel(null);
      setNewModel({ name: '', code: '', description: '', parentId: '', tags: '' });
      showNotification('模型更新成功');
    } catch (error) {
      console.error('Failed to update model:', error);
      showNotification('模型更新失败', 'error');
    }
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
      async () => {
        try {
          await modelAPI.delete(id);
          setModels(models.filter(model => model.id !== id));
          showNotification('模型删除成功');
          closeConfirmDialog();
        } catch (error) {
          console.error('Failed to delete model:', error);
          showNotification('模型删除失败', 'error');
          closeConfirmDialog();
        }
      }
    );
  };
  
  // 共享属性处理函数
  const handleCreateAttr = async () => {
    try {
      const attr = await sharedAttributeAPI.create({ ...newAttr, domainId: parseInt(domainId) });
      setSharedAttributes([...sharedAttributes, attr]);
      setIsAttrModalOpen(false);
      setNewAttr({ name: '', type: 'string', length: '', precision: '', description: '', valueRange: '' });
      showNotification('共享属性创建成功');
    } catch (error) {
      console.error('Failed to create shared attribute:', error);
      showNotification('共享属性创建失败', 'error');
    }
  };
  
  const handleEditAttr = (attr) => {
    setEditingAttr(attr);
    setNewAttr(attr);
    setIsAttrModalOpen(true);
  };
  
  const handleUpdateAttr = async () => {
    try {
      const updatedAttr = await sharedAttributeAPI.update(editingAttr.id, newAttr);
      setSharedAttributes(sharedAttributes.map(attr => 
        attr.id === editingAttr.id ? updatedAttr : attr
      ));
      setIsAttrModalOpen(false);
      setEditingAttr(null);
      setNewAttr({ name: '', type: 'string', length: '', precision: '', description: '', valueRange: '' });
      showNotification('共享属性更新成功');
    } catch (error) {
      console.error('Failed to update shared attribute:', error);
      showNotification('共享属性更新失败', 'error');
    }
  };
  
  const handleDeleteAttr = (id) => {
    showConfirmDialog(
      '删除确认',
      '确定要删除该共享属性吗？删除后无法恢复。',
      async () => {
        try {
          await sharedAttributeAPI.delete(id);
          setSharedAttributes(sharedAttributes.filter(attr => attr.id !== id));
          showNotification('共享属性删除成功');
          closeConfirmDialog();
        } catch (error) {
          console.error('Failed to delete shared attribute:', error);
          showNotification('共享属性删除失败', 'error');
          closeConfirmDialog();
        }
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
  const handleCreateRelation = async () => {
    try {
      const relation = await relationAPI.create(newRelation);
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
    } catch (error) {
      console.error('Failed to create relation:', error);
      showNotification('关系创建失败', 'error');
    }
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
  
  const handleUpdateRelation = async () => {
    try {
      const updatedRelation = await relationAPI.update(editingRelation.id, newRelation);
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
    } catch (error) {
      console.error('Failed to update relation:', error);
      showNotification('关系更新失败', 'error');
    }
  };
  
  const handleDeleteRelation = (id) => {
    showConfirmDialog(
      '删除确认',
      '确定要删除该关系吗？删除后无法恢复。',
      async () => {
        try {
          await relationAPI.delete(id);
          setRelations(relations.filter(relation => relation.id !== id));
          showNotification('关系删除成功');
          closeConfirmDialog();
        } catch (error) {
          console.error('Failed to delete relation:', error);
          showNotification('关系删除失败', 'error');
          closeConfirmDialog();
        }
      }
    );
  };
  
  const handleToggleRelation = async (id) => {
    try {
      const updatedRelation = await relationAPI.toggle(id);
      setRelations(relations.map(relation => 
        relation.id === id ? updatedRelation : relation
      ));
      showNotification(updatedRelation.enabled ? '关系已启用' : '关系已禁用');
    } catch (error) {
      console.error('Failed to toggle relation:', error);
      showNotification('操作失败', 'error');
    }
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
  const handleCreateIndicator = async () => {
    try {
      const indicator = await indicatorAPI.create({ ...newIndicator, domainId: parseInt(domainId) });
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
    } catch (error) {
      console.error('Failed to create indicator:', error);
      showNotification('指标创建失败', 'error');
    }
  };
  
  const handleEditIndicator = (indicator) => {
    setEditingIndicator(indicator);
    setNewIndicator(indicator);
    setIsIndicatorModalOpen(true);
  };
  
  const handleUpdateIndicator = async () => {
    try {
      const updatedIndicator = await indicatorAPI.update(editingIndicator.id, newIndicator);
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
    } catch (error) {
      console.error('Failed to update indicator:', error);
      showNotification('指标更新失败', 'error');
    }
  };
  
  const handleDeleteIndicator = (id) => {
    showConfirmDialog(
      '删除确认',
      '确定要删除该指标吗？删除后无法恢复。',
      async () => {
        try {
          await indicatorAPI.delete(id);
          setSemanticIndicators(semanticIndicators.filter(indicator => indicator.id !== id));
          showNotification('指标删除成功');
          closeConfirmDialog();
        } catch (error) {
          console.error('Failed to delete indicator:', error);
          showNotification('指标删除失败', 'error');
          closeConfirmDialog();
        }
      }
    );
  };
  
  const handlePublishIndicator = async (id) => {
    try {
      const updatedIndicator = await indicatorAPI.publish(id);
      setSemanticIndicators(semanticIndicators.map(indicator => 
        indicator.id === id ? updatedIndicator : indicator
      ));
      showNotification('指标发布成功');
    } catch (error) {
      console.error('Failed to publish indicator:', error);
      showNotification('指标发布失败', 'error');
    }
  };
  
  const handleOfflineIndicator = async (id) => {
    try {
      const updatedIndicator = await indicatorAPI.offline(id);
      setSemanticIndicators(semanticIndicators.map(indicator => 
        indicator.id === id ? updatedIndicator : indicator
      ));
      showNotification('指标已下线');
    } catch (error) {
      console.error('Failed to offline indicator:', error);
      showNotification('指标下线失败', 'error');
    }
  };
  
  const handleSaveIndicator = () => {
    if (editingIndicator) {
      handleUpdateIndicator();
    } else {
      handleCreateIndicator();
    }
  };
  
  const handleCopyIndicator = async (indicator) => {
    // 复制并创建新指标
    const copyData = {
      ...indicator,
      name: `${indicator.name} - 副本`,
      status: 'draft',
      domainId: parseInt(domainId)
    };
    delete copyData.id;
    
    try {
      const newIndicatorCopy = await indicatorAPI.create(copyData);
      setSemanticIndicators([...semanticIndicators, newIndicatorCopy]);
      showNotification('指标复制成功');
    } catch (error) {
      console.error('Failed to copy indicator:', error);
      showNotification('指标复制失败', 'error');
    }
  };
  
  // 数据源管理处理函数
  const handleCreateDatasource = async () => {
    try {
      const datasource = await datasourceAPI.create({ ...newDatasource, domainId: parseInt(domainId), modelId: null });
      setDatasources([...datasources, datasource]);
      setIsDatasourceModalOpen(false);
      setNewDatasource({ name: '', type: 'mysql', url: '', tableName: '', status: 'inactive', description: '' });
      showNotification('数据源创建成功');
    } catch (error) {
      console.error('Failed to create datasource:', error);
      showNotification('数据源创建失败', 'error');
    }
  };
  
  const handleEditDatasource = (datasource) => {
    setEditingDatasource(datasource);
    setNewDatasource(datasource);
    setIsDatasourceModalOpen(true);
  };
  
  const handleUpdateDatasource = async () => {
    try {
      const updatedDatasource = await datasourceAPI.update(editingDatasource.id, { ...newDatasource, domainId: parseInt(domainId) });
      setDatasources(datasources.map(datasource => 
        datasource.id === editingDatasource.id ? updatedDatasource : datasource
      ));
      setIsDatasourceModalOpen(false);
      setEditingDatasource(null);
      setNewDatasource({ name: '', type: 'mysql', url: '', tableName: '', status: 'inactive', description: '' });
      showNotification('数据源更新成功');
    } catch (error) {
      console.error('Failed to update datasource:', error);
      showNotification('数据源更新失败', 'error');
    }
  };
  
  const handleDeleteDatasource = (id) => {
    showConfirmDialog(
      '删除确认',
      '确定要删除该数据源吗？删除后无法恢复。',
      async () => {
        try {
          await datasourceAPI.delete(id);
          setDatasources(datasources.filter(datasource => datasource.id !== id));
          showNotification('数据源删除成功');
          closeConfirmDialog();
        } catch (error) {
          console.error('Failed to delete datasource:', error);
          showNotification('数据源删除失败', 'error');
          closeConfirmDialog();
        }
      }
    );
  };
  
  const handleToggleDatasource = async (id) => {
    try {
      const updatedDatasource = await datasourceAPI.toggle(id);
      setDatasources(datasources.map(datasource => 
        datasource.id === id ? updatedDatasource : datasource
      ));
      showNotification(updatedDatasource.status === 'active' ? '数据源已启用' : '数据源已禁用');
    } catch (error) {
      console.error('Failed to toggle datasource:', error);
      showNotification('操作失败', 'error');
    }
  };
  
  const handleSaveDatasource = () => {
    if (editingDatasource) {
      handleUpdateDatasource();
    } else {
      handleCreateDatasource();
    }
  };
  
  // 测试数据源连通性
  const handleTestDatasourceConnection = async (datasource) => {
    try {
      const result = await datasourceAPI.testConnection(datasource.id);
      if (result.success) {
        showNotification(`数据源 "${datasource.name}" 连通性测试成功`);
      } else {
        showNotification(`数据源 "${datasource.name}" 连通性测试失败: ${result.message}`, 'error');
      }
    } catch (error) {
      console.error('Failed to test datasource connection:', error);
      showNotification(`数据源 "${datasource.name}" 连通性测试失败`, 'error');
    }
  };
  
  // 获取并显示数据源的数据表列表
  const handleNavigateToTables = async (datasource) => {
    try {
      const result = await datasourceAPI.getTables(datasource.id);
      if (result.success) {
        setCurrentDatasource(datasource);
        setTableList(result.tables);
        setIsTableListModalOpen(true);
      } else {
        showNotification(`获取数据源 "${datasource.name}" 的数据表列表失败: ${result.message}`, 'error');
      }
    } catch (error) {
      console.error('Failed to get datasource tables:', error);
      showNotification(`获取数据源 "${datasource.name}" 的数据表列表失败`, 'error');
    }
  };

  // 处理查看表数据
  const handleViewTableData = async (tableName) => {
    if (currentDatasource) {
      setCurrentTable(tableName);
      setTableDataLoading(true);
      
      try {
        const result = await datasourceAPI.getTableData(currentDatasource.id, tableName);
        if (result.success && result.data) {
          // 处理返回的数据，动态生成列配置
          const data = result.data;
          
          if (data.length > 0) {
            // 从第一条数据中提取列名，生成 columns 配置
            const columns = Object.keys(data[0]).map(key => ({
              title: key,
              dataIndex: key,
              key: key,
              ellipsis: true,
              width: 150,
            }));
            
            setTableColumns(columns);
            setTableData(data);
          } else {
            setTableColumns([]);
            setTableData([]);
          }
          
          // 打开表数据模态框
          setIsTableDataModalOpen(true);
        } else {
          showNotification(`获取表 ${tableName} 的数据失败: ${result.message || '未知错误'}`, 'error');
        }
      } catch (error) {
        console.error('Failed to get table data:', error);
        showNotification(`获取表 ${tableName} 的数据失败`, 'error');
      } finally {
        setTableDataLoading(false);
      }
    }
  };

  // 处理绑定/解绑数据源为全局目标数据源
  const handleBindDatasource = async (datasource) => {
    const isBound = boundDatasourceId === datasource.id;
    
    try {
      const result = isBound 
        ? await datasourceAPI.unbind(datasource.id)
        : await datasourceAPI.bind(datasource.id);
      
      if (result.success) {
        // 更新绑定状态
        if (isBound) {
          setBoundDatasourceId(null);
          showNotification(`数据源 "${datasource.name}" 已成功解绑`);
        } else {
          setBoundDatasourceId(datasource.id);
          showNotification(`数据源 "${datasource.name}" 已成功绑定为全局目标数据源`);
        }
      } else {
        showNotification(`${isBound ? '解绑' : '绑定'}数据源失败: ${result.message}`, 'error');
      }
    } catch (error) {
      console.error(`Failed to ${isBound ? 'unbind' : 'bind'} datasource:`, error);
      showNotification(`${isBound ? '解绑' : '绑定'}数据源 "${datasource.name}" 失败`, 'error');
    }
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
      
      {/* 面包屑导航 */}
      <div style={{ padding: '12px 16px', backgroundColor: '#f0f2f5', borderBottom: '1px solid #e0e0e0' }}>
        <span 
          style={{ cursor: 'pointer', color: '#1890ff', marginRight: '8px' }} 
          onClick={() => navigate('/')}
        >
          业务域地图
        </span>
        <span style={{ marginRight: '8px' }}>&gt;</span>
        <span style={{ fontWeight: 'bold' }}>{currentDomain?.name || `域ID: ${domainId}`}</span>
        <span style={{ marginLeft: '8px', fontSize: '12px', color: '#8c8c8c' }}>
          (Domain分类维度)
        </span>
      </div>
      
      {/* 顶部标题和快速导航 */}
      <div style={{ padding: '16px', backgroundColor: 'white', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>业务域工作台</h2>
        <div style={{ display: 'flex', gap: '12px', fontSize: '14px' }}>
          <span style={{ color: '#8c8c8c' }}>快速导航：</span>
          <span 
            style={{ cursor: 'pointer', color: '#1890ff' }}
            onClick={() => setActiveTab('model-mgr')}
          >
            📊 模型聚合
          </span>
          <span 
            style={{ cursor: 'pointer', color: '#1890ff' }}
            onClick={() => setActiveTab('datasource-mgr')}
          >
            💾 数据源聚合
          </span>
          <span 
            style={{ cursor: 'pointer', color: '#1890ff' }}
            onClick={() => navigate('/etl')}
          >
            ⚙️ ETL聚合
          </span>
        </div>
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
        <button
            className={activeTab === 'datasource-mgr' ? 'active' : ''}
            onClick={() => setActiveTab('datasource-mgr')}
          >
            数据源管理
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
            setIsModalOpen={setIsModalOpen}
            setEditingModel={setEditingModel}
            handleModelExport={handleModelExport}
            handleModelImport={handleModelImport}
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
            handleAttrExport={handleAttrExport}
            handleAttrImport={handleAttrImport}
            setIsAttrModalOpen={setIsAttrModalOpen}
            setEditingAttr={setEditingAttr}
            setNewAttr={setNewAttr}
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
            setIsIndicatorModalOpen={setIsIndicatorModalOpen}
            setEditingIndicator={setEditingIndicator}
            setNewIndicator={setNewIndicator}
            handleIndicatorExport={handleIndicatorExport}
            handleIndicatorImport={handleIndicatorImport}
          />
        )}

        {/* 数据源管理 */}
        {/* 注意：DomainWorkbench作为Domain的概览页面，只展示该Domain下的Datasources列表 */}
        {/* 点击数据源名称可以跳转到DatasourceDetail页面进行详细管理（符合DDD聚合边界） */}
        {activeTab === 'datasource-mgr' && (
          <DatasourceManager 
            datasources={datasources}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            handleEditDatasource={handleEditDatasource}
            handleDeleteDatasource={handleDeleteDatasource}
            handleToggleDatasource={handleToggleDatasource}
            handleTestDatasourceConnection={handleTestDatasourceConnection}
            handleNavigateToTables={handleNavigateToTables}
            handleBindDatasource={handleBindDatasource}
            setIsDatasourceModalOpen={setIsDatasourceModalOpen}
            setEditingDatasource={setEditingDatasource}
            setNewDatasource={setNewDatasource}
            boundDatasourceId={boundDatasourceId}
            navigate={navigate}
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
      
      {/* 新建/编辑数据源模态框 */}
      <DatasourceModal 
        isDatasourceModalOpen={isDatasourceModalOpen}
        editingDatasource={editingDatasource}
        newDatasource={newDatasource}
        setNewDatasource={setNewDatasource}
        handleSaveDatasource={handleSaveDatasource}
        setIsDatasourceModalOpen={setIsDatasourceModalOpen}
        setEditingDatasource={setEditingDatasource}
      />
      
      {/* 表列表模态框 */}
      <TableListModal 
        isOpen={isTableListModalOpen}
        onClose={() => setIsTableListModalOpen(false)}
        datasourceName={currentDatasource?.name || ''}
        tables={tableList}
        onTableClick={handleViewTableData}
      />
      
      {/* 表数据模态框 */}
      <TableDataModal
        isOpen={isTableDataModalOpen}
        onClose={() => setIsTableDataModalOpen(false)}
        datasourceName={currentDatasource?.name || ''}
        tableName={currentTable}
        tableData={tableData}
        columns={tableColumns}
        loading={tableDataLoading}
      />
    </div>
  );
};

export default DomainWorkbench;