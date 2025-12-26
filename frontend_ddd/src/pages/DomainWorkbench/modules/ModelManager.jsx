/**
 * Model管理器 - 适配DDD API，使用 Ant Design
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Input, Button, Table, Modal, Form, Space, Typography, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { modelAPI } from '../../../services/api';

const { TextArea } = Input;
const { Title } = Typography;

const ModelManager = ({ 
  models,
  onRefresh,
  domainId
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModel, setEditingModel] = useState(null);
  const [form] = Form.useForm();

  // 过滤模型
  const filteredModels = models.filter(model =>
    model.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 处理创建Model
  const handleCreateModel = async (values) => {
    try {
      const dataToCreate = {
        ...values,
        domainId: domainId ? parseInt(domainId) : null
      };
      await modelAPI.create(dataToCreate);
      setIsModalOpen(false);
      form.resetFields();
      message.success('模型创建成功');
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error('Failed to create model:', error);
      message.error('模型创建失败: ' + error.message);
    }
  };

  // 处理更新Model
  const handleUpdateModel = async (values) => {
    try {
      await modelAPI.update(editingModel.id, values);
      setIsModalOpen(false);
      form.resetFields();
      setEditingModel(null);
      message.success('模型更新成功');
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error('Failed to update model:', error);
      message.error('模型更新失败: ' + error.message);
    }
  };

  // 处理删除Model
  const handleDeleteModel = async (id) => {
    try {
      await modelAPI.delete(id);
      message.success('模型删除成功');
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error('Failed to delete model:', error);
      message.error('模型删除失败: ' + error.message);
    }
  };

  // 处理编辑Model
  const handleEditModel = (model) => {
    setEditingModel(model);
    form.setFieldsValue({
      name: model.name,
      code: model.code,
      description: model.description || '',
    });
    setIsModalOpen(true);
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
    setEditingModel(null);
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      if (editingModel) {
        handleUpdateModel(values);
      } else {
        handleCreateModel(values);
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
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      key: 'creator',
      render: (text) => text || '-',
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
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
            onClick={() => handleEditModel(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个模型吗？"
            onConfirm={() => handleDeleteModel(record.id)}
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
            onClick={() => navigate(`/model/${record.id}`)}
          >
            详情
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Title level={4} style={{ margin: 0 }}>模型管理</Title>
          <Space>
            <Input
              placeholder="搜索模型名称..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: 200 }}
              allowClear
            />
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => {
                form.resetFields();
                setEditingModel(null);
                setIsModalOpen(true);
              }}
            >
              新建模型
            </Button>
          </Space>
        </Space>

        <Table
          columns={columns}
          dataSource={filteredModels}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />

        <Modal
          title={editingModel ? '编辑模型' : '新建模型'}
          open={isModalOpen}
          onOk={handleModalOk}
          onCancel={handleModalCancel}
          okText={editingModel ? '更新' : '创建'}
          cancelText="取消"
        >
          <Form
            form={form}
            layout="vertical"
          >
            <Form.Item
              name="name"
              label="名称"
              rules={[{ required: true, message: '请输入模型名称' }]}
            >
              <Input placeholder="请输入模型名称" />
            </Form.Item>

            <Form.Item
              name="code"
              label="Code"
              rules={[{ required: true, message: '请输入Code' }]}
            >
              <Input placeholder="请输入Code" />
            </Form.Item>

            <Form.Item
              name="description"
              label="描述"
            >
              <TextArea rows={3} placeholder="请输入描述" />
            </Form.Item>
          </Form>
        </Modal>
      </Space>
    </Card>
  );
};

export default ModelManager;

