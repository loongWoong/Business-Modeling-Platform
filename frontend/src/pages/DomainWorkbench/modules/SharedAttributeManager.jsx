import React from 'react';

const SharedAttributeManager = ({ 
  sharedAttributes, 
  searchTerm, 
  setSearchTerm, 
  handleEditAttr, 
  handleDeleteAttr,
  viewMode,
  setViewMode
}) => {
  const filteredAttributes = sharedAttributes.filter(attr => 
    attr.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="header-toolbar">
        <input
          type="text"
          placeholder="搜索共享属性..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={() => console.log('新建共享属性')}>新建属性</button>
        <button onClick={() => console.log('导入共享属性')}>导入</button>
        <button onClick={() => console.log('导出共享属性')}>导出</button>
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
                <th>类型</th>
                <th>长度</th>
                <th>精度</th>
                <th>描述</th>
                <th>引用次数</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttributes.map(attr => (
                <tr key={attr.id}>
                  <td>{attr.name}</td>
                  <td>{attr.type}</td>
                  <td>{attr.length || '-'}</td>
                  <td>{attr.precision || '-'}</td>
                  <td>{attr.description}</td>
                  <td>{attr.referenceCount}</td>
                  <td>
                    <button className="edit" onClick={() => handleEditAttr(attr)}>编辑</button>
                    <button className="delete" onClick={() => handleDeleteAttr(attr.id)}>删除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px', padding: '16px' }}>
          {filteredAttributes.map(attr => (
            <div key={attr.id} className="card" style={{ padding: '16px', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <h3>{attr.name}</h3>
              <p>类型: {attr.type}</p>
              <p>长度: {attr.length || '-'}</p>
              <p>精度: {attr.precision || '-'}</p>
              <p>描述: {attr.description}</p>
              <p>引用次数: {attr.referenceCount}</p>
              <div className="card-actions" style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                <button className="edit" onClick={() => handleEditAttr(attr)}>编辑</button>
                <button className="delete" onClick={() => handleDeleteAttr(attr.id)}>删除</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default SharedAttributeManager;