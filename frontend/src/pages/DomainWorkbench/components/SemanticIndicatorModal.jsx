import React from 'react';
import { Modal, Form, Input, Select, Button } from 'antd';

const { Option } = Select;

const SemanticIndicatorModal = ({ 
  isIndicatorModalOpen, 
  editingIndicator, 
  newIndicator, 
  setNewIndicator, 
  handleSaveIndicator, 
  setIsIndicatorModalOpen, 
  setEditingIndicator 
}) => {
  const handleCancel = () => {
    setIsIndicatorModalOpen(false);
    setEditingIndicator(null);
  };

  return (
    <Modal
      title={editingIndicator ? '编辑指标' : '新建指标'}
      open={isIndicatorModalOpen}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          取消
        </Button>,
        <Button key="submit" type="primary" onClick={handleSaveIndicator}>
          {editingIndicator ? '更新' : '创建'}
        </Button>
      ]}
    >
      <Form layout="vertical">
        <Form.Item
          label="名称"
          rules={[{ required: true, message: '请输入指标名称' }]}
        >
          <Input
            value={newIndicator.name}
            onChange={(e) => setNewIndicator({ ...newIndicator, name: e.target.value })}
          />
        </Form.Item>
        <Form.Item
          label="表达式"
          rules={[{ required: true, message: '请输入指标表达式' }]}
        >
          <Input.TextArea
            value={newIndicator.expression}
            onChange={(e) => setNewIndicator({ ...newIndicator, expression: e.target.value })}
            placeholder="如：SUM(账单金额)/COUNT(通行记录)"
            rows={4}
          />
        </Form.Item>
        <Form.Item
          label="返回类型"
          rules={[{ required: true, message: '请选择返回类型' }]}
        >
          <Select
            value={newIndicator.returnType}
            onChange={(value) => setNewIndicator({ ...newIndicator, returnType: value })}
            placeholder="选择返回类型"
          >
            <Option value="number">数字</Option>
            <Option value="string">字符串</Option>
            <Option value="date">日期</Option>
            <Option value="time">时间</Option>
            <Option value="boolean">布尔值</Option>
          </Select>
        </Form.Item>
        <Form.Item label="单位">
          <Input
            value={newIndicator.unit}
            onChange={(e) => setNewIndicator({ ...newIndicator, unit: e.target.value })}
            placeholder="如：元、辆、%"
          />
        </Form.Item>
        <Form.Item label="描述">
          <Input.TextArea
            value={newIndicator.description}
            onChange={(e) => setNewIndicator({ ...newIndicator, description: e.target.value })}
            rows={4}
          />
        </Form.Item>
        <Form.Item
          label="状态"
          rules={[{ required: true, message: '请选择状态' }]}
        >
          <Select
            value={newIndicator.status}
            onChange={(value) => setNewIndicator({ ...newIndicator, status: value })}
            placeholder="选择状态"
          >
            <Option value="draft">草稿</Option>
            <Option value="published">已发布</Option>
            <Option value="offline">已下线</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SemanticIndicatorModal;