/**
 * Datasource管理器 - 适配DDD API，使用 Ant Design
 */
import React, { useState } from 'react';
import { Card, Input, Button, Table, Modal, Form, Select, Space, Typography, Tag, Switch, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { datasourceAPI } from '../../../services/api';

const { TextArea } = Input;
const { Option } = Select;
const { Title } = Typography;

const DatasourceManager = ({ 
  datasources,
  onRefresh,
  domainId
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDatasource, setEditingDatasource] = useState(null);
  const [form] = Form.useForm();

  // 过滤数据源
  const filteredDatasources = datasources.filter(ds =>
    ds.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 处理创建Datasource
  const handleCreateDatasource = async (values) => {
    try {
      const dataToCreate = {
        ...values,
        domainId: domainId ? parseInt(domainId) : null
      };
      await datasourceAPI.create(dataToCreate);
      setIsModalOpen(false);
      form.resetFields();
      message.success('数据源创建成功');
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error('Failed to create datasource:', error);
      message.error('数据源创建失败: ' + error.message);
    }
  };

  // 处理更新Datasource
  const handleUpdateDatasource = async (values) => {
    try {
      await datasourceAPI.update(editingDatasource.id, values);
      setIsModalOpen(false);
      form.resetFields();
      setEditingDatasource(null);
      message.success('数据源更新成功');
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error('Failed to update datasource:', error);
      message.error('数据源更新失败: ' + error.message);
    }
  };

  // 处理删除Datasource
  const handleDeleteDatasource = async (id) => {
    try {
      await datasourceAPI.delete(id);
      message.success('数据源删除成功');
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error('Failed to delete datasource:', error);
      message.error('数据源删除失败: ' + error.message);
    }
  };

  // 处理切换状态
  const handleToggleStatus = async (id) => {
    try {
      await datasourceAPI.toggleStatus(id);
      message.success('状态切换成功');
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error('Failed to toggle status:', error);
      message.error('状态切换失败: ' + error.message);
    }
  };

  // 处理编辑Datasource
  const handleEditDatasource = (datasource) => {
    setEditingDatasource(datasource);
    form.setFieldsValue({
      name: datasource.name,
      type: datasource.type,
      url: datasource.url,
      username: datasource.username || '',
      password: '', // 不显示密码
      description: datasource.description || ''
    });
    setIsModalOpen(true);
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
    setEditingDatasource(null);
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      if (editingDatasource) {
        handleUpdateDatasource(values);
      } else {
        handleCreateDatasource(values);
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
      title: '类型',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'success' : 'default'}>
          {status === 'active' ? '激活' : '未激活'}
        </Tag>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="link" 
            icon={<EditOutlined />}
            onClick={() => handleEditDatasource(record)}
          >
            编辑
          </Button>
          <Button 
            type="link"
            onClick={() => handleToggleStatus(record.id)}
          >
            {record.status === 'active' ? '停用' : '激活'}
          </Button>
          <Popconfirm
            title="确定要删除这个数据源吗？"
            onConfirm={() => handleDeleteDatasource(record.id)}
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
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Title level={4} style={{ margin: 0 }}>数据源管理</Title>
          <Space>
            <Input
              placeholder="搜索数据源名称..."
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
                setEditingDatasource(null);
                setIsModalOpen(true);
              }}
            >
              新建数据源
            </Button>
          </Space>
        </Space>

        <Table
          columns={columns}
          dataSource={filteredDatasources}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />

        <Modal
          title={editingDatasource ? '编辑数据源' : '新建数据源'}
          open={isModalOpen}
          onOk={handleModalOk}
          onCancel={handleModalCancel}
          okText={editingDatasource ? '更新' : '创建'}
          cancelText="取消"
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
          >
            <Form.Item
              name="name"
              label="名称"
              rules={[{ required: true, message: '请输入数据源名称' }]}
            >
              <Input placeholder="请输入数据源名称" />
            </Form.Item>

            <Form.Item
              name="type"
              label="类型"
              rules={[{ required: true, message: '请选择数据源类型' }]}
            >
              <Select placeholder="请选择数据源类型">
                <Option value="mysql">MySQL</Option>
                <Option value="postgresql">PostgreSQL</Option>
                <Option value="sqlserver">SQL Server</Option>
                <Option value="duckdb">DuckDB</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="url"
              label="URL"
              rules={[{ required: true, message: '请输入URL' }]}
            >
              <Input placeholder="mysql://localhost:3306/database" />
            </Form.Item>

            <Form.Item
              name="username"
              label="用户名"
            >
              <Input placeholder="请输入用户名" />
            </Form.Item>

            <Form.Item
              name="password"
              label="密码"
            >
              <Input.Password placeholder={editingDatasource ? '留空则不修改密码' : '请输入密码'} />
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

export default DatasourceManager;

