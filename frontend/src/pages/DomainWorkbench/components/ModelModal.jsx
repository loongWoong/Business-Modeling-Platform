import React from 'react';
import { Modal, Form, Input, Button } from 'antd';

const ModelModal = ({ 
  isModalOpen, 
  editingModel, 
  newModel, 
  setNewModel, 
  handleSaveModel, 
  setIsModalOpen, 
  setEditingModel 
}) => {
  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingModel(null);
    setNewModel({ name: '', code: '', description: '', parentId: '', tags: '' });
  };

  return (
    <Modal
      title={editingModel ? '编辑模型' : '新建模型'}
      open={isModalOpen}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          取消
        </Button>,
        <Button key="submit" type="primary" onClick={handleSaveModel}>
          {editingModel ? '更新' : '确定'}
        </Button>
      ]}
    >
      <Form layout="vertical">
        <Form.Item
          label="名称"
          rules={[{ required: true, message: '请输入模型名称' }]}
        >
          <Input
            value={newModel.name}
            onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
          />
        </Form.Item>
        <Form.Item
          label="Code"
          rules={[{ required: true, message: '请输入模型Code' }]}
        >
          <Input
            value={newModel.code}
            onChange={(e) => setNewModel({ ...newModel, code: e.target.value })}
            placeholder="例如：user, order, product"
          />
        </Form.Item>
        <Form.Item label="描述">
          <Input.TextArea
            value={newModel.description}
            onChange={(e) => setNewModel({ ...newModel, description: e.target.value })}
            rows={4}
          />
        </Form.Item>
        <Form.Item label="父模型ID（可选）">
          <Input
            value={newModel.parentId}
            onChange={(e) => setNewModel({ ...newModel, parentId: e.target.value })}
            placeholder="可选"
          />
        </Form.Item>
        <Form.Item label="标签（逗号分隔）">
          <Input
            value={newModel.tags}
            onChange={(e) => setNewModel({ ...newModel, tags: e.target.value })}
            placeholder="例如：电商,用户,订单"
          />
        </Form.Item>
        {newModel.hasOwnProperty('domainId') && (
          <Form.Item label="Domain（可选）">
            <Select
              value={newModel.domainId}
              onChange={(value) => setNewModel({ ...newModel, domainId: value })}
              placeholder="选择Domain（可选）"
              allowClear
            >
              {/* Domain选项需要从父组件传入 */}
            </Select>
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default ModelModal;