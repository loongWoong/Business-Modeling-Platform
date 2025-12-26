/**
 * Relation管理器 - 适配DDD API，使用 Ant Design
 * 通过Model聚合根操作Relation
 */
import React, { useState } from 'react';
import { Card, Button, Table, Modal, Form, Input, Select, InputNumber, Space, Typography, Tag, message, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { modelAPI } from '../../../services/api';

const { Option } = Select;
const { Title } = Typography;

const RelationManager = ({ 
  model, 
  relations, 
  setRelations,
  onRefresh
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  // 处理创建Relation
  const handleCreateRelation = async (values) => {
    try {
      // 新API：通过Model聚合根添加Relation
      const relationData = {
        ...values,
        sourceModelId: model.id,
      };
      const newRelation = await modelAPI.addRelation(relationData);
      
      setRelations([...relations, newRelation]);
      setIsModalOpen(false);
      form.resetFields();
      message.success('关系创建成功');
      
      // 刷新完整数据
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error('Failed to create relation:', error);
      message.error('关系创建失败: ' + error.message);
    }
  };

  // 处理删除Relation
  const handleDeleteRelation = async (relationId) => {
    try {
      // 新API：通过Model聚合根删除Relation
      await modelAPI.removeRelation(relationId);
      
      setRelations(relations.filter(r => r.id !== relationId));
      message.success('关系删除成功');
      
      // 刷新完整数据
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error('Failed to delete relation:', error);
      message.error('关系删除失败: ' + error.message);
    }
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      handleCreateRelation(values);
    });
  };

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '源模型',
      dataIndex: 'sourceModelId',
      key: 'sourceModelId',
    },
    {
      title: '目标模型',
      dataIndex: 'targetModelId',
      key: 'targetModelId',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: '状态',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled) => (
        <Tag color={enabled ? 'success' : 'default'}>
          {enabled ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Popconfirm
          title="确定要删除这个关系吗？"
          onConfirm={() => handleDeleteRelation(record.id)}
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
      ),
    },
  ];

  return (
    <Card>
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Title level={4} style={{ margin: 0 }}>关系管理</Title>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => {
              form.resetFields();
              setIsModalOpen(true);
            }}
          >
            添加关系
          </Button>
        </Space>

        <Table
          columns={columns}
          dataSource={relations}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />

        <Modal
          title="添加关系"
          open={isModalOpen}
          onOk={handleModalOk}
          onCancel={handleModalCancel}
          okText="创建"
          cancelText="取消"
        >
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              type: 'one-to-many',
              enabled: true,
            }}
          >
            <Form.Item
              name="name"
              label="名称"
              rules={[{ required: true, message: '请输入关系名称' }]}
            >
              <Input placeholder="请输入关系名称" />
            </Form.Item>

            <Form.Item
              name="targetModelId"
              label="目标模型ID"
              rules={[{ required: true, message: '请输入目标模型ID' }]}
            >
              <InputNumber 
                placeholder="请输入目标模型ID" 
                style={{ width: '100%' }}
                min={1}
              />
            </Form.Item>

            <Form.Item
              name="type"
              label="类型"
              rules={[{ required: true, message: '请选择关系类型' }]}
            >
              <Select placeholder="请选择关系类型">
                <Option value="one-to-one">One-to-One</Option>
                <Option value="one-to-many">One-to-Many</Option>
                <Option value="many-to-one">Many-to-One</Option>
                <Option value="many-to-many">Many-to-Many</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="description"
              label="描述"
            >
              <Input.TextArea rows={3} placeholder="请输入描述" />
            </Form.Item>
          </Form>
        </Modal>
      </Space>
    </Card>
  );
};

export default RelationManager;

