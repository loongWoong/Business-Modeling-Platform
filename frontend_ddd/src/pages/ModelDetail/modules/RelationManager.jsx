/**
 * Relation管理器 - 适配DDD API
 * 通过Model聚合根操作Relation
 */
import React, { useState } from 'react';
import { modelAPI } from '../../../services/api';

const RelationManager = ({ 
  model, 
  relations, 
  setRelations,
  onRefresh
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRelation, setEditingRelation] = useState(null);
  const [relationData, setRelationData] = useState({
    name: '',
    sourceModelId: model.id,
    targetModelId: '',
    type: 'one-to-many',
    description: '',
    enabled: true,
  });

  // 处理创建Relation
  const handleCreateRelation = async () => {
    try {
      // 新API：通过Model聚合根添加Relation
      const newRelation = await modelAPI.addRelation(relationData);
      
      setRelations([...relations, newRelation]);
      setIsModalOpen(false);
      resetForm();
      
      // 刷新完整数据
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error('Failed to create relation:', error);
      alert('关系创建失败: ' + error.message);
    }
  };

  // 处理删除Relation
  const handleDeleteRelation = async (relationId) => {
    if (!confirm('确定要删除这个关系吗？')) {
      return;
    }

    try {
      // 新API：通过Model聚合根删除Relation
      await modelAPI.removeRelation(relationId);
      
      setRelations(relations.filter(r => r.id !== relationId));
      
      // 刷新完整数据
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error('Failed to delete relation:', error);
      alert('关系删除失败: ' + error.message);
    }
  };

  const resetForm = () => {
    setEditingRelation(null);
    setRelationData({
      name: '',
      sourceModelId: model.id,
      targetModelId: '',
      type: 'one-to-many',
      description: '',
      enabled: true,
    });
  };

  return (
    <div className="relation-manager">
      <div className="header">
        <h2>关系管理</h2>
        <button onClick={() => { resetForm(); setIsModalOpen(true); }}>
          添加关系
        </button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>名称</th>
            <th>源模型</th>
            <th>目标模型</th>
            <th>类型</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {relations.map(relation => (
            <tr key={relation.id}>
              <td>{relation.name}</td>
              <td>{relation.sourceModelId}</td>
              <td>{relation.targetModelId}</td>
              <td>{relation.type}</td>
              <td>{relation.enabled ? '启用' : '禁用'}</td>
              <td>
                <button onClick={() => handleDeleteRelation(relation.id)}>删除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>添加关系</h3>
            
            <div className="form-group">
              <label>名称:</label>
              <input
                type="text"
                value={relationData.name}
                onChange={(e) => setRelationData({ ...relationData, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>目标模型ID:</label>
              <input
                type="number"
                value={relationData.targetModelId}
                onChange={(e) => setRelationData({ ...relationData, targetModelId: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>类型:</label>
              <select
                value={relationData.type}
                onChange={(e) => setRelationData({ ...relationData, type: e.target.value })}
              >
                <option value="one-to-one">One-to-One</option>
                <option value="one-to-many">One-to-Many</option>
                <option value="many-to-one">Many-to-One</option>
                <option value="many-to-many">Many-to-Many</option>
              </select>
            </div>

            <div className="form-actions">
              <button onClick={handleCreateRelation}>创建</button>
              <button onClick={() => { setIsModalOpen(false); resetForm(); }}>
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RelationManager;

