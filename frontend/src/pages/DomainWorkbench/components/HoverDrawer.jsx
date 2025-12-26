import React from 'react';
import { Drawer, Typography, Table, Tag } from 'antd';

const { Title, Text } = Typography;

const HoverDrawer = ({ isDrawerVisible, hoveredModel, allData, relations, onClose }) => {
  if (!hoveredModel) return null;

  // 模型属性表格列定义
  const propertyColumns = [
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
      title: '必填',
      dataIndex: 'required',
      key: 'required',
      render: (required) => required ? <Tag color="blue">是</Tag> : <Tag color="default">否</Tag>,
    },
    {
      title: '主键',
      dataIndex: 'isPrimaryKey',
      key: 'isPrimaryKey',
      render: (isPrimaryKey) => isPrimaryKey ? <Tag color="green">是</Tag> : <Tag color="default">否</Tag>,
    },
  ];

  // 模型关系表格列定义
  const relationColumns = [
    {
      title: '关系名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '相关模型',
      key: 'relatedModel',
      render: (text, record) => {
        const relatedModel = record.sourceModel === hoveredModel.name ? record.targetModel : record.sourceModel;
        const relationDirection = record.sourceModel === hoveredModel.name ? '→' : '←';
        return `${record.sourceModel} ${relationDirection} ${record.targetModel}`;
      },
    },
    {
      title: '关系类型',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: '状态',
      key: 'enabled',
      render: (text, record) => record.enabled ? <Tag color="green">启用</Tag> : <Tag color="red">禁用</Tag>,
    },
  ];

  // 获取模型属性数据
  const modelProperties = allData.properties?.filter(prop => prop.modelId === hoveredModel.originalId) || [];
  
  // 获取模型关系数据
  const modelRelations = relations?.filter(rel => rel.sourceModel === hoveredModel.name || rel.targetModel === hoveredModel.name) || [];

  return (
    <Drawer
      title={hoveredModel.type === 'model' ? '模型信息' : '属性信息'}
      placement="right"
      closable={true}
      onClose={onClose}
      open={isDrawerVisible}
      width={400}
    >
      {hoveredModel.type === 'model' && (
        <div>
          <Title level={4}>{hoveredModel.name}</Title>
          <div style={{ marginBottom: '16px' }}>
            <Text strong>描述: </Text>
            <Text>{hoveredModel.description || '暂无描述'}</Text>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <Text strong>创建人: </Text>
            <Text>{hoveredModel.creator || '暂无'}</Text>
          </div>
          <div style={{ marginBottom: '24px' }}>
            <Text strong>更新时间: </Text>
            <Text>{hoveredModel.updatedAt || '暂无'}</Text>
          </div>
          
          {/* 模型属性列表 */}
          <div style={{ marginTop: '16px' }}>
            <Title level={5}>模型属性</Title>
            <Table 
              columns={propertyColumns}
              dataSource={modelProperties}
              rowKey="id"
              pagination={false}
              size="small"
              scroll={{ y: 200 }}
            />
          </div>
          
          {/* 模型关系列表 */}
          <div style={{ marginTop: '16px' }}>
            <Title level={5}>模型关系</Title>
            <Table 
              columns={relationColumns}
              dataSource={modelRelations}
              rowKey="id"
              pagination={false}
              size="small"
              scroll={{ y: 200 }}
            />
          </div>
        </div>
      )}
      
      {/* 属性节点详情 */}
      {hoveredModel.type === 'property' && (
        <div>
          <Title level={4}>{hoveredModel.name}</Title>
          <div style={{ marginBottom: '8px' }}>
            <Text strong>描述: </Text>
            <Text>{hoveredModel.description || '暂无'}</Text>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <Text strong>类型: </Text>
            <Text>{hoveredModel.type}</Text>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <Text strong>必填: </Text>
            <Text>{hoveredModel.required ? '是' : '否'}</Text>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <Text strong>主键: </Text>
            <Text>{hoveredModel.isPrimaryKey ? '是' : '否'}</Text>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <Text strong>外键: </Text>
            <Text>{hoveredModel.isForeignKey ? '是' : '否'}</Text>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <Text strong>物理字段: </Text>
            <Text>{hoveredModel.physicalColumn || '未设置'}</Text>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <Text strong>敏感级别: </Text>
            <Text>{hoveredModel.sensitivityLevel || '公开'}</Text>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <Text strong>默认值: </Text>
            <Text>{hoveredModel.defaultValue !== null ? hoveredModel.defaultValue : '未设置'}</Text>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <Text strong>脱敏规则: </Text>
            <Text>{hoveredModel.maskRule || '无'}</Text>
          </div>
          {hoveredModel.constraints && hoveredModel.constraints.length > 0 && (
            <div style={{ marginBottom: '8px' }}>
              <Text strong>约束规则: </Text>
              <Text>{hoveredModel.constraints.join(', ')}</Text>
            </div>
          )}
        </div>
      )}
    </Drawer>
  );
};

export default HoverDrawer;