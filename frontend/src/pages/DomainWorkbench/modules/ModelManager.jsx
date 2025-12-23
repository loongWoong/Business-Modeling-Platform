import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Pagination from '../../../components/Pagination';

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
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // 计算分页数据
  const totalItems = filteredModels.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedModels = filteredModels.slice(startIndex, endIndex);
  
  // 重置到第一页当数据改变时
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filteredModels]);

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
              {paginatedModels.map(model => (
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
        <div className="card-list grid">
          {paginatedModels.map(model => (
            <div 
              key={model.id} 
              className="card"
              onDoubleClick={() => navigate(`/model/${model.id}`)}
            >
              <h3>{model.name}</h3>
              <p>描述: {model.description}</p>
              <p>创建人: {model.creator}</p>
              <p>更新时间: {model.updatedAt}</p>
              <div className="card-actions">
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
      
      {/* 分页组件 */}
      {totalItems > pageSize && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageSizeChange={setPageSize}
        />
      )}
    </>
  );
};

export default ModelManager;