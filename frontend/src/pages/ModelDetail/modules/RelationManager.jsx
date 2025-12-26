import React from 'react';

const RelationManager = ({ 
  relations, 
  setRelations, 
  showNotification,
  showConfirmDialog,
  isRelationModalOpen, 
  setIsRelationModalOpen, 
  editingRelation, 
  setEditingRelation, 
  newRelation, 
  setNewRelation,
  allModels,
  viewMode,
  setViewMode
}) => {
  // 处理创建关系
  const handleCreateRelation = () => {
    fetch('/api/relation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRelation)
    })
      .then(response => response.json())
      .then(relation => {
        setRelations([...relations, relation]);
        setIsRelationModalOpen(false);
        setEditingRelation(null);
        setNewRelation({
          name: '',
          sourceModelId: '',
          targetModelId: '',
          type: 'one-to-many',
          description: ''
        });
        showNotification('关系创建成功');
      })
      .catch(error => {
        console.error('Failed to create relation:', error);
        showNotification('关系创建失败', 'error');
      });
  };

  // 处理编辑关系
  const handleEditRelation = (relation) => {
    setEditingRelation(relation);
    setNewRelation(relation);
    setIsRelationModalOpen(true);
  };

  // 处理更新关系
  const handleUpdateRelation = () => {
    fetch(`/api/relation/${editingRelation.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRelation)
    })
      .then(response => response.json())
      .then(updatedRelation => {
        setRelations(relations.map(r => r.id === updatedRelation.id ? updatedRelation : r));
        setIsRelationModalOpen(false);
        setEditingRelation(null);
        setNewRelation({
          name: '',
          sourceModelId: '',
          targetModelId: '',
          type: 'one-to-many',
          description: ''
        });
        showNotification('关系更新成功');
      })
      .catch(error => {
        console.error('Failed to update relation:', error);
        showNotification('关系更新失败', 'error');
      });
  };

  // 保存关系（创建或更新）
  const handleSaveRelation = () => {
    if (editingRelation) {
      handleUpdateRelation();
    } else {
      handleCreateRelation();
    }
  };

  // 处理删除关系
  const handleDeleteRelation = (id) => {
    showConfirmDialog(
      '删除确认',
      '确定要删除该关系吗？删除后无法恢复。',
      () => {
        fetch(`/api/relation/${id}`, { method: 'DELETE' })
          .then(() => {
            setRelations(relations.filter(relation => relation.id !== id));
            showNotification('关系删除成功');
          })
          .catch(error => {
            console.error('Failed to delete relation:', error);
            showNotification('关系删除失败', 'error');
          });
      }
    );
  };

  return (
    <div className="relation-manager">
      <div className="header-toolbar">
        <div>
          <button 
            onClick={() => {
              setEditingRelation(null);
              setNewRelation({
                name: '',
                sourceModelId: '',
                targetModelId: '',
                type: 'one-to-many',
                description: ''
              });
              setIsRelationModalOpen(true);
            }}
          >
            新建关系
          </button>
          <button 
            onClick={() => setViewMode(viewMode === 'table' ? 'card' : 'table')}
            className="view-toggle"
          >
            {viewMode === 'table' ? '卡片视图' : '表格视图'}
          </button>
        </div>
        <div>
          <input
            type="text"
            placeholder="搜索关系名称..."
            // 这里应该连接到搜索状态
            onChange={(e) => console.log('搜索关系:', e.target.value)}
          />
          <button onClick={() => console.log('导出关系')}>导出</button>
          <button onClick={() => console.log('导入关系')}>导入</button>
        </div>
      </div>
      
      {viewMode === 'table' ? (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>名称</th>
                <th>源模型</th>
                <th>目标模型</th>
                <th>类型</th>
                <th>描述</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {relations.map(relation => {
                const sourceModel = allModels.find(m => m.id === relation.sourceModelId);
                const targetModel = allModels.find(m => m.id === relation.targetModelId);
                
                return (
                  <tr key={relation.id}>
                    <td>{relation.name}</td>
                    <td>{sourceModel ? sourceModel.name : '未知模型'}</td>
                    <td>{targetModel ? targetModel.name : '未知模型'}</td>
                    <td>{relation.type}</td>
                    <td>{relation.description}</td>
                    <td>
                      <button className="edit" onClick={() => handleEditRelation(relation)}>编辑</button>
                      <button className="delete" onClick={() => handleDeleteRelation(relation.id)}>删除</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px', padding: '16px' }}>
          {relations.map(relation => {
            const sourceModel = allModels.find(m => m.id === relation.sourceModelId);
            const targetModel = allModels.find(m => m.id === relation.targetModelId);
            
            return (
              <div key={relation.id} className="card" style={{ padding: '16px', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h3>{relation.name}</h3>
                <p><strong>源模型:</strong> {sourceModel ? sourceModel.name : '未知模型'}</p>
                <p><strong>目标模型:</strong> {targetModel ? targetModel.name : '未知模型'}</p>
                <p><strong>类型:</strong> {relation.type}</p>
                <p><strong>描述:</strong> {relation.description}</p>
                <div className="card-actions" style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                  <button className="edit" onClick={() => handleEditRelation(relation)}>编辑</button>
                  <button className="delete" onClick={() => handleDeleteRelation(relation.id)}>删除</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RelationManager;