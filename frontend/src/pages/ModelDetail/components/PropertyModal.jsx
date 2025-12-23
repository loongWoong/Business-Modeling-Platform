import React from 'react';
import { Modal, Form, Input, Select, Checkbox, Button, Row, Col } from 'antd';

const { Option } = Select;

const PropertyModal = ({ 
  isPropertyModalOpen, 
  editingProperty, 
  newProperty, 
  setNewProperty, 
  setIsPropertyModalOpen, 
  setEditingProperty,
  handleSaveProperty
}) => {
  const handleCancel = () => {
    setIsPropertyModalOpen(false);
    setEditingProperty(null);
    setNewProperty({ 
      name: '', 
      type: 'string', 
      required: false, 
      description: '', 
      isPrimaryKey: false, 
      isForeignKey: false, 
      defaultValue: null, 
      constraints: [], 
      sensitivityLevel: 'public', 
      maskRule: null, 
      physicalColumn: '' 
    });
  };

  return (
    <Modal
      title={editingProperty ? '编辑属性' : '新建属性'}
      open={isPropertyModalOpen}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          取消
        </Button>,
        <Button key="submit" type="primary" onClick={handleSaveProperty}>
          {editingProperty ? '更新' : '确定'}
        </Button>
      ]}
      width={600}
    >
      <Form layout="vertical">
        <Form.Item
          label="名称 *"
          rules={[{ required: true, message: '请输入属性名称' }]}
        >
          <Input
            value={newProperty.name}
            onChange={(e) => setNewProperty({ ...newProperty, name: e.target.value })}
            placeholder="属性名称"
          />
        </Form.Item>
        
        <Form.Item
          label="数据类型 *"
          rules={[{ required: true, message: '请选择数据类型' }]}
        >
          <Select
            value={newProperty.type}
            onChange={(value) => setNewProperty({ ...newProperty, type: value })}
            placeholder="选择数据类型"
          >
            <Option value="string">字符串</Option>
            <Option value="text">文本</Option>
            <Option value="number">数字</Option>
            <Option value="integer">整数</Option>
            <Option value="boolean">布尔值</Option>
            <Option value="date">日期</Option>
            <Option value="datetime">日期时间</Option>
            <Option value="json">JSON</Option>
          </Select>
        </Form.Item>
        
        <Form.Item label="描述">
          <Input.TextArea
            value={newProperty.description}
            onChange={(e) => setNewProperty({ ...newProperty, description: e.target.value })}
            placeholder="属性描述"
            rows={3}
          />
        </Form.Item>
        
        <Form.Item label="物理字段名">
          <Input
            value={newProperty.physicalColumn}
            onChange={(e) => setNewProperty({ ...newProperty, physicalColumn: e.target.value })}
            placeholder="数据库字段名"
          />
        </Form.Item>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="长度">
              <Input
                value={newProperty.length}
                onChange={(e) => setNewProperty({ ...newProperty, length: e.target.value })}
                placeholder="字段长度"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          
          <Col span={12}>
            <Form.Item label="精度">
              <Input
                value={newProperty.precision}
                onChange={(e) => setNewProperty({ ...newProperty, precision: e.target.value })}
                placeholder="小数位数"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
        </Row>
        
        <Form.Item label="默认值">
          <Input
            value={newProperty.defaultValue !== null ? newProperty.defaultValue.toString() : ''}
            onChange={(e) => setNewProperty({ ...newProperty, defaultValue: e.target.value || null })}
            placeholder="默认值"
          />
        </Form.Item>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Checkbox
                  checked={newProperty.required}
                  onChange={(e) => setNewProperty({ ...newProperty, required: e.target.checked })}
                >
                  必填
                </Checkbox>
              </div>
            </Form.Item>
          </Col>
          
          <Col span={12}>
            <Form.Item>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Checkbox
                  checked={newProperty.isPrimaryKey}
                  onChange={(e) => setNewProperty({ ...newProperty, isPrimaryKey: e.target.checked })}
                >
                  主键
                </Checkbox>
              </div>
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Checkbox
                  checked={newProperty.isForeignKey}
                  onChange={(e) => setNewProperty({ ...newProperty, isForeignKey: e.target.checked })}
                >
                  外键
                </Checkbox>
              </div>
            </Form.Item>
          </Col>
          
          <Col span={12}>
            <Form.Item label="敏感级别">
              <Select
                value={newProperty.sensitivityLevel}
                onChange={(value) => setNewProperty({ ...newProperty, sensitivityLevel: value })}
                placeholder="选择敏感级别"
              >
                <Option value="public">公开</Option>
                <Option value="internal">内部</Option>
                <Option value="private">私有</Option>
                <Option value="secret">机密</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        
        <Form.Item label="脱敏规则">
          <Select
            value={newProperty.maskRule || ''}
            onChange={(value) => setNewProperty({ ...newProperty, maskRule: value || null })}
            placeholder="选择脱敏规则"
          >
            <Option value="">无</Option>
            <Option value="phone_middle_4">手机号中间4位*</Option>
            <Option value="id_card_last_4">身份证号后4位*</Option>
            <Option value="name_first_1">姓名首字*</Option>
            <Option value="email_mask">邮箱</Option>
          </Select>
        </Form.Item>
        
        <Form.Item label="约束规则">
          <Input.TextArea
            value={newProperty.constraints.join('\n')}
            onChange={(e) => setNewProperty({ ...newProperty, constraints: e.target.value.split('\n').filter(Boolean) })}
            placeholder="每行一个约束规则，例如：NOT NULL, UNIQUE, MIN(0)"
            rows={4}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PropertyModal;