/**
 * Datasource管理器 - 适配DDD API
 */
import React, { useState } from 'react';
import { datasourceAPI } from '../../../services/api';

const DatasourceManager = ({ 
  datasources,
  onRefresh,
  domainId
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDatasource, setEditingDatasource] = useState(null);
  const [datasourceData, setDatasourceData] = useState({
    name: '',
    type: 'mysql',
    url: '',
    username: '',
    password: '',
    description: ''
  });

  // 过滤数据源
  const filteredDatasources = datasources.filter(ds =>
    ds.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 处理创建Datasource
  const handleCreateDatasource = async () => {
    try {
      const dataToCreate = {
        ...datasourceData,
        domainId: domainId ? parseInt(domainId) : null
      };
      await datasourceAPI.create(dataToCreate);
      setIsModalOpen(false);
      resetForm();
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error('Failed to create datasource:', error);
      alert('数据源创建失败: ' + error.message);
    }
  };

  // 处理更新Datasource
  const handleUpdateDatasource = async () => {
    try {
      await datasourceAPI.update(editingDatasource.id, datasourceData);
      setIsModalOpen(false);
      resetForm();
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error('Failed to update datasource:', error);
      alert('数据源更新失败: ' + error.message);
    }
  };

  // 处理删除Datasource
  const handleDeleteDatasource = async (id) => {
    if (!confirm('确定要删除这个数据源吗？')) {
      return;
    }

    try {
      await datasourceAPI.delete(id);
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error('Failed to delete datasource:', error);
      alert('数据源删除失败: ' + error.message);
    }
  };

  // 处理切换状态
  const handleToggleStatus = async (id) => {
    try {
      await datasourceAPI.toggleStatus(id);
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error('Failed to toggle status:', error);
      alert('状态切换失败: ' + error.message);
    }
  };

  // 处理编辑Datasource
  const handleEditDatasource = (datasource) => {
    setEditingDatasource(datasource);
    setDatasourceData({
      name: datasource.name,
      type: datasource.type,
      url: datasource.url,
      username: datasource.username || '',
      password: '', // 不显示密码
      description: datasource.description || ''
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingDatasource(null);
    setDatasourceData({
      name: '',
      type: 'mysql',
      url: '',
      username: '',
      password: '',
      description: ''
    });
  };

  return (
    <div className="datasource-manager">
      <div className="header">
        <h2>数据源管理</h2>
        <div className="header-toolbar">
          <input
            type="text"
            placeholder="搜索数据源名称..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button onClick={() => { resetForm(); setIsModalOpen(true); }}>
            新建数据源
          </button>
        </div>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>名称</th>
            <th>类型</th>
            <th>URL</th>
            <th>状态</th>
            <th>描述</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {filteredDatasources.map(datasource => (
            <tr key={datasource.id}>
              <td>{datasource.name}</td>
              <td>{datasource.type}</td>
              <td>{datasource.url}</td>
              <td>
                <span className={`status ${datasource.status}`}>
                  {datasource.status === 'active' ? '激活' : '未激活'}
                </span>
              </td>
              <td>{datasource.description}</td>
              <td>
                <button onClick={() => handleEditDatasource(datasource)}>编辑</button>
                <button onClick={() => handleToggleStatus(datasource.id)}>
                  {datasource.status === 'active' ? '停用' : '激活'}
                </button>
                <button onClick={() => handleDeleteDatasource(datasource.id)}>删除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>{editingDatasource ? '编辑数据源' : '新建数据源'}</h3>
            
            <div className="form-group">
              <label>名称:</label>
              <input
                type="text"
                value={datasourceData.name}
                onChange={(e) => setDatasourceData({ ...datasourceData, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>类型:</label>
              <select
                value={datasourceData.type}
                onChange={(e) => setDatasourceData({ ...datasourceData, type: e.target.value })}
              >
                <option value="mysql">MySQL</option>
                <option value="postgresql">PostgreSQL</option>
                <option value="sqlserver">SQL Server</option>
                <option value="duckdb">DuckDB</option>
              </select>
            </div>

            <div className="form-group">
              <label>URL:</label>
              <input
                type="text"
                value={datasourceData.url}
                onChange={(e) => setDatasourceData({ ...datasourceData, url: e.target.value })}
                placeholder="mysql://localhost:3306/database"
              />
            </div>

            <div className="form-group">
              <label>用户名:</label>
              <input
                type="text"
                value={datasourceData.username}
                onChange={(e) => setDatasourceData({ ...datasourceData, username: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>密码:</label>
              <input
                type="password"
                value={datasourceData.password}
                onChange={(e) => setDatasourceData({ ...datasourceData, password: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>描述:</label>
              <textarea
                value={datasourceData.description}
                onChange={(e) => setDatasourceData({ ...datasourceData, description: e.target.value })}
                rows="3"
              />
            </div>

            <div className="form-actions">
              <button onClick={editingDatasource ? handleUpdateDatasource : handleCreateDatasource}>
                {editingDatasource ? '更新' : '创建'}
              </button>
              <button onClick={() => { setIsModalOpen(false); resetForm(); }}>
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatasourceManager;

