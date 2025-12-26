/**
 * ETL管理页面 - 使用 Ant Design
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Tabs, Typography, Spin, Empty, Tag, Space, message } from 'antd';
import { HomeOutlined, PlayCircleOutlined, PauseCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { etlAPI } from '../../services/api';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const ETLPage = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tasks');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await etlAPI.getAllTasks();
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load ETL tasks:', error);
      message.error('加载ETL任务失败');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (task, action) => {
    try {
      switch (action) {
        case 'activate':
          await etlAPI.activateTask(task.id);
          message.success('任务已激活');
          break;
        case 'pause':
          await etlAPI.pauseTask(task.id);
          message.success('任务已暂停');
          break;
        case 'start':
          await etlAPI.startTask(task.id);
          message.success('任务已启动');
          break;
        default:
          return;
      }
      await loadTasks();
    } catch (error) {
      console.error('Failed to toggle task status:', error);
      message.error('操作失败: ' + error.message);
    }
  };

  const getStatusTag = (status) => {
    const statusMap = {
      'active': { color: 'success', text: '激活' },
      'running': { color: 'processing', text: '运行中' },
      'paused': { color: 'warning', text: '暂停' },
      'error': { color: 'error', text: '错误' },
      'inactive': { color: 'default', text: '未激活' }
    };
    const config = statusMap[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
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
      <Card style={{ marginBottom: '24px' }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Title level={2} style={{ margin: 0 }}>ETL管理</Title>
          <Button icon={<HomeOutlined />} onClick={() => navigate('/')}>
            返回首页
          </Button>
        </Space>
      </Card>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="任务列表" key="tasks">
            {tasks.length === 0 ? (
              <Empty description="暂无ETL任务" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                {tasks.map(task => (
                  <Card key={task.id}>
                    <Space direction="vertical" style={{ width: '100%' }} size="small">
                      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                        <Title level={4} style={{ margin: 0 }}>{task.name}</Title>
                        {getStatusTag(task.status)}
                      </Space>
                      {task.description && <Text>{task.description}</Text>}
                      <Space direction="vertical" size="small">
                        <Text><strong>源数据源ID:</strong> {task.sourceDatasourceId}</Text>
                        <Text><strong>目标模型ID:</strong> {task.targetModelId}</Text>
                        {task.lastRun && <Text><strong>最后运行:</strong> {task.lastRun}</Text>}
                      </Space>
                      <Space>
                        {task.status === 'inactive' && (
                          <Button 
                            icon={<PlayCircleOutlined />}
                            onClick={() => handleToggleStatus(task, 'activate')}
                          >
                            激活
                          </Button>
                        )}
                        {task.status === 'active' && (
                          <>
                            <Button 
                              type="primary"
                              icon={<PlayCircleOutlined />}
                              onClick={() => handleToggleStatus(task, 'start')}
                            >
                              启动
                            </Button>
                            <Button 
                              icon={<PauseCircleOutlined />}
                              onClick={() => handleToggleStatus(task, 'pause')}
                            >
                              暂停
                            </Button>
                          </>
                        )}
                        {task.status === 'running' && (
                          <Button disabled icon={<ReloadOutlined spin />}>
                            运行中...
                          </Button>
                        )}
                        {task.status === 'paused' && (
                          <Button 
                            icon={<PlayCircleOutlined />}
                            onClick={() => handleToggleStatus(task, 'activate')}
                          >
                            恢复
                          </Button>
                        )}
                      </Space>
                    </Space>
                  </Card>
                ))}
              </Space>
            )}
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default ETLPage;

