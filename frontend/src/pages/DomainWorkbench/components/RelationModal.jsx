import React from 'react';
import { Modal, Form, Input, Select, Checkbox, Button } from 'antd';

const { Option } = Select;

const RelationModal = ({ 
  isRelationModalOpen, 
  editingRelation, 
  newRelation, 
  setNewRelation, 
  handleSaveRelation, 
  setIsRelationModalOpen, 
  setEditingRelation,
  models
}) => {
  const handleCancel = () => {
    setIsRelationModalOpen(false);
    setEditingRelation(null);
  };

  return (
    <Modal
      title={editingRelation ? '编辑关系' : '新建关系'}
      open={isRelationModalOpen}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          取消
        </Button>,
        <Button key="submit" type="primary" onClick={handleSaveRelation}>
          {editingRelation ? '更新' : '创建'}
        </Button>
      ]}
    >
      <Form layout="vertical">
        <Form.Item
          label="名称"
          rules={[{ required: true, message: '请输入关系名称' }]}
        >
          <Input
            value={newRelation.name}
            onChange={(e) => setNewRelation({ ...newRelation, name: e.target.value })}
          />
        </Form.Item>
        <Form.Item
          label="源模型"
          rules={[{ required: true, message: '请选择源模型' }]}
        >
          <Select
            value={newRelation.sourceModelId}
            onChange={(value) => setNewRelation({ ...newRelation, sourceModelId: value })}
            placeholder="选择源模型"
          >
            <Option value="">选择源模型</Option>
            {models.map(model => (
              <Option key={model.id} value={model.id}>{model.name}</Option>
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
          >
            <Option value="">选择目标模型</Option>
            {models.map(model => (
              <Option key={model.id} value={model.id}>{model.name}</Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label="关系类型"
          rules={[{ required: true, message: '请选择关系类型' }]}
        >
          <Select
            value={newRelation.type}
            onChange={(value) => setNewRelation({ ...newRelation, type: value })}
            placeholder="选择关系类型"
          >
            <Option value="one-to-one">一对一</Option>
            <Option value="one-to-many">一对多</Option>
            <Option value="many-to-one">多对一</Option>
            <Option value="many-to-many">多对多</Option>
          </Select>
        </Form.Item>
        <Form.Item label="描述">
          <Input.TextArea
            value={newRelation.description}
            onChange={(e) => setNewRelation({ ...newRelation, description: e.target.value })}
            rows={4}
          />
        </Form.Item>
        <Form.Item>
          <Checkbox
            checked={newRelation.enabled}
            onChange={(e) => setNewRelation({ ...newRelation, enabled: e.target.checked })}
          >
            启用
          </Checkbox>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RelationModal;