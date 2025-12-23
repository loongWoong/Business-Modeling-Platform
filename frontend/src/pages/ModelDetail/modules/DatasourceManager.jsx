import React, { useState } from 'react';

const DatasourceManager = ({ 
  datasources, 
  setDatasources, 
  showNotification,
  showConfirmDialog,
  isDatasourceModalOpen, 
  setIsDatasourceModalOpen, 
  editingDatasource, 
  setEditingDatasource, 
  newDatasource, 
  setNewDatasource,
  onMappingClick
}) => {
  // 处理创建数据源
  const handleCreateDatasource = () => {
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
  };

  // 处理编辑数据源
  const handleEditDatasource = (datasource) => {
    setEditingDatasource(datasource);
    setNewDatasource(datasource);
    setIsDatasourceModalOpen(true);
  };

  // 处理更新数据源
  const handleUpdateDatasource = () => {
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
  };

  // 保存数据源（创建或更新）
  const handleSaveDatasource = () => {
    if (editingDatasource) {
      handleUpdateDatasource();
    } else {
      handleCreateDatasource();
    }
  };

  // 处理删除数据源
  const handleDeleteDatasource = (id) => {
    showConfirmDialog(
      '删除确认',
      '确定要删除该数据源吗？删除后无法恢复。',
      () => {
        fetch(`/api/datasource/${id}`, { method: 'DELETE' })
          .then(() => {
            setDatasources(datasources.filter(datasource => datasource.id !== id));
            showNotification('数据源删除成功');
          })
          .catch(error => {
            console.error('Failed to delete datasource:', error);
            showNotification('数据源删除失败', 'error');
          });
      }
    );
  };

  // 测试数据源连接
  const handleTestConnection = (datasource) => {
    // 模拟测试连接
    setTimeout(() => {
      showNotification(`数据源 "${datasource.name}" 连接测试成功`);
    }, 1000);
  };

  return (
    <div className="datasource-manager">
      <div className="header-toolbar">
        <div>
          <button 
            onClick={() => {
              setEditingDatasource(null);
              setNewDatasource({
                name: '',
                type: 'mysql',
                url: '',
                tableName: '',
                status: 'inactive',
                description: ''
              });
              setIsDatasourceModalOpen(true);
            }}
          >
            新建数据源
          </button>
        </div>
        <div>
          <input
            type="text"
            placeholder="搜索数据源名称..."
            onChange={(e) => console.log('搜索数据源:', e.target.value)}
          />
          <button onClick={() => console.log('导出数据源')}>导出</button>
          <button onClick={() => console.log('导入数据源')}>导入</button>
        </div>
      </div>
      
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>名称</th>
              <th>类型</th>
              <th>URL</th>
              <th>表名/主题</th>
              <th>状态</th>
              <th>描述</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {datasources && datasources.length > 0 ? (
              datasources.map(datasource => (
                <tr key={datasource.id}>
                  <td>{datasource.name}</td>
                  <td>{datasource.type}</td>
                  <td>{datasource.url}</td>
                  <td>{datasource.tableName}</td>
                  <td>
                    <span className={`status-badge ${datasource.status}`}>
                      {datasource.status === 'active' ? '活跃' : '非活跃'}
                    </span>
                  </td>
                  <td>{datasource.description}</td>
                  <td>
                    <button className="edit" onClick={() => handleEditDatasource(datasource)}>编辑</button>
                    <button className="test" onClick={() => handleTestConnection(datasource)}>测试</button>
                    <button className="mapping" onClick={() => onMappingClick && onMappingClick(datasource)}>映射</button>
                    <button className="delete" onClick={() => handleDeleteDatasource(datasource.id)}>删除</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                  暂无数据源
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DatasourceManager;