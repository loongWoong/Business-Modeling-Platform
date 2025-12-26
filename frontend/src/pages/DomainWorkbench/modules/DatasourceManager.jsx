import React from 'react';

/**
 * DatasourceManager模块
 * 
 * 在DomainWorkbench中使用，作为Domain的概览页面
 * 展示该Domain下的Datasources列表
 * 
 * 符合DDD聚合边界：
 * - Domain作为分类维度，不是聚合根
 * - Datasource聚合的管理应该在DatasourceDetail页面进行
 * - 这里只提供列表展示和跳转功能
 */
const DatasourceManager = ({ 
  datasources,
  searchTerm,
  setSearchTerm,
  handleEditDatasource,
  handleDeleteDatasource,
  handleToggleDatasource,
  handleTestDatasourceConnection,
  handleNavigateToTables,
  handleBindDatasource,
  setIsDatasourceModalOpen,
  setEditingDatasource,
  setNewDatasource,
  boundDatasourceId,
  navigate
}) => {
  // 过滤数据源
  const filteredDatasources = datasources.filter(datasource =>
    datasource.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="datasource-manager">
      <div className="header-toolbar">
        <input
          type="text"
          placeholder="搜索数据源名称..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button 
          className="create-button" 
          onClick={() => {
            setEditingDatasource(null);
            setNewDatasource({ name: '', type: 'mysql', url: '', tableName: '', status: 'inactive', description: '' });
            setIsDatasourceModalOpen(true);
          }}
        >
          新建数据源
        </button>
      </div>
      
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '20px' }}>#</th>
              <th>名称</th>
              <th>类型</th>
              <th>URL</th>
              <th>状态</th>
              <th>绑定状态</th>
              <th>描述</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredDatasources.length > 0 ? (
              filteredDatasources.map((datasource, index) => (
                <tr key={datasource.id}>
                  <td>{index + 1}</td>
                  <td>
                    <span 
                      style={{ cursor: 'pointer', color: '#1890ff' }}
                      onClick={() => {
                        // 跳转到数据源详情页（符合DDD聚合边界）
                        // Datasource聚合应该由DatasourceDetail管理
                        if (navigate) {
                          navigate(`/datasource/${datasource.id}`);
                        } else if (typeof window !== 'undefined' && window.location) {
                          window.location.href = `/datasource/${datasource.id}`;
                        }
                      }}
                    >
                      {datasource.name}
                    </span>
                  </td>
                  <td>{datasource.type}</td>
                  <td><code>{datasource.url}</code></td>
                  <td>
                    <span className={`status-badge ${datasource.status === 'active' ? 'active' : 'inactive'}`}>
                      {datasource.status === 'active' ? '启用' : '禁用'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${datasource.id === boundDatasourceId ? 'bound' : ''}`}>
                      {datasource.id === boundDatasourceId ? '已绑定全局' : '未绑定'}
                    </span>
                  </td>
                  <td>{datasource.description}</td>
                  <td>
                    <button className="edit" onClick={() => handleEditDatasource(datasource)}>编辑</button>
                    <button 
                      className="test" 
                      onClick={() => handleTestDatasourceConnection(datasource)}
                    >
                      测试
                    </button>
                    <button 
                      className={`toggle ${datasource.status === 'active' ? 'inactive' : 'active'}`} 
                      onClick={() => handleToggleDatasource(datasource.id)}
                    >
                      {datasource.status === 'active' ? '禁用' : '启用'}
                    </button>
                    <button 
                      className={datasource.id === boundDatasourceId ? 'unbind-btn' : 'bind-btn'} 
                      onClick={() => handleBindDatasource(datasource)}
                    >
                      {datasource.id === boundDatasourceId ? '解绑' : '绑定'}
                    </button>
                    <button className="delete" onClick={() => handleDeleteDatasource(datasource.id)}>删除</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
                  未找到数据源
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