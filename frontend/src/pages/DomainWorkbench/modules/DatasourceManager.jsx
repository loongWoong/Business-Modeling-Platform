import React from 'react';

const DatasourceManager = ({ 
  datasources,
  searchTerm,
  setSearchTerm,
  handleEditDatasource,
  handleDeleteDatasource,
  handleToggleDatasource,
  setIsDatasourceModalOpen,
  setEditingDatasource,
  setNewDatasource
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
              <th>表名</th>
              <th>状态</th>
              <th>描述</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredDatasources.length > 0 ? (
              filteredDatasources.map((datasource, index) => (
                <tr key={datasource.id}>
                  <td>{index + 1}</td>
                  <td>{datasource.name}</td>
                  <td>{datasource.type}</td>
                  <td><code>{datasource.url}</code></td>
                  <td>{datasource.tableName}</td>
                  <td>
                    <span className={`status-badge ${datasource.status === 'active' ? 'active' : 'inactive'}`}>
                      {datasource.status === 'active' ? '启用' : '禁用'}
                    </span>
                  </td>
                  <td>{datasource.description}</td>
                  <td>
                    <button className="edit" onClick={() => handleEditDatasource(datasource)}>编辑</button>
                    <button 
                      className={`toggle ${datasource.status === 'active' ? 'inactive' : 'active'}`} 
                      onClick={() => handleToggleDatasource(datasource.id)}
                    >
                      {datasource.status === 'active' ? '禁用' : '启用'}
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