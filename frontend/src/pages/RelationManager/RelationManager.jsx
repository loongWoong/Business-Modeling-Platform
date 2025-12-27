import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Modal, Form, Input, Select, Table, message, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined, LinkOutlined } from '@ant-design/icons';
import { modelAPI, relationAPI, domainAPI } from '../../services/api';

const { Option } = Select;

/**
 * RelationManager - 跨聚合关系管理页面
 * 
 * Relation是连接两个Model的跨聚合关系，不属于任何聚合边界
 * 用于管理Model之间的关系（one-to-many, many-to-many等）
 * 
 * 元模型位置：shared/relation.py
 * 对应聚合：Model聚合（跨聚合关联）
 */
const RelationManager = () => {
  const navigate = useNavigate();
  const [relations, setRelations] = useState([]);
  const [models, setModels] = useState([]);
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRelation, setEditingRelation] = useState(null);
  const [newRelation, setNewRelation] = useState({
    name: '',
    sourceModelId: null,
    targetModelId: null,
    type: 'one-to-many',
    description: '',
    enabled: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const domainData = await domainAPI.getAll();
      setDomains(Array.isArray(domainData) ? domainData : []);
      
      const modelData = await modelAPI.getAll();
      const modelsList = Array.isArray(modelData) ? modelData : (modelData.models || []);
      setModels(modelsList);
      
      const relationData = await relationAPI.getAll({});
      setRelations(Array.isArray(relationData) ? relationData : []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getModelName = (modelId) => {
    const model = models.find(m => m.id === modelId);
    return model ? `${model.name} (${model.code})` : `模型ID: ${modelId}`;
  };

  const getModelDomain = (modelId) => {
    const model = models.find(m => m.id === modelId);
    if (!model?.domainId) return null;
    const domain = domains.find(d => d.id === model.domainId);
    return domain?.name;
  };

  const handleCreateRelation = async () => {
    try {
      if (!newRelation.name || !newRelation.sourceModelId || !newRelation.targetModelId) {
        message.error('请填写关系名称、源模型和目标模型');
        return;
      }

      if (newRelation.sourceModelId === newRelation.targetModelId) {
        message.error('源模型和目标模型不能相同');
        return;
      }

      await relationAPI.create(newRelation);
      message.success('关系创建成功');
      setIsModalOpen(false);
      setNewRelation({
        name: '',
        sourceModelId: null,
        targetModelId: null,
        type: 'one-to-many',
        description: '',
        enabled: true
      });
      loadData();
    } catch (error) {
      console.error('Failed to create relation:', error);
      message.error('关系创建失败：' + (error.message || '未知错误'));
    }
  };

  const handleDeleteRelation = async (relationId) => {
    try {
      await relationAPI.delete(relationId);
      message.success('关系删除成功');
      loadData();
    } catch (error) {
      console.error('Failed to delete relation:', error);
      message.error('关系删除失败：' + (error.message || '未知错误'));
    }
  };

  const columns = [
    {
      title: '关系名称',
      dataIndex: 'name',
      key: 'name',
      render: (name) => <span style={{ fontWeight: 500 }}>{name}</span>
    },
    {
      title: '关系类型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const colors = {
          'one-to-one': 'blue',
          'one-to-many': 'green',
          'many-to-one': 'orange',
          'many-to-many': 'purple'
        };
        return <Tag color={colors[type] || 'default'}>{type}</Tag>;
      }
    },
    {
      title: '源模型',
      key: 'sourceModelId',
      render: (_, record) => (
        <div>
          <div 
            style={{ cursor: 'pointer', color: '#1890ff' }}
            onClick={() => navigate(`/model/${record.sourceModelId}`)}
          >
            {getModelName(record.sourceModelId)}
          </div>
          {getModelDomain(record.sourceModelId) && (
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
              Domain: {getModelDomain(record.sourceModelId)}
            </div>
          )}
        </div>
      )
    },
    {
      title: '目标模型',
      key: 'targetModelId',
      render: (_, record) => (
        <div>
          <div 
            style={{ cursor: 'pointer', color: '#1890ff' }}
            onClick={() => navigate(`/model/${record.targetModelId}`)}
          >
            {getModelName(record.targetModelId)}
          </div>
          {getModelDomain(record.targetModelId) && (
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
              Domain: {getModelDomain(record.targetModelId)}
            </div>
          )}
        </div>
      )
    },
    {
      title: '状态',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled) => (
        <Tag color={enabled ? 'green' : 'red'}>
          {enabled ? '启用' : '禁用'}
        </Tag>
      )
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Button 
          type="link" 
          danger 
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteRelation(record.id)}
        >
          删除
        </Button>
      )
    }
  ];

  return (
    <div className="relation-manager">
      <div style={{ padding: '12px 16px', backgroundColor: '#f0f2f5', borderBottom: '1px solid #e0e0e0' }}>
        <span 
          style={{ cursor: 'pointer', color: '#1890ff', marginRight: '8px' }} 
          onClick={() => navigate('/')}
        >
          元模型地图
        </span>
        <span style={{ marginRight: '8px' }}>&gt;</span>
        <span style={{ fontWeight: 'bold' }}>关系管理</span>
        <span style={{ marginLeft: '8px', fontSize: '12px', color: '#8c8c8c' }}>
          (跨Model聚合的关系)
        </span>
      </div>

      <div style={{ padding: '16px', backgroundColor: 'white', borderBottom: '1px solid #e0e0e0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>跨聚合关系管理</h2>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ color: '#8c8c8c', fontSize: '14px' }}>
              共 {relations.length} 个关系
            </div>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setIsModalOpen(true)}
            >
              新建关系
            </Button>
          </div>
        </div>
        <div style={{ marginTop: '8px', color: '#666', fontSize: '13px' }}>
          <LinkOutlined style={{ marginRight: '8px' }} />
          Relation是连接两个Model的跨聚合关系，定义模型之间的关联（one-to-many、many-to-many等）
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        <Table
          columns={columns}
          dataSource={relations}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </div>

      <Modal
        title="新建关系"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setNewRelation({
            name: '',
            sourceModelId: null,
            targetModelId: null,
            type: 'one-to-many',
            description: '',
            enabled: true
          });
        }}
        footer={[
          <Button key="cancel" onClick={() => setIsModalOpen(false)}>
            取消
          </Button>,
          <Button key="submit" type="primary" onClick={handleCreateRelation}>
            确定
          </Button>
        ]}
      >
        <Form layout="vertical">
          <Form.Item
            label="关系名称"
            rules={[{ required: true, message: '请输入关系名称' }]}
          >
            <Input
              value={newRelation.name}
              onChange={(e) => setNewRelation({ ...newRelation, name: e.target.value })}
              placeholder="例如：用户-订单、订单-商品"
            />
          </Form.Item>
          
          <Form.Item
            label="关系类型"
            rules={[{ required: true, message: '请选择关系类型' }]}
          >
            <Select
              value={newRelation.type}
              onChange={(value) => setNewRelation({ ...newRelation, type: value })}
            >
              <Option value="one-to-one">一对一 (One-to-One)</Option>
              <Option value="one-to-many">一对多 (One-to-Many)</Option>
              <Option value="many-to-one">多对一 (Many-to-One)</Option>
              <Option value="many-to-many">多对多 (Many-to-Many)</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            label="源模型"
            rules={[{ required: true, message: '请选择源模型' }]}
          >
            <Select
              value={newRelation.sourceModelId}
              onChange={(value) => setNewRelation({ ...newRelation, sourceModelId: value })}
              placeholder="选择源模型"
              showSearch
              optionFilterProp="children"
            >
              {models.map(model => (
                <Option key={model.id} value={model.id}>
                  {model.name} ({model.code})
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            label="目标模型"
            rules={[{ required: true, message: '请选择目标模型' }]}
          >
            <Select
              value={newRelation.targetModelId}
              onChange={(value) => setNewRelation({ ...newRelation, targetModelId: value })}
              placeholder="选择目标模型"
              showSearch
              optionFilterProp="children"
            >
              {models.map(model => (
                <Option key={model.id} value={model.id} disabled={model.id === newRelation.sourceModelId}>
                  {model.name} ({model.code})
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item label="描述">
            <Input.TextArea
              value={newRelation.description}
              onChange={(e) => setNewRelation({ ...newRelation, description: e.target.value })}
              rows={3}
              placeholder="描述此关系的业务含义"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RelationManager;
