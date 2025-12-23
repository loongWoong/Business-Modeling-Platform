import React from 'react';
import { Modal, Form, Input, Button } from 'antd';

const DataModal = ({ 
  isDataModalOpen, 
  editingData, 
  newData, 
  setNewData, 
  setIsDataModalOpen, 
  setEditingData,
  handleSaveData,
  properties
}) => {
  const handleCancel = () => {
    setIsDataModalOpen(false);
    setEditingData(null);
    setNewData({});
  };

  return (
    <Modal
      title={editingData ? '编辑数据记录' : '新建数据记录'}
      open={isDataModalOpen}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          取消
        </Button>,
        <Button key="submit" type="primary" onClick={handleSaveData}>
          {editingData ? '更新' : '确定'}
        </Button>
      ]}
      width={600}
    >
      <Form layout="vertical">
        {properties.map(property => (
          <Form.Item
            key={property.id}
            label={`${property.name}${property.required && ' *'}`}
            rules={property.required ? [{ required: true, message: `请输入${property.name}` }] : []}
          >
            <Input
              type={property.type === 'number' ? 'number' : 'text'}
              value={newData[property.physicalColumn] || ''}
              onChange={(e) => setNewData({ ...newData, [property.physicalColumn]: e.target.value })}
              placeholder={property.description || property.name}
            />
          </Form.Item>
        ))}
      </Form>
    </Modal>
  );
};

export default DataModal;