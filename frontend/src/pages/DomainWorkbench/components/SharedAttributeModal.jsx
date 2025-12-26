import React from 'react';
import { Modal, Form, Input, Select, Button } from 'antd';

const { Option } = Select;

const SharedAttributeModal = ({ 
  isAttrModalOpen, 
  editingAttr, 
  newAttr, 
  setNewAttr, 
  handleSaveAttr, 
  setIsAttrModalOpen, 
  setEditingAttr 
}) => {
  const handleCancel = () => {
    setIsAttrModalOpen(false);
    setEditingAttr(null);
  };

  return (
    <Modal
      title={editingAttr ? '编辑共享属性' : '新建共享属性'}
      open={isAttrModalOpen}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          取消
        </Button>,
        <Button key="submit" type="primary" onClick={handleSaveAttr}>
          {editingAttr ? '更新' : '创建'}
        </Button>
      ]}
    >
      <Form layout="vertical">
        <Form.Item
          label="名称"
          rules={[{ required: true, message: '请输入共享属性名称' }]}
        >
          <Input
            value={newAttr.name}
            onChange={(e) => setNewAttr({ ...newAttr, name: e.target.value })}
          />
        </Form.Item>
        <Form.Item
          label="数据类型"
          rules={[{ required: true, message: '请选择数据类型' }]}
        >
          <Select
            value={newAttr.type}
            onChange={(value) => setNewAttr({ ...newAttr, type: value })}
            placeholder="选择数据类型"
          >
            <Option value="string">字符串</Option>
            <Option value="number">数字</Option>
            <Option value="date">日期</Option>
            <Option value="datetime">日期时间</Option>
            <Option value="boolean">布尔值</Option>
            <Option value="text">文本</Option>
          </Select>
        </Form.Item>
        <Form.Item label="长度">
          <Input
            value={newAttr.length}
            onChange={(e) => setNewAttr({ ...newAttr, length: e.target.value })}
            placeholder="可选，如：255"
          />
        </Form.Item>
        <Form.Item label="精度">
          <Input
            value={newAttr.precision}
            onChange={(e) => setNewAttr({ ...newAttr, precision: e.target.value })}
            placeholder="可选，如：0（整数）、2（两位小数）"
          />
        </Form.Item>
        <Form.Item label="描述">
          <Input.TextArea
            value={newAttr.description}
            onChange={(e) => setNewAttr({ ...newAttr, description: e.target.value })}
            rows={4}
          />
        </Form.Item>
        <Form.Item label="值域（可选）">
          <Input
            value={newAttr.valueRange}
            onChange={(e) => setNewAttr({ ...newAttr, valueRange: e.target.value })}
            placeholder="如：0,1 或 男,女"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SharedAttributeModal;