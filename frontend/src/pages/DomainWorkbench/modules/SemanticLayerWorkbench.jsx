import React, { useState, useEffect } from 'react';
import { Card, Tabs, Table, Button, Space, Tag, Input, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { sharedAttributeAPI, indicatorAPI, functionAPI } from '../../../services/api';
import SharedAttributeModal from '../components/SharedAttributeModal';
import SemanticIndicatorModal from '../components/SemanticIndicatorModal';

const { Search } = Input;

/**
 * SemanticLayerWorkbench - 语义层统一管理工作台
 * 
 * 参考 Palantir Foundry 的语义层管理
 * 统一管理共享属性、指标、函数等语义资产
 */
const SemanticLayerWorkbench = ({ domainId, showNotification, showConfirmDialog }) => {
  const [activeTab, setActiveTab] = useState('attributes');
  const [sharedAttributes, setSharedAttributes] = useState([]);
  const [indicators, setIndicators] = useState([]);
  const [functions, setFunctions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // 共享属性相关状态
  const [isAttrModalOpen, setIsAttrModalOpen] = useState(false);
  const [editingAttr, setEditingAttr] = useState(null);
  const [newAttr, setNewAttr] = useState({ 
    name: '', 
    type: 'string', 
    length: '', 
    precision: '', 
    description: '', 
    valueRange: '' 
  });

  // 指标相关状态
  const [isIndicatorModalOpen, setIsIndicatorModalOpen] = useState(false);
  const [editingIndicator, setEditingIndicator] = useState(null);
  const [newIndicator, setNewIndicator] = useState({
    name: '',
    expression: '',
    returnType: 'number',
    description: '',
    status: 'draft',
    unit: ''
  });

  useEffect(() => {
    loadData();
  }, [domainId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // 加载共享属性
      const attrData = await sharedAttributeAPI.getAll(domainId);
      setSharedAttributes(Array.isArray(attrData) ? attrData : []);

      // 加载指标
      const indicatorData = await indicatorAPI.getAll(domainId);
      setIndicators(Array.isArray(indicatorData) ? indicatorData : []);

      // 加载函数
      const functionData = await functionAPI.getAll();
      setFunctions(Array.isArray(functionData) ? functionData : []);
    } catch (error) {
      console.error('Failed to load semantic layer data:', error);
      message.error('加载语义层数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAttr = async () => {
    try {
      const attr = await sharedAttributeAPI.create({ ...newAttr, domainId: parseInt(domainId) });
      setSharedAttributes([...sharedAttributes, attr]);
      setIsAttrModalOpen(false);
      setNewAttr({ name: '', type: 'string', length: '', precision: '', description: '', valueRange: '' });
      showNotification('共享属性创建成功');
    } catch (error) {
      console.error('Failed to create shared attribute:', error);
      showNotification('共享属性创建失败', 'error');
    }
  };

  const handleUpdateAttr = async () => {
    try {
      const updatedAttr = await sharedAttributeAPI.update(editingAttr.id, newAttr);
      setSharedAttributes(sharedAttributes.map(attr => 
        attr.id === editingAttr.id ? updatedAttr : attr
      ));
      setIsAttrModalOpen(false);
      setEditingAttr(null);
      setNewAttr({ name: '', type: 'string', length: '', precision: '', description: '', valueRange: '' });
      showNotification('共享属性更新成功');
    } catch (error) {
      console.error('Failed to update shared attribute:', error);
      showNotification('共享属性更新失败', 'error');
    }
  };

  const handleDeleteAttr = (id) => {
    showConfirmDialog(
      '删除确认',
      '确定要删除该共享属性吗？删除后无法恢复。',
      async () => {
        try {
          await sharedAttributeAPI.delete(id);
          setSharedAttributes(sharedAttributes.filter(attr => attr.id !== id));
          showNotification('共享属性删除成功');
        } catch (error) {
          console.error('Failed to delete shared attribute:', error);
          showNotification('共享属性删除失败', 'error');
        }
      }
    );
  };

  const handleCreateIndicator = async () => {
    try {
      const indicator = await indicatorAPI.create({ ...newIndicator, domainId: parseInt(domainId) });
      setIndicators([...indicators, indicator]);
      setIsIndicatorModalOpen(false);
      setNewIndicator({
        name: '',
        expression: '',
        returnType: 'number',
        description: '',
        status: 'draft',
        unit: ''
      });
      showNotification('指标创建成功');
    } catch (error) {
      console.error('Failed to create indicator:', error);
      showNotification('指标创建失败', 'error');
    }
  };

  const handleUpdateIndicator = async () => {
    try {
      const updatedIndicator = await indicatorAPI.update(editingIndicator.id, newIndicator);
      setIndicators(indicators.map(indicator => 
        indicator.id === editingIndicator.id ? updatedIndicator : indicator
      ));
      setIsIndicatorModalOpen(false);
      setEditingIndicator(null);
      setNewIndicator({
        name: '',
        expression: '',
        returnType: 'number',
        description: '',
        status: 'draft',
        unit: ''
      });
      showNotification('指标更新成功');
    } catch (error) {
      console.error('Failed to update indicator:', error);
      showNotification('指标更新失败', 'error');
    }
  };

  const handleDeleteIndicator = (id) => {
    showConfirmDialog(
      '删除确认',
      '确定要删除该指标吗？删除后无法恢复。',
      async () => {
        try {
          await indicatorAPI.delete(id);
          setIndicators(indicators.filter(indicator => indicator.id !== id));
          showNotification('指标删除成功');
        } catch (error) {
          console.error('Failed to delete indicator:', error);
          showNotification('指标删除失败', 'error');
        }
      }
    );
  };

  const filteredAttributes = sharedAttributes.filter(attr => 
    !searchTerm || attr.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attr.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredIndicators = indicators.filter(indicator => 
    !searchTerm || indicator.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    indicator.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFunctions = functions.filter(func => 
    !searchTerm || func.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    func.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const attributeColumns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '编码',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingAttr(record);
              setNewAttr(record);
              setIsAttrModalOpen(true);
            }}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteAttr(record.id)}
          >
            删除
          </Button>
        </Space>
      )
    }
  ];

  const indicatorColumns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '编码',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: '表达式',
      dataIndex: 'expression',
      key: 'expression',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'default'}>
          {status === 'active' ? '已发布' : '草稿'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingIndicator(record);
              setNewIndicator(record);
              setIsIndicatorModalOpen(true);
            }}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteIndicator(record.id)}
          >
            删除
          </Button>
        </Space>
      )
    }
  ];

  return (
    <Card title="语义层管理">
      <div style={{ marginBottom: '16px' }}>
        <Search
          placeholder="搜索语义资产..."
          allowClear
          enterButton={<SearchOutlined />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: 300 }}
        />
      </div>

      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        items={[
          {
            key: 'attributes',
            label: (
              <span>
                共享属性 <Tag>{filteredAttributes.length}</Tag>
              </span>
            ),
            children: (
              <>
                <div style={{ marginBottom: '16px' }}>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setEditingAttr(null);
                      setNewAttr({ name: '', type: 'string', length: '', precision: '', description: '', valueRange: '' });
                      setIsAttrModalOpen(true);
                    }}
                  >
                    新建共享属性
                  </Button>
                </div>
                <Table
                  columns={attributeColumns}
                  dataSource={filteredAttributes}
                  rowKey="id"
                  loading={loading}
                  pagination={{ pageSize: 10 }}
                />
              </>
            )
          },
          {
            key: 'indicators',
            label: (
              <span>
                指标 <Tag>{filteredIndicators.length}</Tag>
              </span>
            ),
            children: (
              <>
                <div style={{ marginBottom: '16px' }}>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setEditingIndicator(null);
                      setNewIndicator({
                        name: '',
                        expression: '',
                        returnType: 'number',
                        description: '',
                        status: 'draft',
                        unit: ''
                      });
                      setIsIndicatorModalOpen(true);
                    }}
                  >
                    新建指标
                  </Button>
                </div>
                <Table
                  columns={indicatorColumns}
                  dataSource={filteredIndicators}
                  rowKey="id"
                  loading={loading}
                  pagination={{ pageSize: 10 }}
                />
              </>
            )
          },
          {
            key: 'functions',
            label: (
              <span>
                函数 <Tag>{filteredFunctions.length}</Tag>
              </span>
            ),
            children: (
              <Table
                columns={[
                  { title: '名称', dataIndex: 'name', key: 'name' },
                  { title: '编码', dataIndex: 'code', key: 'code' },
                  { title: '类型', dataIndex: 'functionType', key: 'functionType' },
                ]}
                dataSource={filteredFunctions}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
              />
            )
          }
        ]}
      />

      {/* 共享属性模态框 */}
      <SharedAttributeModal 
        isAttrModalOpen={isAttrModalOpen}
        editingAttr={editingAttr}
        newAttr={newAttr}
        setNewAttr={setNewAttr}
        handleSaveAttr={editingAttr ? handleUpdateAttr : handleCreateAttr}
        setIsAttrModalOpen={setIsAttrModalOpen}
        setEditingAttr={setEditingAttr}
      />

      {/* 指标模态框 */}
      <SemanticIndicatorModal 
        isIndicatorModalOpen={isIndicatorModalOpen}
        editingIndicator={editingIndicator}
        newIndicator={newIndicator}
        setNewIndicator={setNewIndicator}
        handleSaveIndicator={editingIndicator ? handleUpdateIndicator : handleCreateIndicator}
        setIsIndicatorModalOpen={setIsIndicatorModalOpen}
        setEditingIndicator={setEditingIndicator}
      />
    </Card>
  );
};

export default SemanticLayerWorkbench;
