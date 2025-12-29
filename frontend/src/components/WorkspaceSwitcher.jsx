import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Select, Space, Typography, Badge, Tooltip, Button } from 'antd';
import { ApartmentOutlined, FolderOutlined, ReloadOutlined } from '@ant-design/icons';
import { domainAPI } from '../services/api';

const { Text } = Typography;
const { Option } = Select;

/**
 * WorkspaceSwitcher - 工作空间切换器
 * 
 * 参考 Palantir Foundry 的工作空间概念
 * 只显示 workspace 类型的 Domain，提供快速切换功能
 */
const WorkspaceSwitcher = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [workspaces, setWorkspaces] = useState([]);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkspaces();
  }, []);

  useEffect(() => {
    // 从 URL 中提取当前工作空间
    const match = location.pathname.match(/\/domain\/(\d+)/);
    if (match) {
      const domainId = parseInt(match[1]);
      const workspace = workspaces.find(w => w.id === domainId);
      if (workspace && workspace.domainType === 'workspace') {
        setCurrentWorkspace(workspace);
      }
    }
  }, [location.pathname, workspaces]);

  const loadWorkspaces = async () => {
    try {
      setLoading(true);
      const domains = await domainAPI.getAll();
      const domainsList = Array.isArray(domains) ? domains : [];
      
      // 只显示 workspace 类型的 Domain，isActive 为 true 或 null（向后兼容）
      const workspaceList = domainsList.filter(d => 
        d.domainType === 'workspace' && (d.isActive !== false)
      );
      setWorkspaces(workspaceList);
      
      // 如果当前在某个 workspace 中，设置当前工作空间
      const match = location.pathname.match(/\/domain\/(\d+)/);
      if (match) {
        const domainId = parseInt(match[1]);
        const workspace = workspaceList.find(w => w.id === domainId);
        if (workspace) {
          setCurrentWorkspace(workspace);
        } else {
          // 如果当前 domain 不是 workspace，清空选择
          setCurrentWorkspace(null);
        }
      } else {
        setCurrentWorkspace(null);
      }
    } catch (error) {
      console.error('Failed to load workspaces:', error);
      setWorkspaces([]);
    } finally {
      setLoading(false);
    }
  };

  const handleWorkspaceChange = (workspaceId) => {
    const workspace = workspaces.find(w => w.id === parseInt(workspaceId));
    if (workspace) {
      navigate(`/domain/${workspaceId}`);
    }
  };

  return (
    <div style={{ 
      padding: '8px 16px', 
      backgroundColor: '#001529',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      <Space direction="vertical" style={{ width: '100%' }} size="small">
        <Space style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <ApartmentOutlined style={{ color: '#fff', fontSize: '16px' }} />
            <Text style={{ color: '#fff', fontSize: '14px', fontWeight: 500 }}>
              工作空间
            </Text>
          </Space>
          <Button
            type="text"
            icon={<ReloadOutlined style={{ color: '#fff' }} />}
            size="small"
            onClick={loadWorkspaces}
            loading={loading}
            style={{ color: '#fff' }}
          />
        </Space>
        <Select
          value={currentWorkspace?.id || undefined}
          onChange={handleWorkspaceChange}
          loading={loading}
          style={{ 
            width: '100%'
          }}
          placeholder={workspaces.length === 0 ? "暂无工作空间" : "选择工作空间"}
          suffixIcon={<FolderOutlined style={{ color: '#fff' }} />}
          dropdownStyle={{ 
            backgroundColor: '#001529'
          }}
          notFoundContent={loading ? '加载中...' : '暂无工作空间'}
          disabled={workspaces.length === 0 || loading}
        >
          {workspaces.map(workspace => (
            <Option key={workspace.id} value={workspace.id}>
              <Space>
                <FolderOutlined style={{ color: '#fff' }} />
                <span style={{ color: '#fff' }}>{workspace.name}</span>
                {workspace.modelQuota && (
                  <Tooltip title={`模型配额: ${workspace.modelQuota}`}>
                    <Badge 
                      count={workspace.modelQuota} 
                      style={{ backgroundColor: '#52c41a' }}
                    />
                  </Tooltip>
                )}
              </Space>
            </Option>
          ))}
        </Select>
        {currentWorkspace && (
          <Text style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '12px' }}>
            {currentWorkspace.description || '无描述'}
          </Text>
        )}
      </Space>
    </div>
  );
};

export default WorkspaceSwitcher;
