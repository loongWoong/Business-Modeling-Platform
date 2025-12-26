/**
 * Model管理器 - 适配DDD API
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { modelAPI } from '../../../services/api';

const ModelManager = ({ 
  models,
  onRefresh,
  domainId
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModel, setEditingModel] = useState(null);
  const [modelData, setModelData] = useState({
    name: '',
    code: '',
    description: '',
    domainId: null
  });

  // 过滤模型
  const filteredModels = models.filter(model =>
    model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 处理创建Model
  const handleCreateModel = async () => {
    try {
      const dataToCreate = {
        ...modelData,
        domainId: domainId ? parseInt(domainId) : null
      };
      await modelAPI.create(dataToCreate);
      setIsModalOpen(false);
      resetForm();
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error('Failed to create model:', error);
      alert('模型创建失败: ' + error.message);
    }
  };

  // 处理更新Model
  const handleUpdateModel = async () => {
    try {
      await modelAPI.update(editingModel.id, modelData);
      setIsModalOpen(false);
      resetForm();
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error('Failed to update model:', error);
      alert('模型更新失败: ' + error.message);
    }
  };

  // 处理删除Model
  const handleDeleteModel = async (id) => {
    if (!confirm('确定要删除这个模型吗？')) {
      return;
    }

    try {
      await modelAPI.delete(id);
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error('Failed to delete model:', error);
      alert('模型删除失败: ' + error.message);
    }
  };

  // 处理编辑Model
  const handleEditModel = (model) => {
    setEditingModel(model);
    setModelData({
      name: model.name,
      code: model.code,
      description: model.description || '',
      domainId: model.domainId
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingModel(null);
    setModelData({
      name: '',
      code: '',
      description: '',
      domainId: null
    });
  };

  return (
    <div className="model-manager">
      <div className="header">
        <h2>模型管理</h2>
        <div className="header-toolbar">
          <input
            type="text"
            placeholder="搜索模型名称..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button onClick={() => { resetForm(); setIsModalOpen(true); }}>
            新建模型
          </button>
          <button 
            onClick={() => setViewMode(viewMode === 'table' ? 'card' : 'table')}
            className="view-toggle"
          >
            {viewMode === 'table' ? '卡片视图' : '表格视图'}
          </button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <table className="data-table">
          <thead>
            <tr>
              <th>名称</th>
              <th>Code</th>
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
                <td>{model.code}</td>
                <td>{model.description}</td>
                <td>{model.creator || '-'}</td>
                <td>{model.updatedAt || '-'}</td>
                <td>
                  <button onClick={() => handleEditModel(model)}>编辑</button>
                  <button onClick={() => handleDeleteModel(model.id)}>删除</button>
                  <button onClick={() => navigate(`/model/${model.id}`)}>详情</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="card-list grid">
          {filteredModels.map(model => (
            <div 
              key={model.id} 
              className="card"
              onDoubleClick={() => navigate(`/model/${model.id}`)}
            >
              <h3>{model.name}</h3>
              <p>code: {model.code}</p>
              <p>描述: {model.description}</p>
              <div className="card-actions">
                <button onClick={() => handleEditModel(model)}>编辑</button>
                <button onClick={() => handleDeleteModel(model.id)}>删除</button>
                <button onClick={() => navigate(`/model/${model.id}`)}>详情</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>{editingModel ? '编辑模型' : '新建模型'}</h3>
            
            <div className="form-group">
              <label>名称:</label>
              <input
                type="text"
                value={modelData.name}
                onChange={(e) => setModelData({ ...modelData, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Code:</label>
              <input
                type="text"
                value={modelData.code}
                onChange={(e) => setModelData({ ...modelData, code: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>描述:</label>
              <textarea
                value={modelData.description}
                onChange={(e) => setModelData({ ...modelData, description: e.target.value })}
                rows="3"
              />
            </div>

            <div className="form-actions">
              <button onClick={editingModel ? handleUpdateModel : handleCreateModel}>
                {editingModel ? '更新' : '创建'}
              </button>
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

export default ModelManager;

