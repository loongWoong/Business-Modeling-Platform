import React from 'react';

const RelationManager = ({ 
  relations, 
  searchTerm, 
  setSearchTerm, 
  handleEditRelation, 
  handleDeleteRelation, 
  handleToggleRelation,
  viewMode,
  setViewMode
}) => {
  const filteredRelations = relations.filter(relation => 
    relation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    relation.sourceModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
    relation.targetModel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="header-toolbar">
        <input
          type="text"
          placeholder="搜索关系..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={() => console.log('新建关系')}>新建关系</button>
        <button onClick={() => console.log('导入关系')}>导入</button>
        <button onClick={() => console.log('导出关系')}>导出</button>
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
                <th>关系</th>
                <th>类型</th>
                <th>描述</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredRelations.map(relation => (
                <tr key={relation.id}>
                  <td>{relation.name}</td>
                  <td>{relation.sourceModel} → {relation.targetModel}</td>
                  <td>{relation.type}</td>
                  <td>{relation.description}</td>
                  <td>{relation.enabled ? '启用' : '禁用'}</td>
                  <td>
                    <button className="edit" onClick={() => handleEditRelation(relation)}>编辑</button>
                    <button className={relation.enabled ? 'delete' : 'edit'} onClick={() => handleToggleRelation(relation.id)}>
                      {relation.enabled ? '禁用' : '启用'}
                    </button>
                    <button className="delete" onClick={() => handleDeleteRelation(relation.id)}>删除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px', padding: '16px' }}>
          {filteredRelations.map(relation => (
            <div key={relation.id} className="card" style={{ padding: '16px', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <h3>{relation.name}</h3>
              <p>关系: {relation.sourceModel} → {relation.targetModel}</p>
              <p>类型: {relation.type}</p>
              <p>描述: {relation.description}</p>
              <p>状态: {relation.enabled ? '启用' : '禁用'}</p>
              <div className="card-actions" style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                <button className="edit" onClick={() => handleEditRelation(relation)}>编辑</button>
                <button className={relation.enabled ? 'delete' : 'edit'} onClick={() => handleToggleRelation(relation.id)}>
                  {relation.enabled ? '禁用' : '启用'}
                </button>
                <button className="delete" onClick={() => handleDeleteRelation(relation.id)}>删除</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default RelationManager;