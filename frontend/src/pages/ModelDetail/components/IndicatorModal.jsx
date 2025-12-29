import React, { useState } from 'react';
import { Modal, Form, Input, Select, Button, Tabs, Space, Card, Tag, InputNumber } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

const IndicatorModal = ({ 
  isIndicatorModalOpen, 
  editingIndicator, 
  newIndicator, 
  setNewIndicator, 
  setIsIndicatorModalOpen, 
  setEditingIndicator,
  handleSaveIndicator,
  properties
}) => {
  const [activeTab, setActiveTab] = useState('basic');

  const handleCancel = () => {
    setIsIndicatorModalOpen(false);
    setEditingIndicator(null);
    setNewIndicator({
      name: '',
      expression: '',
      dimensions: [],
      filters: [],
      sortFields: [],
      returnType: 'number',
      description: '',
      status: 'draft',
      unit: '',
      relatedProperties: []
    });
  };

  // 更新指标字段的辅助函数
  const updateIndicatorField = (field, value) => {
    setNewIndicator(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 维度操作
  const addDimension = () => {
    const newDimension = {
      id: Date.now(),
      name: '',
      propertyId: null,
      propertyName: '',
      alias: ''
    };
    updateIndicatorField('dimensions', [...newIndicator.dimensions, newDimension]);
  };

  const updateDimension = (index, field, value) => {
    const updatedDimensions = [...newIndicator.dimensions];
    updatedDimensions[index] = { ...updatedDimensions[index], [field]: value };
    
    // 如果更新的是propertyId，则同时更新propertyName
    if (field === 'propertyId' && value) {
      const property = properties.find(p => p.id === value);
      if (property) {
        updatedDimensions[index].propertyName = property.name;
      }
    }
    
    updateIndicatorField('dimensions', updatedDimensions);
  };

  const removeDimension = (index) => {
    const updatedDimensions = [...newIndicator.dimensions];
    updatedDimensions.splice(index, 1);
    updateIndicatorField('dimensions', updatedDimensions);
  };

  // 过滤条件操作
  const addFilter = () => {
    const newFilter = {
      id: Date.now(),
      propertyId: null,
      propertyName: '',
      operator: '=',
      value: '',
      condition: 'AND'
    };
    updateIndicatorField('filters', [...newIndicator.filters, newFilter]);
  };

  const updateFilter = (index, field, value) => {
    const updatedFilters = [...newIndicator.filters];
    updatedFilters[index] = { ...updatedFilters[index], [field]: value };
    
    // 如果更新的是propertyId，则同时更新propertyName
    if (field === 'propertyId' && value) {
      const property = properties.find(p => p.id === value);
      if (property) {
        updatedFilters[index].propertyName = property.name;
      }
    }
    
    updateIndicatorField('filters', updatedFilters);
  };

  const removeFilter = (index) => {
    const updatedFilters = [...newIndicator.filters];
    updatedFilters.splice(index, 1);
    updateIndicatorField('filters', updatedFilters);
  };

  // 排序字段操作
  const addSortField = () => {
    const newSortField = {
      id: Date.now(),
      propertyId: null,
      propertyName: '',
      direction: 'ASC'
    };
    updateIndicatorField('sortFields', [...newIndicator.sortFields, newSortField]);
  };

  const updateSortField = (index, field, value) => {
    const updatedSortFields = [...newIndicator.sortFields];
    updatedSortFields[index] = { ...updatedSortFields[index], [field]: value };
    
    // 如果更新的是propertyId，则同时更新propertyName
    if (field === 'propertyId' && value) {
      const property = properties.find(p => p.id === value);
      if (property) {
        updatedSortFields[index].propertyName = property.name;
      }
    }
    
    updateIndicatorField('sortFields', updatedSortFields);
  };

  const removeSortField = (index) => {
    const updatedSortFields = [...newIndicator.sortFields];
    updatedSortFields.splice(index, 1);
    updateIndicatorField('sortFields', updatedSortFields);
  };

  // 获取属性选项
  const propertyOptions = properties ? properties.map(property => (
    <Option key={property.id} value={property.id}>
      {property.name} ({property.type})
    </Option>
  )) : [];

  const tabsItems = [
    {
      key: 'basic',
      label: '基础信息',
      children: (
        <Form layout="vertical">
          <Form.Item
            label="名称 *"
            required
            validateStatus={newIndicator.name ? '' : 'error'}
            help={newIndicator.name ? '' : '请输入指标名称'}
          >
            <Input
              value={newIndicator.name}
              onChange={(e) => updateIndicatorField('name', e.target.value)}
              placeholder="指标名称"
            />
          </Form.Item>
          
          <Form.Item
            label="表达式 *"
            required
            validateStatus={newIndicator.expression ? '' : 'error'}
            help={newIndicator.expression ? '' : '请输入指标计算表达式'}
          >
            <TextArea
              value={newIndicator.expression}
              onChange={(e) => updateIndicatorField('expression', e.target.value)}
              placeholder="指标计算表达式"
              rows={4}
            />
          </Form.Item>
          
          <Form.Item
            label="返回类型 *"
          >
            <Select
              value={newIndicator.returnType}
              onChange={(value) => updateIndicatorField('returnType', value)}
              placeholder="选择返回类型"
            >
              <Option value="number">数字</Option>
              <Option value="string">字符串</Option>
              <Option value="boolean">布尔值</Option>
              <Option value="date">日期</Option>
            </Select>
          </Form.Item>
          
          <Form.Item label="单位">
            <Input
              value={newIndicator.unit}
              onChange={(e) => updateIndicatorField('unit', e.target.value)}
              placeholder="如：元、辆、%"
            />
          </Form.Item>
          
          <Form.Item label="状态">
            <Select
              value={newIndicator.status}
              onChange={(value) => updateIndicatorField('status', value)}
              placeholder="选择状态"
            >
              <Option value="draft">草稿</Option>
              <Option value="published">已发布</Option>
              <Option value="offline">已下线</Option>
            </Select>
          </Form.Item>
          
          <Form.Item label="描述">
            <TextArea
              value={newIndicator.description}
              onChange={(e) => updateIndicatorField('description', e.target.value)}
              placeholder="指标描述"
              rows={3}
            />
          </Form.Item>
        </Form>
      ),
    },
    {
      key: 'dimensions',
      label: '维度配置',
      children: (
        <div>
          <div style={{ marginBottom: '16px' }}>
            <Button 
              type="primary" 
              onClick={addDimension}
              icon={<PlusOutlined />}
            >
              添加维度
            </Button>
          </div>
          
          {(newIndicator.dimensions || []).map((dimension, index) => (
            <Card 
              key={dimension.id || index} 
              size="small" 
              style={{ marginBottom: '12px' }}
              title={`维度 ${index + 1}`}
              extra={
                <Button 
                  type="text" 
                  danger 
                  icon={<MinusCircleOutlined />}
                  onClick={() => removeDimension(index)}
                />
              }
            >
              <Form layout="vertical">
                <Form.Item label="维度名称">
                  <Input
                    value={dimension.name}
                    onChange={(e) => updateDimension(index, 'name', e.target.value)}
                    placeholder="维度名称"
                  />
                </Form.Item>
                
                <Form.Item label="关联属性">
                  <Select
                    value={dimension.propertyId}
                    onChange={(value) => updateDimension(index, 'propertyId', value)}
                    placeholder="选择关联的模型属性"
                  >
                    {propertyOptions}
                  </Select>
                </Form.Item>
                
                <Form.Item label="维度别名">
                  <Input
                    value={dimension.alias}
                    onChange={(e) => updateDimension(index, 'alias', e.target.value)}
                    placeholder="维度别名"
                  />
                </Form.Item>
              </Form>
            </Card>
          ))}
          
          {(newIndicator.dimensions || []).length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px', color: '#bfbfbf' }}>
              <p>暂无维度配置</p>
              <p>点击上方按钮添加维度</p>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'filters',
      label: '过滤条件',
      children: (
        <div>
          <div style={{ marginBottom: '16px' }}>
            <Button 
              type="primary" 
              onClick={addFilter}
              icon={<PlusOutlined />}
            >
              添加过滤条件
            </Button>
          </div>
          
          {(newIndicator.filters || []).map((filter, index) => (
            <Card 
              key={filter.id || index} 
              size="small" 
              style={{ marginBottom: '12px' }}
              title={`过滤条件 ${index + 1}`}
              extra={
                <Button 
                  type="text" 
                  danger 
                  icon={<MinusCircleOutlined />}
                  onClick={() => removeFilter(index)}
                />
              }
            >
              <Form layout="vertical">
                <Form.Item label="关联属性">
                  <Select
                    value={filter.propertyId}
                    onChange={(value) => updateFilter(index, 'propertyId', value)}
                    placeholder="选择关联的模型属性"
                  >
                    {propertyOptions}
                  </Select>
                </Form.Item>
                
                <Form.Item label="操作符">
                  <Select
                    value={filter.operator}
                    onChange={(value) => updateFilter(index, 'operator', value)}
                    placeholder="选择操作符"
                  >
                    <Option value="=">= (等于)</Option>
                    <Option value=">">{'> (大于)'}</Option>
                    <Option value="<">{'< (小于)'}</Option>
                    <Option value=">=">{'>= (大于等于)'}</Option>
                    <Option value="<=">{'<= (小于等于)'}</Option>
                    <Option value="!=">{'!= (不等于)'}</Option>
                    <Option value="like">LIKE (包含)</Option>
                  </Select>
                </Form.Item>
                
                <Form.Item label="过滤值">
                  <Input
                    value={filter.value}
                    onChange={(e) => updateFilter(index, 'value', e.target.value)}
                    placeholder="过滤值"
                  />
                </Form.Item>
                
                <Form.Item label="连接条件">
                  <Select
                    value={filter.condition}
                    onChange={(value) => updateFilter(index, 'condition', value)}
                    placeholder="选择连接条件"
                  >
                    <Option value="AND">AND (并且)</Option>
                    <Option value="OR">OR (或者)</Option>
                  </Select>
                </Form.Item>
              </Form>
            </Card>
          ))}
          
          {(newIndicator.filters || []).length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px', color: '#bfbfbf' }}>
              <p>暂无过滤条件</p>
              <p>点击上方按钮添加过滤条件</p>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'sort',
      label: '排序设置',
      children: (
        <div>
          <div style={{ marginBottom: '16px' }}>
            <Button 
              type="primary" 
              onClick={addSortField}
              icon={<PlusOutlined />}
            >
              添加排序字段
            </Button>
          </div>
          
          {(newIndicator.sortFields || []).map((sortField, index) => (
            <Card 
              key={sortField.id || index} 
              size="small" 
              style={{ marginBottom: '12px' }}
              title={`排序字段 ${index + 1}`}
              extra={
                <Button 
                  type="text" 
                  danger 
                  icon={<MinusCircleOutlined />}
                  onClick={() => removeSortField(index)}
                />
              }
            >
              <Form layout="vertical">
                <Form.Item label="关联属性">
                  <Select
                    value={sortField.propertyId}
                    onChange={(value) => updateSortField(index, 'propertyId', value)}
                    placeholder="选择关联的模型属性"
                  >
                    {propertyOptions}
                  </Select>
                </Form.Item>
                
                <Form.Item label="排序方向">
                  <Select
                    value={sortField.direction}
                    onChange={(value) => updateSortField(index, 'direction', value)}
                    placeholder="选择排序方向"
                  >
                    <Option value="ASC">升序 (ASC)</Option>
                    <Option value="DESC">降序 (DESC)</Option>
                  </Select>
                </Form.Item>
              </Form>
            </Card>
          ))}
          
          {(newIndicator.sortFields || []).length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px', color: '#bfbfbf' }}>
              <p>暂无排序设置</p>
              <p>点击上方按钮添加排序字段</p>
            </div>
          )}
        </div>
      ),
    }
  ];

  return (
    <Modal
      title={editingIndicator ? '编辑指标' : '新建指标'}
      open={isIndicatorModalOpen}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          取消
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          onClick={handleSaveIndicator}
        >
          {editingIndicator ? '更新' : '创建'}
        </Button>
      ]}
      width={800}
      style={{ top: 20 }}
    >
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        items={tabsItems}
      />
    </Modal>
  );
};

export default IndicatorModal;