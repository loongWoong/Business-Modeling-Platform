import React from 'react';

const SemanticIndicatorManager = ({ 
  semanticIndicators, 
  searchTerm, 
  setSearchTerm, 
  handleEditIndicator, 
  handleDeleteIndicator, 
  handlePublishIndicator, 
  handleOfflineIndicator, 
  handleCopyIndicator,
  viewMode,
  setViewMode
}) => {
  const filteredIndicators = semanticIndicators.filter(indicator => 
    indicator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    indicator.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="header-toolbar">
        <input
          type="text"
          placeholder="搜索语义/指标..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={() => console.log('新建指标')}>新建指标</button>
        <button onClick={() => console.log('导入指标')}>导入</button>
        <button onClick={() => console.log('导出指标')}>导出</button>
        <button 
          onClick={() => setViewMode(viewMode === 'table' ? 'card' : 'table')}
          className="view-toggle"
        >
          {viewMode === 'table' ? '卡片视图' : '表格视图'}
        </button>
      </div>
      
      {viewMode === 'table' ? (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>名称</th>
                <th>表达式</th>
                <th>返回类型</th>
                <th>单位</th>
                <th>描述</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredIndicators.map(indicator => (
                <tr key={indicator.id}>
                  <td>{indicator.name}</td>
                  <td>{indicator.expression}</td>
                  <td>{indicator.returnType}</td>
                  <td>{indicator.unit || '-'}</td>
                  <td>{indicator.description}</td>
                  <td>
                    {indicator.status === 'published' ? '已发布' : 
                     indicator.status === 'offline' ? '已下线' : '草稿'}
                  </td>
                  <td>
                    <button className="edit" onClick={() => handleEditIndicator(indicator)}>编辑</button>
                    {indicator.status === 'draft' && (
                      <button onClick={() => handlePublishIndicator(indicator.id)}>发布</button>
                    )}
                    {indicator.status === 'published' && (
                      <button onClick={() => handleOfflineIndicator(indicator.id)}>下线</button>
                    )}
                    <button onClick={() => handleCopyIndicator(indicator)}>复制</button>
                    <button className="delete" onClick={() => handleDeleteIndicator(indicator.id)}>删除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px', padding: '16px' }}>
          {filteredIndicators.map(indicator => (
            <div key={indicator.id} className="card" style={{ padding: '16px', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <h3>{indicator.name}</h3>
              <p>表达式: {indicator.expression}</p>
              <p>返回类型: {indicator.returnType}</p>
              <p>单位: {indicator.unit || '-'}</p>
              <p>描述: {indicator.description}</p>
              <p>状态: {
                indicator.status === 'published' ? '已发布' : 
                indicator.status === 'offline' ? '已下线' : '草稿'
              }</p>
              <div className="card-actions" style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                <button className="edit" onClick={() => handleEditIndicator(indicator)}>编辑</button>
                {indicator.status === 'draft' && (
                  <button onClick={() => handlePublishIndicator(indicator.id)}>发布</button>
                )}
                {indicator.status === 'published' && (
                  <button onClick={() => handleOfflineIndicator(indicator.id)}>下线</button>
                )}
                <button onClick={() => handleCopyIndicator(indicator)}>复制</button>
                <button className="delete" onClick={() => handleDeleteIndicator(indicator.id)}>删除</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default SemanticIndicatorManager;