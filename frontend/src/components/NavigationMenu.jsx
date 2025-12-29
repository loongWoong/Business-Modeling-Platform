import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import {
  HomeOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  ApiOutlined,
  LinkOutlined,
  SwapOutlined
} from '@ant-design/icons';
import WorkspaceSwitcher from './WorkspaceSwitcher';

const { Sider } = Layout;

const menuItems = [
  {
    key: 'domain',
    icon: <HomeOutlined />,
    label: '业务域管理'
  },
  {
    key: 'model',
    icon: <DatabaseOutlined />,
    label: '模型管理'
  },
  {
    key: 'datasource',
    icon: <FileTextOutlined />,
    label: '数据源管理'
  },
  {
    key: 'etl',
    icon: <ApiOutlined />,
    label: 'ETL管理'
  },
  { type: 'divider' },
  {
    key: 'relation',
    icon: <LinkOutlined />,
    label: '关系管理'
  },
  {
    key: 'mapping',
    icon: <SwapOutlined />,
    label: '映射管理'
  }
];

const NavigationMenu = ({ onCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState([]);

  useEffect(() => {
    const currentPath = location.pathname;
    let activeKey = '';

    if (currentPath === '/domains' || currentPath.startsWith('/domain/')) {
      activeKey = 'domain';
    } else if (currentPath === '/models' || currentPath.startsWith('/model/')) {
      activeKey = 'model';
    } else if (currentPath === '/datasources' || currentPath.startsWith('/datasource/')) {
      activeKey = 'datasource';
    } else if (currentPath === '/etl' || currentPath.startsWith('/etl/')) {
      activeKey = 'etl';
    } else if (currentPath === '/relations') {
      activeKey = 'relation';
    } else if (currentPath === '/mappings') {
      activeKey = 'mapping';
    } else if (currentPath === '/') {
      navigate('/domains');
    }

    setSelectedKeys(activeKey ? [activeKey] : []);
  }, [location.pathname, navigate]);

  const handleCollapse = (value) => {
    setCollapsed(value);
    if (onCollapse) {
      onCollapse(value);
    }
  };

  const handleMenuClick = ({ key }) => {
    const item = menuItems.find(i => i.key === key);
    if (item) {
      const pathMap = {
        domain: '/domains',
        model: '/models',
        datasource: '/datasources',
        etl: '/etl',
        relation: '/relations',
        mapping: '/mappings'
      };
      if (pathMap[key]) {
        navigate(pathMap[key]);
      }
    }
  };

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={handleCollapse}
      width={240}
      theme="dark"
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0
      }}
    >
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          cursor: 'pointer'
        }}
        onClick={() => navigate('/domains')}
      >
        <span style={{ color: '#fff', fontSize: collapsed ? '14px' : '16px', fontWeight: 'bold' }}>
          {collapsed ? 'MM' : '业务建模平台'}
        </span>
      </div>

      {!collapsed && <WorkspaceSwitcher />}

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={selectedKeys}
        items={menuItems}
        onClick={handleMenuClick}
        style={{ borderRight: 0 }}
      />
    </Sider>
  );
};

export default NavigationMenu;
