import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { datasourceAPI, domainAPI, modelAPI, modelTableAssociationAPI } from '../../services/api';
import Notification from './components/Notification';
import DatasourceInfo from './modules/DatasourceInfo';
import MappingManager from './modules/MappingManager';
import AssociationManager from './modules/AssociationManager';

/**
 * DatasourceDetail页面
 * 
 * 管理Datasource聚合，包括：
 * 1. Datasource基本信息（聚合根）
 * 2. Mappings（字段映射，连接Datasource-Model-Property）
 * 3. ModelTableAssociations（模型表关联，连接Model-Datasource）
 * 
 * 符合DDD聚合边界：
 * - Datasource是聚合根
 * - Mapping和ModelTableAssociation是聚合内的实体
 * - 所有操作都通过Datasource聚合根进行
 */
const DatasourceDetail = () => {
  const { datasourceId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');
  const [datasource, setDatasource] = useState(null);
  const [mappings, setMappings] = useState([]);
  const [associations, setAssociations] = useState([]);
  const [currentDomain, setCurrentDomain] = useState(null);
  const [allModels, setAllModels] = useState([]);
  
  // 操作反馈状态
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  
  // 确认对话框状态
  const [confirmDialog, setConfirmDialog] = useState({ show: false, title: '', message: '', onConfirm: null });
  
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
      // 首先设置默认数据源数据，避免面包屑显示异常
      setDatasource({
        id: parseInt(datasourceId),
        name: '加载中...',
        description: '',
        domainId: 0,
        domainName: '加载中...'
      });

      try {
        // 使用新API获取数据源详情（包含mappings和associations）
        const datasourceData = await datasourceAPI.getById(datasourceId);
        const foundDatasource = datasourceData.datasource;
        
        if (foundDatasource) {
          // 获取域数据
          try {
            const domainData = await domainAPI.getAll();
            const domains = Array.isArray(domainData) ? domainData : (domainData.domains || []);
            const domain = domains.find(d => d.id === foundDatasource.domainId);
            const updatedDatasource = {
              ...foundDatasource,
              domainName: domain?.name || `域ID: ${foundDatasource.domainId}`
            };
            setCurrentDomain(domain);
            setDatasource(updatedDatasource);
          } catch (error) {
            console.error('Failed to fetch domains:', error);
            // 即使域数据获取失败，也要设置数据源基本信息
            const updatedDatasource = {
              ...foundDatasource,
              domainName: `域ID: ${foundDatasource.domainId}`
            };
            setDatasource(updatedDatasource);
          }

          // 设置从API获取的mappings和associations
          setMappings(datasourceData.mappings || []);
          setAssociations(datasourceData.associations || []);
        } else {
          // 数据源不存在时的处理
          setDatasource({
            id: parseInt(datasourceId),
            name: `数据源ID: ${datasourceId}`,
            description: '数据源不存在',
            domainId: 0,
            domainName: '未知域'
          });
        }

        // 获取所有模型，用于映射和关联
        try {
          const allModelsData = await modelAPI.getAll();
          const models = Array.isArray(allModelsData) ? allModelsData : (allModelsData.models || []);
          setAllModels(models);
        } catch (error) {
          console.error('Failed to fetch all models:', error);
        }
      } catch (error) {
        console.error('Failed to load datasource detail:', error);
        // API调用失败时的处理
        setDatasource({
          id: parseInt(datasourceId),
          name: `数据源ID: ${datasourceId}`,
          description: '获取数据源失败',
          domainId: 0,
          domainName: '未知域'
        });
      }
    };

    if (datasourceId) {
      loadData();
    }
  }, [datasourceId]);

  // 刷新数据
  const refreshData = async () => {
    try {
      const datasourceData = await datasourceAPI.getById(datasourceId);
      const foundDatasource = datasourceData.datasource;
      if (foundDatasource) {
        setDatasource(foundDatasource);
        setMappings(datasourceData.mappings || []);
        setAssociations(datasourceData.associations || []);
      }
    } catch (error) {
      console.error('Failed to refresh datasource data:', error);
    }
  };

  return (
    <div className="datasource-detail">
      {/* 通知提示 */}
      <Notification notification={notification} />
      
      {/* 面包屑导航 */}
      <div style={{ padding: '12px 16px', backgroundColor: '#f0f2f5', borderBottom: '1px solid #e0e0e0' }}>
        <span style={{ cursor: 'pointer', color: '#1890ff', marginRight: '8px' }} onClick={() => navigate('/')}>
          业务域地图
        </span>
        {datasource?.domainId && (
          <>
            <span style={{ marginRight: '8px' }}>&gt;</span>
            <span 
              style={{ cursor: 'pointer', color: '#1890ff', marginRight: '8px' }} 
              onClick={() => navigate(`/domain/${datasource.domainId}`)}
            >
              {datasource?.domainName || (currentDomain ? currentDomain.name : '...')}
            </span>
          </>
        )}
        <span style={{ marginRight: '8px' }}>&gt;</span>
        <span style={{ fontWeight: 'bold' }}>{datasource?.name || '加载中...'}</span>
        <span style={{ marginLeft: '8px', fontSize: '12px', color: '#8c8c8c' }}>
          (Datasource聚合)
        </span>
      </div>
      
      {/* 顶部标题 */}
      <div style={{ padding: '16px', backgroundColor: 'white', borderBottom: '1px solid #e0e0e0' }}>
        <h2>{datasource?.name} - 数据源详情</h2>
      </div>

      {/* Tab导航 */}
      <div className="tab-nav">
        <button
          className={activeTab === 'info' ? 'active' : ''}
          onClick={() => setActiveTab('info')}
        >
          基本信息
        </button>
        <button
          className={activeTab === 'mappings' ? 'active' : ''}
          onClick={() => setActiveTab('mappings')}
        >
          字段映射
        </button>
        <button
          className={activeTab === 'associations' ? 'active' : ''}
          onClick={() => setActiveTab('associations')}
        >
          模型表关联
        </button>
      </div>

      {/* 内容区域 */}
      <div className="content">
        {/* 基本信息Tab */}
        {activeTab === 'info' && (
          <DatasourceInfo 
            datasource={datasource}
            setDatasource={setDatasource}
            showNotification={showNotification}
            showConfirmDialog={showConfirmDialog}
            refreshData={refreshData}
          />
        )}

        {/* 字段映射Tab */}
        {activeTab === 'mappings' && (
          <MappingManager 
            datasource={datasource}
            mappings={mappings}
            setMappings={setMappings}
            allModels={allModels}
            showNotification={showNotification}
            showConfirmDialog={showConfirmDialog}
            refreshData={refreshData}
          />
        )}

        {/* 模型表关联Tab */}
        {activeTab === 'associations' && (
          <AssociationManager 
            datasource={datasource}
            associations={associations}
            setAssociations={setAssociations}
            allModels={allModels}
            showNotification={showNotification}
            showConfirmDialog={showConfirmDialog}
            refreshData={refreshData}
          />
        )}
      </div>
      
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

export default DatasourceDetail;

