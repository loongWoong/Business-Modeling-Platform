import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Button, Modal, Form, Input, message, Tag, Space, Typography, Row, Col, Select, InputNumber, Tooltip, Progress } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FolderOpenOutlined, DatabaseOutlined, ApiOutlined, ApartmentOutlined, TagOutlined } from '@ant-design/icons';
import { domainAPI, modelAPI, datasourceAPI } from '../../services/api';

const { Text } = Typography;
const { TextArea } = Input;

/**
 * DomainManager - 业务域管理页面
 * 
 * 业务域（Domain）是元模型的分类维度，用于组织Models和Datasources
 * 每个业务域代表一个独立的业务领域，包含该领域相关的模型和数据源
 * 
 * 元模型位置：meta/shared/domain.py
 */
const DomainManager = () => {
  const navigate = useNavigate();
  const [domains, setDomains] = useState([]);
  const [models, setModels] = useState({});
  const [datasources, setDatasources] = useState({});
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDomain, setEditingDomain] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const domainData = await domainAPI.getAll();
      const domainsList = Array.isArray(domainData) ? domainData : [];
      setDomains(domainsList);

      const modelsData = await modelAPI.getAll();
      const modelsList = Array.isArray(modelsData) ? modelsData : (modelsData.models || []);

      const datasourcesData = await datasourceAPI.getAll();
      const datasourcesList = Array.isArray(datasourcesData) ? datasourcesData : [];

      const modelsMap = {};
      const datasourcesMap = {};

      domainsList.forEach(domain => {
        modelsMap[domain.id] = modelsList.filter(m => m.domainId === domain.id);
        datasourcesMap[domain.id] = datasourcesList.filter(d => d.domainId === domain.id);
      });

      setModels(modelsMap);
      setDatasources(datasourcesMap);
    } catch (error) {
      console.error('Failed to load data:', error);
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingDomain(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (domain) => {
    setEditingDomain(domain);
    form.setFieldsValue({
      name: domain.name,
      code: domain.code,
      description: domain.description,
      owner: domain.owner || '',
      domainType: domain.domainType || 'category',
      isActive: domain.isActive !== false,
      modelQuota: domain.modelQuota
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editingDomain) {
        await domainAPI.update(editingDomain.id, values);
        message.success('业务域更新成功');
      } else {
        await domainAPI.create(values);
        message.success('业务域创建成功');
      }

      setIsModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Failed to save domain:', error);
      if (!error.errorFields) {
        message.error(editingDomain ? '更新失败' : '创建失败');
      }
    }
  };

  const handleDelete = async (domainId) => {
    try {
      await domainAPI.delete(domainId);
      message.success('业务域删除成功');
      loadData();
    } catch (error) {
      console.error('Failed to delete domain:', error);
      message.error('删除失败：' + (error.message || '未知错误'));
    }
  };

  const handleViewDomain = (domainId) => {
    navigate(`/domain/${domainId}`);
  };

  const columns = [
    {
      title: '业务域名称',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <div>
          <Space>
            <div style={{ fontWeight: 500, fontSize: '14px' }}>{name}</div>
            {record.domainType === 'workspace' ? (
              <Tag icon={<ApartmentOutlined />} color="blue">工作空间</Tag>
            ) : (
              <Tag icon={<TagOutlined />} color="default">分类</Tag>
            )}
          </Space>
          <div>
            <Text type="secondary" style={{ fontSize: '12px' }}>编码: {record.code}</Text>
          </div>
        </div>
      )
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: '模型数量',
      key: 'modelCount',
      render: (_, record) => {
        const domainModels = models[record.id] || [];
        return (
          <Tag icon={<DatabaseOutlined />} color="blue">
            {domainModels.length} 个模型
          </Tag>
        );
      }
    },
    {
      title: '数据源数量',
      key: 'datasourceCount',
      render: (_, record) => {
        const domainDatasources = datasources[record.id] || [];
        return (
          <Tag icon={<ApiOutlined />} color="green">
            {domainDatasources.length} 个数据源
          </Tag>
        );
      }
    },
    {
      title: '资源配额',
      key: 'quota',
      render: (_, record) => {
        if (record.domainType === 'workspace') {
          const modelCount = (models[record.id] || []).length;
          const quota = record.modelQuota;
          if (quota) {
            const percent = Math.min(100, Math.round((modelCount / quota) * 100));
            return (
              <Tooltip title={`已使用 ${modelCount}/${quota} 个模型`}>
                <Progress 
                  percent={percent} 
                  size="small"
                  status={modelCount >= quota ? 'exception' : 'active'}
                />
              </Tooltip>
            );
          }
          return <Text type="secondary">无限制</Text>;
        }
        return <Text type="secondary">-</Text>;
      }
    },
    {
      title: '负责人',
      dataIndex: 'owner',
      key: 'owner',
      render: (owner) => owner ? <Tag color="blue">{owner}</Tag> : <Text type="secondary">-</Text>
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag color={isActive !== false ? 'green' : 'red'}>
          {isActive !== false ? '启用' : '禁用'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<FolderOpenOutlined />}
            onClick={() => handleViewDomain(record.id)}
          >
            {record.domainType === 'workspace' ? '进入工作空间' : '查看'}
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div className="domain-manager">
      <div style={{ padding: '12px 16px', backgroundColor: '#f0f2f5', borderBottom: '1px solid #e0e0e0' }}>
        <span style={{ fontWeight: 'bold' }}>业务域管理</span>
      </div>

      <div style={{ padding: '16px', backgroundColor: 'white', borderBottom: '1px solid #e0e0e0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0 }}>业务域管理</h2>
            <div style={{ marginTop: '8px', color: '#666', fontSize: '13px' }}>
              <FolderOpenOutlined style={{ marginRight: '8px' }} />
              业务域是元模型的分类维度，用于组织模型和数据源
            </div>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            新建业务域
          </Button>
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        <Row gutter={16} style={{ marginBottom: '16px' }}>
          <Col span={24}>
            <Card size="small">
              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                <div>
                  <Text type="secondary">业务域总数</Text>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                    {domains.length}
                  </div>
                </div>
                <div>
                  <Text type="secondary">模型总数</Text>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                    {Object.values(models).flat().length}
                  </div>
                </div>
                <div>
                  <Text type="secondary">数据源总数</Text>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#722ed1' }}>
                    {Object.values(datasources).flat().length}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={domains}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </div>

      <Modal
        title={editingDomain ? '编辑业务域' : '新建业务域'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        onOk={handleSubmit}
        okText="确定"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ 
            domainType: 'category',
            isActive: true 
          }}
        >
          <Form.Item
            label="业务域名称"
            name="name"
            rules={[{ required: true, message: '请输入业务域名称' }]}
          >
            <Input placeholder="请输入业务域名称" />
          </Form.Item>

          <Form.Item
            label="业务域编码"
            name="code"
            rules={[
              { required: true, message: '请输入业务域编码' },
              { pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/, message: '编码必须以字母开头，只能包含字母、数字和下划线' }
            ]}
          >
            <Input placeholder="请输入业务域编码" disabled={!!editingDomain} />
          </Form.Item>

          <Form.Item
            label="类型"
            name="domainType"
            rules={[{ required: true, message: '请选择类型' }]}
          >
            <Select placeholder="请选择类型">
              <Select.Option value="category">分类维度</Select.Option>
              <Select.Option value="workspace">工作空间</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.domainType !== currentValues.domainType}
          >
            {({ getFieldValue }) => {
              const domainType = getFieldValue('domainType');
              if (domainType === 'workspace') {
                return (
                  <Form.Item
                    label="模型配额"
                    name="modelQuota"
                    tooltip="限制该工作空间可创建的模型数量，留空表示无限制"
                  >
                    <InputNumber 
                      min={1} 
                      placeholder="留空表示无限制"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                );
              }
              return null;
            }}
          </Form.Item>

          <Form.Item
            label="负责人"
            name="owner"
          >
            <Input placeholder="请输入负责人姓名" />
          </Form.Item>

          <Form.Item
            label="描述"
            name="description"
          >
            <TextArea rows={3} placeholder="请输入业务域描述" />
          </Form.Item>

          <Form.Item
            label="状态"
            name="isActive"
            initialValue={true}
          >
            <Select>
              <Select.Option value={true}>启用</Select.Option>
              <Select.Option value={false}>禁用</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DomainManager;
