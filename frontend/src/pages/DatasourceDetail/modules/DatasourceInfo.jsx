import React, { useState, useEffect } from 'react';
import { datasourceAPI } from '../../../services/api';

/**
 * DatasourceInfo模块
 * 管理数据源的基本信息
 */
const DatasourceInfo = ({ 
  datasource, 
  setDatasource, 
  showNotification, 
  showConfirmDialog,
  refreshData 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedDatasource, setEditedDatasource] = useState(datasource);

  useEffect(() => {
    setEditedDatasource(datasource);
  }, [datasource]);

  const handleSave = async () => {
    try {
      const updated = await datasourceAPI.update(datasource.id, editedDatasource);
      setDatasource(updated);
      setIsEditing(false);
      showNotification('数据源更新成功');
      refreshData();
    } catch (error) {
      console.error('Failed to update datasource:', error);
      showNotification('数据源更新失败', 'error');
    }
  };

  const handleCancel = () => {
    setEditedDatasource(datasource);
    setIsEditing(false);
  };

  const handleTestConnection = async () => {
    try {
      const result = await datasourceAPI.testConnection(datasource.id);
      if (result.success) {
        showNotification('数据源连接测试成功');
      } else {
        showNotification(`数据源连接测试失败: ${result.message}`, 'error');
      }
    } catch (error) {
      console.error('Failed to test connection:', error);
      showNotification('数据源连接测试失败', 'error');
    }
  };

  const handleToggleStatus = async () => {
    try {
      const updated = await datasourceAPI.toggleStatus(datasource.id);
      setDatasource(updated);
      showNotification(updated.status === 'active' ? '数据源已启用' : '数据源已禁用');
      refreshData();
    } catch (error) {
      console.error('Failed to toggle status:', error);
      showNotification('操作失败', 'error');
    }
  };

  if (!datasource) {
    return <div>加载中...</div>;
  }

  return (
    <div className="datasource-info">
      <div className="header-toolbar">
        {!isEditing ? (
          <>
            <button onClick={() => setIsEditing(true)}>编辑</button>
            <button onClick={handleTestConnection}>测试连接</button>
            <button onClick={handleToggleStatus}>
              {datasource.status === 'active' ? '禁用' : '启用'}
            </button>
          </>
        ) : (
          <>
            <button onClick={handleSave}>保存</button>
            <button onClick={handleCancel}>取消</button>
          </>
        )}
      </div>

      <div className="info-form" style={{ padding: '20px' }}>
        <div className="form-group">
          <label>名称</label>
          {isEditing ? (
            <input
              type="text"
              value={editedDatasource.name || ''}
              onChange={(e) => setEditedDatasource({ ...editedDatasource, name: e.target.value })}
            />
          ) : (
            <div>{datasource.name}</div>
          )}
        </div>

        <div className="form-group">
          <label>类型</label>
          {isEditing ? (
            <select
              value={editedDatasource.type || 'mysql'}
              onChange={(e) => setEditedDatasource({ ...editedDatasource, type: e.target.value })}
            >
              <option value="mysql">MySQL</option>
              <option value="postgresql">PostgreSQL</option>
              <option value="sqlserver">SQL Server</option>
              <option value="duckdb">DuckDB</option>
            </select>
          ) : (
            <div>{datasource.type}</div>
          )}
        </div>

        <div className="form-group">
          <label>URL</label>
          {isEditing ? (
            <input
              type="text"
              value={editedDatasource.url || ''}
              onChange={(e) => setEditedDatasource({ ...editedDatasource, url: e.target.value })}
            />
          ) : (
            <div><code>{datasource.url}</code></div>
          )}
        </div>

        <div className="form-group">
          <label>用户名</label>
          {isEditing ? (
            <input
              type="text"
              value={editedDatasource.username || ''}
              onChange={(e) => setEditedDatasource({ ...editedDatasource, username: e.target.value })}
            />
          ) : (
            <div>{datasource.username || '-'}</div>
          )}
        </div>

        <div className="form-group">
          <label>状态</label>
          <div>
            <span className={`status-badge ${datasource.status === 'active' ? 'active' : 'inactive'}`}>
              {datasource.status === 'active' ? '启用' : '禁用'}
            </span>
          </div>
        </div>

        <div className="form-group">
          <label>描述</label>
          {isEditing ? (
            <textarea
              value={editedDatasource.description || ''}
              onChange={(e) => setEditedDatasource({ ...editedDatasource, description: e.target.value })}
              rows={4}
            />
          ) : (
            <div>{datasource.description || '-'}</div>
          )}
        </div>

        <div className="form-group">
          <label>创建时间</label>
          <div>{datasource.createdAt || '-'}</div>
        </div>

        <div className="form-group">
          <label>更新时间</label>
          <div>{datasource.updatedAt || '-'}</div>
        </div>
      </div>
    </div>
  );
};

export default DatasourceInfo;

