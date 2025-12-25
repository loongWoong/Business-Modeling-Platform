import React, { useState, useEffect } from 'react';
import Pagination from '../../../components/Pagination';

const SharedAttributeManager = ({ 
  sharedAttributes, 
  searchTerm, 
  setSearchTerm, 
  handleEditAttr, 
  handleDeleteAttr,
  viewMode,
  setViewMode,
  handleAttrExport,
  handleAttrImport,
  setIsAttrModalOpen,
  setEditingAttr,
  setNewAttr
}) => {
  const filteredAttributes = sharedAttributes.filter(attr => 
    attr.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // 计算分页数据
  const totalItems = filteredAttributes.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedAttributes = filteredAttributes.slice(startIndex, endIndex);
  
  // 重置到第一页当数据改变时
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filteredAttributes]);

  return (
    <>
      <div className="header-toolbar">
        <input
          type="text"
          placeholder="搜索共享属性..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={() => {
          setEditingAttr(null);
          setNewAttr({ name: '', type: 'string', length: '', precision: '', description: '', valueRange: '' });
          setIsAttrModalOpen(true);
        }}>新建属性</button>
        <button onClick={handleAttrImport}>导入</button>
        <button onClick={handleAttrExport}>导出</button>
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
              {paginatedAttributes.map(attr => (
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
        <div className="card-list grid">
          {paginatedAttributes.map(attr => (
            <div key={attr.id} className="card">
              <h3>{attr.name}</h3>
              <p>类型: {attr.type}</p>
              <p>长度: {attr.length || '-'}</p>
              <p>精度: {attr.precision || '-'}</p>
              <p>描述: {attr.description}</p>
              <p>引用次数: {attr.referenceCount}</p>
              <div className="card-actions">
                <button className="edit" onClick={() => handleEditAttr(attr)}>编辑</button>
                <button className="delete" onClick={() => handleDeleteAttr(attr.id)}>删除</button>
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

export default SharedAttributeManager;