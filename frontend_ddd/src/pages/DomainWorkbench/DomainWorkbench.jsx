/**
 * Domain工作台 - 适配DDD API，使用 Ant Design
 * 展示Domain下的Models和Datasources
 */
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Layout, Card, Typography, Spin, Alert, Space } from 'antd';
import { domainAPI, modelAPI, datasourceAPI } from '../../services/api';
import ModelManager from './modules/ModelManager';
import DatasourceManager from './modules/DatasourceManager';

const { Content } = Layout;
const { Title, Text } = Typography;

const DomainWorkbench = () => {
  const { domainId } = useParams();
  const [domain, setDomain] = useState(null);
  const [models, setModels] = useState([]);
  const [datasources, setDatasources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 加载Domain信息
        if (domainId) {
          const domainData = await domainAPI.getById(domainId);
          setDomain(domainData);
        }

        // 加载Models（使用domainId过滤）
        const modelsData = await modelAPI.getAll(domainId);
        // 新API返回 {models: [], edges: []}
        const modelsList = modelsData.models || modelsData;
        setModels(Array.isArray(modelsList) ? modelsList : []);

        // 加载Datasources（使用domainId过滤）
        const datasourcesData = await datasourceAPI.getAll(domainId);
        setDatasources(Array.isArray(datasourcesData) ? datasourcesData : []);

      } catch (err) {
        console.error('Failed to load domain data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (domainId) {
      loadData();
    }
  }, [domainId]);

  const refreshData = async () => {
    try {
      // 加载Models（使用domainId过滤）
      const modelsData = await modelAPI.getAll(domainId);
      // 新API返回 {models: [], edges: []}
      const modelsList = modelsData.models || modelsData;
      setModels(Array.isArray(modelsList) ? modelsList : []);

      // 加载Datasources（使用domainId过滤）
      const datasourcesData = await datasourceAPI.getAll(domainId);
      setDatasources(Array.isArray(datasourcesData) ? datasourcesData : []);
    } catch (err) {
      console.error('Failed to refresh data:', err);
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert message="加载错误" description={error} type="error" showIcon />
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content style={{ padding: '24px' }}>
        <Card style={{ marginBottom: '24px' }}>
          <Space direction="vertical" size="small">
            <Title level={2} style={{ margin: 0 }}>
              {domain?.name || `Domain ${domainId}`}
            </Title>
            {domain?.description && <Text type="secondary">{domain.description}</Text>}
          </Space>
        </Card>

        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <ModelManager
            models={models}
            onRefresh={refreshData}
            domainId={domainId}
          />

          <DatasourceManager
            datasources={datasources}
            onRefresh={refreshData}
            domainId={domainId}
          />
        </Space>
      </Content>
    </Layout>
  );
};

export default DomainWorkbench;

