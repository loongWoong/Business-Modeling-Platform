/**
 * Property管理器 - 适配DDD API，使用 Ant Design
 * 通过Model聚合根操作Property
 */
import React, { useState } from 'react';
import { Card, Button, Table, Modal, Form, Input, Select, Checkbox, Space, Typography, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { modelAPI } from '../../../services/api';

const { Option } = Select;
const { Title } = Typography;

const PropertyManager = ({ 
  model, 
  properties, 
  setProperties,
  onRefresh
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [form] = Form.useForm();

  // 处理创建Property
  const handleCreateProperty = async (values) => {
    try {
      // 新API：通过Model聚合根添加Property
      const newProperty = await modelAPI.addProperty(model.id, values);
      
      setProperties([...properties, newProperty]);
      setIsModalOpen(false);
      form.resetFields();
      message.success('属性创建成功');
      
      // 刷新完整数据
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error('Failed to create property:', error);
      message.error('属性创建失败: ' + error.message);
    }
  };

  // 处理删除Property
  const handleDeleteProperty = async (propertyId) => {
    try {
      // 新API：通过Model聚合根删除Property
      await modelAPI.removeProperty(model.id, propertyId);
      
      setProperties(properties.filter(p => p.id !== propertyId));
      message.success('属性删除成功');
      
      // 刷新完整数据
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error('Failed to delete property:', error);
      message.error('属性删除失败: ' + error.message);
    }
  };

  // 处理编辑Property
  const handleEditProperty = (property) => {
    setEditingProperty(property);
    form.setFieldsValue({
      name: property.name,
      code: property.code,
      type: property.type,
      required: property.required || false,
      description: property.description || '',
      isPrimaryKey: property.isPrimaryKey || false,
      isForeignKey: property.isForeignKey || false,
      defaultValue: property.defaultValue,
    });
    setIsModalOpen(true);
  };

  // 处理更新Property（注意：新API可能不支持直接更新，需要删除后重新创建）
  const handleUpdateProperty = async (values) => {
    try {
      // 先删除旧属性
      await modelAPI.removeProperty(model.id, editingProperty.id);
      
      // 再创建新属性
      const updatedProperty = await modelAPI.addProperty(model.id, values);
      
      setProperties(properties.map(p => 
        p.id === editingProperty.id ? updatedProperty : p
      ));
      setIsModalOpen(false);
      form.resetFields();
      setEditingProperty(null);
      message.success('属性更新成功');
      
      // 刷新完整数据
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error('Failed to update property:', error);
      message.error('属性更新失败: ' + error.message);
    }
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
    setEditingProperty(null);
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      if (editingProperty) {
        handleUpdateProperty(values);
      } else {
        handleCreateProperty(values);
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
      title: '类型',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: '必填',
      dataIndex: 'required',
      key: 'required',
      render: (required) => required ? '是' : '否',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="link" 
            icon={<EditOutlined />}
            onClick={() => handleEditProperty(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个属性吗？"
            onConfirm={() => handleDeleteProperty(record.id)}
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
          <Title level={4} style={{ margin: 0 }}>属性管理</Title>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => {
              form.resetFields();
              setEditingProperty(null);
              setIsModalOpen(true);
            }}
          >
            添加属性
          </Button>
        </Space>

        <Table
          columns={columns}
          dataSource={properties}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />

        <Modal
          title={editingProperty ? '编辑属性' : '添加属性'}
          open={isModalOpen}
          onOk={handleModalOk}
          onCancel={handleModalCancel}
          okText={editingProperty ? '更新' : '创建'}
          cancelText="取消"
        >
          <Form
            form={form}
            layout="vertical"
          >
            <Form.Item
              name="name"
              label="名称"
              rules={[{ required: true, message: '请输入属性名称' }]}
            >
              <Input placeholder="请输入属性名称" />
            </Form.Item>

            <Form.Item
              name="code"
              label="Code"
              rules={[{ required: true, message: '请输入Code' }]}
            >
              <Input placeholder="请输入Code" />
            </Form.Item>

            <Form.Item
              name="type"
              label="类型"
              rules={[{ required: true, message: '请选择类型' }]}
            >
              <Select placeholder="请选择类型">
                <Option value="string">String</Option>
                <Option value="integer">Integer</Option>
                <Option value="float">Float</Option>
                <Option value="boolean">Boolean</Option>
                <Option value="date">Date</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="required"
              valuePropName="checked"
            >
              <Checkbox>必填</Checkbox>
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

export default PropertyManager;

