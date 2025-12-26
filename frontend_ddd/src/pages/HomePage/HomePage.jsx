/**
 * 首页 - 功能菜单和概览（使用Ant Design）
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Statistic, Typography, Button, Space, Spin, Empty } from 'antd';
import { 
  BankOutlined, 
  DatabaseOutlined, 
  HddOutlined, 
  SettingOutlined,
  ArrowRightOutlined 
} from '@ant-design/icons';
import { domainAPI, modelAPI, datasourceAPI, etlAPI } from '../../services/api';

const { Title, Paragraph } = Typography;

const HomePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    domains: 0,
    models: 0,
    datasources: 0,
    etlTasks: 0
  });
  const [domains, setDomains] = useState([]);
  const [models, setModels] = useState([]);
  const [recentModels, setRecentModels] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [domainsData, modelsData, datasourcesData, etlTasksData] = await Promise.all([
        domainAPI.getAll().catch(() => []),
        modelAPI.getAll().catch(() => ({ models: [] })),
        datasourceAPI.getAll().catch(() => []),
        etlAPI.getAllTasks().catch(() => [])
      ]);

      const domainsList = Array.isArray(domainsData) ? domainsData : [];
      const modelsList = Array.isArray(modelsData) ? modelsData.models || modelsData : [];
      const datasourcesList = Array.isArray(datasourcesData) ? datasourcesData : [];
      const etlTasksList = Array.isArray(etlTasksData) ? etlTasksData : [];

      setDomains(domainsList);
      setModels(modelsList);
      setRecentModels(modelsList.slice(0, 5));
      
      setStats({
        domains: domainsList.length,
        models: modelsList.length,
        datasources: datasourcesList.length,
        etlTasks: etlTasksList.length
      });
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      {/* 头部 */}
      <Card style={{ marginBottom: '24px', textAlign: 'center' }}>
        <Title level={1}>业务建模平台</Title>
        <Paragraph type="secondary" style={{ fontSize: '16px' }}>
          基于DDD架构的业务建模和数据管理平台
        </Paragraph>
      </Card>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable
            onClick={() => navigate('/domains')}
            style={{ cursor: 'pointer' }}
          >
            <Statistic
              title="业务域"
              value={stats.domains}
              prefix={<BankOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable
            onClick={() => navigate('/models')}
            style={{ cursor: 'pointer' }}
          >
            <Statistic
              title="业务模型"
              value={stats.models}
              prefix={<DatabaseOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable
            onClick={() => navigate('/datasources')}
            style={{ cursor: 'pointer' }}
          >
            <Statistic
              title="数据源"
              value={stats.datasources}
              prefix={<HddOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable
            onClick={() => navigate('/etl')}
            style={{ cursor: 'pointer' }}
          >
            <Statistic
              title="ETL任务"
              value={stats.etlTasks}
              prefix={<SettingOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 功能菜单 */}
      <Card title="功能菜单" style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card
              hoverable
              onClick={() => navigate('/domains')}
              style={{ cursor: 'pointer', textAlign: 'center' }}
            >
              <BankOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
              <Title level={4}>业务域管理</Title>
              <Paragraph type="secondary">创建和管理业务域，组织业务模型和数据源</Paragraph>
              <Button type="primary" icon={<ArrowRightOutlined />}>
                进入
              </Button>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card
              hoverable
              onClick={() => navigate('/models')}
              style={{ cursor: 'pointer', textAlign: 'center' }}
            >
              <DatabaseOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} />
              <Title level={4}>模型管理</Title>
              <Paragraph type="secondary">创建和管理业务模型，定义属性和关系</Paragraph>
              <Button type="primary" icon={<ArrowRightOutlined />}>
                进入
              </Button>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card
              hoverable
              onClick={() => navigate('/datasources')}
              style={{ cursor: 'pointer', textAlign: 'center' }}
            >
              <HddOutlined style={{ fontSize: '48px', color: '#faad14', marginBottom: '16px' }} />
              <Title level={4}>数据源管理</Title>
              <Paragraph type="secondary">配置和管理数据源连接，设置字段映射</Paragraph>
              <Button type="primary" icon={<ArrowRightOutlined />}>
                进入
              </Button>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card
              hoverable
              onClick={() => navigate('/etl')}
              style={{ cursor: 'pointer', textAlign: 'center' }}
            >
              <SettingOutlined style={{ fontSize: '48px', color: '#722ed1', marginBottom: '16px' }} />
              <Title level={4}>ETL管理</Title>
              <Paragraph type="secondary">配置ETL任务，监控数据同步执行</Paragraph>
              <Button type="primary" icon={<ArrowRightOutlined />}>
                进入
              </Button>
            </Card>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]}>
        {/* 业务域列表 */}
        <Col xs={24} lg={12}>
          <Card 
            title="业务域列表"
            extra={<Button type="link" onClick={() => navigate('/domains')}>查看全部</Button>}
          >
            {domains.length > 0 ? (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                {domains.map(domain => (
                  <Card
                    key={domain.id}
                    size="small"
                    hoverable
                    onClick={() => navigate(`/domain/${domain.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <Space direction="vertical" style={{ width: '100%' }} size="small">
                      <Title level={5} style={{ margin: 0 }}>{domain.name}</Title>
                      <Paragraph type="secondary" style={{ margin: 0 }}>
                        {domain.description || '暂无描述'}
                      </Paragraph>
                      {domain.owner && (
                        <Paragraph type="secondary" style={{ margin: 0, fontSize: '12px' }}>
                          负责人: {domain.owner}
                        </Paragraph>
                      )}
                      <Button 
                        type="primary" 
                        size="small"
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          navigate(`/domain/${domain.id}`); 
                        }}
                      >
                        进入工作台
                      </Button>
                    </Space>
                  </Card>
                ))}
              </Space>
            ) : (
              <Empty 
                description="暂无业务域"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Button type="primary" onClick={() => navigate('/domains')}>
                  创建业务域
                </Button>
              </Empty>
            )}
          </Card>
        </Col>

        {/* 最近模型 */}
        <Col xs={24} lg={12}>
          <Card 
            title="最近模型"
            extra={<Button type="link" onClick={() => navigate('/models')}>查看全部</Button>}
          >
            {recentModels.length > 0 ? (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                {recentModels.map(model => (
                  <Card
                    key={model.id}
                    size="small"
                    hoverable
                    onClick={() => navigate(`/model/${model.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <Space direction="vertical" style={{ width: '100%' }} size="small">
                      <Title level={5} style={{ margin: 0 }}>{model.name}</Title>
                      <Paragraph type="secondary" style={{ margin: 0 }}>
                        Code: {model.code}
                      </Paragraph>
                      {model.description && (
                        <Paragraph type="secondary" style={{ margin: 0, fontSize: '12px' }}>
                          {model.description}
                        </Paragraph>
                      )}
                      <Button 
                        type="primary" 
                        size="small"
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          navigate(`/model/${model.id}`); 
                        }}
                      >
                        查看详情
                      </Button>
                    </Space>
                  </Card>
                ))}
              </Space>
            ) : (
              <Empty 
                description="暂无模型"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Button type="primary" onClick={() => navigate('/models')}>
                  创建模型
                </Button>
              </Empty>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default HomePage;
