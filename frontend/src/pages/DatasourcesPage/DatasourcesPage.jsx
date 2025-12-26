import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Modal, Form, Input, Select, InputNumber, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { datasourceAPI, domainAPI } from '../../services/api';

const { Option } = Select;

// 扩展DatasourceModal以支持Domain选择
const ExtendedDatasourceModal = ({ domains, ...props }) => {
  const fileInputRef = useRef(null);
  const [localDatasource, setLocalDatasource] = useState(props.newDatasource);
  
  useEffect(() => {
    setLocalDatasource(props.newDatasource);
  }, [props.newDatasource]);

  const handleDatasourceChange = (updates) => {
    const updated = { ...localDatasource, ...updates };
    setLocalDatasource(updated);
    props.setNewDatasource(updated);
  };

  const handleCancel = () => {
    props.setIsDatasourceModalOpen(false);
    props.setEditingDatasource(null);
    props.setNewDatasource({
      name: '',
      type: 'mysql',
      url: '',
      username: '',
      password: '',
      tableName: '',
      status: 'inactive',
      description: '',
      domainId: null
    });
  };

  return (
    <Modal
      title={props.editingDatasource ? '编辑数据源' : '新建数据源'}
      open={props.isDatasourceModalOpen}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          取消
        </Button>,
        <Button key="submit" type="primary" onClick={props.handleSaveDatasource}>
          {props.editingDatasource ? '更新' : '保存'}
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
            value={localDatasource.name}
            onChange={(e) => handleDatasourceChange({ name: e.target.value })}
            placeholder="请输入数据源名称"
          />
        </Form.Item>
        
        <Form.Item
          label="类型 *"
          rules={[{ required: true, message: '请选择数据源类型' }]}
        >
          <Select
            value={localDatasource.type}
            onChange={(value) => handleDatasourceChange({ type: value, url: '' })}
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
        
        {(localDatasource.type === 'sqlite' || localDatasource.type === 'duckdb') ? (
          <Form.Item
            label="文件路径 *"
            rules={[{ required: true, message: '请选择数据库文件' }]}
            help="请手动输入完整的文件路径，例如：C:/data/mydb.sqlite 或 /home/user/mydb.duckdb"
          >
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <Input
                value={localDatasource.url}
                onChange={(e) => handleDatasourceChange({ url: e.target.value })}
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
                    handleDatasourceChange({ url: file.name });
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
                value={localDatasource.url}
                onChange={(e) => handleDatasourceChange({ url: e.target.value })}
                placeholder="请输入数据源连接URL"
              />
            </Form.Item>
            
            <Form.Item label="用户名">
              <Input
                value={localDatasource.username}
                onChange={(e) => handleDatasourceChange({ username: e.target.value })}
                placeholder="请输入数据源用户名"
              />
            </Form.Item>
            
            <Form.Item label="密码">
              <Input.Password
                value={localDatasource.password}
                onChange={(e) => handleDatasourceChange({ password: e.target.value })}
                placeholder="请输入数据源密码"
              />
            </Form.Item>
          </>
        )}
        
        <Form.Item label="状态">
          <Select
            value={localDatasource.status}
            onChange={(value) => handleDatasourceChange({ status: value })}
          >
            <Option value="active">启用</Option>
            <Option value="inactive">禁用</Option>
          </Select>
        </Form.Item>
        
        <Form.Item label="Domain（可选）">
          <Select
            value={localDatasource.domainId}
            onChange={(value) => handleDatasourceChange({ domainId: value })}
            placeholder="选择Domain（可选）"
            allowClear
          >
            {domains.map(domain => (
              <Option key={domain.id} value={domain.id}>
                {domain.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        
        <Form.Item label="描述">
          <Input.TextArea
            value={localDatasource.description}
            onChange={(e) => handleDatasourceChange({ description: e.target.value })}
            placeholder="请输入数据源描述"
            rows={3}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

/**
 * DatasourcesPage - 数据源聚合列表页面
 * 
 * 显示所有Datasource聚合，支持：
 * - 查看所有数据源（跨Domain）
 * - 点击数据源跳转到DatasourceDetail
 * - 按Domain筛选
 * - 搜索数据源
 * - 新建数据源
 */
const DatasourcesPage = () => {
  const navigate = useNavigate();
  const [datasources, setDatasources] = useState([]);
  const [domains, setDomains] = useState([]);
  const [selectedDomainId, setSelectedDomainId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('table'); // table or card
  
  // 新建数据源相关状态
  const [isDatasourceModalOpen, setIsDatasourceModalOpen] = useState(false);
  const [editingDatasource, setEditingDatasource] = useState(null);
  const [newDatasource, setNewDatasource] = useState({
    name: '',
    type: 'mysql',
    url: '',
    username: '',
    password: '',
    tableName: '',
    status: 'inactive',
    description: '',
    domainId: null
  });

  useEffect(() => {
    loadData();
  }, [selectedDomainId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // 加载所有Domain
      const domainData = await domainAPI.getAll();
      const domainsList = Array.isArray(domainData) ? domainData : (domainData.domains || []);
      setDomains(domainsList);

      // 加载所有Datasource（可选domainId过滤）
      const datasourceData = await datasourceAPI.getAll(selectedDomainId);
      const datasourcesList = Array.isArray(datasourceData) ? datasourceData : [];
      setDatasources(datasourcesList);
    } catch (error) {
      console.error('Failed to load datasources:', error);
    } finally {
      setLoading(false);
    }
  };

  // 过滤数据源
  const filteredDatasources = datasources.filter(datasource => {
    const matchesSearch = datasource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (datasource.type && datasource.type.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  // 获取数据源所属的Domain名称
  const getDomainName = (domainId) => {
    if (!domainId) return '未分类';
    const domain = domains.find(d => d.id === domainId);
    return domain ? domain.name : `域ID: ${domainId}`;
  };

  // 处理新建数据源
  const handleCreateDatasource = async () => {
    try {
      if (!newDatasource.name || !newDatasource.type) {
        message.error('请填写数据源名称和类型');
        return;
      }
      
      const datasourceData = {
        name: newDatasource.name,
        type: newDatasource.type,
        url: newDatasource.url || '',
        username: newDatasource.username || '',
        password: newDatasource.password || '',
        tableName: newDatasource.tableName || '',
        status: newDatasource.status || 'inactive',
        description: newDatasource.description || '',
        domainId: newDatasource.domainId ? parseInt(newDatasource.domainId) : null,
        modelId: null
      };
      
      const datasource = await datasourceAPI.create(datasourceData);
      setDatasources([...datasources, datasource]);
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
        description: '',
        domainId: null
      });
      message.success('数据源创建成功');
      loadData(); // 重新加载数据
    } catch (error) {
      console.error('Failed to create datasource:', error);
      message.error('数据源创建失败：' + (error.message || '未知错误'));
    }
  };

  // 处理保存数据源（创建或更新）
  const handleSaveDatasource = () => {
    if (editingDatasource) {
      // 更新功能可以后续添加
      message.warning('编辑功能暂未实现，请到数据源详情页进行编辑');
    } else {
      handleCreateDatasource();
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <div>加载中...</div>
      </div>
    );
  }

  return (
    <div className="datasources-page">
      {/* 面包屑导航 */}
      <div style={{ padding: '12px 16px', backgroundColor: '#f0f2f5', borderBottom: '1px solid #e0e0e0' }}>
        <span 
          style={{ cursor: 'pointer', color: '#1890ff', marginRight: '8px' }} 
          onClick={() => navigate('/')}
        >
          业务域地图
        </span>
        <span style={{ marginRight: '8px' }}>&gt;</span>
        <span style={{ fontWeight: 'bold' }}>数据源聚合</span>
        <span style={{ marginLeft: '8px', fontSize: '12px', color: '#8c8c8c' }}>
          (Datasource聚合列表)
        </span>
      </div>

      {/* 顶部标题和工具栏 */}
      <div style={{ padding: '16px', backgroundColor: 'white', borderBottom: '1px solid #e0e0e0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0 }}>数据源聚合列表</h2>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingDatasource(null);
                setNewDatasource({
                  name: '',
                  type: 'mysql',
                  url: '',
                  username: '',
                  password: '',
                  tableName: '',
                  status: 'inactive',
                  description: '',
                  domainId: null
                });
                setIsDatasourceModalOpen(true);
              }}
            >
              新建数据源
            </Button>
            <Button onClick={() => setViewMode(viewMode === 'table' ? 'card' : 'table')}>
              {viewMode === 'table' ? '卡片视图' : '表格视图'}
            </Button>
          </div>
        </div>

        {/* 筛选和搜索 */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label>Domain筛选：</label>
            <select
              value={selectedDomainId || ''}
              onChange={(e) => setSelectedDomainId(e.target.value ? parseInt(e.target.value) : null)}
              style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #d9d9d9' }}
            >
              <option value="">全部Domain</option>
              {domains.map(domain => (
                <option key={domain.id} value={domain.id}>
                  {domain.name}
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1, maxWidth: '400px' }}>
            <input
              type="text"
              placeholder="搜索数据源名称或类型..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '6px 12px', borderRadius: '4px', border: '1px solid #d9d9d9' }}
            />
          </div>
          <div style={{ color: '#8c8c8c', fontSize: '14px' }}>
            共 {filteredDatasources.length} 个数据源
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div style={{ padding: '16px' }}>
        {viewMode === 'table' ? (
          <div className="table-container">
            <table className="data-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>名称</th>
                  <th>类型</th>
                  <th>URL</th>
                  <th>Domain</th>
                  <th>状态</th>
                  <th>描述</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredDatasources.length > 0 ? (
                  filteredDatasources.map(datasource => (
                    <tr key={datasource.id}>
                      <td>
                        <span 
                          style={{ cursor: 'pointer', color: '#1890ff', fontWeight: '500' }}
                          onClick={() => navigate(`/datasource/${datasource.id}`)}
                        >
                          {datasource.name}
                        </span>
                      </td>
                      <td>{datasource.type}</td>
                      <td><code style={{ fontSize: '12px' }}>{datasource.url}</code></td>
                      <td>
                        {datasource.domainId ? (
                          <span 
                            style={{ cursor: 'pointer', color: '#1890ff' }}
                            onClick={() => navigate(`/domain/${datasource.domainId}`)}
                          >
                            {getDomainName(datasource.domainId)}
                          </span>
                        ) : (
                          <span style={{ color: '#8c8c8c' }}>未分类</span>
                        )}
                      </td>
                      <td>
                        <span className={`status-badge ${datasource.status === 'active' ? 'active' : 'inactive'}`}>
                          {datasource.status === 'active' ? '启用' : '禁用'}
                        </span>
                      </td>
                      <td>{datasource.description || '-'}</td>
                      <td>
                        <button 
                          className="view"
                          onClick={() => navigate(`/datasource/${datasource.id}`)}
                        >
                          查看详情
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#8c8c8c' }}>
                      {searchTerm || selectedDomainId ? '没有找到匹配的数据源' : '暂无数据源'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="card-list grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {filteredDatasources.length > 0 ? (
              filteredDatasources.map(datasource => (
                <div 
                  key={datasource.id} 
                  className="card"
                  onClick={() => navigate(`/datasource/${datasource.id}`)}
                  style={{ cursor: 'pointer', padding: '16px', border: '1px solid #e0e0e0', borderRadius: '8px', transition: 'all 0.3s' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                    e.currentTarget.style.borderColor = '#1890ff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = '#e0e0e0';
                  }}
                >
                  <h3 style={{ margin: '0 0 8px 0', color: '#1890ff' }}>{datasource.name}</h3>
                  <div style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: '8px' }}>
                    类型: {datasource.type}
                  </div>
                  {datasource.domainId && (
                    <div style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: '8px' }}>
                      Domain: 
                      <span 
                        style={{ color: '#1890ff', cursor: 'pointer', marginLeft: '4px' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/domain/${datasource.domainId}`);
                        }}
                      >
                        {getDomainName(datasource.domainId)}
                      </span>
                    </div>
                  )}
                  <div style={{ fontSize: '12px', marginBottom: '8px' }}>
                    <span className={`status-badge ${datasource.status === 'active' ? 'active' : 'inactive'}`}>
                      {datasource.status === 'active' ? '启用' : '禁用'}
                    </span>
                  </div>
                  <div style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
                    {datasource.description || '暂无描述'}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#8c8c8c' }}>
                {searchTerm || selectedDomainId ? '没有找到匹配的数据源' : '暂无数据源'}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 新建/编辑数据源模态框 */}
      <ExtendedDatasourceModal
        domains={domains}
        isDatasourceModalOpen={isDatasourceModalOpen}
        editingDatasource={editingDatasource}
        newDatasource={newDatasource}
        setNewDatasource={setNewDatasource}
        handleSaveDatasource={handleSaveDatasource}
        setIsDatasourceModalOpen={setIsDatasourceModalOpen}
        setEditingDatasource={setEditingDatasource}
      />
    </div>
  );
};

export default DatasourcesPage;

