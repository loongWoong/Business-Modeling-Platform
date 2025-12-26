/**
 * 数据源列表页面 - 使用 Ant Design
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Input, Select, Button, Row, Col, Typography, Spin, Empty, Space, Tag } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { datasourceAPI, domainAPI } from '../../services/api';

const { Title, Text } = Typography;
const { Option } = Select;

const DatasourcesPage = () => {
  const navigate = useNavigate();
  const [datasources, setDatasources] = useState([]);
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadDatasources();
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

  const loadDatasources = async () => {
    try {
      setLoading(true);
      const data = await datasourceAPI.getAll(selectedDomain);
      setDatasources(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load datasources:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDatasources = datasources.filter(ds =>
    ds.name.toLowerCase().includes(searchTerm.toLowerCase())
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
          <Title level={2} style={{ margin: 0 }}>数据源管理</Title>
          <Button icon={<HomeOutlined />} onClick={() => navigate('/')}>
            返回首页
          </Button>
        </Space>
      </Card>

      <Card style={{ marginBottom: '24px' }}>
        <Space size="middle" style={{ width: '100%' }}>
          <Input
            placeholder="搜索数据源名称..."
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

      {filteredDatasources.length === 0 ? (
        <Card>
          <Empty 
            description={searchTerm || selectedDomain ? '没有找到匹配的数据源' : '暂无数据源'}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {filteredDatasources.map(datasource => (
            <Col xs={24} sm={12} lg={8} xl={6} key={datasource.id}>
              <Card>
                <Space direction="vertical" style={{ width: '100%' }} size="small">
                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Title level={4} style={{ margin: 0 }}>{datasource.name}</Title>
                    <Tag color={datasource.status === 'active' ? 'success' : 'default'}>
                      {datasource.status === 'active' ? '激活' : '未激活'}
                    </Tag>
                  </Space>
                  <Text><strong>类型:</strong> {datasource.type}</Text>
                  <Text ellipsis><strong>URL:</strong> {datasource.url}</Text>
                  {datasource.description && <Text>{datasource.description}</Text>}
                  {datasource.domainId && (
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      <strong>业务域:</strong> {domains.find(d => d.id === datasource.domainId)?.name || `ID: ${datasource.domainId}`}
                    </Text>
                  )}
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default DatasourcesPage;

