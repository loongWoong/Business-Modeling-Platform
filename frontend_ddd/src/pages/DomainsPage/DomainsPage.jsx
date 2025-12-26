/**
 * 业务域列表页面 - 使用 Ant Design
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Input, Button, Row, Col, Typography, Spin, Empty, Space, Table, Modal, Form, message, Popconfirm } from 'antd';
import { HomeOutlined, PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { domainAPI } from '../../services/api';

const { Title, Text } = Typography;
const { TextArea } = Input;

const DomainsPage = () => {
  const navigate = useNavigate();
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDomain, setEditingDomain] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadDomains();
  }, []);

  const loadDomains = async () => {
    try {
      setLoading(true);
      const data = await domainAPI.getAll();
      setDomains(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load domains:', error);
      message.error('加载业务域失败');
    } finally {
      setLoading(false);
    }
  };

  const filteredDomains = domains.filter(domain =>
    domain.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    domain.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateDomain = async (values) => {
    try {
      await domainAPI.create(values);
      setIsModalOpen(false);
      form.resetFields();
      message.success('业务域创建成功');
      await loadDomains();
    } catch (error) {
      console.error('Failed to create domain:', error);
      message.error('业务域创建失败: ' + error.message);
    }
  };

  const handleUpdateDomain = async (values) => {
    try {
      await domainAPI.update(editingDomain.id, values);
      setIsModalOpen(false);
      form.resetFields();
      setEditingDomain(null);
      message.success('业务域更新成功');
      await loadDomains();
    } catch (error) {
      console.error('Failed to update domain:', error);
      message.error('业务域更新失败: ' + error.message);
    }
  };

  const handleDeleteDomain = async (id) => {
    try {
      await domainAPI.delete(id);
      message.success('业务域删除成功');
      await loadDomains();
    } catch (error) {
      console.error('Failed to delete domain:', error);
      message.error('业务域删除失败: ' + error.message);
    }
  };

  const handleEditDomain = (domain) => {
    setEditingDomain(domain);
    form.setFieldsValue({
      name: domain.name,
      description: domain.description || '',
      owner: domain.owner || '',
    });
    setIsModalOpen(true);
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
    setEditingDomain(null);
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      if (editingDomain) {
        handleUpdateDomain(values);
      } else {
        handleCreateDomain(values);
      }
    });
  };

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '负责人',
      dataIndex: 'owner',
      key: 'owner',
      render: (text) => text || '-',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="link" 
            icon={<EditOutlined />}
            onClick={() => handleEditDomain(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个业务域吗？"
            onConfirm={() => handleDeleteDomain(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              type="link" 
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
          <Button 
            type="link" 
            icon={<EyeOutlined />}
            onClick={() => navigate(`/domain/${record.id}`)}
          >
            进入工作台
          </Button>
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      <Card style={{ marginBottom: '24px' }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Title level={2} style={{ margin: 0 }}>业务域管理</Title>
          <Button icon={<HomeOutlined />} onClick={() => navigate('/')}>
            返回首页
          </Button>
        </Space>
      </Card>

      <Card style={{ marginBottom: '24px' }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Input
            placeholder="搜索业务域名称或描述..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => {
              form.resetFields();
              setEditingDomain(null);
              setIsModalOpen(true);
            }}
          >
            新建业务域
          </Button>
        </Space>
      </Card>

      {filteredDomains.length === 0 ? (
        <Card>
          <Empty 
            description={searchTerm ? '没有找到匹配的业务域' : '暂无业务域'}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            {!searchTerm && (
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => {
                  form.resetFields();
                  setEditingDomain(null);
                  setIsModalOpen(true);
                }}
              >
                创建业务域
              </Button>
            )}
          </Empty>
        </Card>
      ) : (
        <Card>
          <Table
            columns={columns}
            dataSource={filteredDomains}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Card>
      )}

      <Modal
        title={editingDomain ? '编辑业务域' : '新建业务域'}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText={editingDomain ? '更新' : '创建'}
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="名称"
            rules={[{ required: true, message: '请输入业务域名称' }]}
          >
            <Input placeholder="请输入业务域名称" />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
          >
            <TextArea rows={3} placeholder="请输入描述" />
          </Form.Item>

          <Form.Item
            name="owner"
            label="负责人"
          >
            <Input placeholder="请输入负责人" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DomainsPage;

