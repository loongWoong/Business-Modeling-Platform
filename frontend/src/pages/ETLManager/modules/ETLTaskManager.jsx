import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Input, Select, Switch, Tag, Table, Space, Card } from 'antd';

const { Option } = Select;

const ETLTaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [newTask, setNewTask] = useState({
    name: '',
    description: '',
    sourceDatasourceId: null,
    targetModelId: null,
    schedule: '',
    status: 'inactive'
  });
  
  const [datasources, setDatasources] = useState([]);
  const [models, setModels] = useState([]);

  // 获取所有数据
  useEffect(() => {
    fetchTasks();
    fetchDatasources();
    fetchModels();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/etl/tasks');
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Failed to fetch ETL tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDatasources = async () => {
    try {
      const response = await fetch('/api/datasource');
      const data = await response.json();
      setDatasources(data);
    } catch (error) {
      console.error('Failed to fetch datasources:', error);
    }
  };

  const fetchModels = async () => {
    try {
      const response = await fetch('/api/model');
      const data = await response.json();
      // 如果返回的是包含models的对象，则取models数组
      const modelsData = Array.isArray(data) ? data : data.models || [];
      setModels(modelsData);
    } catch (error) {
      console.error('Failed to fetch models:', error);
    }
  };

  const showModal = (task = null) => {
    setEditingTask(task);
    if (task) {
      setNewTask({
        name: task.name,
        description: task.description,
        sourceDatasourceId: task.sourceDatasourceId,
        targetModelId: task.targetModelId,
        schedule: task.schedule,
        status: task.status
      });
    } else {
      setNewTask({
        name: '',
        description: '',
        sourceDatasourceId: null,
        targetModelId: null,
        schedule: '',
        status: 'inactive'
      });
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingTask(null);
    setNewTask({
      name: '',
      description: '',
      sourceDatasourceId: null,
      targetModelId: null,
      schedule: '',
      status: 'inactive'
    });
  };

  const handleSave = async () => {
    try {
      if (editingTask) {
        // 更新任务
        await fetch(`/api/etl/tasks/${editingTask.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newTask)
        });
      } else {
        // 创建任务
        await fetch('/api/etl/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newTask)
        });
      }
      setIsModalVisible(false);
      fetchTasks(); // 重新获取任务列表
    } catch (error) {
      console.error('Failed to save ETL task:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`/api/etl/tasks/${id}`, {
        method: 'DELETE'
      });
      fetchTasks(); // 重新获取任务列表
    } catch (error) {
      console.error('Failed to delete ETL task:', error);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await fetch(`/api/etl/tasks/${id}/toggle`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      fetchTasks(); // 重新获取任务列表
    } catch (error) {
      console.error('Failed to toggle ETL task status:', error);
    }
  };

  const executeTask = async (id) => {
    try {
      const response = await fetch(`/api/etl/tasks/${id}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const result = await response.json();
      console.log('ETL task executed:', result);
      fetchTasks(); // 重新获取任务列表以更新执行时间
    } catch (error) {
      console.error('Failed to execute ETL task:', error);
    }
  };

  const columns = [
    {
      title: '任务名称',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <strong>{text}</strong>
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      render: (text) => text || '-'
    },
    {
      title: '源数据源',
      dataIndex: 'sourceDatasourceId',
      key: 'sourceDatasourceId',
      render: (id) => {
        const datasource = datasources.find(ds => ds.id === id);
        return datasource ? datasource.name : '未知数据源';
      }
    },
    {
      title: '目标模型',
      dataIndex: 'targetModelId',
      key: 'targetModelId',
      render: (id) => {
        const model = models.find(m => m.id === id);
        return model ? model.name : '未知模型';
      }
    },
    {
      title: '调度计划',
      dataIndex: 'schedule',
      key: 'schedule',
      render: (text) => text || '-'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : status === 'running' ? 'blue' : 'default'}>
          {status === 'active' ? '启用' : status === 'running' ? '运行中' : '禁用'}
        </Tag>
      )
    },
    {
      title: '最后运行',
      dataIndex: 'lastRun',
      key: 'lastRun',
      render: (text) => text || '-'
    },
    {
      title: '下次运行',
      dataIndex: 'nextRun',
      key: 'nextRun',
      render: (text) => text || '-'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="link" 
            onClick={() => executeTask(record.id)}
            disabled={record.status !== 'active'}
          >
            执行
          </Button>
          <Button 
            type="link" 
            onClick={() => showModal(record)}
          >
            编辑
          </Button>
          <Button 
            type="link" 
            danger
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
          <Switch
            checked={record.status === 'active'}
            onChange={(checked) => toggleStatus(record.id, record.status)}
            checkedChildren="启用"
            unCheckedChildren="禁用"
          />
        </Space>
      )
    }
  ];

  return (
    <div className="etl-task-manager">
      <div className="header-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#fafafa', borderBottom: '1px solid #e8e8e8' }}>
        <Button 
          type="primary" 
          onClick={() => showModal()}
        >
          新建ETL任务
        </Button>
        <div>
          <Button style={{ marginRight: '8px' }}>批量操作</Button>
          <Button>导入</Button>
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        <Table 
          dataSource={tasks} 
          columns={columns} 
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </div>

      <Modal
        title={editingTask ? '编辑ETL任务' : '新建ETL任务'}
        open={isModalVisible}
        onCancel={handleCancel}
        onOk={handleSave}
        width={600}
      >
        <Form layout="vertical">
          <Form.Item label="任务名称" required>
            <Input
              value={newTask.name}
              onChange={(e) => setNewTask({...newTask, name: e.target.value})}
              placeholder="请输入任务名称"
            />
          </Form.Item>
          
          <Form.Item label="描述">
            <Input.TextArea
              value={newTask.description}
              onChange={(e) => setNewTask({...newTask, description: e.target.value})}
              placeholder="请输入任务描述"
              rows={3}
            />
          </Form.Item>
          
          <Form.Item label="源数据源" required>
            <Select
              value={newTask.sourceDatasourceId}
              onChange={(value) => setNewTask({...newTask, sourceDatasourceId: value})}
              placeholder="请选择源数据源"
            >
              {datasources.map(ds => (
                <Option key={ds.id} value={ds.id}>{ds.name}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item label="目标模型" required>
            <Select
              value={newTask.targetModelId}
              onChange={(value) => setNewTask({...newTask, targetModelId: value})}
              placeholder="请选择目标模型"
            >
              {models.map(model => (
                <Option key={model.id} value={model.id}>{model.name}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item label="调度计划">
            <Input
              value={newTask.schedule}
              onChange={(e) => setNewTask({...newTask, schedule: e.target.value})}
              placeholder="请输入Cron表达式，如：0 */1 * * *"
            />
          </Form.Item>
          
          <Form.Item label="初始状态">
            <Select
              value={newTask.status}
              onChange={(value) => setNewTask({...newTask, status: value})}
              placeholder="请选择初始状态"
            >
              <Option value="active">启用</Option>
              <Option value="inactive">禁用</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ETLTaskManager;