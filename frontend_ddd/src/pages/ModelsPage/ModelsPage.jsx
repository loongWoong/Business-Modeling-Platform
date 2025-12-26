/**
 * 模型列表页面 - 使用 Ant Design
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Input, Select, Button, Row, Col, Typography, Spin, Empty, Space } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { modelAPI, domainAPI } from '../../services/api';

const { Title, Text } = Typography;
const { Option } = Select;

const ModelsPage = () => {
  const navigate = useNavigate();
  const [models, setModels] = useState([]);
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadModels();
  }, [selectedDomain]);

  const loadData = async () => {
    try {
      const [domainsData] = await Promise.all([
        domainAPI.getAll().catch(() => [])
      ]);
      setDomains(Array.isArray(domainsData) ? domainsData : []);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const loadModels = async () => {
    try {
      setLoading(true);
      const data = await modelAPI.getAll(selectedDomain);
      const modelsList = data.models || data;
      setModels(Array.isArray(modelsList) ? modelsList : []);
    } catch (error) {
      console.error('Failed to load models:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredModels = models.filter(model =>
    model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      <Card style={{ marginBottom: '24px' }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Title level={2} style={{ margin: 0 }}>模型管理</Title>
          <Button icon={<HomeOutlined />} onClick={() => navigate('/')}>
            返回首页
          </Button>
        </Space>
      </Card>

      <Card style={{ marginBottom: '24px' }}>
        <Space size="middle" style={{ width: '100%' }}>
          <Input
            placeholder="搜索模型名称或Code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          <Select
            placeholder="选择业务域"
            value={selectedDomain}
            onChange={(value) => setSelectedDomain(value)}
            style={{ width: 200 }}
            allowClear
          >
            {domains.map(domain => (
              <Option key={domain.id} value={domain.id}>{domain.name}</Option>
            ))}
          </Select>
        </Space>
      </Card>

      {filteredModels.length === 0 ? (
        <Card>
          <Empty 
            description={searchTerm || selectedDomain ? '没有找到匹配的模型' : '暂无模型'}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {filteredModels.map(model => (
            <Col xs={24} sm={12} lg={8} xl={6} key={model.id}>
              <Card
                hoverable
                onClick={() => navigate(`/model/${model.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <Space direction="vertical" style={{ width: '100%' }} size="small">
                  <Title level={4} style={{ margin: 0 }}>{model.name}</Title>
                  <Text type="secondary">Code: {model.code}</Text>
                  <Text>{model.description || '暂无描述'}</Text>
                  {model.domainId && (
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      业务域: {domains.find(d => d.id === model.domainId)?.name || `ID: ${model.domainId}`}
                    </Text>
                  )}
                  <Button 
                    type="primary" 
                    block
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      navigate(`/model/${model.id}`); 
                    }}
                  >
                    查看详情
                  </Button>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default ModelsPage;

