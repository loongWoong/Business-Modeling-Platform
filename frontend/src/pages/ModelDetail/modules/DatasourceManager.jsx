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
  onMappingClick,
  // 新增关联表功能相关属性
  domainDatasources,
  isTableAssociationModalOpen,
  setIsTableAssociationModalOpen,
  selectedDomainDatasource,
  setSelectedDomainDatasource,
  tablesInDatasource,
  setTablesInDatasource
}) => {
  // 数据库类型筛选状态
  const [selectedDatabaseType, setSelectedDatabaseType] = useState('');
  
  // 可用的数据库类型列表
  const databaseTypes = ['mysql', 'postgresql', 'oracle', 'sqlserver', 'mongodb', 'hive'];
  
  // 过滤后的数据源列表
  const filteredDomainDatasources = selectedDatabaseType 
    ? domainDatasources.filter(ds => ds.type === selectedDatabaseType)
    : domainDatasources;
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
    fetch(`/api/datasource/${datasource.id}/test`, {
      method: 'POST'
    })
      .then(response => response.json())
      .then(result => {
        if (result.success) {
          showNotification(`数据源 "${datasource.name}" 连接测试成功`);
        } else {
          showNotification(`数据源 "${datasource.name}" 连接测试失败: ${result.message}`, 'error');
        }
      })
      .catch(error => {
        console.error('Failed to test datasource connection:', error);
        showNotification(`数据源 "${datasource.name}" 连接测试失败`, 'error');
      });
  };

  // 获取并显示数据源的数据表列表
  const handleNavigateToTables = (datasource) => {
    fetch(`/api/datasource/${datasource.id}/tables`)
      .then(response => response.json())
      .then(result => {
        if (result.success) {
          // 这里可以添加显示数据表列表的逻辑，例如打开一个模态框
          console.log(`数据源 ${datasource.name} 的数据表列表:`, result.tables);
          showNotification(`数据源 "${datasource.name}" 包含 ${result.tables.length} 张表: ${result.tables.join(', ')}`);
        } else {
          showNotification(`获取数据源 "${datasource.name}" 的数据表列表失败: ${result.message}`, 'error');
        }
      })
      .catch(error => {
        console.error('Failed to get datasource tables:', error);
        showNotification(`获取数据源 "${datasource.name}" 的数据表列表失败`, 'error');
      });
  };

  return (
    <div className="datasource-manager">
      <div className="header-toolbar">
        <div>
          <button 
            onClick={() => {
              // 打开关联表选择模态框
              setIsTableAssociationModalOpen(true);
            }}
          >
            关联表
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
                  <td>
                    <span 
                      style={{ cursor: 'pointer', color: '#1890ff' }}
                      onClick={() => handleNavigateToTables(datasource)}
                    >
                      {datasource.name}
                    </span>
                  </td>
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
      
      {/* 关联表选择模态框 */}
      {isTableAssociationModalOpen && (
        <div className="modal">
          <div className="modal-content" style={{ width: '800px' }}>
            <h2>关联表</h2>
            <div style={{ display: 'flex', gap: '20px' }}>
              {/* 左侧：业务域数据源列表 */}
              <div style={{ flex: 1, border: '1px solid #e0e0e0', padding: '10px', borderRadius: '4px' }}>
                <h3>选择数据源</h3>
                
                {/* 数据库类型筛选 */}
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>数据库类型</label>
                  <select 
                    style={{ width: '100%', padding: '8px' }}
                    value={selectedDatabaseType}
                    onChange={(e) => {
                      setSelectedDatabaseType(e.target.value);
                      // 重置选择的数据源
                      setSelectedDomainDatasource(null);
                      setTablesInDatasource([]);
                    }}
                  >
                    <option value="">所有类型</option>
                    {databaseTypes.map(type => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <select 
                  style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
                  value={selectedDomainDatasource?.id || ''}
                  onChange={(e) => {
                    const datasourceId = parseInt(e.target.value);
                    const datasource = filteredDomainDatasources.find(ds => ds.id === datasourceId);
                    setSelectedDomainDatasource(datasource);
                    
                    // 查询数据源下的表列表
                    if (datasource) {
                      // 先检查数据源连通性
                      fetch(`/api/datasource/${datasource.id}/test-connection`)
                        .then(response => {
                          if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                          }
                          return response.json();
                        })
                        .then(connectionResult => {
                          if (connectionResult.success) {
                            // 连通性检查成功，获取表列表
                            return fetch(`/api/datasource/${datasource.id}/tables`);
                          } else {
                            throw new Error('数据源连接失败');
                          }
                        })
                        .then(response => {
                          if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                          }
                          return response.json();
                        })
                        .then(tableData => {
                          setTablesInDatasource(tableData);
                          showNotification('成功获取表列表');
                        })
                        .catch(error => {
                          console.error('Failed to fetch tables:', error);
                          // 失败时清空表列表并显示错误
                          setTablesInDatasource([]);
                          showNotification('获取表列表失败：' + error.message, 'error');
                        });
                    } else {
                      setTablesInDatasource([]);
                    }
                  }}
                >
                  <option value="">请选择数据源</option>
                  {filteredDomainDatasources.map(datasource => (
                    <option key={datasource.id} value={datasource.id}>
                      {datasource.name} ({datasource.type})
                    </option>
                  ))}
                </select>
                <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #e0e0e0', borderRadius: '4px', padding: '10px' }}>
                  <h4>数据源列表</h4>
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {filteredDomainDatasources.map(datasource => (
                      <li key={datasource.id} style={{ marginBottom: '8px', cursor: 'pointer', padding: '8px', borderRadius: '4px', backgroundColor: selectedDomainDatasource?.id === datasource.id ? '#e6f7ff' : 'transparent' }} 
                          onClick={() => {
                            setSelectedDomainDatasource(datasource);
                            // 查询数据源下的表列表
                            if (datasource) {
                              // 先检查数据源连通性
                              fetch(`/api/datasource/${datasource.id}/test-connection`)
                                .then(response => {
                                  if (!response.ok) {
                                    throw new Error(`HTTP error! status: ${response.status}`);
                                  }
                                  return response.json();
                                })
                                .then(connectionResult => {
                                  if (connectionResult.success) {
                                    // 连通性检查成功，获取表列表
                                    return fetch(`/api/datasource/${datasource.id}/tables`);
                                  } else {
                                    throw new Error('数据源连接失败');
                                  }
                                })
                                .then(response => {
                                  if (!response.ok) {
                                    throw new Error(`HTTP error! status: ${response.status}`);
                                  }
                                  return response.json();
                                })
                                .then(tableData => {
                                  setTablesInDatasource(tableData);
                                  showNotification('成功获取表列表');
                                })
                                .catch(error => {
                                  console.error('Failed to fetch tables:', error);
                                  // 失败时清空表列表并显示错误
                                  setTablesInDatasource([]);
                                  showNotification('获取表列表失败：' + error.message, 'error');
                                });
                            } else {
                              setTablesInDatasource([]);
                            }
                          }}
                      >
                        <div><strong>{datasource.name}</strong></div>
                        <div style={{ fontSize: '12px', color: '#666' }}>{datasource.type} - {datasource.url}</div>
                        <div style={{ fontSize: '12px', color: '#999' }}>{datasource.description}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {/* 右侧：数据源下的表列表 */}
              <div style={{ flex: 1, border: '1px solid #e0e0e0', padding: '10px', borderRadius: '4px' }}>
                <h3>选择表</h3>
                {selectedDomainDatasource ? (
                  <>
                    <div style={{ marginBottom: '10px', padding: '8px', backgroundColor: '#f0f2f5', borderRadius: '4px' }}>
                      <div><strong>当前数据源：</strong>{selectedDomainDatasource.name}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>{selectedDomainDatasource.type} - {selectedDomainDatasource.url}</div>
                    </div>
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      <table className="data-table" style={{ width: '100%' }}>
                        <thead>
                          <tr>
                            <th>表名</th>
                            <th>描述</th>
                            <th>操作</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tablesInDatasource.map(table => (
                            <tr key={table.id}>
                              <td>{table.name}</td>
                              <td>{table.description}</td>
                              <td>
                                <button 
                                  className="submit"
                                  onClick={() => {
                                    // 关联表逻辑：将选中的表关联到当前模型
                                    const newAssociation = {
                                      ...selectedDomainDatasource,
                                      tableName: table.name
                                    };
                                    // 添加到当前模型的数据源列表
                                    setDatasources([...datasources, newAssociation]);
                                    showNotification(`成功关联表 "${table.name}"`);
                                    setIsTableAssociationModalOpen(false);
                                  }}
                                >
                                  关联
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                    请先选择一个数据源
                  </div>
                )}
              </div>
            </div>
            <div className="form-actions" style={{ marginTop: '20px' }}>
              <button className="cancel" onClick={() => setIsTableAssociationModalOpen(false)}>取消</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatasourceManager;