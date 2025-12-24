import React from 'react';

const DatasourceModal = ({ 
  isDatasourceModalOpen, 
  editingDatasource, 
  newDatasource, 
  setNewDatasource, 
  handleSaveDatasource, 
  setIsDatasourceModalOpen, 
  setEditingDatasource 
}) => {
  if (!isDatasourceModalOpen) {
    return null;
  }

  return (
    <div className="modal-overlay open">
      <div className="modal">
        <div className="modal-header">
          <h3>{editingDatasource ? '编辑数据源' : '新建数据源'}</h3>
          <button 
            className="close-button" 
            onClick={() => {
              setIsDatasourceModalOpen(false);
              setEditingDatasource(null);
              setNewDatasource({ name: '', type: 'mysql', url: '', tableName: '', status: 'inactive', description: '' });
            }}
          >
            ×
          </button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>名称</label>
            <input 
              type="text" 
              value={newDatasource.name} 
              onChange={(e) => setNewDatasource({ ...newDatasource, name: e.target.value })} 
              placeholder="请输入数据源名称"
              required
            />
          </div>
          
          <div className="form-group">
            <label>类型</label>
            <select 
              value={newDatasource.type} 
              onChange={(e) => setNewDatasource({ ...newDatasource, type: e.target.value })} 
            >
              <option value="mysql">MySQL</option>
              <option value="postgresql">PostgreSQL</option>
              <option value="oracle">Oracle</option>
              <option value="sqlserver">SQL Server</option>
              <option value="mongodb">MongoDB</option>
              <option value="hive">Hive</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>URL</label>
            <input 
              type="text" 
              value={newDatasource.url} 
              onChange={(e) => setNewDatasource({ ...newDatasource, url: e.target.value })} 
              placeholder="请输入数据源连接URL"
              required
            />
          </div>
          
          <div className="form-group">
            <label>表名</label>
            <input 
              type="text" 
              value={newDatasource.tableName} 
              onChange={(e) => setNewDatasource({ ...newDatasource, tableName: e.target.value })} 
              placeholder="请输入目标表名"
              required
            />
          </div>
          
          <div className="form-group">
            <label>状态</label>
            <select 
              value={newDatasource.status} 
              onChange={(e) => setNewDatasource({ ...newDatasource, status: e.target.value })} 
            >
              <option value="active">启用</option>
              <option value="inactive">禁用</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>描述</label>
            <textarea 
              value={newDatasource.description} 
              onChange={(e) => setNewDatasource({ ...newDatasource, description: e.target.value })} 
              placeholder="请输入数据源描述"
              rows={3}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button 
            className="cancel-button" 
            onClick={() => {
              setIsDatasourceModalOpen(false);
              setEditingDatasource(null);
              setNewDatasource({ name: '', type: 'mysql', url: '', tableName: '', status: 'inactive', description: '' });
            }}
          >
            取消
          </button>
          <button className="save-button" onClick={handleSaveDatasource}>
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

export default DatasourceModal;