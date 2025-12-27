import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Modal, Form, Input, Select, Table, message, Tag, Card, Row, Col } from 'antd';
import { PlusOutlined, DeleteOutlined, ApiOutlined, DatabaseOutlined, TableOutlined } from '@ant-design/icons';
import { datasourceAPI, modelAPI, datasourceAPI as mappingAPI, domainAPI } from '../../services/api';

const { Option } = Select;

/**
 * MappingManager - 跨聚合映射管理页面
 * 
 * Mapping是连接Datasource、Model和Property的跨聚合关系
 * 用于定义数据源字段到模型属性的映射
 * 
 * 元模型位置：shared/mapping.py
 * 对应聚合：Datasource聚合（跨聚合关联）
 */
const MappingManager = () => {
  const navigate = useNavigate();
  const [mappings, setMappings] = useState([]);
  const [datasources, setDatasources] = useState([]);
  const [models, setModels] = useState([]);
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDatasource, setSelectedDatasource] = useState(null);
  const [datasourceData, setDatasourceData] = useState({ datasource: null, mappings: [], associations: [] });
  const [newMapping, setNewMapping] = useState({
    modelId: null,
    propertyId: null,
    fieldId: ''
  });
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const domainData = await domainAPI.getAll();
      setDomains(Array.isArray(domainData) ? domainData : []);
      
      const modelData = await modelAPI.getAll();
      const modelsList = Array.isArray(modelData) ? modelData : (modelData.models || []);
      setModels(modelsList);
      
      const datasourceData = await datasourceAPI.getAll();
      setDatasources(Array.isArray(datasourceData) ? datasourceData : []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDatasourceDetails = async (datasourceId) => {
    try {
      setLoading(true);
      const data = await datasourceAPI.getById(datasourceId);
      setDatasourceData(data);
      setMappings(data.mappings || []);
    } catch (error) {
      console.error('Failed to load datasource details:', error);
      message.error('加载数据源详情失败');
    } finally {
      setLoading(false);
    }
  };

  const loadModelProperties = async (modelId) => {
    try {
      const modelData = await modelAPI.getById(modelId);
      setProperties(modelData.properties || []);
    } catch (error) {
      console.error('Failed to load model properties:', error);
      setProperties([]);
    }
  };

  const handleSelectDatasource = (datasourceId) => {
    setSelectedDatasource(datasourceId);
    loadDatasourceDetails(datasourceId);
  };

  const handleCreateMapping = async () => {
    try {
      if (!selectedDatasource || !newMapping.modelId || !newMapping.propertyId || !newMapping.fieldId) {
        message.error('请填写完整信息');
        return;
      }

      await mappingAPI.addMapping(selectedDatasource, {
        modelId: newMapping.modelId,
        propertyId: newMapping.propertyId,
        fieldId: newMapping.fieldId
      });

      message.success('映射创建成功');
      loadDatasourceDetails(selectedDatasource);
      setNewMapping({
        modelId: null,
        propertyId: null,
        fieldId: ''
      });
      setProperties([]);
    } catch (error) {
      console.error('Failed to create mapping:', error);
      message.error('映射创建失败：' + (error.message || '未知错误'));
    }
  };

  const handleDeleteMapping = async (mappingId) => {
    try {
      await datasourceAPI.delete(selectedDatasource);
      message.success('映射删除成功');
      loadDatasourceDetails(selectedDatasource);
    } catch (error) {
      console.error('Failed to delete mapping:', error);
      message.error('映射删除失败：' + (error.message || '未知错误'));
    }
  };

  const handleModelChange = (modelId) => {
    setNewMapping({ ...newMapping, modelId, propertyId: null });
    if (modelId) {
      loadModelProperties(modelId);
    } else {
      setProperties([]);
    }
  };

  const getModelName = (modelId) => {
    const model = models.find(m => m.id === modelId);
    return model ? `${model.name} (${model.code})` : `模型ID: ${modelId}`;
  };

  const getPropertyName = (propertyId) => {
    const property = properties.find(p => p.id === propertyId);
    return property ? `${property.name} (${property.code})` : `属性ID: ${propertyId}`;
  };

  const columns = [
    {
      title: '数据源字段',
      dataIndex: 'fieldId',
      key: 'fieldId',
      render: (fieldId, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{fieldId}</div>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
            {record.datasourceId ? `数据源ID: ${record.datasourceId}` : ''}
          </div>
        </div>
      )
    },
    {
      title: '模型',
      dataIndex: 'modelId',
      key: 'modelId',
      render: (modelId) => (
        <span 
          style={{ cursor: 'pointer', color: '#1890ff' }}
          onClick={() => navigate(`/model/${modelId}`)}
        >
          {getModelName(modelId)}
        </span>
      )
    },
    {
      title: '属性',
      dataIndex: 'propertyId',
      key: 'propertyId',
      render: (propertyId, record) => {
        const model = models.find(m => m.id === record.modelId);
        return (
          <span>
            {getPropertyName(propertyId)}
          </span>
        );
      }
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Button 
          type="link" 
          danger 
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteMapping(record.id)}
        >
          删除
        </Button>
      )
    }
  ];

  const mappingColumns = [
    {
      title: '物理字段',
      dataIndex: 'fieldId',
      key: 'fieldId',
      render: (fieldId) => <code>{fieldId}</code>
    },
    {
      title: '模型',
      dataIndex: 'modelId',
      key: 'modelId',
      render: (modelId) => getModelName(modelId)
    },
    {
      title: '属性',
      dataIndex: 'propertyId',
      key: 'propertyId',
      render: (propertyId) => {
        const modelId = datasourceData.mappings?.find(m => m.propertyId === propertyId)?.modelId;
        const model = models.find(m => m.id === modelId);
        if (!model) return propertyId;
        const property = model.properties?.find(p => p.id === propertyId);
        return property ? `${property.name} (${property.code})` : propertyId;
      }
    }
  ];

  return (
    <div className="mapping-manager">
      <div style={{ padding: '12px 16px', backgroundColor: '#f0f2f5', borderBottom: '1px solid #e0e0e0' }}>
        <span 
          style={{ cursor: 'pointer', color: '#1890ff', marginRight: '8px' }} 
          onClick={() => navigate('/')}
        >
          元模型地图
        </span>
        <span style={{ marginRight: '8px' }}>&gt;</span>
        <span style={{ fontWeight: 'bold' }}>映射管理</span>
        <span style={{ marginLeft: '8px', fontSize: '12px', color: '#8c8c8c' }}>
          (跨Datasource聚合的映射)
        </span>
      </div>

      <div style={{ padding: '16px', backgroundColor: 'white', borderBottom: '1px solid #e0e0e0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0 }}>跨聚合映射管理</h2>
            <div style={{ marginTop: '8px', color: '#666', fontSize: '13px' }}>
              <ApiOutlined style={{ marginRight: '8px' }} />
              Mapping是连接Datasource、Model和Property的跨聚合关系，定义数据源字段到模型属性的映射
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        <Row gutter={16}>
          <Col span={8}>
            <Card 
              title="选择数据源" 
              size="small"
              style={{ height: '100%' }}
            >
              <div style={{ maxHeight: '400px', overflow: 'auto' }}>
                {datasources.map(ds => (
                  <div
                    key={ds.id}
                    onClick={() => handleSelectDatasource(ds.id)}
                    style={{
                      padding: '12px',
                      marginBottom: '8px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      backgroundColor: selectedDatasource === ds.id ? '#e6f7ff' : '#fafafa',
                      border: selectedDatasource === ds.id ? '1px solid #1890ff' : '1px solid #d9d9d9',
                      transition: 'all 0.3s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <DatabaseOutlined style={{ color: ds.status === 'active' ? '#52c41a' : '#8c8c8c' }} />
                      <div>
                        <div style={{ fontWeight: 500 }}>{ds.name}</div>
                        <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{ds.type}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Col>
          
          <Col span={16}>
            {selectedDatasource ? (
              <Card 
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <DatabaseOutlined />
                    <span>
                      {datasourceData.datasource?.name || '数据源详情'}
                    </span>
                    <Tag color={datasourceData.datasource?.status === 'active' ? 'green' : 'red'}>
                      {datasourceData.datasource?.status === 'active' ? '启用' : '禁用'}
                    </Tag>
                  </div>
                }
                size="small"
              >
                <div style={{ marginBottom: '16px' }}>
                  <Row gutter={16}>
                    <Col span={8}>
                      <div style={{ fontSize: '12px', color: '#8c8c8c' }}>类型</div>
                      <div>{datasourceData.datasource?.type}</div>
                    </Col>
                    <Col span={16}>
                      <div style={{ fontSize: '12px', color: '#8c8c8c' }}>URL</div>
                      <div><code>{datasourceData.datasource?.url}</code></div>
                    </Col>
                  </Row>
                </div>

                <div style={{ marginBottom: '16px', padding: '16px', background: '#fafafa', borderRadius: '4px' }}>
                  <div style={{ marginBottom: '12px', fontWeight: 500 }}>添加新映射</div>
                  <Form layout="inline">
                    <Form.Item>
                      <Select
                        style={{ width: 200 }}
                        placeholder="选择模型"
                        value={newMapping.modelId}
                        onChange={handleModelChange}
                        showSearch
                        optionFilterProp="children"
                      >
                        {models.map(model => (
                          <Option key={model.id} value={model.id}>
                            {model.name} ({model.code})
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Form.Item>
                      <Select
                        style={{ width: 200 }}
                        placeholder="选择属性"
                        value={newMapping.propertyId}
                        onChange={(value) => setNewMapping({ ...newMapping, propertyId: value })}
                        disabled={!newMapping.modelId}
                      >
                        {properties.map(prop => (
                          <Option key={prop.id} value={prop.id}>
                            {prop.name} ({prop.code})
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Form.Item>
                      <Input
                        placeholder="物理字段名"
                        value={newMapping.fieldId}
                        onChange={(e) => setNewMapping({ ...newMapping, fieldId: e.target.value })}
                        style={{ width: 150 }}
                      />
                    </Form.Item>
                    <Form.Item>
                      <Button 
                        type="primary" 
                        icon={<PlusOutlined />}
                        onClick={handleCreateMapping}
                        disabled={!newMapping.modelId || !newMapping.propertyId || !newMapping.fieldId}
                      >
                        添加
                      </Button>
                    </Form.Item>
                  </Form>
                </div>

                <Table
                  columns={mappingColumns}
                  dataSource={mappings}
                  rowKey="id"
                  loading={loading}
                  pagination={{ pageSize: 5 }}
                  size="small"
                />
              </Card>
            ) : (
              <Card size="small">
                <div style={{ textAlign: 'center', padding: '40px', color: '#8c8c8c' }}>
                  <TableOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                  <div>请从左侧选择一个数据源来管理映射</div>
                </div>
              </Card>
            )}
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default MappingManager;
