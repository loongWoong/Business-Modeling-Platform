import React, { useState, useEffect } from 'react';
import { Button, Table, Tag, Card, Statistic, Row, Col, Space, Modal, Descriptions } from 'antd';
import { ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const ETLExecutionMonitor = () => {
  const [logs, setLogs] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  // 获取所有数据
  useEffect(() => {
    fetchLogs();
    fetchTasks();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/etl/logs');
      const data = await response.json();
      setLogs(data);
    } catch (error) {
      console.error('Failed to fetch ETL logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/etl/tasks');
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Failed to fetch ETL tasks:', error);
    }
  };

  const getTaskName = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    return task ? task.name : `任务ID: ${taskId}`;
  };

  const getStatusTag = (status) => {
    switch (status) {
      case 'success':
        return <Tag color="green">成功</Tag>;
      case 'failed':
        return <Tag color="red">失败</Tag>;
      case 'running':
        return <Tag color="blue">运行中</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const showLogDetails = (log) => {
    setSelectedLog(log);
    setIsDetailModalVisible(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalVisible(false);
    setSelectedLog(null);
  };

  // 计算统计信息
  const totalExecutions = logs.length;
  const successfulExecutions = logs.filter(log => log.status === 'success').length;
  const failedExecutions = logs.filter(log => log.status === 'failed').length;
  const successRate = totalExecutions > 0 ? Math.round((successfulExecutions / totalExecutions) * 100) : 0;

  // 计算总处理记录数
  const totalRecordsProcessed = logs.reduce((sum, log) => sum + (log.recordsProcessed || 0), 0);
  const totalRecordsSuccess = logs.reduce((sum, log) => sum + (log.recordsSuccess || 0), 0);
  const totalRecordsFailed = logs.reduce((sum, log) => sum + (log.recordsFailed || 0), 0);

  const logColumns = [
    {
      title: '任务名称',
      dataIndex: 'taskId',
      key: 'taskId',
      render: (taskId) => getTaskName(taskId)
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status)
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime'
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime'
    },
    {
      title: '处理记录数',
      dataIndex: 'recordsProcessed',
      key: 'recordsProcessed',
      render: (text) => text || 0
    },
    {
      title: '成功记录数',
      dataIndex: 'recordsSuccess',
      key: 'recordsSuccess',
      render: (text) => text || 0
    },
    {
      title: '失败记录数',
      dataIndex: 'recordsFailed',
      key: 'recordsFailed',
      render: (text) => text || 0
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="link" 
            onClick={() => showLogDetails(record)}
          >
            详情
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div className="etl-execution-monitor">
      <div style={{ padding: '20px' }}>
        {/* 统计卡片 */}
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="总执行次数"
                value={totalExecutions}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="成功执行"
                value={successfulExecutions}
                valueStyle={{ color: '#3f8600' }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="失败执行"
                value={failedExecutions}
                valueStyle={{ color: '#cf1322' }}
                prefix={<CloseCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="成功率"
                value={successRate}
                suffix="%"
                valueStyle={{ color: successRate >= 90 ? '#3f8600' : successRate >= 70 ? '#faad14' : '#cf1322' }}
                prefix={<ExclamationCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* 记录统计卡片 */}
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={8}>
            <Card>
              <Statistic
                title="总处理记录数"
                value={totalRecordsProcessed}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="成功记录数"
                value={totalRecordsSuccess}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="失败记录数"
                value={totalRecordsFailed}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
        </Row>

        {/* 日志表格 */}
        <Card title="执行日志">
          <Table 
            dataSource={logs} 
            columns={logColumns} 
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </Card>
      </div>

      {/* 日志详情模态框 */}
      <Modal
        title="执行日志详情"
        open={isDetailModalVisible}
        onCancel={closeDetailModal}
        footer={[
          <Button key="close" onClick={closeDetailModal}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {selectedLog && (
          <div>
            <Descriptions title="基本信息" bordered column={2} style={{ marginBottom: '20px' }}>
              <Descriptions.Item label="任务名称">{getTaskName(selectedLog.taskId)}</Descriptions.Item>
              <Descriptions.Item label="状态">{getStatusTag(selectedLog.status)}</Descriptions.Item>
              <Descriptions.Item label="开始时间">{selectedLog.startTime}</Descriptions.Item>
              <Descriptions.Item label="结束时间">{selectedLog.endTime}</Descriptions.Item>
              <Descriptions.Item label="处理记录数">{selectedLog.recordsProcessed}</Descriptions.Item>
              <Descriptions.Item label="成功记录数">{selectedLog.recordsSuccess}</Descriptions.Item>
              <Descriptions.Item label="失败记录数">{selectedLog.recordsFailed}</Descriptions.Item>
              <Descriptions.Item label="错误信息" span={2}>
                {selectedLog.errorMessage || '无'}
              </Descriptions.Item>
            </Descriptions>

            <Descriptions title="执行详情" bordered column={1}>
              {selectedLog.details && (
                <>
                  <Descriptions.Item label="抽取阶段">
                    <div>
                      <div>耗时: {selectedLog.details.extract.duration}秒</div>
                      <div>记录数: {selectedLog.details.extract.records}</div>
                    </div>
                  </Descriptions.Item>
                  <Descriptions.Item label="转换阶段">
                    <div>
                      <div>耗时: {selectedLog.details.transform.duration}秒</div>
                      <div>记录数: {selectedLog.details.transform.records}</div>
                    </div>
                  </Descriptions.Item>
                  <Descriptions.Item label="加载阶段">
                    <div>
                      <div>耗时: {selectedLog.details.load.duration}秒</div>
                      <div>记录数: {selectedLog.details.load.records}</div>
                    </div>
                  </Descriptions.Item>
                </>
              )}
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ETLExecutionMonitor;