import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Modal, Input, Select, Form, Tabs, Card } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, EyeOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

const SemanticIndicatorManager = ({ 
  semanticIndicators,
  setSemanticIndicators,
  boundIndicators,
  setBoundIndicators,
  showNotification,
  showConfirmDialog,
  isIndicatorModalOpen,
  setIsIndicatorModalOpen,
  editingIndicator,
  setEditingIndicator,
  newIndicator,
  setNewIndicator,
  modelId,
  properties
}) => {
  // 处理创建指标
  const handleCreateIndicator = () => {
    fetch('/api/indicator', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newIndicator)
    })
      .then(response => response.json())
      .then(indicator => {
        const updatedSemanticIndicators = [...semanticIndicators, indicator];
        setSemanticIndicators(updatedSemanticIndicators);
        
        setIsIndicatorModalOpen(false);
        setEditingIndicator(null);
        setNewIndicator({
          name: '',
          expression: '',
          dimensions: [],
          filters: [],
          sortFields: [],
          returnType: 'number',
          description: '',
          status: 'draft',
          unit: '',
          relatedProperties: []
        });
        showNotification('指标创建成功');
      })
      .catch(error => {
        console.error('Failed to create indicator:', error);
        showNotification('指标创建失败', 'error');
      });
  };

  // 处理编辑指标
  const handleEditIndicator = (indicator) => {
    setEditingIndicator(indicator);
    setNewIndicator(indicator);
    setIsIndicatorModalOpen(true);
  };

  // 处理更新指标
  const handleUpdateIndicator = () => {
    fetch(`/api/indicator/${editingIndicator.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newIndicator)
    })
      .then(response => response.json())
      .then(updatedIndicator => {
        setSemanticIndicators(semanticIndicators.map(i => i.id === updatedIndicator.id ? updatedIndicator : i));
        setIsIndicatorModalOpen(false);
        setEditingIndicator(null);
        setNewIndicator({
          name: '',
          expression: '',
          dimensions: [],
          filters: [],
          sortFields: [],
          returnType: 'number',
          description: '',
          status: 'draft',
          unit: '',
          relatedProperties: []
        });
        showNotification('指标更新成功');
      })
      .catch(error => {
        console.error('Failed to update indicator:', error);
        showNotification('指标更新失败', 'error');
      });
  };

  // 保存指标（创建或更新）
  const handleSaveIndicator = () => {
    if (editingIndicator) {
      handleUpdateIndicator();
    } else {
      handleCreateIndicator();
    }
  };

  // 处理删除指标
  const handleDeleteIndicator = (id) => {
    showConfirmDialog(
      '删除确认',
      '确定要删除该指标吗？删除后无法恢复。',
      () => {
        fetch(`/api/indicator/${id}`, { method: 'DELETE' })
          .then(() => {
            setSemanticIndicators(semanticIndicators.filter(indicator => indicator.id !== id));
            showNotification('指标删除成功');
          })
          .catch(error => {
            console.error('Failed to delete indicator:', error);
            showNotification('指标删除失败', 'error');
          });
      }
    );
  };

  // 绑定指标到模型
  const handleBindIndicator = (indicator) => {
    // 检查是否已经绑定
    if (boundIndicators.find(b => b.id === indicator.id)) {
      showNotification('该指标已绑定到当前模型', 'error');
      return;
    }

    // 发送绑定请求
    fetch(`/api/model/${modelId}/indicator/${indicator.id}`, {
      method: 'POST'
    })
      .then(response => {
        if (response.ok) {
          // 确保指标数据是最新的，如果来自创建过程，可能需要更新完整数据
          const fullIndicator = semanticIndicators.find(i => i.id === indicator.id) || indicator;
          setBoundIndicators([...boundIndicators, fullIndicator]);
          showNotification(`指标 "${indicator.name}" 绑定成功`);
        } else {
          throw new Error('绑定失败');
        }
      })
      .catch(error => {
        console.error('Failed to bind indicator:', error);
        showNotification('指标绑定失败', 'error');
      });
  };

  // 解绑指标
  const handleUnbindIndicator = (id) => {
    fetch(`/api/model/${modelId}/indicator/${id}`, {
      method: 'DELETE'
    })
      .then(response => {
        if (response.ok) {
          setBoundIndicators(boundIndicators.filter(indicator => indicator.id !== id));
          showNotification('指标解绑成功');
        } else {
          throw new Error('解绑失败');
        }
      })
      .catch(error => {
        console.error('Failed to unbind indicator:', error);
        showNotification('指标解绑失败', 'error');
      });
  };

  // 格式化维度显示
  const formatDimensions = (dimensions) => {
    if (!dimensions || dimensions.length === 0) return '-';
    return dimensions.map(dim => (
      <Tag key={dim.id} color="blue">
        {dim.name} ({dim.propertyName})
      </Tag>
    ));
  };

  // 格式化过滤条件显示
  const formatFilters = (filters) => {
    if (!filters || filters.length === 0) return '-';
    return filters.map(filter => (
      <Tag key={filter.id} color="green">
        {filter.propertyName} {filter.operator} {filter.value}
      </Tag>
    ));
  };

  // 格式化排序字段显示
  const formatSortFields = (sortFields) => {
    if (!sortFields || sortFields.length === 0) return '-';
    return sortFields.map(sort => (
      <Tag key={sort.id} color="orange">
        {sort.propertyName} ({sort.direction})
      </Tag>
    ));
  };

  // 表格列定义
  const columns = [
    {
      title: '指标名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (text) => <strong>{text}</strong>
    },
    {
      title: '表达式',
      dataIndex: 'expression',
      key: 'expression',
      width: 200,
      render: (text) => (
        <div style={{ wordBreak: 'break-word', maxWidth: '200px' }}>
          <code>{text}</code>
        </div>
      )
    },
    {
      title: '维度',
      dataIndex: 'dimensions',
      key: 'dimensions',
      width: 200,
      render: (dimensions) => formatDimensions(dimensions)
    },
    {
      title: '过滤条件',
      dataIndex: 'filters',
      key: 'filters',
      width: 200,
      render: (filters) => formatFilters(filters)
    },
    {
      title: '排序',
      dataIndex: 'sortFields',
      key: 'sortFields',
      width: 150,
      render: (sortFields) => formatSortFields(sortFields)
    },
    {
      title: '返回类型',
      dataIndex: 'returnType',
      key: 'returnType',
      width: 100,
      render: (type) => (
        <Tag color={
          type === 'number' ? 'cyan' : 
          type === 'string' ? 'blue' : 
          type === 'boolean' ? 'purple' : 
          type === 'date' ? 'green' : 'default'
        }>
          {type}
        </Tag>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={
          status === 'published' ? 'green' : 
          status === 'draft' ? 'orange' : 
          status === 'offline' ? 'red' : 'default'
        }>
          {status === 'published' ? '已发布' : status === 'draft' ? '草稿' : '已下线'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => handleEditIndicator(record)}
          >
            编辑
          </Button>
          <Button 
            type="link" 
            icon={<DeleteOutlined />} 
            danger
            onClick={() => handleDeleteIndicator(record.id)}
          >
            删除
          </Button>
          {boundIndicators.find(b => b.id === record.id) ? (
            <Button 
              type="primary" 
              danger
              size="small"
              onClick={() => handleUnbindIndicator(record.id)}
            >
              解绑
            </Button>
          ) : (
            <Button 
              type="primary" 
              size="small"
              onClick={() => handleBindIndicator(record)}
            >
              绑定
            </Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <div className="semantic-indicator-manager">
      <div className="header-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#fafafa', borderBottom: '1px solid #e8e8e8' }}>
        <div>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setIsIndicatorModalOpen(true)}
          >
            新建指标
          </Button>
        </div>
        <div>
          <input
            type="text"
            placeholder="搜索指标名称..."
            onChange={(e) => console.log('搜索指标:', e.target.value)}
            style={{ padding: '6px 12px', border: '1px solid #d9d9d9', borderRadius: '4px', marginRight: '8px' }}
          />
          <Button style={{ marginRight: '8px' }}>导出</Button>
          <Button>导入</Button>
        </div>
      </div>
      
      {/* 已绑定指标表格 */}
      <div style={{ padding: '20px' }}>
        <Card 
          title={`已绑定指标 (${boundIndicators.length})`} 
          style={{ marginBottom: '24px' }}
          extra={
            <Tag color="green" style={{ fontSize: '14px' }}>
              模型关联
            </Tag>
          }
        >
          {boundIndicators.length > 0 ? (
            <Table 
              dataSource={boundIndicators} 
              columns={columns} 
              rowKey="id"
              pagination={{ pageSize: 10 }}
              scroll={{ x: 'max-content' }}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#bfbfbf' }}>
              <p>暂无绑定的指标</p>
              <p>请从下方可用指标中选择需要的指标进行绑定</p>
            </div>
          )}
        </Card>

        <Card 
          title={`可用指标 (${semanticIndicators.length})`} 
          extra={
            <Tag color="blue" style={{ fontSize: '14px' }}>
              全局指标
            </Tag>
          }
        >
          <Table 
            dataSource={semanticIndicators.filter(ind => !boundIndicators.some(b => b.id === ind.id))} 
            columns={columns} 
            rowKey="id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 'max-content' }}
          />
        </Card>
      </div>
    </div>
  );
};

export default SemanticIndicatorManager;