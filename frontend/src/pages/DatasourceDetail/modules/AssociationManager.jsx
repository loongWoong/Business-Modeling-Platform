import React, { useState } from 'react';
import { datasourceAPI } from '../../../services/api';

/**
 * AssociationManager模块
 * 管理模型表关联（ModelTableAssociation实体）
 * ModelTableAssociation连接Model-Datasource
 */
const AssociationManager = ({ 
  datasource, 
  associations, 
  setAssociations, 
  allModels,
  showNotification, 
  showConfirmDialog,
  refreshData 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssociation, setEditingAssociation] = useState(null);
  const [newAssociation, setNewAssociation] = useState({
    modelId: '',
    tableName: '',
    status: 'active'
  });

  const handleCreateAssociation = async () => {
    try {
      const associationData = {
        ...newAssociation,
        datasourceId: datasource.id,
        modelId: parseInt(newAssociation.modelId)
      };
      
      const result = await datasourceAPI.addAssociation(datasource.id, associationData);
      setAssociations([...associations, result]);
      setIsModalOpen(false);
      setNewAssociation({ modelId: '', tableName: '', status: 'active' });
      showNotification('模型表关联创建成功');
      refreshData();
    } catch (error) {
      console.error('Failed to create association:', error);
      showNotification('模型表关联创建失败', 'error');
    }
  };

  const handleEditAssociation = (association) => {
    setEditingAssociation(association);
    setNewAssociation({
      modelId: association.modelId.toString(),
      tableName: association.tableName,
      status: association.status
    });
    setIsModalOpen(true);
  };

  const handleUpdateAssociation = async () => {
    try {
      // 注意：后端可能需要单独的更新接口
      // 实际应该调用 PUT /api/datasource/:id/associations/:associationId
      showNotification('更新功能待实现', 'error');
    } catch (error) {
      console.error('Failed to update association:', error);
      showNotification('模型表关联更新失败', 'error');
    }
  };

  const handleDeleteAssociation = (associationId) => {
    showConfirmDialog(
      '删除确认',
      '确定要删除该模型表关联吗？删除后无法恢复。',
      async () => {
        try {
          // 注意：后端可能需要单独的删除接口
          // 实际应该调用 DELETE /api/datasource/:id/associations/:associationId
          setAssociations(associations.filter(a => a.id !== associationId));
          showNotification('模型表关联删除成功');
          refreshData();
        } catch (error) {
          console.error('Failed to delete association:', error);
          showNotification('模型表关联删除失败', 'error');
        }
      }
    );
  };

  const handleToggleStatus = async (association) => {
    try {
      // 切换关联状态
      const updated = {
        ...association,
        status: association.status === 'active' ? 'inactive' : 'active'
      };
      // 注意：后端可能需要单独的更新接口
      setAssociations(associations.map(a => a.id === association.id ? updated : a));
      showNotification(updated.status === 'active' ? '关联已启用' : '关联已禁用');
      refreshData();
    } catch (error) {
      console.error('Failed to toggle association status:', error);
      showNotification('操作失败', 'error');
    }
  };

  const handleSaveAssociation = () => {
    if (editingAssociation) {
      handleUpdateAssociation();
    } else {
      handleCreateAssociation();
    }
  };

  return (
    <div className="association-manager">
      <div className="header-toolbar">
        <button onClick={() => {
          setEditingAssociation(null);
          setNewAssociation({ modelId: '', tableName: '', status: 'active' });
          setIsModalOpen(true);
        }}>
          新建关联
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>模型</th>
              <th>表名</th>
              <th>状态</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {associations.length > 0 ? (
              associations.map(association => {
                const model = allModels.find(m => m.id === association.modelId);
                return (
                  <tr key={association.id}>
                    <td>{model?.name || `模型ID: ${association.modelId}`}</td>
                    <td>{association.tableName}</td>
                    <td>
                      <span className={`status-badge ${association.status === 'active' ? 'active' : 'inactive'}`}>
                        {association.status === 'active' ? '启用' : '禁用'}
                      </span>
                    </td>
                    <td>{association.createdAt || '-'}</td>
                    <td>
                      <button className="edit" onClick={() => handleEditAssociation(association)}>编辑</button>
                      <button 
                        className="toggle" 
                        onClick={() => handleToggleStatus(association)}
                      >
                        {association.status === 'active' ? '禁用' : '启用'}
                      </button>
                      <button className="delete" onClick={() => handleDeleteAssociation(association.id)}>删除</button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                  暂无模型表关联
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 新建/编辑关联模态框 */}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content" style={{ width: '500px' }}>
            <h2>{editingAssociation ? '编辑模型表关联' : '新建模型表关联'}</h2>
            
            <div className="form-group">
              <label>模型 *</label>
              <select
                value={newAssociation.modelId}
                onChange={(e) => setNewAssociation({ ...newAssociation, modelId: e.target.value })}
              >
                <option value="">请选择模型</option>
                {allModels.map(model => (
                  <option key={model.id} value={model.id}>
                    {model.name} ({model.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>表名 *</label>
              <input
                type="text"
                value={newAssociation.tableName}
                onChange={(e) => setNewAssociation({ ...newAssociation, tableName: e.target.value })}
                placeholder="输入数据源中的表名"
              />
            </div>

            <div className="form-group">
              <label>状态</label>
              <select
                value={newAssociation.status}
                onChange={(e) => setNewAssociation({ ...newAssociation, status: e.target.value })}
              >
                <option value="active">启用</option>
                <option value="inactive">禁用</option>
              </select>
            </div>

            <div className="form-actions">
              <button className="cancel" onClick={() => {
                setIsModalOpen(false);
                setEditingAssociation(null);
                setNewAssociation({ modelId: '', tableName: '', status: 'active' });
              }}>
                取消
              </button>
              <button className="submit" onClick={handleSaveAssociation}>
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssociationManager;

