import React from 'react';
import { useNavigate } from 'react-router-dom';

const ModelManager = ({ 
  filteredModels, 
  searchTerm, 
  setSearchTerm, 
  handleEditModel, 
  handleDeleteModel,
  viewMode,
  setViewMode
}) => {
  const navigate = useNavigate();

  return (
    <>
      <div className="header-toolbar">
        <input
          type="text"
          placeholder="搜索模型名称..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={() => navigate('/model/create')}>新建模型</button>
        <button onClick={() => console.log('导入模型')}>导入</button>
        <button onClick={() => console.log('导出模型')}>导出</button>
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
                <th>描述</th>
                <th>创建人</th>
                <th>更新时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredModels.map(model => (
                <tr key={model.id}>
                  <td>{model.name}</td>
                  <td>{model.description}</td>
                  <td>{model.creator}</td>
                  <td>{model.updatedAt}</td>
                  <td>
                    <button className="edit" onClick={() => handleEditModel(model)}>编辑</button>
                    <button className="delete" onClick={() => handleDeleteModel(model.id)}>删除</button>
                    <button onClick={() => navigate(`/model/${model.id}`)}>详情</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px', padding: '16px' }}>
          {filteredModels.map(model => (
            <div 
              key={model.id} 
              className="card"
              onDoubleClick={() => navigate(`/model/${model.id}`)}
              style={{ padding: '16px', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
            >
              <h3>{model.name}</h3>
              <p>描述: {model.description}</p>
              <p>创建人: {model.creator}</p>
              <p>更新时间: {model.updatedAt}</p>
              <div className="card-actions" style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                <button className="edit" onClick={(e) => {
                  e.stopPropagation();
                  handleEditModel(model);
                }}>编辑</button>
                <button className="delete" onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteModel(model.id);
                }}>删除</button>
                <button onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/model/${model.id}`);
                }}>详情</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default ModelManager;