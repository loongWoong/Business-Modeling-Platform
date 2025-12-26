import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Modal, Form, Input, Select, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { modelAPI, domainAPI } from '../../services/api';

const { Option } = Select;

// 扩展ModelModal以支持Domain选择
const ExtendedModelModal = ({ domains, ...props }) => {
  const [localModel, setLocalModel] = useState(props.newModel);
  
  useEffect(() => {
    setLocalModel(props.newModel);
  }, [props.newModel]);

  const handleModelChange = (updates) => {
    const updated = { ...localModel, ...updates };
    setLocalModel(updated);
    props.setNewModel(updated);
  };

  return (
    <Modal
      title={props.editingModel ? '编辑模型' : '新建模型'}
      open={props.isModalOpen}
      onCancel={() => {
        props.setIsModalOpen(false);
        props.setEditingModel(null);
        props.setNewModel({ name: '', code: '', description: '', parentId: '', tags: '', domainId: null });
      }}
      footer={[
        <Button key="cancel" onClick={() => {
          props.setIsModalOpen(false);
          props.setEditingModel(null);
          props.setNewModel({ name: '', code: '', description: '', parentId: '', tags: '', domainId: null });
        }}>
          取消
        </Button>,
        <Button key="submit" type="primary" onClick={props.handleSaveModel}>
          {props.editingModel ? '更新' : '确定'}
        </Button>
      ]}
    >
      <Form layout="vertical">
        <Form.Item
          label="名称"
          rules={[{ required: true, message: '请输入模型名称' }]}
        >
          <Input
            value={localModel.name}
            onChange={(e) => handleModelChange({ name: e.target.value })}
          />
        </Form.Item>
        <Form.Item
          label="Code"
          rules={[{ required: true, message: '请输入模型Code' }]}
        >
          <Input
            value={localModel.code}
            onChange={(e) => handleModelChange({ code: e.target.value })}
            placeholder="例如：user, order, product"
          />
        </Form.Item>
        <Form.Item label="描述">
          <Input.TextArea
            value={localModel.description}
            onChange={(e) => handleModelChange({ description: e.target.value })}
            rows={4}
          />
        </Form.Item>
        <Form.Item label="Domain（可选）">
          <Select
            value={localModel.domainId}
            onChange={(value) => handleModelChange({ domainId: value })}
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
        <Form.Item label="父模型ID（可选）">
          <Input
            value={localModel.parentId}
            onChange={(e) => handleModelChange({ parentId: e.target.value })}
            placeholder="可选"
          />
        </Form.Item>
        <Form.Item label="标签（逗号分隔）">
          <Input
            value={localModel.tags}
            onChange={(e) => handleModelChange({ tags: e.target.value })}
            placeholder="例如：电商,用户,订单"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

/**
 * ModelsPage - 模型聚合列表页面
 * 
 * 显示所有Model聚合，支持：
 * - 查看所有模型（跨Domain）
 * - 点击模型跳转到ModelDetail
 * - 按Domain筛选
 * - 搜索模型
 * - 新建模型
 */
const ModelsPage = () => {
  const navigate = useNavigate();
  const [models, setModels] = useState([]);
  const [domains, setDomains] = useState([]);
  const [selectedDomainId, setSelectedDomainId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('table'); // table or card
  
  // 新建模型相关状态
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModel, setEditingModel] = useState(null);
  const [newModel, setNewModel] = useState({ 
    name: '', 
    code: '', 
    description: '', 
    parentId: '', 
    tags: '',
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

      // 加载所有Model（可选domainId过滤）
      const modelData = await modelAPI.getAll(selectedDomainId);
      const modelsList = Array.isArray(modelData) ? modelData : (modelData.models || []);
      setModels(modelsList);
    } catch (error) {
      console.error('Failed to load models:', error);
    } finally {
      setLoading(false);
    }
  };

  // 过滤模型
  const filteredModels = models.filter(model => {
    const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (model.code && model.code.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  // 获取模型所属的Domain名称
  const getDomainName = (domainId) => {
    if (!domainId) return '未分类';
    const domain = domains.find(d => d.id === domainId);
    return domain ? domain.name : `域ID: ${domainId}`;
  };

  // 处理新建模型
  const handleCreateModel = async () => {
    try {
      if (!newModel.name || !newModel.code) {
        message.error('请填写模型名称和Code');
        return;
      }
      
      const modelData = {
        name: newModel.name,
        code: newModel.code,
        description: newModel.description || '',
        parentId: newModel.parentId || null,
        tags: newModel.tags || '',
        domainId: newModel.domainId ? parseInt(newModel.domainId) : null
      };
      
      const model = await modelAPI.create(modelData);
      setModels([...models, model]);
      setIsModalOpen(false);
      setEditingModel(null);
      setNewModel({ name: '', code: '', description: '', parentId: '', tags: '', domainId: null });
      message.success('模型创建成功');
      loadData(); // 重新加载数据
    } catch (error) {
      console.error('Failed to create model:', error);
      message.error('模型创建失败：' + (error.message || '未知错误'));
    }
  };

  // 处理保存模型（创建或更新）
  const handleSaveModel = () => {
    if (editingModel) {
      // 更新功能可以后续添加
      message.warning('编辑功能暂未实现，请到模型详情页进行编辑');
    } else {
      handleCreateModel();
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
    <div className="models-page">
      {/* 面包屑导航 */}
      <div style={{ padding: '12px 16px', backgroundColor: '#f0f2f5', borderBottom: '1px solid #e0e0e0' }}>
        <span 
          style={{ cursor: 'pointer', color: '#1890ff', marginRight: '8px' }} 
          onClick={() => navigate('/')}
        >
          业务域地图
        </span>
        <span style={{ marginRight: '8px' }}>&gt;</span>
        <span style={{ fontWeight: 'bold' }}>模型聚合</span>
        <span style={{ marginLeft: '8px', fontSize: '12px', color: '#8c8c8c' }}>
          (Model聚合列表)
        </span>
      </div>

      {/* 顶部标题和工具栏 */}
      <div style={{ padding: '16px', backgroundColor: 'white', borderBottom: '1px solid #e0e0e0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0 }}>模型聚合列表</h2>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingModel(null);
                setNewModel({ name: '', code: '', description: '', parentId: '', tags: '', domainId: null });
                setIsModalOpen(true);
              }}
            >
              新建模型
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
              placeholder="搜索模型名称或Code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '6px 12px', borderRadius: '4px', border: '1px solid #d9d9d9' }}
            />
          </div>
          <div style={{ color: '#8c8c8c', fontSize: '14px' }}>
            共 {filteredModels.length} 个模型
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
                  <th>Code</th>
                  <th>Domain</th>
                  <th>描述</th>
                  <th>创建人</th>
                  <th>更新时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredModels.length > 0 ? (
                  filteredModels.map(model => (
                    <tr key={model.id}>
                      <td>
                        <span 
                          style={{ cursor: 'pointer', color: '#1890ff', fontWeight: '500' }}
                          onClick={() => navigate(`/model/${model.id}`)}
                        >
                          {model.name}
                        </span>
                      </td>
                      <td><code>{model.code}</code></td>
                      <td>
                        {model.domainId ? (
                          <span 
                            style={{ cursor: 'pointer', color: '#1890ff' }}
                            onClick={() => navigate(`/domain/${model.domainId}`)}
                          >
                            {getDomainName(model.domainId)}
                          </span>
                        ) : (
                          <span style={{ color: '#8c8c8c' }}>未分类</span>
                        )}
                      </td>
                      <td>{model.description || '-'}</td>
                      <td>{model.creator || '-'}</td>
                      <td>{model.updatedAt || '-'}</td>
                      <td>
                        <button 
                          className="view"
                          onClick={() => navigate(`/model/${model.id}`)}
                        >
                          查看详情
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#8c8c8c' }}>
                      {searchTerm || selectedDomainId ? '没有找到匹配的模型' : '暂无模型'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="card-list grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {filteredModels.length > 0 ? (
              filteredModels.map(model => (
                <div 
                  key={model.id} 
                  className="card"
                  onClick={() => navigate(`/model/${model.id}`)}
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
                  <h3 style={{ margin: '0 0 8px 0', color: '#1890ff' }}>{model.name}</h3>
                  <div style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: '8px' }}>
                    Code: <code>{model.code}</code>
                  </div>
                  {model.domainId && (
                    <div style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: '8px' }}>
                      Domain: 
                      <span 
                        style={{ color: '#1890ff', cursor: 'pointer', marginLeft: '4px' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/domain/${model.domainId}`);
                        }}
                      >
                        {getDomainName(model.domainId)}
                      </span>
                    </div>
                  )}
                  <div style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
                    {model.description || '暂无描述'}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#8c8c8c' }}>
                {searchTerm || selectedDomainId ? '没有找到匹配的模型' : '暂无模型'}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 新建/编辑模型模态框 */}
      <ExtendedModelModal
        domains={domains}
        isModalOpen={isModalOpen}
        editingModel={editingModel}
        newModel={newModel}
        setNewModel={setNewModel}
        handleSaveModel={handleSaveModel}
        setIsModalOpen={setIsModalOpen}
        setEditingModel={setEditingModel}
      />
    </div>
  );
};

export default ModelsPage;

