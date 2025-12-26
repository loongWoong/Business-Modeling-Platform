import React, { useState } from 'react';
import { datasourceAPI, modelAPI } from '../../../services/api';

/**
 * MappingManager模块
 * 管理字段映射（Mapping实体）
 * Mapping连接Datasource-Model-Property
 */
const MappingManager = ({ 
  datasource, 
  mappings, 
  setMappings, 
  allModels,
  showNotification, 
  showConfirmDialog,
  refreshData 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMapping, setEditingMapping] = useState(null);
  const [newMapping, setNewMapping] = useState({
    modelId: '',
    fieldId: '',
    propertyId: ''
  });
  const [selectedModel, setSelectedModel] = useState(null);
  const [modelProperties, setModelProperties] = useState([]);

  // 当选择模型时，加载该模型的属性
  const handleModelSelect = async (modelId) => {
    if (!modelId) {
      setSelectedModel(null);
      setModelProperties([]);
      return;
    }

    try {
      const modelData = await modelAPI.getById(modelId);
      const model = allModels.find(m => m.id === parseInt(modelId));
      setSelectedModel(model);
      setModelProperties(modelData.properties || []);
    } catch (error) {
      console.error('Failed to load model properties:', error);
      showNotification('加载模型属性失败', 'error');
    }
  };

  const handleCreateMapping = async () => {
    try {
      const mappingData = {
        ...newMapping,
        datasourceId: datasource.id,
        modelId: parseInt(newMapping.modelId),
        propertyId: parseInt(newMapping.propertyId)
      };
      
      const result = await datasourceAPI.addMapping(datasource.id, mappingData);
      setMappings([...mappings, result]);
      setIsModalOpen(false);
      setNewMapping({ modelId: '', fieldId: '', propertyId: '' });
      setSelectedModel(null);
      setModelProperties([]);
      showNotification('字段映射创建成功');
      refreshData();
    } catch (error) {
      console.error('Failed to create mapping:', error);
      showNotification('字段映射创建失败', 'error');
    }
  };

  const handleEditMapping = (mapping) => {
    setEditingMapping(mapping);
    setNewMapping({
      modelId: mapping.modelId.toString(),
      fieldId: mapping.fieldId,
      propertyId: mapping.propertyId.toString()
    });
    handleModelSelect(mapping.modelId);
    setIsModalOpen(true);
  };

  const handleUpdateMapping = async () => {
    try {
      // 注意：后端可能需要单独的更新接口，这里假设可以通过删除+创建来实现
      // 实际应该调用 PUT /api/datasource/:id/mappings/:mappingId
      showNotification('更新功能待实现', 'error');
    } catch (error) {
      console.error('Failed to update mapping:', error);
      showNotification('字段映射更新失败', 'error');
    }
  };

  const handleDeleteMapping = (mappingId) => {
    showConfirmDialog(
      '删除确认',
      '确定要删除该字段映射吗？删除后无法恢复。',
      async () => {
        try {
          // 注意：后端可能需要单独的删除接口
          // 实际应该调用 DELETE /api/datasource/:id/mappings/:mappingId
          setMappings(mappings.filter(m => m.id !== mappingId));
          showNotification('字段映射删除成功');
          refreshData();
        } catch (error) {
          console.error('Failed to delete mapping:', error);
          showNotification('字段映射删除失败', 'error');
        }
      }
    );
  };

  const handleSaveMapping = () => {
    if (editingMapping) {
      handleUpdateMapping();
    } else {
      handleCreateMapping();
    }
  };

  return (
    <div className="mapping-manager">
      <div className="header-toolbar">
        <button onClick={() => {
          setEditingMapping(null);
          setNewMapping({ modelId: '', fieldId: '', propertyId: '' });
          setSelectedModel(null);
          setModelProperties([]);
          setIsModalOpen(true);
        }}>
          新建映射
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>数据源字段</th>
              <th>模型</th>
              <th>属性</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {mappings.length > 0 ? (
              mappings.map(mapping => {
                const model = allModels.find(m => m.id === mapping.modelId);
                // 需要从模型属性中查找属性名称
                return (
                  <tr key={mapping.id}>
                    <td>{mapping.fieldId}</td>
                    <td>{model?.name || `模型ID: ${mapping.modelId}`}</td>
                    <td>属性ID: {mapping.propertyId}</td>
                    <td>
                      <button className="edit" onClick={() => handleEditMapping(mapping)}>编辑</button>
                      <button className="delete" onClick={() => handleDeleteMapping(mapping.id)}>删除</button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                  暂无字段映射
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 新建/编辑映射模态框 */}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content" style={{ width: '600px' }}>
            <h2>{editingMapping ? '编辑字段映射' : '新建字段映射'}</h2>
            
            <div className="form-group">
              <label>数据源字段名 *</label>
              <input
                type="text"
                value={newMapping.fieldId}
                onChange={(e) => setNewMapping({ ...newMapping, fieldId: e.target.value })}
                placeholder="输入数据源中的字段名"
              />
            </div>

            <div className="form-group">
              <label>模型 *</label>
              <select
                value={newMapping.modelId}
                onChange={(e) => {
                  setNewMapping({ ...newMapping, modelId: e.target.value, propertyId: '' });
                  handleModelSelect(e.target.value);
                }}
              >
                <option value="">请选择模型</option>
                {allModels.map(model => (
                  <option key={model.id} value={model.id}>
                    {model.name} ({model.code})
                  </option>
                ))}
              </select>
            </div>

            {selectedModel && (
              <div className="form-group">
                <label>属性 *</label>
                <select
                  value={newMapping.propertyId}
                  onChange={(e) => setNewMapping({ ...newMapping, propertyId: e.target.value })}
                >
                  <option value="">请选择属性</option>
                  {modelProperties.map(prop => (
                    <option key={prop.id} value={prop.id}>
                      {prop.name} ({prop.code})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-actions">
              <button className="cancel" onClick={() => {
                setIsModalOpen(false);
                setEditingMapping(null);
                setNewMapping({ modelId: '', fieldId: '', propertyId: '' });
                setSelectedModel(null);
                setModelProperties([]);
              }}>
                取消
              </button>
              <button className="submit" onClick={handleSaveMapping}>
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MappingManager;

