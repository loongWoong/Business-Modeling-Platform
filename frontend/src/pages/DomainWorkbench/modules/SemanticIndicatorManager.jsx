import React, { useState } from 'react';
import Pagination from '../../../components/Pagination';

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
  setViewMode,
  setIsIndicatorModalOpen,
  setEditingIndicator,
  setNewIndicator,
  handleIndicatorExport,
  handleIndicatorImport
}) => {
  const filteredIndicators = semanticIndicators.filter(indicator => 
    indicator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    indicator.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // 计算分页数据
  const totalItems = filteredIndicators.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedIndicators = filteredIndicators.slice(startIndex, endIndex);
  
  // 重置到第一页当数据改变时
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filteredIndicators]);

  return (
    <>
      <div className="header-toolbar">
        <input
          type="text"
          placeholder="搜索语义/指标..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={() => {
          setEditingIndicator(null);
          setNewIndicator({ name: '', expression: '', returnType: 'number', description: '', status: 'draft', unit: '' });
          setIsIndicatorModalOpen(true);
        }}>新建指标</button>
        <button onClick={handleIndicatorImport}>导入</button>
        <button onClick={handleIndicatorExport}>导出</button>
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
              {paginatedIndicators.map(indicator => (
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
        <div className="card-list grid">
          {paginatedIndicators.map(indicator => (
            <div key={indicator.id} className="card">
              <h3>{indicator.name}</h3>
              <p>表达式: {indicator.expression}</p>
              <p>返回类型: {indicator.returnType}</p>
              <p>单位: {indicator.unit || '-'}</p>
              <p>描述: {indicator.description}</p>
              <p>状态: {
                indicator.status === 'published' ? '已发布' : 
                indicator.status === 'offline' ? '已下线' : '草稿'
              }</p>
              <div className="card-actions">
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

export default SemanticIndicatorManager;