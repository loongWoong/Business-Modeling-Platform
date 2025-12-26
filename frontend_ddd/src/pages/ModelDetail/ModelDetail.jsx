/**
 * Model详情页面 - 适配DDD API，使用 Ant Design
 * 使用新的API结构：一次调用获取model、properties和relations
 */
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Layout, Card, Typography, Spin, Alert, Space } from 'antd';
import { modelAPI, domainAPI } from '../../services/api';
import PropertyManager from './modules/PropertyManager';
import RelationManager from './modules/RelationManager';

const { Content } = Layout;
const { Title, Text } = Typography;

const ModelDetail = () => {
  const { modelId } = useParams();
  const [model, setModel] = useState(null);
  const [properties, setProperties] = useState([]);
  const [relations, setRelations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 加载Model详情（包含properties和relations）
  useEffect(() => {
    const loadModelDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        // 新API：一次调用获取所有数据
        const data = await modelAPI.getById(modelId);
        
        setModel(data.model);
        setProperties(data.properties || []);
        setRelations(data.relations || []);

        // 如果需要domain信息，单独获取
        if (data.model.domainId) {
          try {
            const domain = await domainAPI.getById(data.model.domainId);
            setModel(prev => ({ ...prev, domainName: domain.name }));
          } catch (err) {
            console.warn('Failed to load domain:', err);
          }
        }
      } catch (err) {
        console.error('Failed to load model detail:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (modelId) {
      loadModelDetail();
    }
  }, [modelId]);

  // 刷新数据
  const refreshModelDetail = async () => {
    try {
      const data = await modelAPI.getById(modelId);
      setModel(data.model);
      setProperties(data.properties || []);
      setRelations(data.relations || []);
    } catch (err) {
      console.error('Failed to refresh model detail:', err);
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

  if (!model) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert message="Model未找到" type="warning" showIcon />
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content style={{ padding: '24px' }}>
        <Card style={{ marginBottom: '24px' }}>
          <Space direction="vertical" size="small">
            <Title level={2} style={{ margin: 0 }}>{model.name}</Title>
            <Text type="secondary">Code: {model.code}</Text>
            {model.description && <Text>{model.description}</Text>}
            {model.domainName && <Text type="secondary">域: {model.domainName}</Text>}
          </Space>
        </Card>

        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <PropertyManager
            model={model}
            properties={properties}
            setProperties={setProperties}
            onRefresh={refreshModelDetail}
          />

          <RelationManager
            model={model}
            relations={relations}
            setRelations={setRelations}
            onRefresh={refreshModelDetail}
          />
        </Space>
      </Content>
    </Layout>
  );
};

export default ModelDetail;

