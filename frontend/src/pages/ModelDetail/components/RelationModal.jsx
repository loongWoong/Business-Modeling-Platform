import React from 'react';
import { Modal, Form, Input, Select, Button } from 'antd';

const { Option } = Select;

const RelationModal = ({ 
  isRelationModalOpen, 
  editingRelation, 
  newRelation, 
  setNewRelation, 
  setIsRelationModalOpen, 
  setEditingRelation,
  allModels,
  handleSaveRelation
}) => {
  const handleCloseRelationModal = () => {
    setIsRelationModalOpen(false);
    setEditingRelation(null);
    setNewRelation({
      name: '',
      sourceModelId: '',
      targetModelId: '',
      type: 'one-to-many',
      description: ''
    });
  };

  const handleTargetModelChange = (value, option) => {
    setNewRelation({
      ...newRelation, 
      targetModelId: value,
      targetModel: option.children
    });
  };

  return (
    <Modal
      title={editingRelation ? '编辑关系' : '新建关系'}
      open={isRelationModalOpen}
      onCancel={handleCloseRelationModal}
      footer={[
        <Button key="cancel" onClick={handleCloseRelationModal}>
          取消
        </Button>,
        <Button key="submit" type="primary" onClick={handleSaveRelation}>
          {editingRelation ? '更新' : '确定'}
        </Button>
      ]}
      width={600}
    >
      <Form layout="vertical">
        <Form.Item
          label="名称 *"
          rules={[{ required: true, message: '请输入关系名称' }]}
        >
          <Input
            value={newRelation.name}
            onChange={(e) => setNewRelation({ ...newRelation, name: e.target.value })}
            placeholder="关系名称"
          />
        </Form.Item>
        
        <Form.Item
          label="源模型 *"
          rules={[{ required: true, message: '请选择源模型' }]}
        >
          <Select
            value={newRelation.sourceModelId}
            onChange={(value) => setNewRelation({ ...newRelation, sourceModelId: parseInt(value) })}
            placeholder="选择源模型"
          >
            <Option value="">选择源模型</Option>
            {allModels.map(model => (
              <Option key={model.id} value={model.id}>{model.name}</Option>
            ))}
          </Select>
        </Form.Item>
        
        <Form.Item
          label="目标模型 *"
          rules={[{ required: true, message: '请选择目标模型' }]}
        >
          <Select
            value={newRelation.targetModelId}
            onChange={handleTargetModelChange}
            placeholder="输入目标模型名称进行搜索"
            showSearch
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
          >
            {allModels.map(model => (
              <Option key={model.id} value={model.id}>{model.name}</Option>
            ))}
          </Select>
        </Form.Item>
        
        <Form.Item
          label="关系类型 *"
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
            placeholder="关系描述"
            rows={3}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RelationModal;