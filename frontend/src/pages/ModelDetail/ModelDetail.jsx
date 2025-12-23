import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as d3 from 'd3';
import Notification from './components/Notification';
import PropertyModal from './components/PropertyModal';
import RelationModal from './components/RelationModal';
import DatasourceModal from './components/DatasourceModal';
import DataModal from './components/DataModal';
import IndicatorModal from './components/IndicatorModal';
import PropertyManager from './modules/PropertyManager';
import RelationManager from './modules/RelationManager';
import SharedAttributeReference from './modules/SharedAttributeReference';
import DatasourceManager from './modules/DatasourceManager';
import DataManager from './modules/DataManager';
import SemanticIndicatorManager from './modules/SemanticIndicatorManager';
import BloodlineAnalyzer from './modules/BloodlineAnalyzer';

const ModelDetail = () => {
  const { modelId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('properties');
  const [model, setModel] = useState(null);
  const [properties, setProperties] = useState([]);
  const [relations, setRelations] = useState([]);
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [newProperty, setNewProperty] = useState({ 
    name: '', 
    type: 'string', 
    required: false, 
    description: '', 
    isPrimaryKey: false, 
    isForeignKey: false, 
    defaultValue: null, 
    constraints: [], 
    sensitivityLevel: 'public', 
    maskRule: null, 
    physicalColumn: '' 
  });
  
  // 视图模式状态
  const [propertyViewMode, setPropertyViewMode] = useState('table');
  const [relationViewMode, setRelationViewMode] = useState('table');
  
  // 操作反馈状态
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  
  // 确认对话框状态
  const [confirmDialog, setConfirmDialog] = useState({ show: false, title: '', message: '', onConfirm: null });
  
  // 关系相关状态
  const [isRelationModalOpen, setIsRelationModalOpen] = useState(false);
  const [editingRelation, setEditingRelation] = useState(null);
  const [newRelation, setNewRelation] = useState({
    name: '',
    sourceModelId: '',
    targetModelId: '',
    type: 'one-to-many',
    description: ''
  });
  
  // 共享属性引用相关状态
  const [isSharedAttrModalOpen, setIsSharedAttrModalOpen] = useState(false);
  const [sharedAttributes, setSharedAttributes] = useState([]);
  const [selectedSharedAttrs, setSelectedSharedAttrs] = useState([]);
  const [sharedAttrSearchTerm, setSharedAttrSearchTerm] = useState('');
  
  // 模型列表状态，用于模糊匹配
  const [allModels, setAllModels] = useState([]);
  const [targetModelSearchTerm, setTargetModelSearchTerm] = useState('');
  const [targetModelSuggestions, setTargetModelSuggestions] = useState([]);
  const [showTargetSuggestions, setShowTargetSuggestions] = useState(false);
  
  // 关系类型列表状态，用于模糊匹配关系名称
  const [relationTypes, setRelationTypes] = useState([]);
  const [relationNameSearchTerm, setRelationNameSearchTerm] = useState('');
  const [relationNameSuggestions, setRelationNameSuggestions] = useState([]);
  const [showRelationNameSuggestions, setShowRelationNameSuggestions] = useState(false);
  const [currentDomain, setCurrentDomain] = useState(null);
  
  // 属性选择状态
  const [selectedProperties, setSelectedProperties] = useState([]);
  
  // 数据源相关状态
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
  
  // 数据相关状态
  const [dataRecords, setDataRecords] = useState([]);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [newData, setNewData] = useState({});
  
  // 语义/指标相关状态
  const [semanticIndicators, setSemanticIndicators] = useState([]);
  const [boundIndicators, setBoundIndicators] = useState([]);
  const [isIndicatorModalOpen, setIsIndicatorModalOpen] = useState(false);
  const [editingIndicator, setEditingIndicator] = useState(null);
  const [newIndicator, setNewIndicator] = useState({
    name: '',
    expression: '',
    returnType: 'number',
    description: ''
  });
  
  // 血缘分析相关状态
  const [bloodlineType, setBloodlineType] = useState('forward'); // forward, reverse, endToEnd, impact
  const [bloodlineData, setBloodlineData] = useState({ nodes: [], links: [] });

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

  // 生成血缘分析数据
  const generateBloodlineData = () => {
    // 模拟血缘数据，实际项目中应该从API获取
    const currentModelId = model?.id || parseInt(modelId);
    const nodes = [];
    const links = [];
    
    // 核心模型
    const currentModelName = model?.name || `模型${currentModelId}`;
    nodes.push({
      id: currentModelId,
      name: currentModelName,
      type: 'model',
      isCurrent: true
    });
    
    // 检查是否是收费站模型，生成特定的血缘数据
    const isTollStationModel = currentModelName.includes('收费站') || model?.name === '收费站';
    
    if (isTollStationModel) {
      // 根据血缘类型生成收费站模型特定的数据
      switch (bloodlineType) {
        case 'forward':
          // 正向血缘：收费站 → 车道 → 标识点 → 交易流水 → 车辆通行路径 → 通行拟合路径 → 拆分明细
          nodes.push(
            { id: currentModelId + 1, name: `车道`, type: 'model' },
            { id: currentModelId + 2, name: `标识点`, type: 'model' },
            { id: currentModelId + 3, name: `交易流水`, type: 'model' },
            { id: currentModelId + 4, name: `车辆通行路径`, type: 'model' },
            { id: currentModelId + 5, name: `通行拟合路径`, type: 'model' },
            { id: currentModelId + 6, name: `拆分明细`, type: 'model' }
          );
          links.push(
            { source: currentModelId, target: currentModelId + 1, name: '包含' },
            { source: currentModelId + 1, target: currentModelId + 2, name: '继承' },
            { source: currentModelId + 2, target: currentModelId + 3, name: '生成' },
            { source: currentModelId + 3, target: currentModelId + 4, name: '汇聚为' },
            { source: currentModelId + 4, target: currentModelId + 5, name: '拟合为' },
            { source: currentModelId + 5, target: currentModelId + 6, name: '拆分为' }
          );
          break;
          
        case 'reverse':
          // 反向血缘：收费公路 → 收费站
          // 路段业主 → 收费公路 → 收费站
          nodes.push(
            { id: currentModelId - 1, name: `收费公路`, type: 'model' },
            { id: currentModelId - 2, name: `路段业主`, type: 'model' }
          );
          links.push(
            { source: currentModelId - 2, target: currentModelId - 1, name: '管理' },
            { source: currentModelId - 1, target: currentModelId, name: '包含' }
          );
          break;
          
        case 'endToEnd':
          // 端到端血缘：路段业主 → 收费公路 → 收费站 → 车道 → 标识点 → 交易流水 → 车辆通行路径 → 通行拟合路径 → 拆分明细
          nodes.push(
            { id: currentModelId - 2, name: `路段业主`, type: 'model' },
            { id: currentModelId - 1, name: `收费公路`, type: 'model' },
            { id: currentModelId + 1, name: `车道`, type: 'model' },
            { id: currentModelId + 2, name: `标识点`, type: 'model' },
            { id: currentModelId + 3, name: `交易流水`, type: 'model' },
            { id: currentModelId + 4, name: `车辆通行路径`, type: 'model' },
            { id: currentModelId + 5, name: `通行拟合路径`, type: 'model' },
            { id: currentModelId + 6, name: `拆分明细`, type: 'model' }
          );
          links.push(
            { source: currentModelId - 2, target: currentModelId - 1, name: '管理' },
            { source: currentModelId - 1, target: currentModelId, name: '包含' },
            { source: currentModelId, target: currentModelId + 1, name: '包含' },
            { source: currentModelId + 1, target: currentModelId + 2, name: '继承' },
            { source: currentModelId + 2, target: currentModelId + 3, name: '生成' },
            { source: currentModelId + 3, target: currentModelId + 4, name: '汇聚为' },
            { source: currentModelId + 4, target: currentModelId + 5, name: '拟合为' },
            { source: currentModelId + 5, target: currentModelId + 6, name: '拆分为' }
          );
          break;
          
        case 'impact':
          // 影响分析：收费站 → 车道 → 标识点 → 交易流水 → 车辆通行路径 → 通行拟合路径 → 拆分明细
          // 同时考虑ETC门架对标识点和交易流水的影响
          nodes.push(
            { id: currentModelId + 1, name: `车道`, type: 'model' },
            { id: currentModelId + 2, name: `标识点`, type: 'model' },
            { id: currentModelId + 3, name: `交易流水`, type: 'model' },
            { id: currentModelId + 4, name: `车辆通行路径`, type: 'model' },
            { id: currentModelId + 5, name: `通行拟合路径`, type: 'model' },
            { id: currentModelId + 6, name: `拆分明细`, type: 'model' },
            { id: currentModelId + 7, name: `收费单元`, type: 'model' },
            { id: currentModelId + 8, name: `ETC门架`, type: 'model' }
          );
          links.push(
            { source: currentModelId, target: currentModelId + 1, name: '影响' },
            { source: currentModelId + 1, target: currentModelId + 2, name: '影响' },
            { source: currentModelId + 2, target: currentModelId + 3, name: '影响' },
            { source: currentModelId + 3, target: currentModelId + 4, name: '影响' },
            { source: currentModelId + 4, target: currentModelId + 5, name: '影响' },
            { source: currentModelId + 5, target: currentModelId + 6, name: '影响' },
            { source: currentModelId + 6, target: currentModelId + 7, name: '影响' },
            { source: currentModelId + 8, target: currentModelId + 2, name: '影响' },
            { source: currentModelId + 8, target: currentModelId + 3, name: '影响' }
          );
          break;
      }
    } else {
      // 非收费站模型，使用默认的血缘数据
      switch (bloodlineType) {
        case 'forward':
          // 正向血缘：当前模型 → 下游模型1 → 下游模型2
          nodes.push(
            { id: currentModelId + 1, name: `下游模型1`, type: 'model' },
            { id: currentModelId + 2, name: `下游模型2`, type: 'model' }
          );
          links.push(
            { source: currentModelId, target: currentModelId + 1, name: '关联' },
            { source: currentModelId + 1, target: currentModelId + 2, name: '关联' }
          );
          break;
          
        case 'reverse':
          // 反向血缘：上游模型1 → 上游模型2 → 当前模型
          nodes.push(
            { id: currentModelId - 2, name: `上游模型2`, type: 'model' },
            { id: currentModelId - 1, name: `上游模型1`, type: 'model' }
          );
          links.push(
            { source: currentModelId - 2, target: currentModelId - 1, name: '关联' },
            { source: currentModelId - 1, target: currentModelId, name: '关联' }
          );
          break;
          
        case 'endToEnd':
          // 端到端血缘：源头 → 中间模型1 → 当前模型 → 中间模型2 → 目标
          nodes.push(
            { id: currentModelId - 2, name: `数据源`, type: 'datasource' },
            { id: currentModelId - 1, name: `预处理模型`, type: 'model' },
            { id: currentModelId + 1, name: `分析模型`, type: 'model' },
            { id: currentModelId + 2, name: `业务指标`, type: 'indicator' }
          );
          links.push(
            { source: currentModelId - 2, target: currentModelId - 1, name: '读取' },
            { source: currentModelId - 1, target: currentModelId, name: '转换' },
            { source: currentModelId, target: currentModelId + 1, name: '分析' },
            { source: currentModelId + 1, target: currentModelId + 2, name: '生成' }
          );
          break;
          
        case 'impact':
          // 影响分析：当前模型 → 直接影响1 → 直接影响2 → 间接影响1 → 间接影响2
          nodes.push(
            { id: currentModelId + 1, name: `直接影响1`, type: 'model' },
            { id: currentModelId + 2, name: `直接影响2`, type: 'model' },
            { id: currentModelId + 3, name: `间接影响1`, type: 'model' },
            { id: currentModelId + 4, name: `间接影响2`, type: 'model' }
          );
          links.push(
            { source: currentModelId, target: currentModelId + 1, name: '影响' },
            { source: currentModelId, target: currentModelId + 2, name: '影响' },
            { source: currentModelId + 1, target: currentModelId + 3, name: '影响' },
            { source: currentModelId + 2, target: currentModelId + 4, name: '影响' }
          );
          break;
      }
    }
    
    setBloodlineData({ nodes, links });
  };

  // 切换血缘类型时重新生成数据
  useEffect(() => {
    generateBloodlineData();
  }, [bloodlineType, model]);

  // 从API获取数据
  useEffect(() => {
    // 首先设置默认模型数据，避免面包屑显示异常
    setModel({
      id: parseInt(modelId),
      name: '加载中...',
      description: '',
      domainId: 0,
      domainName: '加载中...'
    });

    // 获取模型数据
    fetch('/api/model')
      .then(response => response.json())
      .then(data => {
        // 处理API返回的数据格式，兼容数组或包含models和edges的对象
        const models = Array.isArray(data) ? data : data.models || [];
        // 保存所有模型，用于目标模型的模糊匹配
        setAllModels(models);
        
        const foundModel = models.find(m => m.id === parseInt(modelId));
        if (foundModel) {
          // 获取域数据
          fetch('/api/domain/list')
            .then(response => response.json())
            .then(domainData => {
              const domain = domainData.domains.find(d => d.id === foundModel.domainId);
              const updatedModel = {
                id: parseInt(modelId),
                name: foundModel.name,
                description: foundModel.description,
                domainId: foundModel.domainId,
                domainName: domain?.name || `域ID: ${foundModel.domainId}`
              };
              setCurrentDomain(domain);
              setModel(updatedModel);
              
              // 获取当前业务域的共享属性
              fetch(`/api/shared-attribute?domainId=${updatedModel.domainId}`)
                .then(response => response.json())
                .then(sharedAttrData => {
                  setSharedAttributes(sharedAttrData);
                })
                .catch(error => console.error('Failed to fetch shared attributes:', error));
            })
            .catch(error => {
              console.error('Failed to fetch domains:', error);
              // 即使域数据获取失败，也要设置模型基本信息
              const updatedModel = {
                id: parseInt(modelId),
                name: foundModel.name,
                description: foundModel.description,
                domainId: foundModel.domainId,
                domainName: `域ID: ${foundModel.domainId}`
              };
              setModel(updatedModel);
              
              // 获取当前业务域的共享属性
              fetch(`/api/shared-attribute?domainId=${updatedModel.domainId}`)
                .then(response => response.json())
                .then(sharedAttrData => {
                  setSharedAttributes(sharedAttrData);
                })
                .catch(error => console.error('Failed to fetch shared attributes:', error));
            });
        } else {
          // 模型不存在时的处理
          setModel({
            id: parseInt(modelId),
            name: `模型ID: ${modelId}`,
            description: '模型不存在',
            domainId: 0,
            domainName: '未知域'
          });
        }
      })
      .catch(error => {
        console.error('Failed to fetch models:', error);
        // API调用失败时的处理
        setModel({
          id: parseInt(modelId),
          name: `模型ID: ${modelId}`,
          description: '获取模型失败',
          domainId: 0,
          domainName: '未知域'
        });
      });
    
    // 获取属性列表
    fetch(`/api/property?modelId=${modelId}`)
      .then(response => response.json())
      .then(propertyData => {
        setProperties(propertyData);
      })
      .catch(error => console.error('Failed to fetch properties:', error));
    
    // 获取关系列表
    fetch(`/api/relation?modelId=${modelId}`)
      .then(response => response.json())
      .then(relationData => {
        setRelations(relationData);
      })
      .catch(error => console.error('Failed to fetch relations:', error));
    
    // 获取所有关系类型，用于关系名称的模糊匹配
    fetch('/api/relation')
      .then(response => response.json())
      .then(allRelationData => {
        // 提取所有关系名称，去重
        const relationNames = [...new Set(allRelationData.map(r => r.name))];
        setRelationTypes(relationNames);
      })
      .catch(error => console.error('Failed to fetch relation types:', error));
    
    // 获取数据源数据
    fetch(`/api/datasource?modelId=${modelId}`)
      .then(response => response.json())
      .then(datasourceData => {
        setDatasources(datasourceData);
      })
      .catch(error => console.error('Failed to fetch datasources:', error));
    
    // 获取模型绑定的指标
    fetch(`/api/model/${modelId}/indicator`)
      .then(response => response.json())
      .then(indicatorData => {
        setBoundIndicators(indicatorData);
      })
      .catch(error => console.error('Failed to fetch bound indicators:', error));
    
    // 获取所有可用指标
    fetch('/api/indicator')
      .then(response => response.json())
      .then(indicatorData => {
        setSemanticIndicators(indicatorData);
      })
      .catch(error => console.error('Failed to fetch indicators:', error));
    
    // 从后端API获取数据记录
    fetch(`/api/data?modelId=${modelId}`)
      .then(response => response.json())
      .then(data => {
        setDataRecords(data);
      })
      .catch(error => {
        console.error('Failed to fetch data records:', error);
        // 获取失败时使用空数组
        setDataRecords([]);
      });
  }, [modelId]);

  return (
    <div className="model-detail">
      {/* 通知提示 */}
      <Notification notification={notification} />
      
      {/* 面包屑 */}
      <div style={{ padding: '12px 16px', backgroundColor: '#f0f2f5', borderBottom: '1px solid #e0e0e0' }}>
        <span style={{ cursor: 'pointer', color: '#1890ff', marginRight: '8px' }} onClick={() => navigate('/')}>业务域地图</span>
        <span style={{ marginRight: '8px' }}>&gt;</span>
        <span style={{ cursor: 'pointer', color: '#1890ff', marginRight: '8px' }} onClick={() => navigate(`/domain/${model?.domainId}`)}>{model?.domainName || (currentDomain ? currentDomain.name : '...')}</span>
        <span style={{ marginRight: '8px' }}>&gt;</span>
        <span>{model?.name || '加载中...'}</span>
      </div>
      
      {/* 顶部标题 */}
      <div style={{ padding: '16px', backgroundColor: 'white', borderBottom: '1px solid #e0e0e0' }}>
        <h2>{model?.name} - 模型详情</h2>
      </div>

      {/* Tab导航 */}
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
        <button
          className={activeTab === 'bloodline' ? 'active' : ''}
          onClick={() => setActiveTab('bloodline')}
        >
          血缘分析
        </button>
      </div>

      {/* 内容区域 */}
      <div className="content">
        {/* 属性Tab */}
        {activeTab === 'properties' && (
          <PropertyManager 
            model={model}
            properties={properties}
            setProperties={setProperties}
            showNotification={showNotification}
            showConfirmDialog={showConfirmDialog}
            isPropertyModalOpen={isPropertyModalOpen}
            setIsPropertyModalOpen={setIsPropertyModalOpen}
            editingProperty={editingProperty}
            setEditingProperty={setEditingProperty}
            newProperty={newProperty}
            setNewProperty={setNewProperty}
            selectedProperties={selectedProperties}
            setSelectedProperties={setSelectedProperties}
            viewMode={propertyViewMode}
            setViewMode={setPropertyViewMode}
          />
        )}

        {/* 关系Tab */}
        {activeTab === 'relations' && (
          <RelationManager 
            relations={relations}
            setRelations={setRelations}
            showNotification={showNotification}
            showConfirmDialog={showConfirmDialog}
            isRelationModalOpen={isRelationModalOpen}
            setIsRelationModalOpen={setIsRelationModalOpen}
            editingRelation={editingRelation}
            setEditingRelation={setEditingRelation}
            newRelation={newRelation}
            setNewRelation={setNewRelation}
            allModels={allModels}
            viewMode={relationViewMode}
            setViewMode={setRelationViewMode}
          />
        )}

        {/* 数据源Tab */}
        {activeTab === 'datasource' && (
          <DatasourceManager 
            datasources={datasources}
            setDatasources={setDatasources}
            showNotification={showNotification}
            showConfirmDialog={showConfirmDialog}
            isDatasourceModalOpen={isDatasourceModalOpen}
            setIsDatasourceModalOpen={setIsDatasourceModalOpen}
            editingDatasource={editingDatasource}
            setEditingDatasource={setEditingDatasource}
            newDatasource={newDatasource}
            setNewDatasource={setNewDatasource}
          />
        )}

        {/* 数据Tab */}
        {activeTab === 'data' && (
          <DataManager 
            dataRecords={dataRecords}
            setDataRecords={setDataRecords}
            showNotification={showNotification}
            showConfirmDialog={showConfirmDialog}
            isDataModalOpen={isDataModalOpen}
            setIsDataModalOpen={setIsDataModalOpen}
            editingData={editingData}
            setEditingData={setEditingData}
            newData={newData}
            setNewData={setNewData}
            properties={properties}
          />
        )}

        {/* 语义/指标Tab */}
        {activeTab === 'semantic' && (
          <SemanticIndicatorManager 
            semanticIndicators={semanticIndicators}
            setSemanticIndicators={setSemanticIndicators}
            boundIndicators={boundIndicators}
            setBoundIndicators={setBoundIndicators}
            showNotification={showNotification}
            showConfirmDialog={showConfirmDialog}
            isIndicatorModalOpen={isIndicatorModalOpen}
            setIsIndicatorModalOpen={setIsIndicatorModalOpen}
            editingIndicator={editingIndicator}
            setEditingIndicator={setEditingIndicator}
            newIndicator={newIndicator}
            setNewIndicator={setNewIndicator}
            modelId={modelId}
          />
        )}

        {/* 血缘分析Tab */}
        {activeTab === 'bloodline' && (
          <BloodlineAnalyzer 
            model={model}
            bloodlineType={bloodlineType}
            setBloodlineType={setBloodlineType}
            bloodlineData={bloodlineData}
            allData={{ models: allModels, properties: properties }}
            relations={relations}
          />
        )}
      </div>

      {/* 属性模态框 */}
      <PropertyModal 
        isPropertyModalOpen={isPropertyModalOpen}
        editingProperty={editingProperty}
        newProperty={newProperty}
        setNewProperty={setNewProperty}
        setIsPropertyModalOpen={setIsPropertyModalOpen}
        setEditingProperty={setEditingProperty}
        handleSaveProperty={() => {
          if (editingProperty) {
            // 更新属性
            fetch(`/api/property/${editingProperty.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newProperty)
            })
              .then(response => response.json())
              .then(updatedProperty => {
                setProperties(properties.map(p => p.id === updatedProperty.id ? updatedProperty : p));
                setIsPropertyModalOpen(false);
                setEditingProperty(null);
                setNewProperty({ 
                  name: '', 
                  type: 'string', 
                  required: false, 
                  description: '', 
                  isPrimaryKey: false, 
                  isForeignKey: false, 
                  defaultValue: null, 
                  constraints: [], 
                  sensitivityLevel: 'public', 
                  maskRule: null, 
                  physicalColumn: '' 
                });
                showNotification('属性更新成功');
              })
              .catch(error => {
                console.error('Failed to update property:', error);
                showNotification('属性更新失败', 'error');
              });
          } else {
            // 创建属性
            const propertyData = {
              ...newProperty,
              modelId: parseInt(modelId)
            };

            fetch('/api/property', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(propertyData)
            })
              .then(response => response.json())
              .then(property => {
                setProperties([...properties, property]);
                setIsPropertyModalOpen(false);
                setEditingProperty(null);
                setNewProperty({ 
                  name: '', 
                  type: 'string', 
                  required: false, 
                  description: '', 
                  isPrimaryKey: false, 
                  isForeignKey: false, 
                  defaultValue: null, 
                  constraints: [], 
                  sensitivityLevel: 'public', 
                  maskRule: null, 
                  physicalColumn: '' 
                });
                showNotification('属性创建成功');
              })
              .catch(error => {
                console.error('Failed to create property:', error);
                showNotification('属性创建失败', 'error');
              });
          }
        }}
      />
      
      {/* 关系模态框 */}
      <RelationModal 
        isRelationModalOpen={isRelationModalOpen}
        editingRelation={editingRelation}
        newRelation={newRelation}
        setNewRelation={setNewRelation}
        setIsRelationModalOpen={setIsRelationModalOpen}
        setEditingRelation={setEditingRelation}
        allModels={allModels}
        handleSaveRelation={() => {
          if (editingRelation) {
            // 更新关系
            fetch(`/api/relation/${editingRelation.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newRelation)
            })
              .then(response => response.json())
              .then(updatedRelation => {
                setRelations(relations.map(r => r.id === updatedRelation.id ? updatedRelation : r));
                setIsRelationModalOpen(false);
                setEditingRelation(null);
                setNewRelation({
                  name: '',
                  sourceModelId: '',
                  targetModelId: '',
                  type: 'one-to-many',
                  description: ''
                });
                showNotification('关系更新成功');
              })
              .catch(error => {
                console.error('Failed to update relation:', error);
                showNotification('关系更新失败', 'error');
              });
          } else {
            // 创建关系
            fetch('/api/relation', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newRelation)
            })
              .then(response => response.json())
              .then(relation => {
                setRelations([...relations, relation]);
                setIsRelationModalOpen(false);
                setEditingRelation(null);
                setNewRelation({
                  name: '',
                  sourceModelId: '',
                  targetModelId: '',
                  type: 'one-to-many',
                  description: ''
                });
                showNotification('关系创建成功');
              })
              .catch(error => {
                console.error('Failed to create relation:', error);
                showNotification('关系创建失败', 'error');
              });
          }
        }}
      />
      
      {/* 数据源模态框 */}
      <DatasourceModal 
        isDatasourceModalOpen={isDatasourceModalOpen}
        editingDatasource={editingDatasource}
        newDatasource={newDatasource}
        setNewDatasource={setNewDatasource}
        setIsDatasourceModalOpen={setIsDatasourceModalOpen}
        setEditingDatasource={setEditingDatasource}
        handleSaveDatasource={() => {
          if (editingDatasource) {
            // 更新数据源
            fetch(`/api/datasource/${editingDatasource.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newDatasource)
            })
              .then(response => response.json())
              .then(updatedDatasource => {
                setDatasources(datasources.map(d => d.id === updatedDatasource.id ? updatedDatasource : d));
                setIsDatasourceModalOpen(false);
                setEditingDatasource(null);
                setNewDatasource({
                  name: '',
                  type: 'mysql',
                  url: '',
                  tableName: '',
                  status: 'inactive',
                  description: ''
                });
                showNotification('数据源更新成功');
              })
              .catch(error => {
                console.error('Failed to update datasource:', error);
                showNotification('数据源更新失败', 'error');
              });
          } else {
            // 创建数据源
            fetch('/api/datasource', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newDatasource)
            })
              .then(response => response.json())
              .then(datasource => {
                setDatasources([...datasources, datasource]);
                setIsDatasourceModalOpen(false);
                setEditingDatasource(null);
                setNewDatasource({
                  name: '',
                  type: 'mysql',
                  url: '',
                  tableName: '',
                  status: 'inactive',
                  description: ''
                });
                showNotification('数据源创建成功');
              })
              .catch(error => {
                console.error('Failed to create datasource:', error);
                showNotification('数据源创建失败', 'error');
              });
          }
        }}
      />
      
      {/* 数据记录模态框 */}
      <DataModal 
        isDataModalOpen={isDataModalOpen}
        editingData={editingData}
        newData={newData}
        setNewData={setNewData}
        setIsDataModalOpen={setIsDataModalOpen}
        setEditingData={setEditingData}
        handleSaveData={() => {
          if (editingData) {
            // 更新数据记录
            fetch(`/api/data/${editingData.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newData)
            })
              .then(response => response.json())
              .then(updatedData => {
                setDataRecords(dataRecords.map(record => record.id === updatedData.id ? updatedData : record));
                setIsDataModalOpen(false);
                setEditingData(null);
                setNewData({});
                showNotification('数据记录更新成功');
              })
              .catch(error => {
                console.error('Failed to update data:', error);
                showNotification('数据记录更新失败', 'error');
              });
          } else {
            // 创建数据记录
            const dataWithId = {
              ...newData,
              id: dataRecords.length + 1
            };
            
            fetch('/api/data', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(dataWithId)
            })
              .then(response => response.json())
              .then(data => {
                setDataRecords([...dataRecords, data]);
                setIsDataModalOpen(false);
                setEditingData(null);
                setNewData({});
                showNotification('数据记录创建成功');
              })
              .catch(error => {
                console.error('Failed to create data:', error);
                showNotification('数据记录创建失败', 'error');
              });
          }
        }}
        properties={properties}
      />
      
      {/* 指标模态框 */}
      <IndicatorModal 
        isIndicatorModalOpen={isIndicatorModalOpen}
        editingIndicator={editingIndicator}
        newIndicator={newIndicator}
        setNewIndicator={setNewIndicator}
        setIsIndicatorModalOpen={setIsIndicatorModalOpen}
        setEditingIndicator={setEditingIndicator}
        handleSaveIndicator={() => {
          if (editingIndicator) {
            // 更新指标
            fetch(`/api/indicator/${editingIndicator.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newIndicator)
            })
              .then(response => response.json())
              .then(updatedIndicator => {
                setSemanticIndicators(semanticIndicators.map(i => i.id === updatedIndicator.id ? updatedIndicator : i));
                setIsIndicatorModalOpen(false);
                setEditingIndicator(null);
                setNewIndicator({
                  name: '',
                  expression: '',
                  returnType: 'number',
                  description: ''
                });
                showNotification('指标更新成功');
              })
              .catch(error => {
                console.error('Failed to update indicator:', error);
                showNotification('指标更新失败', 'error');
              });
          } else {
            // 创建指标
            fetch('/api/indicator', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newIndicator)
            })
              .then(response => response.json())
              .then(indicator => {
                setSemanticIndicators([...semanticIndicators, indicator]);
                setIsIndicatorModalOpen(false);
                setEditingIndicator(null);
                setNewIndicator({
                  name: '',
                  expression: '',
                  returnType: 'number',
                  description: ''
                });
                showNotification('指标创建成功');
              })
              .catch(error => {
                console.error('Failed to create indicator:', error);
                showNotification('指标创建失败', 'error');
              });
          }
        }}
      />
      
      {/* 确认对话框 */}
      {confirmDialog.show && (
        <div className="modal">
          <div className="modal-content" style={{ width: '400px' }}>
            <h2>{confirmDialog.title}</h2>
            <p>{confirmDialog.message}</p>
            <div className="form-actions">
              <button className="cancel" onClick={closeConfirmDialog}>取消</button>
              <button className="submit" onClick={() => {
                confirmDialog.onConfirm();
                closeConfirmDialog();
              }}>确定</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelDetail;