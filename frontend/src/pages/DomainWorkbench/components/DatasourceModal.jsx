import React, { useRef } from 'react';
import { Modal, Form, Input, Select, Button } from 'antd';

const { Option } = Select;

const DatasourceModal = ({ 
  isDatasourceModalOpen, 
  editingDatasource, 
  newDatasource, 
  setNewDatasource, 
  handleSaveDatasource, 
  setIsDatasourceModalOpen, 
  setEditingDatasource 
}) => {
  const fileInputRef = useRef(null);
  
  const handleCancel = () => {
    setIsDatasourceModalOpen(false);
    setEditingDatasource(null);
    setNewDatasource({ 
      name: '', 
      type: 'mysql', 
      url: '', 
      username: '', 
      password: '', 
      tableName: '', 
      status: 'inactive', 
      description: '' 
    });
  };

  return (
    <Modal
      title={editingDatasource ? '编辑数据源' : '新建数据源'}
      open={isDatasourceModalOpen}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          取消
        </Button>,
        <Button key="submit" type="primary" onClick={handleSaveDatasource}>
          {editingDatasource ? '更新' : '保存'}
        </Button>
      ]}
      width={600}
    >
      <Form layout="vertical">
        <Form.Item
          label="名称 *"
          rules={[{ required: true, message: '请输入数据源名称' }]}
        >
          <Input
            value={newDatasource.name}
            onChange={(e) => setNewDatasource({ ...newDatasource, name: e.target.value })}
            placeholder="请输入数据源名称"
          />
        </Form.Item>
        
        <Form.Item
          label="类型 *"
          rules={[{ required: true, message: '请选择数据源类型' }]}
        >
          <Select
            value={newDatasource.type}
            onChange={(value) => setNewDatasource({ ...newDatasource, type: value, url: '' })}
            placeholder="请选择数据源类型"
          >
            <Option value="mysql">MySQL</Option>
            <Option value="postgresql">PostgreSQL</Option>
            <Option value="oracle">Oracle</Option>
            <Option value="sqlserver">SQL Server</Option>
            <Option value="mongodb">MongoDB</Option>
            <Option value="hive">Hive</Option>
            <Option value="sqlite">SQLite</Option>
            <Option value="duckdb">DuckDB</Option>
          </Select>
        </Form.Item>
        
        {/* 根据数据库类型动态显示不同的输入控件 */}
        {(newDatasource.type === 'sqlite' || newDatasource.type === 'duckdb') ? (
          <Form.Item
            label="文件路径 *"
            rules={[{ required: true, message: '请选择数据库文件' }]}
            help="请手动输入完整的文件路径，例如：C:/data/mydb.sqlite 或 /home/user/mydb.duckdb"
          >
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <Input
                value={newDatasource.url}
                onChange={(e) => setNewDatasource({ ...newDatasource, url: e.target.value })}
                placeholder="请输入完整的文件路径，例如：C:/data/mydb.sqlite 或 /home/user/mydb.duckdb"
                style={{ flex: 1 }}
              />
              <input
                type="file"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    // 在浏览器环境中，出于安全考虑，无法直接获取文件的完整路径
                    // 我们只能获取文件名，需要用户手动输入完整路径
                    // 这里我们将文件名设置到输入框，提示用户手动补全路径
                    setNewDatasource({ ...newDatasource, url: file.name });
                  }
                }}
              />
              <Button 
                type="default" 
                onClick={() => fileInputRef.current?.click()}
                style={{ cursor: 'pointer' }}
              >
                选择文件
              </Button>
            </div>
          </Form.Item>
        ) : (
          <>
            <Form.Item
              label="URL *"
              rules={[{ required: true, message: '请输入数据源连接URL' }]}
            >
              <Input
                value={newDatasource.url}
                onChange={(e) => setNewDatasource({ ...newDatasource, url: e.target.value })}
                placeholder="请输入数据源连接URL"
              />
            </Form.Item>
            
            <Form.Item
              label="用户名"
            >
              <Input
                value={newDatasource.username}
                onChange={(e) => setNewDatasource({ ...newDatasource, username: e.target.value })}
                placeholder="请输入数据源用户名"
              />
            </Form.Item>
            
            <Form.Item
              label="密码"
            >
              <Input.Password
                value={newDatasource.password}
                onChange={(e) => setNewDatasource({ ...newDatasource, password: e.target.value })}
                placeholder="请输入数据源密码"
              />
            </Form.Item>
          </>
        )}
        
        <Form.Item
          label="状态"
        >
          <Select
            value={newDatasource.status}
            onChange={(value) => setNewDatasource({ ...newDatasource, status: value })}
          >
            <Option value="active">启用</Option>
            <Option value="inactive">禁用</Option>
          </Select>
        </Form.Item>
        
        <Form.Item
          label="描述"
        >
          <Input.TextArea
            value={newDatasource.description}
            onChange={(e) => setNewDatasource({ ...newDatasource, description: e.target.value })}
            placeholder="请输入数据源描述"
            rows={3}
          />
        </Form.Item>
        {newDatasource.hasOwnProperty('domainId') && (
          <Form.Item label="Domain（可选）">
            <Select
              value={newDatasource.domainId}
              onChange={(value) => setNewDatasource({ ...newDatasource, domainId: value })}
              placeholder="选择Domain（可选）"
              allowClear
            >
              {/* Domain选项需要从父组件传入 */}
            </Select>
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default DatasourceModal;